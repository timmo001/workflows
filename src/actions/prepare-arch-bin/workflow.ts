import { Release } from "@timmo001/effect-gh";
import { Effect, FileSystem, Schema } from "effect";
import { createHash } from "node:crypto";
import { basename, join } from "node:path";
import { Annotations } from "../../action/Annotations.js";
import { GitHubCommand } from "../../action/GitHubCommand.js";
import { CommandExecutor } from "../../services/CommandExecutor.js";
import {
  IDENTITY_PATTERN,
  isReleaseVersion,
  isSafeRelativePath,
  linuxAssetNames,
  newlineValues,
} from "../release-bun-cli/workflow.js";

export const Inputs = Schema.Struct({
  repository: Schema.String,
  releaseVersion: Schema.String,
  packageName: Schema.String,
  binaryName: Schema.optionalKey(Schema.String),
  pkgbuildTemplate: Schema.String,
  outputDirectory: Schema.String,
  completionsArguments: Schema.optionalKey(Schema.String),
  extraFiles: Schema.optionalKey(Schema.String),
  token: Schema.optionalKey(Schema.String),
});

export interface Inputs extends Schema.Schema.Type<typeof Inputs> {}

const REPOSITORY_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

const SHA256_PATTERN = /^[0-9a-f]{64}$/;

const failure = (message: string, title?: string) => {
  if (title === undefined) return new Annotations.ActionFailure({ message });

  return new Annotations.ActionFailure({ message, title });
};

const mapCommand = Effect.mapError((error: CommandExecutor.CommandError) =>
  failure(
    error.stderr.length > 0
      ? error.stderr
      : `Command failed with exit code ${error.exitCode}: ${error.command}`,
    "Command failed",
  ),
);

const mapFileSystem = Effect.mapError((error: { readonly message: string }) =>
  failure(error.message, "File operation failed"),
);

export const completionFiles = (binaryName: string) =>
  [
    { shell: "bash", fileName: `${binaryName}.bash` },
    { shell: "fish", fileName: `${binaryName}.fish` },
    { shell: "zsh", fileName: `_${binaryName}` },
  ] as const;

export const completionCommandArguments = (template: string, shell: string) =>
  template
    .trim()
    .split(/\s+/)
    .map((argument) => (argument === "{shell}" ? shell : argument));

export const checksumFor = (checksums: string, assetName: string) => {
  for (const line of checksums.split("\n")) {
    const [digest, name] = line.trim().split(/\s+/);

    if (name?.replace(/^\*/, "") !== assetName) continue;

    if (digest === undefined || !SHA256_PATTERN.test(digest)) {
      return failure(`Invalid SHA256SUMS entry for ${assetName}`);
    }

    return digest;
  }

  return failure(`SHA256SUMS has no entry for ${assetName}`);
};

export const renderPkgbuild = (
  template: string,
  values: {
    readonly version: string;
    readonly x86_64: string;
    readonly aarch64: string;
  },
) => {
  const replacements = [
    ["pkgver", values.version],
    ["sha256sums_x86_64", `('${values.x86_64}')`],
    ["sha256sums_aarch64", `('${values.aarch64}')`],
  ] as const;

  return replacements.reduce<string | Annotations.ActionFailure>(
    (rendered, [key, value]) => {
      if (rendered instanceof Annotations.ActionFailure) return rendered;
      const pattern = new RegExp(`^${key}=.*$`, "m");

      if (!pattern.test(rendered)) {
        return failure(`PKGBUILD template has no ${key}= line`);
      }

      return rendered.replace(pattern, () => `${key}=${value}`);
    },
    template,
  );
};

export const validateInputs = (inputs: Inputs) => {
  if (!REPOSITORY_PATTERN.test(inputs.repository)) {
    return failure(`Invalid repository: ${inputs.repository}`);
  }

  if (!isReleaseVersion(inputs.releaseVersion)) {
    return failure(`Invalid release version: ${inputs.releaseVersion}`);
  }

  for (const name of [inputs.packageName, inputs.binaryName ?? ""]) {
    if (name !== "" && !IDENTITY_PATTERN.test(name)) {
      return failure(`Invalid name: ${name}`);
    }
  }

  for (const path of [
    inputs.pkgbuildTemplate,
    ...newlineValues(inputs.extraFiles),
  ]) {
    if (!isSafeRelativePath(path)) {
      return failure(
        `Paths must be relative and must not contain dot segments: ${path}`,
      );
    }
  }

  if (
    inputs.completionsArguments !== undefined &&
    !inputs.completionsArguments.split(/\s+/).includes("{shell}")
  ) {
    return failure("completionsArguments must contain a {shell} placeholder");
  }
};

export const run = Effect.fn("PrepareArchBin.run")(function* (inputs: Inputs) {
  const invalid = validateInputs(inputs);

  if (invalid !== undefined) return yield* invalid;
  const commands = yield* CommandExecutor.Service;
  const annotations = yield* Annotations.Service;
  const fs = yield* FileSystem.FileSystem;
  const binaryName = inputs.binaryName ?? inputs.packageName;
  const version = inputs.releaseVersion;
  const output = inputs.outputDirectory;
  const download = yield* fs.makeTempDirectoryScoped().pipe(mapFileSystem);

  const [x86_64Archive] = linuxAssetNames(
    inputs.packageName,
    version,
    "x86_64",
  );

  const [aarch64Archive] = linuxAssetNames(
    inputs.packageName,
    version,
    "aarch64",
  );

  const completionsRequested = inputs.completionsArguments !== undefined;
  const ghEnv: Record<string, string> = {};

  if (inputs.token !== undefined) ghEnv.GH_TOKEN = inputs.token;

  yield* GitHubCommand.run(
    "download release assets",
    Release.download(
      {
        repo: inputs.repository,
        tag: version,
        patterns: [
          "SHA256SUMS",
          ...(completionsRequested ? [x86_64Archive] : []),
        ],
        directory: download,
      },
      { env: ghEnv },
    ),
  );

  const checksums = yield* fs
    .readFileString(join(download, "SHA256SUMS"))
    .pipe(mapFileSystem);

  const x86_64 = checksumFor(checksums, x86_64Archive);

  if (x86_64 instanceof Annotations.ActionFailure) return yield* x86_64;
  const aarch64 = checksumFor(checksums, aarch64Archive);

  if (aarch64 instanceof Annotations.ActionFailure) return yield* aarch64;

  const template = yield* fs
    .readFileString(inputs.pkgbuildTemplate)
    .pipe(mapFileSystem);

  const pkgbuild = renderPkgbuild(template, { version, x86_64, aarch64 });

  if (pkgbuild instanceof Annotations.ActionFailure) return yield* pkgbuild;
  yield* fs.makeDirectory(output, { recursive: true }).pipe(mapFileSystem);
  yield* fs
    .writeFileString(join(output, "PKGBUILD"), pkgbuild)
    .pipe(mapFileSystem);

  if (completionsRequested) {
    const archive = join(download, x86_64Archive);

    const actual = createHash("sha256")
      .update(yield* fs.readFile(archive).pipe(mapFileSystem))
      .digest("hex");

    if (actual !== x86_64) {
      return yield* failure(
        `Checksum mismatch for ${x86_64Archive}: expected ${x86_64}, got ${actual}`,
      );
    }

    yield* commands
      .run("tar", [
        "--extract",
        "--gzip",
        "--file",
        archive,
        "--directory",
        download,
      ])
      .pipe(mapCommand);

    for (const { shell, fileName } of completionFiles(binaryName)) {
      const completion = yield* commands
        .run(
          join(download, binaryName),
          completionCommandArguments(inputs.completionsArguments, shell),
        )
        .pipe(mapCommand);

      yield* fs
        .writeFileString(join(output, fileName), completion)
        .pipe(mapFileSystem);
    }
  }

  for (const path of newlineValues(inputs.extraFiles)) {
    yield* fs.copyFile(path, join(output, basename(path))).pipe(mapFileSystem);
  }

  yield* annotations.notice(
    `Prepared ${inputs.packageName}-bin ${version} in ${output}`,
  );
});
