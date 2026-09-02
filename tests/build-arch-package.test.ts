import { describe, expect, it } from "vitest";
import { NodeServices } from "@effect/platform-node";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Effect, Layer } from "effect";
import {
  dispatchPayload,
  provenance,
  type Inputs,
  run,
  validateIdentity,
  sourcePinningScript,
  sourcePolicyScript,
} from "../src/actions/build-arch-package/workflow.js";
import { CommandExecutor } from "../src/services/CommandExecutor.js";

const validInputs: Inputs = {
  stage: "build",
  packageName: "example-git",
  pkgbuildPath: ".scripts/linux/PKGBUILD",
  sourceRepository: "timmo001/example",
  sourceSha: "0123456789abcdef0123456789abcdef01234567",
};

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

  it.each([
    ["default-git/PKGBUILD", "git+https://github.com/timmo001/example.git"],
    [
      "custom-path/packaging/PKGBUILD",
      "https://example.invalid/releases/$pkgver.tar.gz",
    ],
    ["prepared-binary/PKGBUILD", "auxiliary.conf"],
    ["prepared-source/PKGBUILD", "source.tar.gz"],
    ["stable/PKGBUILD", "pkgname=example"],
    ["git-http/PKGBUILD", "source_x86_64="],
  ])("keeps a representative PKGBUILD fixture for %s", (path, syntax) => {
    const fixturePath = `tests/fixtures/arch-package/${path}`;
    const fixture = readFileSync(fixturePath, "utf8");
    expect(fixture).toContain(syntax);
    expect(() => execFileSync("bash", ["-n", fixturePath])).not.toThrow();
  });

  it("replaces an aliased source fragment with exactly one full commit pin", () => {
    const output = execFileSync(
      "bash",
      [
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
      ],
      { encoding: "utf8" },
    );
    expect(output).toContain(
      `alias::git+https://github.com/timmo001/example.git#commit=${validInputs.sourceSha}`,
    );
    expect(output).toContain("https://example.invalid/helper.tar.gz");
  });

  it("rejects missing and duplicate repository source pins", () => {
    for (const sources of [
      "source=(https://example.invalid/archive.tar.gz)",
      "source=(git+https://github.com/timmo001/example.git git+https://github.com/timmo001/example.git)",
    ]) {
      expect(() =>
        execFileSync("bash", [
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
      ).toThrow();
    }
  });

  it("accepts full Git commit pins and rejects aliases and unsupported VCS", () => {
    const root = mkdtempSync(join(tmpdir(), "arch-package-policy-"));
    try {
      const check = (sources: string) => {
        writeFileSync(join(root, ".SRCINFO"), sources);
        return () =>
          execFileSync("bash", [
            "-c",
            `fail() { printf '%s\\n' "$1" >&2; exit 1; }
build_root=$1
${sourcePolicyScript}`,
            "_",
            root,
          ]);
      };
      expect(
        check(
          `source = git+https://github.com/timmo001/example.git#commit=${validInputs.sourceSha}\nsource_x86_64 = https://example.invalid/helper.tar.gz\n`,
        ),
      ).not.toThrow();
      expect(
        check(
          "source = git+https://github.com/timmo001/example.git#branch=main\n",
        ),
      ).toThrow();
      expect(
        check("source = hg+https://example.invalid/repository\n"),
      ).toThrow();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

const commandLayer = CommandExecutor.layer.pipe(
  Layer.provide(NodeServices.layer),
);

const validateFixture = (root: string) => {
  const previous = process.env.RUNNER_TEMP;
  process.env.RUNNER_TEMP = root;
  return Effect.runPromiseExit(
    Effect.scoped(
      run({
        ...validInputs,
        stage: "validate",
        packageName: "example",
      }),
    ).pipe(Effect.provide(commandLayer), Effect.provide(NodeServices.layer)),
  ).finally(() => {
    if (previous === undefined) delete process.env.RUNNER_TEMP;
    else process.env.RUNNER_TEMP = previous;
  });
};

const makePackage = (root: string, name: string, pkgname = "example") => {
  const content = join(root, `${name}-content`);
  mkdirSync(content);
  writeFileSync(join(content, ".PKGINFO"), `pkgname = ${pkgname}\n`);
  const packagePath = join(root, name);
  execFileSync("bsdtar", ["-a", "-cf", packagePath, "-C", content, ".PKGINFO"]);
  return packagePath;
};

describe("build-arch-package candidate validation", () => {
  it("supports GNU long names with ustar magic and preserves transport order", async () => {
    const root = mkdtempSync(join(tmpdir(), "arch-package-test-"));
    try {
      const envelope = join(root, "candidate-envelope");
      mkdirSync(envelope);
      const packageName = `example-${"a".repeat(90)}-1-1-x86_64.pkg.tar.zst`;
      expect(packageName.length).toBeGreaterThan(100);
      makePackage(root, packageName);
      execFileSync("tar", [
        "-C",
        root,
        "-cf",
        join(envelope, "arch-package-candidate.tar"),
        "--",
        packageName,
      ]);
      const candidateEnvelope = join(envelope, "arch-package-candidate.tar");
      expect(
        readFileSync(candidateEnvelope).subarray(257, 262).toString(),
      ).toBe("ustar");
      expect(
        execFileSync("tar", ["-tf", candidateEnvelope], {
          encoding: "utf8",
        }),
      ).toBe(`${packageName}\n`);
      const exit = await validateFixture(root);
      expect(exit._tag).toBe("Success");
      expect(
        readFileSync(join(root, "candidate.tar")).subarray(257, 262).toString(),
      ).toBe("ustar");
      expect(
        execFileSync("tar", ["-tf", join(root, "candidate.tar")], {
          encoding: "utf8",
        }),
      ).toBe(`${packageName}\nprovenance.json\n`);
      expect(
        JSON.parse(
          execFileSync(
            "tar",
            ["-xOf", join(root, "candidate.tar"), "provenance.json"],
            { encoding: "utf8" },
          ),
        ),
      ).toEqual(
        provenance(
          packageName,
          "example",
          validInputs.sourceRepository,
          validInputs.sourceSha,
        ),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects multi-member and non-file envelopes", async () => {
    for (const unsafe of ["multi", "directory"] as const) {
      const root = mkdtempSync(join(tmpdir(), "arch-package-test-"));
      try {
        const envelope = join(root, "candidate-envelope");
        mkdirSync(envelope);
        const packageName = "example-1-1-x86_64.pkg.tar.zst";
        makePackage(root, packageName);
        const members = [packageName];
        if (unsafe === "multi") {
          const second = "example-2-1-x86_64.pkg.tar.zst";
          members.push(second);
          makePackage(root, second);
        } else {
          mkdirSync(join(root, "unsafe.pkg.tar.zst"));
          members[0] = "unsafe.pkg.tar.zst";
        }
        execFileSync("tar", [
          "--format=ustar",
          "-C",
          root,
          "-cf",
          join(envelope, "arch-package-candidate.tar"),
          "--",
          ...members,
        ]);
        const exit = await validateFixture(root);
        expect(exit._tag).toBe("Failure");
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    }
  });

  it("rejects a package whose PKGINFO identity differs", async () => {
    const root = mkdtempSync(join(tmpdir(), "arch-package-test-"));
    try {
      const envelope = join(root, "candidate-envelope");
      mkdirSync(envelope);
      const packageName = "other-1-1-x86_64.pkg.tar.zst";
      makePackage(root, packageName, "other");
      execFileSync("tar", [
        "--format=ustar",
        "-C",
        root,
        "-cf",
        join(envelope, "arch-package-candidate.tar"),
        "--",
        packageName,
      ]);
      const exit = await validateFixture(root);
      expect(exit._tag).toBe("Failure");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
