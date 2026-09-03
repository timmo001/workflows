import { Effect, FileSystem, Schema } from "effect";
import { ActionOutputs } from "../../action/ActionOutputs.js";
import { Annotations } from "../../action/Annotations.js";
import { CommandExecutor } from "../../services/CommandExecutor.js";

export const Stage = Schema.Literals([
  "allocate-version",
  "validate-inputs",
  "compile",
  "smoke-test",
  "prepare-package",
  "install-nfpm",
  "build-assets",
  "verify-assets",
  "publish-release",
]);

export const Architecture = Schema.Literals(["x86_64", "aarch64"]);
export type Architecture = typeof Architecture.Type;

const GitHubBoolean = Schema.Literals(["true", "false"]);

export const Inputs = Schema.Struct({
  stage: Stage,
  binaryName: Schema.optionalKey(Schema.String),
  packageName: Schema.optionalKey(Schema.String),
  entrypoint: Schema.optionalKey(Schema.String),
  packageConfig: Schema.optionalKey(Schema.String),
  architecture: Schema.optionalKey(Architecture),
  smokeTestArguments: Schema.optionalKey(Schema.String),
  packagePrepareCommand: Schema.optionalKey(Schema.String),
  archiveExtraPaths: Schema.optionalKey(Schema.String),
  prerelease: Schema.optionalKey(GitHubBoolean),
  releaseVersion: Schema.optionalKey(Schema.String),
  sourceSha: Schema.optionalKey(Schema.String),
  existingRelease: Schema.optionalKey(GitHubBoolean),
  assetRoot: Schema.optionalKey(Schema.String),
  nfpmVersion: Schema.optionalKey(Schema.String),
});
export interface Inputs extends Schema.Schema.Type<typeof Inputs> {}

export const architectureProfiles = {
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
} as const;

export const expectedReleaseAssetCount = 6;

export const VERSION_PATTERN = /^[0-9]{8}\.[0-9]+$/;
export const IDENTITY_PATTERN = /^[a-z0-9][a-z0-9._+-]*$/;

export const linuxAssetNames = (
  packageName: string,
  version: string,
  architecture: Architecture,
) => {
  const profile = architectureProfiles[architecture];
  return [
    `${packageName}-${version}-linux-${architecture}.tar.gz`,
    `${packageName}_${version}_${profile.debArchitecture}.deb`,
    `${packageName}-${version}-1.${profile.rpmArchitecture}.rpm`,
  ] as const;
};

export const isSafeRelativePath = (path: string) =>
  path.length > 0 && !path.startsWith("/") && !/(^|\/)\.\.?(\/|$)/.test(path);

export const newlineValues = (value: string | undefined) => {
  if (value === undefined || value === "") return [];
  return value.split("\n").filter((line) => line.length > 0);
};

export const archiveMemberPaths = (
  binaryName: string,
  extraPaths: string | undefined,
) => [binaryName, ...newlineValues(extraPaths)];

const failure = (message: string, title?: string) => {
  if (title === undefined) return new Annotations.ActionFailure({ message });
  return new Annotations.ActionFailure({ message, title });
};

const requireInput = <T extends string>(value: T | undefined, name: string) =>
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

const commandLines = (stdout: string) => {
  const trimmed = stdout.trim();
  return trimmed === "" ? [] : trimmed.split("\n");
};

export const resolveReleaseVersion = (input: {
  readonly requestedVersion: string | undefined;
  readonly releaseDate: string;
  readonly tagsPointingAtSource: readonly string[];
  readonly tagsForReleaseDate: readonly string[];
}) => {
  if (input.requestedVersion !== undefined) {
    if (!VERSION_PATTERN.test(input.requestedVersion)) {
      return failure(`Invalid release version: ${input.requestedVersion}`);
    }
    return input.requestedVersion;
  }
  const existing = input.tagsPointingAtSource.find((tag) =>
    VERSION_PATTERN.test(tag),
  );
  if (existing !== undefined) return existing;
  const latest = input.tagsForReleaseDate[0];
  if (latest === undefined) return `${input.releaseDate}.0`;
  const prefix = `${input.releaseDate}.`;
  const sequence = latest.startsWith(prefix) ? latest.slice(prefix.length) : "";
  if (!/^[0-9]+$/.test(sequence)) {
    return failure(
      `Invalid release tag in the ${input.releaseDate} series: ${latest}`,
    );
  }
  return `${input.releaseDate}.${Number.parseInt(sequence, 10) + 1}`;
};

export const validateIdentity = (input: {
  readonly binaryName: string;
  readonly packageName: string;
  readonly entrypoint: string;
  readonly packageConfig: string;
}) => {
  if (!IDENTITY_PATTERN.test(input.binaryName)) {
    return failure(`Invalid binary name: ${input.binaryName}`);
  }
  if (!IDENTITY_PATTERN.test(input.packageName)) {
    return failure(`Invalid package name: ${input.packageName}`);
  }
  for (const path of [input.entrypoint, input.packageConfig]) {
    if (!isSafeRelativePath(path)) {
      return failure(
        `Paths must be relative and must not contain dot segments: ${path}`,
      );
    }
  }
};

export const smokeTestScript = String.raw`set -euo pipefail
while IFS= read -r invocation || [[ -n "$invocation" ]]; do
  [[ -n "$invocation" ]] || continue
  read -r -a arguments <<< "$invocation"
  "dist/release/root/$BINARY_NAME" "\${arguments[@]}"
done <<< "$SMOKE_TEST_ARGUMENTS"`.replaceAll("\\${", "${");

export const installNfpmScript = String.raw`set -euo pipefail
archive="nfpm_\${NFPM_VERSION}_Linux_\${NFPM_DOWNLOAD_ARCHITECTURE}.tar.gz"
base_url="https://github.com/goreleaser/nfpm/releases/download/v\${NFPM_VERSION}"
curl --fail --location --silent --show-error --output "$archive" "$base_url/$archive"
curl --fail --location --silent --show-error --output checksums.txt "$base_url/checksums.txt"
grep "  \${archive}$" checksums.txt | sha256sum --check --strict
tar --extract --gzip --file "$archive" nfpm
chmod 0755 nfpm`.replaceAll("\\${", "${");

export const writeArchiveScript = String.raw`set -euo pipefail
assets="dist/release/assets"
mkdir -p "$assets"
mapfile -t archive_paths <<< "$ARCHIVE_PATHS"
tar --create --sort=name --mtime='@0' --owner=0 --group=0 --numeric-owner \
  --directory=dist/release/root "\${archive_paths[@]}" \
  | gzip --no-name > "$assets/\${PACKAGE_NAME}-\${VERSION}-linux-\${RELEASE_ARCHITECTURE}.tar.gz"`.replaceAll(
  "\\${",
  "${",
);

export const packageAssetsScript = String.raw`set -euo pipefail
assets="dist/release/assets"
./nfpm package --config "$PACKAGE_CONFIG" --packager deb \
  --target "$assets/\${PACKAGE_NAME}_\${VERSION}_\${DEB_ARCHITECTURE}.deb"
./nfpm package --config "$PACKAGE_CONFIG" --packager rpm \
  --target "$assets/\${PACKAGE_NAME}-\${VERSION}-1.\${RPM_ARCHITECTURE}.rpm"`.replaceAll(
  "\\${",
  "${",
);

export const verifyAssetsScript = String.raw`set -euo pipefail
expected_assets=6
actual_assets="$(find "$ASSET_ROOT" -maxdepth 1 -type f | wc -l)"
[[ "$actual_assets" -eq "$expected_assets" ]] || {
  printf 'Expected %s release assets, found %s.\n' "$expected_assets" "$actual_assets" >&2
  exit 1
}
find "$ASSET_ROOT" -maxdepth 1 -type f ! -name SHA256SUMS -printf '%f\n' | sort \
  | while IFS= read -r asset; do
      (cd "$ASSET_ROOT" && sha256sum "$asset")
    done > "$ASSET_ROOT/SHA256SUMS"
(cd "$ASSET_ROOT" && sha256sum --check --strict SHA256SUMS)`;

export const publishReleaseScript = String.raw`set -euo pipefail
if [[ "$EXISTING_RELEASE" == "true" ]]; then
  gh release view "$RELEASE_VERSION" >/dev/null
  gh release upload "$RELEASE_VERSION" "$ASSET_ROOT"/* --clobber
  exit 0
fi

release_exists=false
if git rev-parse --verify --quiet "refs/tags/$RELEASE_VERSION" >/dev/null; then
  [[ "$(git rev-list -n 1 "$RELEASE_VERSION")" == "$SOURCE_SHA" ]] || {
    printf 'Release tag %s already points to another commit.\n' "$RELEASE_VERSION" >&2
    exit 1
  }
  gh release view "$RELEASE_VERSION" >/dev/null 2>&1 && release_exists=true
fi

if [[ "$release_exists" == "true" ]]; then
  gh release edit "$RELEASE_VERSION" \
    --target "$SOURCE_SHA" \
    --title "$RELEASE_VERSION" \
    --notes "Rolling release $RELEASE_VERSION from commit $SOURCE_SHA." \
    --prerelease="$PRERELEASE"
  gh release upload "$RELEASE_VERSION" "$ASSET_ROOT"/* --clobber
else
  prerelease_arguments=()
  [[ "$PRERELEASE" == "true" ]] && prerelease_arguments+=(--prerelease)
  gh release create "$RELEASE_VERSION" "$ASSET_ROOT"/* \
    --target "$SOURCE_SHA" \
    --title "$RELEASE_VERSION" \
    --notes "Rolling release $RELEASE_VERSION from commit $SOURCE_SHA." \
    "\${prerelease_arguments[@]}"
fi`.replaceAll("\\${", "${");

const resolvedPackageName = (inputs: Inputs, binaryName: string) =>
  inputs.packageName ?? binaryName;

const requireIdentity = (inputs: Inputs) =>
  Effect.gen(function* () {
    const binaryName = yield* requireInput(inputs.binaryName, "binary-name");
    const entrypoint = yield* requireInput(inputs.entrypoint, "entrypoint");
    const packageConfig = yield* requireInput(
      inputs.packageConfig,
      "package-config",
    );
    const packageName = resolvedPackageName(inputs, binaryName);
    const invalid = validateIdentity({
      binaryName,
      packageName,
      entrypoint,
      packageConfig,
    });
    if (invalid !== undefined) return yield* invalid;
    return { binaryName, packageName, entrypoint, packageConfig };
  });

const allocateVersion = Effect.fn("ReleaseBunCli.allocateVersion")(function* (
  inputs: Inputs,
) {
  const commands = yield* CommandExecutor.Service;
  const sourceSha = (yield* commands
    .run("git", ["rev-parse", "HEAD"])
    .pipe(mapCommand)).trim();
  const releaseDate = (yield* commands
    .run("date", ["--utc", "+%Y%m%d"])
    .pipe(mapCommand)).trim();
  const tagsPointingAtSource = commandLines(
    yield* commands
      .run("git", [
        "tag",
        "--points-at",
        sourceSha,
        "--list",
        "--sort=-version:refname",
      ])
      .pipe(mapCommand),
  );
  const tagsForReleaseDate = commandLines(
    yield* commands
      .run("git", [
        "tag",
        "--list",
        `${releaseDate}.*`,
        "--sort=-version:refname",
      ])
      .pipe(mapCommand),
  );
  const version = resolveReleaseVersion({
    requestedVersion: inputs.releaseVersion,
    releaseDate,
    tagsPointingAtSource,
    tagsForReleaseDate,
  });
  if (version instanceof Annotations.ActionFailure) return yield* version;
  yield* ActionOutputs.setOutput("release-version", version);
  yield* ActionOutputs.setOutput("source-sha", sourceSha);
});

const validateInputs = Effect.fn("ReleaseBunCli.validateInputs")(function* (
  inputs: Inputs,
) {
  yield* requireIdentity(inputs);
});

const compile = Effect.fn("ReleaseBunCli.compile")(function* (inputs: Inputs) {
  const commands = yield* CommandExecutor.Service;
  const identity = yield* requireIdentity(inputs);
  const architecture = yield* requireInput(inputs.architecture, "architecture");
  const bunTarget = architectureProfiles[architecture].bunTarget;
  yield* commands
    .stream(
      "bash",
      [
        "-c",
        'set -euo pipefail\nmkdir -p dist/release/root\nbun build "$ENTRYPOINT" --compile --target="$BUN_TARGET" --outfile "dist/release/root/$BINARY_NAME"',
      ],
      {
        label: "compile executable",
        env: {
          BINARY_NAME: identity.binaryName,
          BUN_TARGET: bunTarget,
          ENTRYPOINT: identity.entrypoint,
        },
      },
    )
    .pipe(mapCommand);
});

const smokeTest = Effect.fn("ReleaseBunCli.smokeTest")(function* (
  inputs: Inputs,
) {
  const commands = yield* CommandExecutor.Service;
  const binaryName = yield* requireInput(inputs.binaryName, "binary-name");
  yield* commands
    .stream("bash", ["-c", smokeTestScript], {
      label: "smoke-test executable",
      env: {
        BINARY_NAME: binaryName,
        SMOKE_TEST_ARGUMENTS: inputs.smokeTestArguments ?? "",
      },
    })
    .pipe(mapCommand);
});

const preparePackage = Effect.fn("ReleaseBunCli.preparePackage")(function* (
  inputs: Inputs,
) {
  const commands = yield* CommandExecutor.Service;
  const command = yield* requireInput(
    inputs.packagePrepareCommand,
    "package-prepare-command",
  );
  yield* commands
    .stream("bash", ["-euo", "pipefail", "-c", command], {
      label: "prepare package files",
    })
    .pipe(mapCommand);
});

const installNfpm = Effect.fn("ReleaseBunCli.installNfpm")(function* (
  inputs: Inputs,
) {
  const commands = yield* CommandExecutor.Service;
  const architecture = yield* requireInput(inputs.architecture, "architecture");
  const nfpmVersion = yield* requireInput(inputs.nfpmVersion, "nfpm-version");
  yield* commands
    .stream("bash", ["-c", installNfpmScript], {
      label: "install nFPM",
      env: {
        NFPM_VERSION: nfpmVersion,
        NFPM_DOWNLOAD_ARCHITECTURE:
          architectureProfiles[architecture].nfpmDownloadArchitecture,
      },
    })
    .pipe(mapCommand);
});

const buildAssets = Effect.fn("ReleaseBunCli.buildAssets")(function* (
  inputs: Inputs,
) {
  const commands = yield* CommandExecutor.Service;
  const fs = yield* FileSystem.FileSystem;
  const identity = yield* requireIdentity(inputs);
  const architecture = yield* requireInput(inputs.architecture, "architecture");
  const version = yield* requireInput(inputs.releaseVersion, "release-version");
  const extraPaths = newlineValues(inputs.archiveExtraPaths);
  for (const path of extraPaths) {
    if (!isSafeRelativePath(path)) {
      return yield* failure(`Invalid archive path: ${path}`);
    }
    const exists = yield* fs
      .exists(`dist/release/root/${path}`)
      .pipe(
        Effect.mapError((error) =>
          failure(String(error), "File operation failed"),
        ),
      );
    if (!exists) return yield* failure(`Archive path not found: ${path}`);
  }
  const profile = architectureProfiles[architecture];
  const archiveEnv = {
    ARCHIVE_PATHS: archiveMemberPaths(
      identity.binaryName,
      inputs.archiveExtraPaths,
    ).join("\n"),
    PACKAGE_NAME: identity.packageName,
    VERSION: version,
    RELEASE_ARCHITECTURE: architecture,
    PACKAGE_CONFIG: identity.packageConfig,
    DEB_ARCHITECTURE: profile.debArchitecture,
    RPM_ARCHITECTURE: profile.rpmArchitecture,
    ARCH: profile.nfpmArchitecture,
  };
  yield* commands
    .stream("bash", ["-c", writeArchiveScript], {
      label: "create release archive",
      env: archiveEnv,
    })
    .pipe(mapCommand);
  yield* commands
    .stream("bash", ["-c", packageAssetsScript], {
      label: "build linux packages",
      env: archiveEnv,
    })
    .pipe(mapCommand);
});

const verifyAssets = Effect.fn("ReleaseBunCli.verifyAssets")(function* (
  inputs: Inputs,
) {
  const commands = yield* CommandExecutor.Service;
  const assetRoot = yield* requireInput(inputs.assetRoot, "asset-root");
  yield* commands
    .stream("bash", ["-c", verifyAssetsScript], {
      label: "verify release assets",
      env: { ASSET_ROOT: assetRoot },
    })
    .pipe(mapCommand);
});

const publishRelease = Effect.fn("ReleaseBunCli.publishRelease")(function* (
  inputs: Inputs,
) {
  const commands = yield* CommandExecutor.Service;
  const assetRoot = yield* requireInput(inputs.assetRoot, "asset-root");
  const releaseVersion = yield* requireInput(
    inputs.releaseVersion,
    "release-version",
  );
  const sourceSha = yield* requireInput(inputs.sourceSha, "source-sha");
  yield* commands
    .stream("bash", ["-c", publishReleaseScript], {
      label: "publish GitHub release",
      env: {
        ASSET_ROOT: assetRoot,
        EXISTING_RELEASE: inputs.existingRelease ?? "false",
        PRERELEASE: inputs.prerelease ?? "true",
        RELEASE_VERSION: releaseVersion,
        SOURCE_SHA: sourceSha,
      },
    })
    .pipe(mapCommand);
});

export const run = Effect.fn("ReleaseBunCli.run")(function* (inputs: Inputs) {
  switch (inputs.stage) {
    case "allocate-version":
      return yield* allocateVersion(inputs);
    case "validate-inputs":
      return yield* validateInputs(inputs);
    case "compile":
      return yield* compile(inputs);
    case "smoke-test":
      return yield* smokeTest(inputs);
    case "prepare-package":
      return yield* preparePackage(inputs);
    case "install-nfpm":
      return yield* installNfpm(inputs);
    case "build-assets":
      return yield* buildAssets(inputs);
    case "verify-assets":
      return yield* verifyAssets(inputs);
    case "publish-release":
      return yield* publishRelease(inputs);
  }
});
