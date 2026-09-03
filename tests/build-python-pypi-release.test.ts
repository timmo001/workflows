import { execFileSync } from "node:child_process";
import {
  existsSync,
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
import {
  ARTIFACT_NAME_PREFIX,
  artifactName,
  type Inputs,
  run,
  validateDistributionsScript,
  validateEvent,
  validateTagScript,
} from "../src/actions/build-python-pypi-release/workflow.js";
import { CommandExecutor } from "../src/services/CommandExecutor.js";

const publishedRelease: Inputs = {
  stage: "validate-event",
  eventName: "release",
  eventAction: "published",
  releaseDraft: "false",
  releasePrerelease: "false",
  releaseTag: "1.0.0",
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

const pythonWithPackaging = () => {
  for (const bin of ["python3", "python", "/usr/bin/python3"]) {
    try {
      execFileSync(bin, ["-c", "import packaging.utils, packaging.version"], {
        stdio: "ignore",
      });
      return bin;
    } catch {
      continue;
    }
  }
  throw new Error("Python packaging is required for these tests");
};

const python = pythonWithPackaging();

const runPython = (script: string, env: Record<string, string>) =>
  execFileSync(python, ["-c", script], {
    encoding: "utf8",
    env: { ...process.env, ...env },
  });

const git = (args: string[], cwd: string) =>
  execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

const initRepo = (root: string) => {
  git(["init", "-b", "main"], root);
  git(["config", "user.email", "test@example.com"], root);
  git(["config", "user.name", "test"], root);
  git(["commit", "--allow-empty", "-m", "init"], root);
  return git(["rev-parse", "HEAD"], root);
};

const writeDistributions = (
  dist: string,
  args: {
    packageName: string;
    version: string;
    wheelFile?: string;
    sdistFile?: string;
    metadataName?: string;
    metadataVersion?: string;
    extraWheelEntries?: ReadonlyArray<readonly [string, string]>;
    extraSdistEntries?: ReadonlyArray<readonly [string, string]>;
    omitDefaultMetadata?: boolean;
    omitDefaultPkgInfo?: boolean;
    skipWheel?: boolean;
    skipSdist?: boolean;
    extraFiles?: ReadonlyArray<string>;
  },
) => {
  mkdirSync(dist, { recursive: true });
  execFileSync(
    python,
    [
      "-c",
      `
import io
import json
import sys
import tarfile
from pathlib import Path
from zipfile import ZipFile

args = json.loads(sys.argv[1])
dist = Path(args["dist"])
name = args["packageName"]
version = args["version"]
metadata = (
    f"Metadata-Version: 2.3\\nName: {args['metadataName']}\\n"
    f"Version: {args['metadataVersion']}\\n"
).encode()
escaped = name.replace("-", "_")
if not args["skipWheel"]:
    with ZipFile(dist / args["wheelFile"], "w") as archive:
        if not args["omitDefaultMetadata"]:
            archive.writestr(f"{escaped}-{version}.dist-info/METADATA", metadata)
        for entry_name, data in args["extraWheelEntries"]:
            archive.writestr(entry_name, data)
if not args["skipSdist"]:
    with tarfile.open(dist / args["sdistFile"], "w:gz") as archive:
        if not args["omitDefaultPkgInfo"]:
            info = tarfile.TarInfo(f"{escaped}-{version}/PKG-INFO")
            info.size = len(metadata)
            archive.addfile(info, io.BytesIO(metadata))
        for entry_name, data in args["extraSdistEntries"]:
            payload = data.encode()
            member = tarfile.TarInfo(entry_name)
            member.size = len(payload)
            archive.addfile(member, io.BytesIO(payload))
for extra in args["extraFiles"]:
    (dist / extra).write_text("nope\\n")
`,
      JSON.stringify({
        dist,
        packageName: args.packageName,
        version: args.version,
        wheelFile:
          args.wheelFile ??
          `${args.packageName.replaceAll("-", "_")}-${args.version}-py3-none-any.whl`,
        sdistFile:
          args.sdistFile ??
          `${args.packageName.replaceAll("-", "_")}-${args.version}.tar.gz`,
        metadataName: args.metadataName ?? args.packageName,
        metadataVersion: args.metadataVersion ?? args.version,
        extraWheelEntries: args.extraWheelEntries ?? [],
        extraSdistEntries: args.extraSdistEntries ?? [],
        omitDefaultMetadata: args.omitDefaultMetadata === true,
        omitDefaultPkgInfo: args.omitDefaultPkgInfo === true,
        skipWheel: args.skipWheel === true,
        skipSdist: args.skipSdist === true,
        extraFiles: args.extraFiles ?? [],
      }),
    ],
    { encoding: "utf8" },
  );
};

describe("build-python-pypi-release event contract", () => {
  it("accepts a published stable release", () => {
    expect(validateEvent(publishedRelease)).toBeUndefined();
  });

  it.each([
    [
      { ...publishedRelease, eventName: "push" },
      "PyPI publication requires a release event.",
    ],
    [
      { ...publishedRelease, eventAction: "created" },
      "PyPI publication requires a published release.",
    ],
    [
      { ...publishedRelease, releaseDraft: "true" },
      "Draft releases cannot be published to PyPI.",
    ],
    [
      { ...publishedRelease, releasePrerelease: "true" },
      "Prereleases cannot be published through the stable PyPI workflow.",
    ],
    [
      {
        stage: "validate-event",
        eventName: "release",
        eventAction: "published",
        releaseDraft: "false",
        releasePrerelease: "false",
      },
      "The release has no tag.",
    ],
    [{ ...publishedRelease, releaseTag: "" }, "The release has no tag."],
  ] as const)("rejects %j", (inputs, message) => {
    expect(validateEvent(inputs)?.message).toBe(message);
  });

  it("runs the validate-event stage", async () => {
    const exit = await runStage(publishedRelease);
    expect(exit._tag).toBe("Success");
    const failed = await runStage({
      ...publishedRelease,
      eventName: "workflow_dispatch",
    });
    expect(failed._tag).toBe("Failure");
  });
});

describe("build-python-pypi-release artifact contract", () => {
  it("keeps the workflow artifact name", () => {
    expect(artifactName("123", "1")).toBe("python-package-distributions-123-1");
    expect(
      readFileSync(".github/workflows/build-python-pypi-release.yml", "utf8"),
    ).toContain(
      `${ARTIFACT_NAME_PREFIX}-\${{ github.run_id }}-\${{ github.run_attempt }}`,
    );
  });
});

describe("build-python-pypi-release source immutability", () => {
  it("accepts a tag that peels to HEAD, including annotated tags", async () => {
    const root = mkdtempSync(join(tmpdir(), "python-release-source-"));
    const previous = process.cwd();
    try {
      const sha = initRepo(root);
      git(["tag", "1.0.0"], root);
      process.chdir(root);
      const lightweight = await runStage({
        stage: "validate-source",
        releaseTag: "1.0.0",
      });
      expect(lightweight._tag).toBe("Success");
      git(["tag", "-d", "1.0.0"], root);
      git(["tag", "-a", "1.0.0", "-m", "release"], root);
      const annotated = await runStage({
        stage: "validate-source",
        releaseTag: "1.0.0",
      });
      expect(annotated._tag).toBe("Success");
      const tagObject = git(["rev-parse", "refs/tags/1.0.0"], root);
      expect(tagObject).not.toBe(sha);
      expect(git(["rev-parse", "refs/tags/1.0.0^{commit}"], root)).toBe(sha);
    } finally {
      process.chdir(previous);
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects a tag that points at another commit", async () => {
    const root = mkdtempSync(join(tmpdir(), "python-release-source-"));
    const previous = process.cwd();
    try {
      initRepo(root);
      git(["tag", "1.0.0"], root);
      git(["commit", "--allow-empty", "-m", "later"], root);
      process.chdir(root);
      const exit = await runStage({
        stage: "validate-source",
        releaseTag: "1.0.0",
      });
      expect(exit._tag).toBe("Failure");
    } finally {
      process.chdir(previous);
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("build-python-pypi-release packaging parity", () => {
  it.each([
    ["Friendly-Bard", "friendly-bard"],
    ["oslo.concurrency", "oslo-concurrency"],
    ["FrIeNdLy-._.-bArD", "friendly-bard"],
    ["systembridgeconnector", "systembridgeconnector"],
    ["example_pkg", "example-pkg"],
  ])("canonicalize_name(%s) is %s", (name, expected) => {
    const actual = execFileSync(
      python,
      [
        "-c",
        "from packaging.utils import canonicalize_name; import sys; print(canonicalize_name(sys.argv[1]), end='')",
        name,
      ],
      { encoding: "utf8" },
    );
    expect(actual).toBe(expected);
  });

  it.each([
    ["1.0.0", true],
    ["1.0", true],
    ["v1.2.3", true],
    ["1.0.0.post1", true],
    ["1.0.0a1", false],
    ["1.0.0b2", false],
    ["1.0.0rc1", false],
    ["1.0.0.dev1", false],
    ["1.0.0+local", false],
    ["not-a-version", false],
  ])("stable public version %s -> %s", (tag, stable) => {
    const runTag = () => runPython(validateTagScript, { RELEASE_TAG: tag });
    if (stable) {
      expect(runTag).not.toThrow();
      return;
    }
    expect(runTag).toThrow();
  });

  it("treats 1.0 and 1.0.0 as the same packaging version", () => {
    const equal = execFileSync(
      python,
      [
        "-c",
        "from packaging.version import Version; import sys; sys.exit(0 if Version('1.0') == Version('1.0.0') else 1)",
      ],
      { encoding: "utf8" },
    );
    expect(equal).toBe("");
  });
});

describe("build-python-pypi-release distribution contract", () => {
  it("accepts one matching wheel and sdist, including normalised names", () => {
    const root = mkdtempSync(join(tmpdir(), "python-release-dist-"));
    try {
      const dist = join(root, "dist");
      writeDistributions(dist, {
        packageName: "example-pkg",
        version: "1.0.0",
        metadataName: "Example.Pkg",
      });
      expect(() =>
        runPython(validateDistributionsScript, {
          PACKAGE_NAME: "Example.Pkg",
          RELEASE_TAG: "1.0.0",
          DIST_DIR: dist,
        }),
      ).not.toThrow();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("accepts filename version 1.0 against release tag 1.0.0", () => {
    const root = mkdtempSync(join(tmpdir(), "python-release-dist-"));
    try {
      const dist = join(root, "dist");
      writeDistributions(dist, {
        packageName: "foo",
        version: "1.0",
        metadataVersion: "1.0.0",
      });
      expect(() =>
        runPython(validateDistributionsScript, {
          PACKAGE_NAME: "foo",
          RELEASE_TAG: "1.0.0",
          DIST_DIR: dist,
        }),
      ).not.toThrow();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects extra files and missing distributions", () => {
    const root = mkdtempSync(join(tmpdir(), "python-release-dist-"));
    try {
      const extra = join(root, "extra");
      writeDistributions(extra, {
        packageName: "foo",
        version: "1.0.0",
        extraFiles: ["notes.txt"],
      });
      expect(() =>
        runPython(validateDistributionsScript, {
          PACKAGE_NAME: "foo",
          RELEASE_TAG: "1.0.0",
          DIST_DIR: extra,
        }),
      ).toThrow(/exactly one wheel and one \.tar\.gz/);

      const missing = join(root, "missing");
      writeDistributions(missing, {
        packageName: "foo",
        version: "1.0.0",
        skipSdist: true,
      });
      expect(() =>
        runPython(validateDistributionsScript, {
          PACKAGE_NAME: "foo",
          RELEASE_TAG: "1.0.0",
          DIST_DIR: missing,
        }),
      ).toThrow(/exactly one wheel and one \.tar\.gz/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects filename and metadata identity mismatches", () => {
    const root = mkdtempSync(join(tmpdir(), "python-release-dist-"));
    try {
      const filename = join(root, "filename");
      writeDistributions(filename, {
        packageName: "other",
        version: "1.0.0",
      });
      expect(() =>
        runPython(validateDistributionsScript, {
          PACKAGE_NAME: "foo",
          RELEASE_TAG: "1.0.0",
          DIST_DIR: filename,
        }),
      ).toThrow(/wheel filename identifies/);

      const metadata = join(root, "metadata");
      writeDistributions(metadata, {
        packageName: "foo",
        version: "1.0.0",
        metadataName: "other",
      });
      expect(() =>
        runPython(validateDistributionsScript, {
          PACKAGE_NAME: "foo",
          RELEASE_TAG: "1.0.0",
          DIST_DIR: metadata,
        }),
      ).toThrow(/wheel metadata identifies/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects a second METADATA file", () => {
    const root = mkdtempSync(join(tmpdir(), "python-release-dist-"));
    try {
      const dist = join(root, "dist");
      writeDistributions(dist, {
        packageName: "foo",
        version: "1.0.0",
        extraWheelEntries: [["bar-1.0.0.dist-info/METADATA", "Name: bar\n"]],
      });
      expect(() =>
        runPython(validateDistributionsScript, {
          PACKAGE_NAME: "foo",
          RELEASE_TAG: "1.0.0",
          DIST_DIR: dist,
        }),
      ).toThrow(/exactly one METADATA file/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("ignores unsafe extra members without extracting them", () => {
    const root = mkdtempSync(join(tmpdir(), "python-release-dist-"));
    try {
      const sentinel = join(root, "sentinel.txt");
      writeFileSync(sentinel, "safe\n");
      const dist = join(root, "dist");
      writeDistributions(dist, {
        packageName: "foo",
        version: "1.0.0",
        extraWheelEntries: [
          ["../sentinel.txt", "pwned\n"],
          ["../evil.dist-info/METADATA", "Name: evil\nVersion: 1.0.0\n"],
        ],
        extraSdistEntries: [["../sentinel.txt", "pwned\n"]],
      });
      expect(() =>
        runPython(validateDistributionsScript, {
          PACKAGE_NAME: "foo",
          RELEASE_TAG: "1.0.0",
          DIST_DIR: dist,
        }),
      ).not.toThrow();
      expect(readFileSync(sentinel, "utf8")).toBe("safe\n");
      expect(existsSync(join(root, "evil.dist-info"))).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects traversal-only metadata without writing outside dist", () => {
    const root = mkdtempSync(join(tmpdir(), "python-release-dist-"));
    try {
      const sentinel = join(root, "sentinel.txt");
      writeFileSync(sentinel, "safe\n");
      const dist = join(root, "dist");
      writeDistributions(dist, {
        packageName: "foo",
        version: "1.0.0",
        omitDefaultMetadata: true,
        omitDefaultPkgInfo: true,
        extraWheelEntries: [
          ["../evil.dist-info/METADATA", "Name: foo\nVersion: 1.0.0\n"],
        ],
        extraSdistEntries: [["../PKG-INFO", "Name: foo\nVersion: 1.0.0\n"]],
      });
      expect(() =>
        runPython(validateDistributionsScript, {
          PACKAGE_NAME: "foo",
          RELEASE_TAG: "1.0.0",
          DIST_DIR: dist,
        }),
      ).toThrow();
      expect(readFileSync(sentinel, "utf8")).toBe("safe\n");
      expect(existsSync(join(root, "evil.dist-info"))).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects a symlink PKG-INFO without following it", () => {
    const root = mkdtempSync(join(tmpdir(), "python-release-dist-"));
    try {
      const dist = join(root, "dist");
      mkdirSync(dist, { recursive: true });
      execFileSync(python, [
        "-c",
        `
import tarfile
from pathlib import Path
from zipfile import ZipFile

dist = Path(${JSON.stringify(dist)})
metadata = b"Metadata-Version: 2.3\\nName: foo\\nVersion: 1.0.0\\n"
with ZipFile(dist / "foo-1.0.0-py3-none-any.whl", "w") as archive:
    archive.writestr("foo-1.0.0.dist-info/METADATA", metadata)
with tarfile.open(dist / "foo-1.0.0.tar.gz", "w:gz") as archive:
    link = tarfile.TarInfo("foo-1.0.0/PKG-INFO")
    link.type = tarfile.SYMTYPE
    link.linkname = "/etc/passwd"
    archive.addfile(link)
`,
      ]);
      expect(() =>
        runPython(validateDistributionsScript, {
          PACKAGE_NAME: "foo",
          RELEASE_TAG: "1.0.0",
          DIST_DIR: dist,
        }),
      ).toThrow(/one top-level PKG-INFO/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
