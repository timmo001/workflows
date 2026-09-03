import { execFileSync } from "node:child_process";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NodeServices } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";
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
  publishReleaseScript,
  resolveReleaseVersion,
  smokeTestScript,
  type Inputs,
  validateIdentity,
  verifyAssetsScript,
  writeArchiveScript,
  run,
} from "../src/actions/release-bun-cli/workflow.js";
import { CommandExecutor } from "../src/services/CommandExecutor.js";

const floatApp = {
  binaryName: "float-app",
  packageName: "float-app",
  entrypoint: "src/index.ts",
  packageConfig: ".scripts/linux/nfpm.yaml",
};

const commandLayer = CommandExecutor.layer.pipe(
  Layer.provide(NodeServices.layer),
);

const runStage = (inputs: Inputs) =>
  Effect.runPromiseExit(
    Effect.scoped(run(inputs)).pipe(
      Effect.provide(commandLayer),
      Effect.provide(NodeServices.layer),
    ),
  );

const messageOf = (result: ReturnType<typeof resolveReleaseVersion>) =>
  result instanceof Annotations.ActionFailure ? result.message : result;

const git = (args: string[], cwd: string) =>
  execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

const initRepo = (root: string) => {
  git(["init", "-b", "main"], root);
  git(["config", "user.email", "test@example.com"], root);
  git(["config", "user.name", "test"], root);
  git(["commit", "--allow-empty", "-m", "init"], root);
  return git(["rev-parse", "HEAD"], root);
};

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
  it.each([
    smokeTestScript,
    installNfpmScript,
    writeArchiveScript,
    packageAssetsScript,
    verifyAssetsScript,
    publishReleaseScript,
  ])("keeps a syntactically valid bash stage script %#", (script) => {
    expect(() => execFileSync("bash", ["-n", "-c", script])).not.toThrow();
  });
});

describe("release-bun-cli smoke tests and prepare", () => {
  it("preserves line and argument splitting for Context-style smoke tests", async () => {
    const root = mkdtempSync(join(tmpdir(), "release-bun-cli-smoke-"));
    const previous = process.cwd();
    try {
      mkdirSync(join(root, "dist/release/root"), { recursive: true });
      writeFileSync(
        join(root, "dist/release/root/context"),
        `#!/bin/bash
printf '%s\\n' "$#" "$@" >> "$TRACE"
`,
      );
      chmodSync(join(root, "dist/release/root/context"), 0o755);
      const trace = join(root, "trace");
      process.chdir(root);
      process.env.TRACE = trace;
      const exit = await runStage({
        stage: "smoke-test",
        binaryName: "context",
        smokeTestArguments: "help\nstack --json\n",
      });
      expect(exit._tag).toBe("Success");
      expect(readFileSync(trace, "utf8")).toBe("1\nhelp\n2\nstack\n--json\n");
    } finally {
      process.chdir(previous);
      delete process.env.TRACE;
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("runs package-prepare-command with trusted Bash semantics", async () => {
    const root = mkdtempSync(join(tmpdir(), "release-bun-cli-prepare-"));
    const previous = process.cwd();
    try {
      process.chdir(root);
      const exit = await runStage({
        stage: "prepare-package",
        packagePrepareCommand:
          "mkdir -p out && printf '%s' \"$HOME\" > out/home",
      });
      expect(exit._tag).toBe("Success");
      expect(readFileSync(join(root, "out/home"), "utf8")).toBe(
        process.env.HOME ?? "",
      );
    } finally {
      process.chdir(previous);
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("release-bun-cli archives and checksums", () => {
  it("writes deterministic archive metadata", () => {
    const root = mkdtempSync(join(tmpdir(), "release-bun-cli-archive-"));
    try {
      mkdirSync(join(root, "dist/release/root"), { recursive: true });
      writeFileSync(join(root, "dist/release/root/float-app"), "binary\n");
      writeFileSync(join(root, "dist/release/root/sendspin-rs-cli"), "extra\n");
      const env = {
        ...process.env,
        ARCHIVE_PATHS: "float-app\nsendspin-rs-cli",
        PACKAGE_NAME: "float-app",
        VERSION: "20260101.0",
        RELEASE_ARCHITECTURE: "x86_64",
      };
      execFileSync("bash", ["-c", writeArchiveScript], { cwd: root, env });
      execFileSync("bash", ["-c", writeArchiveScript], { cwd: root, env });
      const first = readFileSync(
        join(
          root,
          "dist/release/assets/float-app-20260101.0-linux-x86_64.tar.gz",
        ),
      );
      execFileSync("bash", ["-c", writeArchiveScript], { cwd: root, env });
      const second = readFileSync(
        join(
          root,
          "dist/release/assets/float-app-20260101.0-linux-x86_64.tar.gz",
        ),
      );
      expect(first.equals(second)).toBe(true);
      expect([first[0], first[1]]).toEqual([0x1f, 0x8b]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("creates SHA256SUMS after verifying six assets", async () => {
    const root = mkdtempSync(join(tmpdir(), "release-bun-cli-verify-"));
    try {
      const assets = [
        ...linuxAssetNames("float-app", "20260101.0", "x86_64"),
        ...linuxAssetNames("float-app", "20260101.0", "aarch64"),
      ];
      for (const asset of assets) {
        writeFileSync(join(root, asset), `${asset}\n`);
      }
      const exit = await runStage({
        stage: "verify-assets",
        assetRoot: root,
      });
      expect(exit._tag).toBe("Success");
      const sums = readFileSync(join(root, "SHA256SUMS"), "utf8")
        .trim()
        .split("\n");
      expect(sums).toHaveLength(expectedReleaseAssetCount);
      expect(sums.map((line) => line.split("  ")[1]).sort()).toEqual(
        [...assets].sort(),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects the wrong number of release assets", async () => {
    const root = mkdtempSync(join(tmpdir(), "release-bun-cli-verify-"));
    try {
      writeFileSync(join(root, "only-one"), "nope\n");
      const exit = await runStage({
        stage: "verify-assets",
        assetRoot: root,
      });
      expect(exit._tag).toBe("Failure");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("release-bun-cli GitHub reconciliation", () => {
  it("uploads to an existing release without editing it", async () => {
    const root = mkdtempSync(join(tmpdir(), "release-bun-cli-publish-"));
    const previous = process.cwd();
    const previousPath = process.env.PATH;
    try {
      const sha = initRepo(root);
      const bin = join(root, "bin");
      mkdirSync(bin);
      const log = join(root, "gh.log");
      writeFileSync(
        join(bin, "gh"),
        `#!/bin/bash
printf '%s\\n' "$*" >> "$GH_LOG"
if [[ "$1" == "release" && "$2" == "view" ]]; then
  exit 0
fi
`,
      );
      chmodSync(join(bin, "gh"), 0o755);
      const assets = join(root, "assets");
      mkdirSync(assets);
      writeFileSync(join(assets, "asset.tar.gz"), "asset\n");
      process.chdir(root);
      process.env.PATH = `${bin}:${previousPath}`;
      process.env.GH_LOG = log;
      const exit = await runStage({
        stage: "publish-release",
        assetRoot: assets,
        releaseVersion: "20260101.0",
        sourceSha: sha,
        existingRelease: "true",
        prerelease: "false",
      });
      expect(exit._tag).toBe("Success");
      expect(readFileSync(log, "utf8")).toBe(
        `release view 20260101.0\nrelease upload 20260101.0 ${assets}/asset.tar.gz --clobber\n`,
      );
    } finally {
      process.chdir(previous);
      process.env.PATH = previousPath;
      delete process.env.GH_LOG;
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("creates a prerelease when the tag is absent", async () => {
    const root = mkdtempSync(join(tmpdir(), "release-bun-cli-publish-"));
    const previous = process.cwd();
    const previousPath = process.env.PATH;
    try {
      const sha = initRepo(root);
      const bin = join(root, "bin");
      mkdirSync(bin);
      const log = join(root, "gh.log");
      writeFileSync(
        join(bin, "gh"),
        `#!/bin/bash
printf '%s\\n' "$*" >> "$GH_LOG"
`,
      );
      chmodSync(join(bin, "gh"), 0o755);
      const assets = join(root, "assets");
      mkdirSync(assets);
      writeFileSync(join(assets, "asset.tar.gz"), "asset\n");
      process.chdir(root);
      process.env.PATH = `${bin}:${previousPath}`;
      process.env.GH_LOG = log;
      const exit = await runStage({
        stage: "publish-release",
        assetRoot: assets,
        releaseVersion: "20260101.0",
        sourceSha: sha,
        existingRelease: "false",
        prerelease: "true",
      });
      expect(exit._tag).toBe("Success");
      expect(readFileSync(log, "utf8")).toContain(
        `release create 20260101.0 ${assets}/asset.tar.gz --target ${sha} --title 20260101.0 --notes Rolling release 20260101.0 from commit ${sha}. --prerelease`,
      );
    } finally {
      process.chdir(previous);
      process.env.PATH = previousPath;
      delete process.env.GH_LOG;
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("edits an existing same-commit release instead of creating it", async () => {
    const root = mkdtempSync(join(tmpdir(), "release-bun-cli-publish-"));
    const previous = process.cwd();
    const previousPath = process.env.PATH;
    try {
      const sha = initRepo(root);
      git(["tag", "20260101.0"], root);
      const bin = join(root, "bin");
      mkdirSync(bin);
      const log = join(root, "gh.log");
      writeFileSync(
        join(bin, "gh"),
        `#!/bin/bash
printf '%s\\n' "$*" >> "$GH_LOG"
`,
      );
      chmodSync(join(bin, "gh"), 0o755);
      const assets = join(root, "assets");
      mkdirSync(assets);
      writeFileSync(join(assets, "asset.tar.gz"), "asset\n");
      process.chdir(root);
      process.env.PATH = `${bin}:${previousPath}`;
      process.env.GH_LOG = log;
      const exit = await runStage({
        stage: "publish-release",
        assetRoot: assets,
        releaseVersion: "20260101.0",
        sourceSha: sha,
        existingRelease: "false",
        prerelease: "false",
      });
      expect(exit._tag).toBe("Success");
      const logged = readFileSync(log, "utf8");
      expect(logged).toContain("release view 20260101.0");
      expect(logged).toContain("release edit 20260101.0");
      expect(logged).toContain("--prerelease=false");
      expect(logged).not.toContain("release create");
    } finally {
      process.chdir(previous);
      process.env.PATH = previousPath;
      delete process.env.GH_LOG;
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("fails when an existing tag points at another commit", async () => {
    const root = mkdtempSync(join(tmpdir(), "release-bun-cli-publish-"));
    const previous = process.cwd();
    try {
      initRepo(root);
      git(["tag", "20260101.0"], root);
      git(["commit", "--allow-empty", "-m", "other"], root);
      const other = git(["rev-parse", "HEAD"], root);
      const assets = join(root, "assets");
      mkdirSync(assets);
      writeFileSync(join(assets, "asset.tar.gz"), "asset\n");
      process.chdir(root);
      const exit = await runStage({
        stage: "publish-release",
        assetRoot: assets,
        releaseVersion: "20260101.0",
        sourceSha: other,
        existingRelease: "false",
        prerelease: "true",
      });
      expect(exit._tag).toBe("Failure");
    } finally {
      process.chdir(previous);
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("release-bun-cli version job", () => {
  it("allocates a requested version and writes outputs", async () => {
    const root = mkdtempSync(join(tmpdir(), "release-bun-cli-version-"));
    const previous = process.cwd();
    const output = join(root, "github-output");
    writeFileSync(output, "");
    try {
      const sha = initRepo(root);
      process.chdir(root);
      process.env.GITHUB_OUTPUT = output;
      const exit = await runStage({
        stage: "allocate-version",
        releaseVersion: "20260101.7",
      });
      expect(exit._tag).toBe("Success");
      const written = readFileSync(output, "utf8");
      expect(written).toContain("release-version");
      expect(written).toContain("20260101.7");
      expect(written).toContain("source-sha");
      expect(written).toContain(sha);
    } finally {
      process.chdir(previous);
      delete process.env.GITHUB_OUTPUT;
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("release-bun-cli newline lists", () => {
  it("skips empty lines while keeping extra archive paths", () => {
    expect(newlineValues("sendspin-rs-cli\n\n")).toEqual(["sendspin-rs-cli"]);
    expect(newlineValues(undefined)).toEqual([]);
  });
});
