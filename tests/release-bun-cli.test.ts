import { join } from "node:path";
import { NodeServices } from "@effect/platform-node";
import { layer } from "@timmo001/effect-gh";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Exit, FileSystem } from "effect";
import { Annotations } from "../src/action/Annotations.js";
import {
  architectureProfiles,
  archiveMemberPaths,
  expectedReleaseAssetCount,
  IDENTITY_PATTERN,
  installNfpmScript,
  isSafeRelativePath,
  linuxAssetNames,
  newlineValues,
  packageAssetsScript,
  releaseTagScript,
  resolveReleaseVersion,
  smokeTestScript,
  type Inputs,
  validateIdentity,
  verifyAssetsScript,
  writeArchiveScript,
  run,
} from "../src/actions/release-bun-cli/workflow.js";
import {
  commandLayer,
  exec,
  git,
  inDirectory,
  initRepo,
  platformLayer,
  tempDirectory,
  withEnv,
} from "./support.js";

const floatApp = {
  binaryName: "float-app",
  packageName: "float-app",
  entrypoint: "src/index.ts",
  packageConfig: ".scripts/linux/nfpm.yaml",
};

const runStage = (inputs: Inputs) =>
  Effect.exit(Effect.scoped(run(inputs))).pipe(
    Effect.provide(layer()),
    Effect.provide(commandLayer),
    Effect.provide(NodeServices.layer),
  );

const messageOf = (result: ReturnType<typeof resolveReleaseVersion>) =>
  result instanceof Annotations.ActionFailure ? result.message : result;

describe("release-bun-cli architecture and assets", () => {
  it("maps both Linux architectures to the current workflow contract", () => {
    expect(architectureProfiles).toEqual({
      x86_64: {
        bunTarget: "bun-linux-x64-baseline",
        debArchitecture: "amd64",
        nfpmArchitecture: "amd64",
        nfpmDownloadArchitecture: "x86_64",
        rpmArchitecture: "x86_64",
      },
      aarch64: {
        bunTarget: "bun-linux-arm64",
        debArchitecture: "arm64",
        nfpmArchitecture: "arm64",
        nfpmDownloadArchitecture: "arm64",
        rpmArchitecture: "aarch64",
      },
    });
  });

  it("names the six Float App assets", () => {
    const version = "20260101.0";

    const assets = [
      ...linuxAssetNames("float-app", version, "x86_64"),
      ...linuxAssetNames("float-app", version, "aarch64"),
    ];

    expect(assets).toEqual([
      "float-app-20260101.0-linux-x86_64.tar.gz",
      "float-app_20260101.0_amd64.deb",
      "float-app-20260101.0-1.x86_64.rpm",
      "float-app-20260101.0-linux-aarch64.tar.gz",
      "float-app_20260101.0_arm64.deb",
      "float-app-20260101.0-1.aarch64.rpm",
    ]);
    expect(assets).toHaveLength(expectedReleaseAssetCount);
  });

  it("keeps Notes binary and package names distinct in asset names", () => {
    expect(linuxAssetNames("repo-notes", "20260315.2", "x86_64")).toEqual([
      "repo-notes-20260315.2-linux-x86_64.tar.gz",
      "repo-notes_20260315.2_amd64.deb",
      "repo-notes-20260315.2-1.x86_64.rpm",
    ]);
    expect(IDENTITY_PATTERN.test("notes")).toBe(true);
    expect(IDENTITY_PATTERN.test("repo-notes")).toBe(true);
  });

  it("includes Music Assistant extra archive members after the binary", () => {
    expect(
      archiveMemberPaths("music-assistant-tui", "sendspin-rs-cli"),
    ).toEqual(["music-assistant-tui", "sendspin-rs-cli"]);
    expect(isSafeRelativePath("sendspin-rs-cli")).toBe(true);
  });
});

describe("release-bun-cli identity", () => {
  it("accepts Float App paths and names", () => {
    expect(validateIdentity(floatApp)).toBeUndefined();
    expect(isSafeRelativePath(".scripts/linux/nfpm.yaml")).toBe(true);
    expect(isSafeRelativePath("src/index.ts")).toBe(true);
  });

  it.each([
    [{ ...floatApp, binaryName: "Float-App" }, "Invalid binary name"],
    [{ ...floatApp, packageName: "repo notes" }, "Invalid package name"],
    [{ ...floatApp, entrypoint: "/src/index.ts" }, "relative and must not"],
    [{ ...floatApp, packageConfig: "../nfpm.yaml" }, "relative and must not"],
    [
      { ...floatApp, packageConfig: "scripts/./nfpm.yaml" },
      "relative and must not",
    ],
  ])("rejects unsafe identity input %#", (input, message) => {
    expect(validateIdentity(input)?.message).toContain(message);
  });
});

describe("release-bun-cli version allocation", () => {
  it("uses a requested YYYYMMDD.N version", () => {
    expect(
      resolveReleaseVersion({
        requestedVersion: "20260101.4",
        releaseDate: "20260102",
        tagsPointingAtSource: ["20260101.0"],
        tagsForReleaseDate: ["20260102.0"],
      }),
    ).toBe("20260101.4");
  });

  it("uses a requested X.Y.Z version", () => {
    expect(
      resolveReleaseVersion({
        requestedVersion: "0.1.0",
        releaseDate: "20260102",
        tagsPointingAtSource: ["20260101.0"],
        tagsForReleaseDate: ["20260102.0"],
      }),
    ).toBe("0.1.0");
  });

  it.each(["1.2.3-beta.1", "01.2.3", "1.2"])(
    "rejects requested version %s",
    (requestedVersion) => {
      expect(
        messageOf(
          resolveReleaseVersion({
            requestedVersion,
            releaseDate: "20260101",
            tagsPointingAtSource: [],
            tagsForReleaseDate: [],
          }),
        ),
      ).toContain(`Invalid release version: ${requestedVersion}`);
    },
  );

  it("rejects an invalid requested version", () => {
    expect(
      messageOf(
        resolveReleaseVersion({
          requestedVersion: "v1.2.3",
          releaseDate: "20260101",
          tagsPointingAtSource: [],
          tagsForReleaseDate: [],
        }),
      ),
    ).toContain("Invalid release version: v1.2.3");
  });

  it("reuses the highest matching tag already pointing at the source", () => {
    expect(
      resolveReleaseVersion({
        requestedVersion: undefined,
        releaseDate: "20260101",
        tagsPointingAtSource: ["20260101.3", "v1.0", "20251231.9"],
        tagsForReleaseDate: ["20260101.8"],
      }),
    ).toBe("20260101.3");
  });

  it("starts a new UTC date series at .0", () => {
    expect(
      resolveReleaseVersion({
        requestedVersion: undefined,
        releaseDate: "20260101",
        tagsPointingAtSource: [],
        tagsForReleaseDate: [],
      }),
    ).toBe("20260101.0");
  });

  it("increments the current UTC date series", () => {
    expect(
      resolveReleaseVersion({
        requestedVersion: undefined,
        releaseDate: "20260101",
        tagsPointingAtSource: [],
        tagsForReleaseDate: ["20260101.10", "20260101.9"],
      }),
    ).toBe("20260101.11");
  });

  it("rejects a non-numeric tag in the current date series", () => {
    expect(
      messageOf(
        resolveReleaseVersion({
          requestedVersion: undefined,
          releaseDate: "20260101",
          tagsPointingAtSource: [],
          tagsForReleaseDate: ["20260101.beta"],
        }),
      ),
    ).toContain("Invalid release tag in the 20260101 series: 20260101.beta");
  });
});

describe("release-bun-cli scripts", () => {
  it.effect.each([
    smokeTestScript,
    installNfpmScript,
    writeArchiveScript,
    packageAssetsScript,
    verifyAssetsScript,
    releaseTagScript,
  ])("keeps a syntactically valid bash stage script %#", (script) =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(exec("bash", ["-n", "-c", script]));

      expect(Exit.isSuccess(exit)).toBe(true);
    }).pipe(Effect.provide(platformLayer)),
  );
});

const writeExecutable = Effect.fn("ReleaseBunCliTest.writeExecutable")(
  function* (path: string, content: string) {
    const fs = yield* FileSystem.FileSystem;
    yield* fs.writeFileString(path, content, { mode: 0o755 });
    yield* fs.chmod(path, 0o755);
  },
);

describe("release-bun-cli smoke tests and prepare", () => {
  it.effect(
    "preserves line and argument splitting for Context-style smoke tests",
    () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const root = yield* tempDirectory("release-bun-cli-smoke-");
        yield* fs.makeDirectory(join(root, "dist/release/root"), {
          recursive: true,
        });
        yield* writeExecutable(
          join(root, "dist/release/root/context"),
          `#!/bin/bash
printf '%s\\n' "$#" "$@" >> "$TRACE"
`,
        );
        const trace = join(root, "trace");
        yield* inDirectory(root);
        yield* withEnv("TRACE", trace);

        const exit = yield* runStage({
          stage: "smoke-test",
          binaryName: "context",
          smokeTestArguments: "help\nstack --json\n",
        });

        expect(exit._tag).toBe("Success");
        expect(yield* fs.readFileString(trace)).toBe(
          "1\nhelp\n2\nstack\n--json\n",
        );
      }).pipe(Effect.provide(platformLayer)),
  );

  it.effect("runs package-prepare-command with trusted Bash semantics", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const root = yield* tempDirectory("release-bun-cli-prepare-");
      yield* inDirectory(root);

      const exit = yield* runStage({
        stage: "prepare-package",
        packagePrepareCommand:
          "mkdir -p out && printf '%s' \"$HOME\" > out/home",
      });

      expect(exit._tag).toBe("Success");
      expect(yield* fs.readFileString(join(root, "out/home"))).toBe(
        process.env.HOME ?? "",
      );
    }).pipe(Effect.provide(platformLayer)),
  );
});

describe("release-bun-cli archives and checksums", () => {
  it.effect("writes deterministic archive metadata", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const root = yield* tempDirectory("release-bun-cli-archive-");
      yield* fs.makeDirectory(join(root, "dist/release/root"), {
        recursive: true,
      });
      yield* fs.writeFileString(
        join(root, "dist/release/root/float-app"),
        "binary\n",
      );
      yield* fs.writeFileString(
        join(root, "dist/release/root/sendspin-rs-cli"),
        "extra\n",
      );

      const env = {
        ARCHIVE_PATHS: "float-app\nsendspin-rs-cli",
        PACKAGE_NAME: "float-app",
        VERSION: "20260101.0",
        RELEASE_ARCHITECTURE: "x86_64",
      };

      const archive = join(
        root,
        "dist/release/assets/float-app-20260101.0-linux-x86_64.tar.gz",
      );

      yield* exec("bash", ["-c", writeArchiveScript], { cwd: root, env });
      yield* exec("bash", ["-c", writeArchiveScript], { cwd: root, env });

      const first = yield* fs.readFile(archive);

      yield* exec("bash", ["-c", writeArchiveScript], { cwd: root, env });

      const second = yield* fs.readFile(archive);

      expect(Buffer.from(first).equals(Buffer.from(second))).toBe(true);
      expect([first[0], first[1]]).toEqual([0x1f, 0x8b]);
    }).pipe(Effect.provide(platformLayer)),
  );

  it.effect("creates SHA256SUMS after verifying six assets", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const root = yield* tempDirectory("release-bun-cli-verify-");

      const assets = [
        ...linuxAssetNames("float-app", "20260101.0", "x86_64"),
        ...linuxAssetNames("float-app", "20260101.0", "aarch64"),
      ];

      for (const asset of assets) {
        yield* fs.writeFileString(join(root, asset), `${asset}\n`);
      }

      const exit = yield* runStage({
        stage: "verify-assets",
        assetRoot: root,
      });

      expect(exit._tag).toBe("Success");

      const sums = (yield* fs.readFileString(join(root, "SHA256SUMS")))
        .trim()
        .split("\n");

      expect(sums).toHaveLength(expectedReleaseAssetCount);
      expect(sums.map((line) => line.split("  ")[1])).toEqual(
        expect.arrayContaining(assets),
      );
    }).pipe(Effect.provide(platformLayer)),
  );

  it.effect("rejects the wrong number of release assets", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const root = yield* tempDirectory("release-bun-cli-verify-");
      yield* fs.writeFileString(join(root, "only-one"), "nope\n");

      const exit = yield* runStage({
        stage: "verify-assets",
        assetRoot: root,
      });

      expect(exit._tag).toBe("Failure");
    }).pipe(Effect.provide(platformLayer)),
  );
});

const publishFixture = Effect.fn("ReleaseBunCliTest.publishFixture")(function* (
  ghScript: string,
  tag?: string,
) {
  const fs = yield* FileSystem.FileSystem;
  const root = yield* tempDirectory("release-bun-cli-publish-");
  const sha = yield* initRepo(root);

  if (tag !== undefined) yield* git(["tag", tag], root);

  const bin = join(root, "bin");
  yield* fs.makeDirectory(bin);
  const log = join(root, "gh.log");
  yield* writeExecutable(join(bin, "gh"), ghScript);
  const assets = join(root, "assets");
  yield* fs.makeDirectory(assets);
  yield* fs.writeFileString(join(assets, "asset.tar.gz"), "asset\n");
  yield* inDirectory(root);
  yield* withEnv("PATH", `${bin}:${process.env.PATH ?? ""}`);
  yield* withEnv("GH_LOG", log);

  return { root, sha, log, assets };
});

describe("release-bun-cli GitHub reconciliation", () => {
  it.effect("uploads to an existing release without editing it", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;

      const { sha, log, assets } = yield* publishFixture(
        `#!/bin/bash
printf '%s\\n' "$*" >> "$GH_LOG"
if [[ "$1" == "release" && "$2" == "view" ]]; then
  exit 0
fi
`,
      );

      const exit = yield* runStage({
        stage: "publish-release",
        assetRoot: assets,
        releaseVersion: "20260101.0",
        sourceSha: sha,
        existingRelease: "true",
        prerelease: "false",
      });

      expect(exit._tag).toBe("Success");
      expect(yield* fs.readFileString(log)).toBe(
        `release view 20260101.0\nrelease upload 20260101.0 ${assets}/asset.tar.gz --clobber\n`,
      );
    }).pipe(Effect.provide(platformLayer)),
  );

  it.effect("creates a prerelease when the tag is absent", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;

      const { sha, log, assets } = yield* publishFixture(
        `#!/bin/bash
printf '%s\\n' "$*" >> "$GH_LOG"
`,
      );

      const exit = yield* runStage({
        stage: "publish-release",
        assetRoot: assets,
        releaseVersion: "20260101.0",
        sourceSha: sha,
        existingRelease: "false",
        prerelease: "true",
      });

      expect(exit._tag).toBe("Success");
      expect(yield* fs.readFileString(log)).toContain(
        `release create 20260101.0 ${assets}/asset.tar.gz --target ${sha} --title 20260101.0 --notes Rolling release 20260101.0 from commit ${sha}. --prerelease`,
      );
    }).pipe(Effect.provide(platformLayer)),
  );

  it.effect(
    "edits an existing same-commit release instead of creating it",
    () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;

        const { sha, log, assets } = yield* publishFixture(
          `#!/bin/bash
printf '%s\\n' "$*" >> "$GH_LOG"
`,
          "20260101.0",
        );

        const exit = yield* runStage({
          stage: "publish-release",
          assetRoot: assets,
          releaseVersion: "20260101.0",
          sourceSha: sha,
          existingRelease: "false",
          prerelease: "false",
        });

        expect(exit._tag).toBe("Success");
        const logged = yield* fs.readFileString(log);
        expect(logged).toContain("release view 20260101.0");
        expect(logged).toContain("release edit 20260101.0");
        expect(logged).toContain("--prerelease=false");
        expect(logged).not.toContain("release create");
      }).pipe(Effect.provide(platformLayer)),
  );

  it.effect("fails when an existing tag points at another commit", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const root = yield* tempDirectory("release-bun-cli-publish-");
      yield* initRepo(root);
      yield* git(["tag", "20260101.0"], root);
      yield* git(["commit", "--allow-empty", "-m", "other"], root);
      const other = yield* git(["rev-parse", "HEAD"], root);
      const assets = join(root, "assets");
      yield* fs.makeDirectory(assets);
      yield* fs.writeFileString(join(assets, "asset.tar.gz"), "asset\n");
      yield* inDirectory(root);

      const exit = yield* runStage({
        stage: "publish-release",
        assetRoot: assets,
        releaseVersion: "20260101.0",
        sourceSha: other,
        existingRelease: "false",
        prerelease: "true",
      });

      expect(exit._tag).toBe("Failure");
    }).pipe(Effect.provide(platformLayer)),
  );
});

describe("release-bun-cli version job", () => {
  it.effect("allocates a requested version and writes outputs", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const root = yield* tempDirectory("release-bun-cli-version-");
      const output = join(root, "github-output");
      yield* fs.writeFileString(output, "");
      const sha = yield* initRepo(root);
      yield* inDirectory(root);
      yield* withEnv("GITHUB_OUTPUT", output);

      const exit = yield* runStage({
        stage: "allocate-version",
        releaseVersion: "20260101.7",
      });

      expect(exit._tag).toBe("Success");
      const written = yield* fs.readFileString(output);
      expect(written).toContain("release-version");
      expect(written).toContain("20260101.7");
      expect(written).toContain("source-sha");
      expect(written).toContain(sha);
    }).pipe(Effect.provide(platformLayer)),
  );
});

describe("release-bun-cli newline lists", () => {
  it("skips empty lines while keeping extra archive paths", () => {
    expect(newlineValues("sendspin-rs-cli\n\n")).toEqual(["sendspin-rs-cli"]);
    expect(newlineValues(undefined)).toEqual([]);
  });
});
