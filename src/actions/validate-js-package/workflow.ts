import { Effect, FileSystem, Schema } from "effect";
import { join } from "node:path";
import { Annotations } from "../../action/Annotations.js";
import { CommandExecutor } from "../../services/CommandExecutor.js";

export const Contract = Schema.Literals(["build", "npm", "jsr"]);

export const Inputs = Schema.Struct({
  contract: Contract,
  packagePath: Schema.optionalKey(Schema.String),
  checkCommand: Schema.optionalKey(Schema.String),
  buildCommand: Schema.optionalKey(Schema.String),
  jsrCliVersion: Schema.optionalKey(Schema.String),
  releaseTag: Schema.optionalKey(Schema.String),
});
export interface Inputs extends Schema.Schema.Type<typeof Inputs> {}

export const VersionManifest = Schema.Struct({
  version: Schema.String,
});

export const VersionManifestFromJson = Schema.fromJsonString(VersionManifest);

export const trustedBashArgs = (command: string) =>
  ["-euo", "pipefail", "-c", command] as const;

export const npmPackDryRunArgs = ["pack", "--dry-run"] as const;

export const jsrDryRunArgs = (cliVersion: string) =>
  [`jsr@${cliVersion}`, "publish", "--dry-run"] as const;

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

export const compareReleaseTag = (releaseTag: string, version: string) => {
  if (releaseTag !== version) {
    return failure(
      `Release tag ${releaseTag} does not match package version ${version}`,
    );
  }
};

export const compareJsrVersions = (
  packageVersion: string,
  jsrVersion: string,
) => {
  if (packageVersion !== jsrVersion) {
    return failure("package.json and jsr.json versions differ");
  }
};

const readVersion = Effect.fn("ValidateJsPackage.readVersion")(function* (
  packagePath: string,
  filename: string,
) {
  const fs = yield* FileSystem.FileSystem;
  const text = yield* fs
    .readFileString(join(packagePath, filename))
    .pipe(
      Effect.mapError((error) =>
        failure(
          `Unable to read ${filename}: ${error}`,
          "File operation failed",
        ),
      ),
    );
  const manifest = yield* Schema.decodeUnknownEffect(VersionManifestFromJson)(
    text,
  ).pipe(
    Effect.mapError((error) =>
      failure(`Invalid ${filename}: ${error}`, `Invalid ${filename}`),
    ),
  );
  return manifest.version;
});

const runTrusted = Effect.fn("ValidateJsPackage.runTrusted")(function* (
  command: string,
  label: string,
  cwd: string,
) {
  const commands = yield* CommandExecutor.Service;
  yield* commands
    .stream("bash", trustedBashArgs(command), { label, cwd })
    .pipe(mapCommand);
});

const runStream = Effect.fn("ValidateJsPackage.runStream")(function* (
  command: string,
  args: readonly string[],
  label: string,
  cwd: string,
) {
  const commands = yield* CommandExecutor.Service;
  yield* commands.stream(command, args, { label, cwd }).pipe(mapCommand);
});

export const run = Effect.fn("ValidateJsPackage.run")(function* (
  inputs: Inputs,
) {
  const packagePath = inputs.packagePath ?? ".";
  const checkCommand = yield* requireInput(
    inputs.checkCommand,
    "check-command",
  );
  switch (inputs.contract) {
    case "build": {
      const buildCommand = yield* requireInput(
        inputs.buildCommand,
        "build-command",
      );
      const jsrCliVersion = yield* requireInput(
        inputs.jsrCliVersion,
        "jsr-cli-version",
      );
      yield* runTrusted(checkCommand, "check package", packagePath);
      yield* runTrusted(buildCommand, "build package", packagePath);
      yield* runStream(
        "npm",
        npmPackDryRunArgs,
        "npm pack --dry-run",
        packagePath,
      );
      yield* runStream(
        "bunx",
        jsrDryRunArgs(jsrCliVersion),
        "jsr publish --dry-run",
        packagePath,
      );
      return;
    }
    case "npm": {
      const buildCommand = yield* requireInput(
        inputs.buildCommand,
        "build-command",
      );
      const releaseTag = yield* requireInput(inputs.releaseTag, "release-tag");
      const packageVersion = yield* readVersion(packagePath, "package.json");
      const mismatched = compareReleaseTag(releaseTag, packageVersion);
      if (mismatched !== undefined) return yield* mismatched;
      yield* runTrusted(checkCommand, "check package", packagePath);
      yield* runTrusted(buildCommand, "build package", packagePath);
      yield* runStream(
        "npm",
        npmPackDryRunArgs,
        "npm pack --dry-run",
        packagePath,
      );
      return;
    }
    case "jsr": {
      const releaseTag = yield* requireInput(inputs.releaseTag, "release-tag");
      const packageVersion = yield* readVersion(packagePath, "package.json");
      const jsrVersion = yield* readVersion(packagePath, "jsr.json");
      const mismatchedManifests = compareJsrVersions(
        packageVersion,
        jsrVersion,
      );
      if (mismatchedManifests !== undefined) {
        return yield* mismatchedManifests;
      }
      const mismatchedTag = compareReleaseTag(releaseTag, packageVersion);
      if (mismatchedTag !== undefined) return yield* mismatchedTag;
      yield* runTrusted(checkCommand, "check package", packagePath);
    }
  }
});
