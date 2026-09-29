import { NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { layer } from "@timmo001/effect-gh";
import { join } from "node:path";
import { Effect, Exit, FileSystem } from "effect";
import {
  dispatchPayload,
  provenance,
  type Inputs,
  run,
  validateIdentity,
  sourcePinningScript,
  sourcePolicyScript,
} from "../src/actions/build-arch-package/workflow.js";
import { commandLayer, exec, platformLayer, tempDirectory } from "./support.js";

const validInputs = {
  stage: "build",
  packageName: "example-git",
  pkgbuildPath: ".scripts/linux/PKGBUILD",
  sourceRepository: "timmo001/example",
  sourceSha: "0123456789abcdef0123456789abcdef01234567",
} satisfies Inputs;

describe("build-arch-package contract", () => {
  it("accepts the existing repository, package, SHA, and path contract", () => {
    expect(validateIdentity(validInputs)).toBeUndefined();
  });

  it.each([
    [
      { ...validInputs, sourceRepository: "other/example" },
      "Unsupported source repository",
    ],
    [{ ...validInputs, sourceSha: "abc" }, "full commit SHA"],
    [{ ...validInputs, packageName: "Example" }, "Invalid Arch package name"],
    [{ ...validInputs, packageName: "example-debug" }, "Debug packages"],
    [
      { ...validInputs, pkgbuildPath: "../PKGBUILD" },
      "relative without dot segments",
    ],
    [
      { ...validInputs, pkgbuildPath: "pkg/./PKGBUILD" },
      "relative without dot segments",
    ],
    [
      { ...validInputs, pkgbuildPath: "/PKGBUILD" },
      "relative without dot segments",
    ],
  ])("rejects unsafe identity input %#", (inputs, message) => {
    expect(validateIdentity(inputs)?.message).toContain(message);
  });

  it("constructs the exact provenance shape", () => {
    expect(
      provenance(
        "example-1.0-1-x86_64.pkg.tar.zst",
        "example",
        "timmo001/example",
        validInputs.sourceSha,
      ),
    ).toEqual({
      artifact: "example-1.0-1-x86_64.pkg.tar.zst",
      package: "example",
      source_repository: "timmo001/example",
      source_sha: validInputs.sourceSha,
    });
  });

  it("constructs the exact repository dispatch shape", () => {
    expect(
      dispatchPayload(
        "arch-package-example-123-1",
        "timmo001/example",
        "123",
        validInputs.sourceSha,
      ),
    ).toEqual({
      event_type: "publish-package",
      client_payload: {
        artifact_name: "arch-package-example-123-1",
        source_repository: "timmo001/example",
        source_run_id: "123",
        source_sha: validInputs.sourceSha,
      },
    });
  });

  it.effect.each([
    ["default-git/PKGBUILD", "git+https://github.com/timmo001/example.git"],
    [
      "custom-path/packaging/PKGBUILD",
      "https://example.invalid/releases/$pkgver.tar.gz",
    ],
    ["prepared-binary/PKGBUILD", "auxiliary.conf"],
    ["prepared-source/PKGBUILD", "source.tar.gz"],
    ["stable/PKGBUILD", "pkgname=example"],
    ["git-http/PKGBUILD", "source_x86_64="],
  ])("keeps a representative PKGBUILD fixture for %s", ([path, syntax]) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const fixturePath = `tests/fixtures/arch-package/${path}`;
      const fixture = yield* fs.readFileString(fixturePath);
      expect(fixture).toContain(syntax);
      expect(
        Exit.isSuccess(yield* Effect.exit(exec("bash", ["-n", fixturePath]))),
      ).toBe(true);
    }).pipe(Effect.provide(platformLayer)),
  );

  it.effect(
    "replaces an aliased source fragment with exactly one full commit pin",
    () =>
      Effect.gen(function* () {
        const output = yield* exec("bash", [
          "-c",
          `apply() {
source=(alias::git+https://github.com/timmo001/example.git#branch=main)
source_x86_64=(https://example.invalid/helper.tar.gz)
expected_source=git+https://github.com/timmo001/example.git
source_sha=${validInputs.sourceSha}
PACKAGE_NAME=example-git
${sourcePinningScript}
declare -p source source_x86_64
}
apply`,
        ]);

        expect(output).toContain(
          `alias::git+https://github.com/timmo001/example.git#commit=${validInputs.sourceSha}`,
        );
        expect(output).toContain("https://example.invalid/helper.tar.gz");
      }).pipe(Effect.provide(platformLayer)),
  );

  it.effect("rejects missing and duplicate repository source pins", () =>
    Effect.gen(function* () {
      for (const sources of [
        "source=(https://example.invalid/archive.tar.gz)",
        "source=(git+https://github.com/timmo001/example.git git+https://github.com/timmo001/example.git)",
      ]) {
        const exit = yield* Effect.exit(
          exec("bash", [
            "-c",
            `apply() {
${sources}
expected_source=git+https://github.com/timmo001/example.git
source_sha=${validInputs.sourceSha}
PACKAGE_NAME=example-git
${sourcePinningScript}
}
apply`,
          ]),
        );

        expect(Exit.isFailure(exit)).toBe(true);
      }
    }).pipe(Effect.provide(platformLayer)),
  );

  it.effect(
    "accepts full Git commit pins and rejects aliases and unsupported VCS",
    () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const root = yield* tempDirectory("arch-package-policy-");

        const check = Effect.fn("ArchPackageTest.check")(function* (
          sources: string,
        ) {
          yield* fs.writeFileString(join(root, ".SRCINFO"), sources);

          return yield* Effect.exit(
            exec("bash", [
              "-c",
              `fail() { printf '%s\\n' "$1" >&2; exit 1; }
build_root=$1
${sourcePolicyScript}`,
              "_",
              root,
            ]),
          );
        });

        expect(
          Exit.isSuccess(
            yield* check(
              `source = git+https://github.com/timmo001/example.git#commit=${validInputs.sourceSha}\nsource_x86_64 = https://example.invalid/helper.tar.gz\n`,
            ),
          ),
        ).toBe(true);
        expect(
          Exit.isFailure(
            yield* check(
              "source = git+https://github.com/timmo001/example.git#branch=main\n",
            ),
          ),
        ).toBe(true);
        expect(
          Exit.isFailure(
            yield* check("source = hg+https://example.invalid/repository\n"),
          ),
        ).toBe(true);
      }).pipe(Effect.provide(platformLayer)),
  );
});

const validateFixture = (root: string) =>
  Effect.acquireUseRelease(
    Effect.sync(() => {
      const previous = process.env.RUNNER_TEMP;
      process.env.RUNNER_TEMP = root;

      return previous;
    }),
    () =>
      Effect.exit(
        Effect.scoped(
          run({
            ...validInputs,
            stage: "validate",
            packageName: "example",
          }),
        ),
      ).pipe(
        Effect.provide(layer()),
        Effect.provide(commandLayer),
        Effect.provide(NodeServices.layer),
      ),
    (previous) =>
      Effect.sync(() => {
        if (previous === undefined) delete process.env.RUNNER_TEMP;
        else process.env.RUNNER_TEMP = previous;
      }),
  );

const makePackage = Effect.fn("ArchPackageTest.makePackage")(function* (
  root: string,
  name: string,
  pkgname = "example",
) {
  const fs = yield* FileSystem.FileSystem;
  const content = join(root, `${name}-content`);
  yield* fs.makeDirectory(content);
  yield* fs.writeFileString(
    join(content, ".PKGINFO"),
    `pkgname = ${pkgname}\n`,
  );
  const packagePath = join(root, name);
  yield* exec("bsdtar", ["-a", "-cf", packagePath, "-C", content, ".PKGINFO"]);

  return packagePath;
});

const ustarMagic = (bytes: Uint8Array) =>
  new TextDecoder().decode(bytes.subarray(257, 262));

describe("build-arch-package candidate validation", () => {
  it.effect(
    "supports GNU long names with ustar magic and preserves transport order",
    () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const root = yield* tempDirectory("arch-package-test-");
        const envelope = join(root, "candidate-envelope");
        yield* fs.makeDirectory(envelope);
        const packageName = `example-${"a".repeat(90)}-1-1-x86_64.pkg.tar.zst`;
        expect(packageName.length).toBeGreaterThan(100);
        yield* makePackage(root, packageName);
        yield* exec("tar", [
          "-C",
          root,
          "-cf",
          join(envelope, "arch-package-candidate.tar"),
          "--",
          packageName,
        ]);
        const candidateEnvelope = join(envelope, "arch-package-candidate.tar");
        expect(ustarMagic(yield* fs.readFile(candidateEnvelope))).toBe("ustar");
        expect(yield* exec("tar", ["-tf", candidateEnvelope])).toBe(
          `${packageName}\n`,
        );
        const exit = yield* validateFixture(root);
        expect(exit._tag).toBe("Success");
        expect(
          ustarMagic(yield* fs.readFile(join(root, "candidate.tar"))),
        ).toBe("ustar");
        expect(yield* exec("tar", ["-tf", join(root, "candidate.tar")])).toBe(
          `${packageName}\nprovenance.json\n`,
        );
        expect(
          JSON.parse(
            yield* exec("tar", [
              "-xOf",
              join(root, "candidate.tar"),
              "provenance.json",
            ]),
          ),
        ).toEqual(
          provenance(
            packageName,
            "example",
            validInputs.sourceRepository,
            validInputs.sourceSha,
          ),
        );
      }).pipe(Effect.provide(platformLayer)),
  );

  it.effect("rejects multi-member and non-file envelopes", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;

      for (const unsafe of ["multi", "directory"] as const) {
        yield* Effect.scoped(
          Effect.gen(function* () {
            const root = yield* tempDirectory("arch-package-test-");
            const envelope = join(root, "candidate-envelope");
            yield* fs.makeDirectory(envelope);
            const packageName = "example-1-1-x86_64.pkg.tar.zst";
            yield* makePackage(root, packageName);
            const members = [packageName];

            if (unsafe === "multi") {
              const second = "example-2-1-x86_64.pkg.tar.zst";
              members.push(second);
              yield* makePackage(root, second);
            } else {
              yield* fs.makeDirectory(join(root, "unsafe.pkg.tar.zst"));
              members[0] = "unsafe.pkg.tar.zst";
            }

            yield* exec("tar", [
              "--format=ustar",
              "-C",
              root,
              "-cf",
              join(envelope, "arch-package-candidate.tar"),
              "--",
              ...members,
            ]);
            const exit = yield* validateFixture(root);
            expect(exit._tag).toBe("Failure");
          }),
        );
      }
    }).pipe(Effect.provide(platformLayer)),
  );

  it.effect("rejects a package whose PKGINFO identity differs", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const root = yield* tempDirectory("arch-package-test-");
      const envelope = join(root, "candidate-envelope");
      yield* fs.makeDirectory(envelope);
      const packageName = "other-1-1-x86_64.pkg.tar.zst";
      yield* makePackage(root, packageName, "other");
      yield* exec("tar", [
        "--format=ustar",
        "-C",
        root,
        "-cf",
        join(envelope, "arch-package-candidate.tar"),
        "--",
        packageName,
      ]);
      const exit = yield* validateFixture(root);
      expect(exit._tag).toBe("Failure");
    }).pipe(Effect.provide(platformLayer)),
  );
});
