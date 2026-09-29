import { join } from "node:path";
import { NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Exit, FileSystem } from "effect";
import {
  ARTIFACT_NAME_PREFIX,
  artifactName,
  type Inputs,
  run,
  validateDistributionsScript,
  validateEvent,
  validateTagScript,
} from "../src/actions/build-python-pypi-release/workflow.js";
import {
  commandLayer,
  exec,
  git,
  inDirectory,
  initRepo,
  platformLayer,
  tempDirectory,
} from "./support.js";

const publishedRelease = {
  stage: "validate-event",
  eventName: "release",
  eventAction: "published",
  releaseDraft: "false",
  releasePrerelease: "false",
  releaseTag: "1.0.0",
} satisfies Inputs;

const runStage = (inputs: Inputs) =>
  Effect.exit(Effect.scoped(run(inputs))).pipe(
    Effect.provide(commandLayer),
    Effect.provide(NodeServices.layer),
  );

const python = Effect.gen(function* () {
  for (const bin of ["python3", "python", "/usr/bin/python3"]) {
    const exit = yield* Effect.exit(
      exec(bin, ["-c", "import packaging.utils, packaging.version"]),
    );

    if (Exit.isSuccess(exit)) return bin;
  }

  return yield* Effect.die(
    new Error("Python packaging is required for these tests"),
  );
});

const runPython = (script: string, env: Record<string, string>) =>
  Effect.flatMap(python, (bin) => exec(bin, ["-c", script], { env }));

const pythonFailure = (script: string, env: Record<string, string>) =>
  Effect.flip(runPython(script, env));

const writeDistributions = Effect.fn("PythonReleaseTest.writeDistributions")(
  function* (
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
  ) {
    const fs = yield* FileSystem.FileSystem;
    yield* fs.makeDirectory(dist, { recursive: true });
    yield* exec(yield* python, [
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
    ]);
  },
);

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

  it.effect("runs the validate-event stage", () =>
    Effect.gen(function* () {
      const exit = yield* runStage(publishedRelease);
      expect(exit._tag).toBe("Success");

      const failed = yield* runStage({
        ...publishedRelease,
        eventName: "workflow_dispatch",
      });

      expect(failed._tag).toBe("Failure");
    }),
  );
});

describe("build-python-pypi-release artifact contract", () => {
  it.effect("keeps the workflow artifact name", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      expect(artifactName("123", "1")).toBe(
        "python-package-distributions-123-1",
      );
      expect(
        yield* fs.readFileString(
          ".github/workflows/build-python-pypi-release.yml",
        ),
      ).toContain(
        `${ARTIFACT_NAME_PREFIX}-\${{ github.run_id }}-\${{ github.run_attempt }}`,
      );
    }).pipe(Effect.provide(NodeServices.layer)),
  );
});

describe("build-python-pypi-release source immutability", () => {
  it.effect("accepts a tag that peels to HEAD, including annotated tags", () =>
    Effect.gen(function* () {
      const root = yield* tempDirectory("python-release-source-");
      const sha = yield* initRepo(root);
      yield* git(["tag", "1.0.0"], root);
      yield* inDirectory(root);

      const lightweight = yield* runStage({
        stage: "validate-source",
        releaseTag: "1.0.0",
      });

      expect(lightweight._tag).toBe("Success");
      yield* git(["tag", "-d", "1.0.0"], root);
      yield* git(["tag", "-a", "1.0.0", "-m", "release"], root);

      const annotated = yield* runStage({
        stage: "validate-source",
        releaseTag: "1.0.0",
      });

      expect(annotated._tag).toBe("Success");
      const tagObject = yield* git(["rev-parse", "refs/tags/1.0.0"], root);
      expect(tagObject).not.toBe(sha);
      expect(yield* git(["rev-parse", "refs/tags/1.0.0^{commit}"], root)).toBe(
        sha,
      );
    }).pipe(Effect.provide(platformLayer)),
  );

  it.effect("rejects a tag that points at another commit", () =>
    Effect.gen(function* () {
      const root = yield* tempDirectory("python-release-source-");
      yield* initRepo(root);
      yield* git(["tag", "1.0.0"], root);
      yield* git(["commit", "--allow-empty", "-m", "later"], root);
      yield* inDirectory(root);

      const exit = yield* runStage({
        stage: "validate-source",
        releaseTag: "1.0.0",
      });

      expect(exit._tag).toBe("Failure");
    }).pipe(Effect.provide(platformLayer)),
  );
});

describe("build-python-pypi-release packaging parity", () => {
  it.effect.each([
    { name: "Friendly-Bard", expected: "friendly-bard" },
    { name: "oslo.concurrency", expected: "oslo-concurrency" },
    { name: "FrIeNdLy-._.-bArD", expected: "friendly-bard" },
    { name: "systembridgeconnector", expected: "systembridgeconnector" },
    { name: "example_pkg", expected: "example-pkg" },
  ])("canonicalize_name($name) is $expected", ({ name, expected }) =>
    Effect.gen(function* () {
      const actual = yield* exec(yield* python, [
        "-c",
        "from packaging.utils import canonicalize_name; import sys; print(canonicalize_name(sys.argv[1]), end='')",
        name,
      ]);

      expect(actual).toBe(expected);
    }).pipe(Effect.provide(platformLayer)),
  );

  it.effect.each([
    { tag: "1.0.0", stable: true },
    { tag: "1.0", stable: true },
    { tag: "v1.2.3", stable: true },
    { tag: "1.0.0.post1", stable: true },
    { tag: "1.0.0a1", stable: false },
    { tag: "1.0.0b2", stable: false },
    { tag: "1.0.0rc1", stable: false },
    { tag: "1.0.0.dev1", stable: false },
    { tag: "1.0.0+local", stable: false },
    { tag: "not-a-version", stable: false },
  ])("stable public version $tag -> $stable", ({ tag, stable }) =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(
        runPython(validateTagScript, { RELEASE_TAG: tag }),
      );

      expect(Exit.isSuccess(exit)).toBe(stable);
    }).pipe(Effect.provide(platformLayer)),
  );

  it.effect("treats 1.0 and 1.0.0 as the same packaging version", () =>
    Effect.gen(function* () {
      const equal = yield* exec(yield* python, [
        "-c",
        "from packaging.version import Version; import sys; sys.exit(0 if Version('1.0') == Version('1.0.0') else 1)",
      ]);

      expect(equal).toBe("");
    }).pipe(Effect.provide(platformLayer)),
  );
});

describe("build-python-pypi-release distribution contract", () => {
  it.effect(
    "accepts one matching wheel and sdist, including normalised names",
    () =>
      Effect.gen(function* () {
        const root = yield* tempDirectory("python-release-dist-");
        const dist = join(root, "dist");
        yield* writeDistributions(dist, {
          packageName: "example-pkg",
          version: "1.0.0",
          metadataName: "Example.Pkg",
        });
        yield* runPython(validateDistributionsScript, {
          PACKAGE_NAME: "Example.Pkg",
          RELEASE_TAG: "1.0.0",
          DIST_DIR: dist,
        });
      }).pipe(Effect.provide(platformLayer)),
  );

  it.effect("accepts filename version 1.0 against release tag 1.0.0", () =>
    Effect.gen(function* () {
      const root = yield* tempDirectory("python-release-dist-");
      const dist = join(root, "dist");
      yield* writeDistributions(dist, {
        packageName: "foo",
        version: "1.0",
        metadataVersion: "1.0.0",
      });
      yield* runPython(validateDistributionsScript, {
        PACKAGE_NAME: "foo",
        RELEASE_TAG: "1.0.0",
        DIST_DIR: dist,
      });
    }).pipe(Effect.provide(platformLayer)),
  );

  it.effect("rejects extra files and missing distributions", () =>
    Effect.gen(function* () {
      const root = yield* tempDirectory("python-release-dist-");
      const extra = join(root, "extra");
      yield* writeDistributions(extra, {
        packageName: "foo",
        version: "1.0.0",
        extraFiles: ["notes.txt"],
      });

      expect(
        (yield* pythonFailure(validateDistributionsScript, {
          PACKAGE_NAME: "foo",
          RELEASE_TAG: "1.0.0",
          DIST_DIR: extra,
        })).stderr,
      ).toMatch(/exactly one wheel and one \.tar\.gz/);

      const missing = join(root, "missing");
      yield* writeDistributions(missing, {
        packageName: "foo",
        version: "1.0.0",
        skipSdist: true,
      });

      expect(
        (yield* pythonFailure(validateDistributionsScript, {
          PACKAGE_NAME: "foo",
          RELEASE_TAG: "1.0.0",
          DIST_DIR: missing,
        })).stderr,
      ).toMatch(/exactly one wheel and one \.tar\.gz/);
    }).pipe(Effect.provide(platformLayer)),
  );

  it.effect("rejects filename and metadata identity mismatches", () =>
    Effect.gen(function* () {
      const root = yield* tempDirectory("python-release-dist-");
      const filename = join(root, "filename");
      yield* writeDistributions(filename, {
        packageName: "other",
        version: "1.0.0",
      });

      expect(
        (yield* pythonFailure(validateDistributionsScript, {
          PACKAGE_NAME: "foo",
          RELEASE_TAG: "1.0.0",
          DIST_DIR: filename,
        })).stderr,
      ).toMatch(/wheel filename identifies/);

      const metadata = join(root, "metadata");
      yield* writeDistributions(metadata, {
        packageName: "foo",
        version: "1.0.0",
        metadataName: "other",
      });

      expect(
        (yield* pythonFailure(validateDistributionsScript, {
          PACKAGE_NAME: "foo",
          RELEASE_TAG: "1.0.0",
          DIST_DIR: metadata,
        })).stderr,
      ).toMatch(/wheel metadata identifies/);
    }).pipe(Effect.provide(platformLayer)),
  );

  it.effect("rejects a second METADATA file", () =>
    Effect.gen(function* () {
      const root = yield* tempDirectory("python-release-dist-");
      const dist = join(root, "dist");
      yield* writeDistributions(dist, {
        packageName: "foo",
        version: "1.0.0",
        extraWheelEntries: [["bar-1.0.0.dist-info/METADATA", "Name: bar\n"]],
      });

      expect(
        (yield* pythonFailure(validateDistributionsScript, {
          PACKAGE_NAME: "foo",
          RELEASE_TAG: "1.0.0",
          DIST_DIR: dist,
        })).stderr,
      ).toMatch(/exactly one METADATA file/);
    }).pipe(Effect.provide(platformLayer)),
  );

  it.effect("ignores unsafe extra members without extracting them", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const root = yield* tempDirectory("python-release-dist-");
      const sentinel = join(root, "sentinel.txt");
      yield* fs.writeFileString(sentinel, "safe\n");
      const dist = join(root, "dist");
      yield* writeDistributions(dist, {
        packageName: "foo",
        version: "1.0.0",
        extraWheelEntries: [
          ["../sentinel.txt", "pwned\n"],
          ["../evil.dist-info/METADATA", "Name: evil\nVersion: 1.0.0\n"],
        ],
        extraSdistEntries: [["../sentinel.txt", "pwned\n"]],
      });
      yield* runPython(validateDistributionsScript, {
        PACKAGE_NAME: "foo",
        RELEASE_TAG: "1.0.0",
        DIST_DIR: dist,
      });
      expect(yield* fs.readFileString(sentinel)).toBe("safe\n");
      expect(yield* fs.exists(join(root, "evil.dist-info"))).toBe(false);
    }).pipe(Effect.provide(platformLayer)),
  );

  it.effect(
    "rejects traversal-only metadata without writing outside dist",
    () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const root = yield* tempDirectory("python-release-dist-");
        const sentinel = join(root, "sentinel.txt");
        yield* fs.writeFileString(sentinel, "safe\n");
        const dist = join(root, "dist");
        yield* writeDistributions(dist, {
          packageName: "foo",
          version: "1.0.0",
          omitDefaultMetadata: true,
          omitDefaultPkgInfo: true,
          extraWheelEntries: [
            ["../evil.dist-info/METADATA", "Name: foo\nVersion: 1.0.0\n"],
          ],
          extraSdistEntries: [["../PKG-INFO", "Name: foo\nVersion: 1.0.0\n"]],
        });
        yield* pythonFailure(validateDistributionsScript, {
          PACKAGE_NAME: "foo",
          RELEASE_TAG: "1.0.0",
          DIST_DIR: dist,
        });
        expect(yield* fs.readFileString(sentinel)).toBe("safe\n");
        expect(yield* fs.exists(join(root, "evil.dist-info"))).toBe(false);
      }).pipe(Effect.provide(platformLayer)),
  );

  it.effect("rejects a symlink PKG-INFO without following it", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const root = yield* tempDirectory("python-release-dist-");
      const dist = join(root, "dist");
      yield* fs.makeDirectory(dist, { recursive: true });
      yield* exec(yield* python, [
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

      expect(
        (yield* pythonFailure(validateDistributionsScript, {
          PACKAGE_NAME: "foo",
          RELEASE_TAG: "1.0.0",
          DIST_DIR: dist,
        })).stderr,
      ).toMatch(/one top-level PKG-INFO/);
    }).pipe(Effect.provide(platformLayer)),
  );
});
