import { Effect, Schema } from "effect";
import { Annotations } from "../../action/Annotations.js";
import { CommandExecutor } from "../../services/CommandExecutor.js";

export const Stage = Schema.Literals([
  "validate-event",
  "validate-source",
  "validate-tag",
  "validate-distributions",
]);

export const Inputs = Schema.Struct({
  stage: Stage,
  eventName: Schema.optionalKey(Schema.String),
  eventAction: Schema.optionalKey(Schema.String),
  releaseDraft: Schema.optionalKey(Schema.String),
  releasePrerelease: Schema.optionalKey(Schema.String),
  releaseTag: Schema.optionalKey(Schema.String),
  packageName: Schema.optionalKey(Schema.String),
  distDir: Schema.optionalKey(Schema.String),
});
export interface Inputs extends Schema.Schema.Type<typeof Inputs> {}

export const ARTIFACT_NAME_PREFIX = "python-package-distributions";

export const artifactName = (runId: string, runAttempt: string) =>
  `${ARTIFACT_NAME_PREFIX}-${runId}-${runAttempt}`;

const failure = (message: string, title?: string) => {
  if (title === undefined) return new Annotations.ActionFailure({ message });
  return new Annotations.ActionFailure({ message, title });
};

const requireInput = (value: string | undefined, name: string) =>
  value === undefined
    ? Effect.fail(failure(`Input is required: ${name}`))
    : Effect.succeed(value);

const mapCommand = Effect.mapError((error: CommandExecutor.CommandError) =>
  failure(
    error.stderr.length > 0
      ? error.stderr
      : `Command failed with exit code ${error.exitCode}: ${error.command}`,
    "Command failed",
  ),
);

export const validateEvent = (inputs: Inputs) => {
  if (inputs.eventName !== "release") {
    return failure("PyPI publication requires a release event.");
  }
  if (inputs.eventAction !== "published") {
    return failure("PyPI publication requires a published release.");
  }
  if (inputs.releaseDraft !== "false") {
    return failure("Draft releases cannot be published to PyPI.");
  }
  if (inputs.releasePrerelease !== "false") {
    return failure(
      "Prereleases cannot be published through the stable PyPI workflow.",
    );
  }
  if (inputs.releaseTag === undefined || inputs.releaseTag === "") {
    return failure("The release has no tag.");
  }
};

export const validateTagScript = `
import os

from packaging.version import InvalidVersion, Version

tag = os.environ["RELEASE_TAG"]
try:
    version = Version(tag)
except InvalidVersion as error:
    raise SystemExit(f"Invalid PEP 440 release tag: {tag}") from error

if version.is_devrelease or version.is_prerelease or version.local is not None:
    raise SystemExit(f"Release tag is not a stable public version: {tag}")
`;

export const validateDistributionsScript = `
from email.parser import BytesParser
import os
from pathlib import Path
import tarfile
from zipfile import ZipFile

from packaging.utils import (
    canonicalize_name,
    parse_sdist_filename,
    parse_wheel_filename,
)
from packaging.version import Version


def is_safe_archive_path(name):
    if name.startswith("/") or name.startswith("\\\\"):
        return False
    parts = name.replace("\\\\", "/").split("/")
    return all(part not in ("", ".", "..") for part in parts)


expected_name = canonicalize_name(os.environ["PACKAGE_NAME"])
expected_version = Version(os.environ["RELEASE_TAG"])
distributions = Path(os.environ.get("DIST_DIR", "dist"))
wheels = list(distributions.glob("*.whl"))
sdists = list(distributions.glob("*.tar.gz"))
files = [path for path in distributions.iterdir() if path.is_file()]

if len(wheels) != 1 or len(sdists) != 1 or set(files) != set(wheels + sdists):
    raise SystemExit(
        "Expected dist to contain exactly one wheel and one .tar.gz source "
        f"distribution, found: {[path.name for path in files]}"
    )

wheel_name, wheel_version, _, _ = parse_wheel_filename(wheels[0].name)
sdist_name, sdist_version = parse_sdist_filename(sdists[0].name)
for kind, name, version in (
    ("wheel filename", wheel_name, wheel_version),
    ("sdist filename", sdist_name, sdist_version),
):
    if canonicalize_name(name) != expected_name or version != expected_version:
        raise SystemExit(
            f"{kind} identifies {name} {version}, expected "
            f"{expected_name} {expected_version}"
        )

with ZipFile(wheels[0]) as archive:
    metadata_paths = [
        path
        for path in archive.namelist()
        if is_safe_archive_path(path)
        and path.replace("\\\\", "/").count("/") == 1
        and path.replace("\\\\", "/").endswith(".dist-info/METADATA")
    ]
    if len(metadata_paths) != 1:
        raise SystemExit("Wheel must contain exactly one METADATA file")
    wheel_metadata = BytesParser().parsebytes(archive.read(metadata_paths[0]))

with tarfile.open(sdists[0], mode="r:gz") as archive:
    metadata_members = [
        member
        for member in archive.getmembers()
        if member.isfile()
        and is_safe_archive_path(member.name)
        and member.name.count("/") == 1
        and member.name.endswith("/PKG-INFO")
    ]
    if len(metadata_members) != 1:
        raise SystemExit("Source distribution must contain one top-level PKG-INFO")
    metadata_file = archive.extractfile(metadata_members[0])
    if metadata_file is None:
        raise SystemExit("Unable to read source distribution PKG-INFO")
    sdist_metadata = BytesParser().parsebytes(metadata_file.read())

for kind, metadata in (
    ("wheel metadata", wheel_metadata),
    ("sdist metadata", sdist_metadata),
):
    name = metadata["Name"]
    version = metadata["Version"]
    if (
        name is None
        or version is None
        or canonicalize_name(name) != expected_name
        or Version(version) != expected_version
    ):
        raise SystemExit(
            f"{kind} identifies {name} {version}, expected "
            f"{expected_name} {expected_version}"
        )
`;

const validateSource = Effect.fn("BuildPythonPypiRelease.validateSource")(
  function* (inputs: Inputs) {
    const commands = yield* CommandExecutor.Service;
    const tag = yield* requireInput(inputs.releaseTag, "release-tag");
    const sourceSha = (yield* commands
      .run("git", ["rev-parse", "HEAD"])
      .pipe(mapCommand)).trim();
    const tagSha = (yield* commands
      .run("git", ["rev-parse", "--verify", `refs/tags/${tag}^{commit}`])
      .pipe(mapCommand)).trim();
    if (tagSha !== sourceSha) {
      return yield* failure(
        `Release tag ${tag} resolves to ${tagSha}, not event source ${sourceSha}.`,
      );
    }
  },
);

const validateTag = Effect.fn("BuildPythonPypiRelease.validateTag")(function* (
  inputs: Inputs,
) {
  const commands = yield* CommandExecutor.Service;
  const tag = yield* requireInput(inputs.releaseTag, "release-tag");
  yield* commands
    .run("python", ["-c", validateTagScript], {
      env: { RELEASE_TAG: tag },
    })
    .pipe(mapCommand);
});

const validateDistributions = Effect.fn(
  "BuildPythonPypiRelease.validateDistributions",
)(function* (inputs: Inputs) {
  const commands = yield* CommandExecutor.Service;
  const packageName = yield* requireInput(inputs.packageName, "package-name");
  const tag = yield* requireInput(inputs.releaseTag, "release-tag");
  yield* commands
    .run("python", ["-c", validateDistributionsScript], {
      env: {
        PACKAGE_NAME: packageName,
        RELEASE_TAG: tag,
        DIST_DIR: inputs.distDir ?? "dist",
      },
    })
    .pipe(mapCommand);
});

export const run = Effect.fn("BuildPythonPypiRelease.run")(function* (
  inputs: Inputs,
) {
  switch (inputs.stage) {
    case "validate-event": {
      const invalid = validateEvent(inputs);
      if (invalid !== undefined) return yield* invalid;
      return;
    }
    case "validate-source":
      return yield* validateSource(inputs);
    case "validate-tag":
      return yield* validateTag(inputs);
    case "validate-distributions":
      return yield* validateDistributions(inputs);
  }
});
