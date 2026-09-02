import { Effect, FileSystem, Schema } from "effect";
import { Annotations } from "../../action/Annotations.js";
import { CommandExecutor } from "../../services/CommandExecutor.js";

export const Stage = Schema.Literals([
  "validate-contract",
  "build",
  "validate",
  "dispatch",
]);

export const Inputs = Schema.Struct({
  stage: Stage,
  packageName: Schema.String,
  packageFilesArtifactName: Schema.optionalKey(Schema.String),
  pkgbuildPath: Schema.optionalKey(Schema.String),
  sourceRepository: Schema.String,
  sourceSha: Schema.String,
  allowlistUrl: Schema.optionalKey(Schema.String),
  artifactName: Schema.optionalKey(Schema.String),
  sourceRunId: Schema.optionalKey(Schema.String),
});
export interface Inputs extends Schema.Schema.Type<typeof Inputs> {}

const failure = (message: string, title?: string) => {
  if (title === undefined) return new Annotations.ActionFailure({ message });
  return new Annotations.ActionFailure({ message, title });
};

const requireInput = (value: string | undefined, name: string) =>
  value === undefined
    ? Effect.fail(failure(`Input is required: ${name}`))
    : Effect.succeed(value);

export const validateIdentity = (inputs: Inputs) => {
  if (!/^timmo001\/[A-Za-z0-9._-]+$/.test(inputs.sourceRepository)) {
    return failure(`Unsupported source repository: ${inputs.sourceRepository}`);
  }
  if (!/^[a-f0-9]{40}$/.test(inputs.sourceSha)) {
    return failure("The source revision must be a full commit SHA.");
  }
  if (!/^[a-z0-9@_+][a-z0-9@._+-]*$/.test(inputs.packageName)) {
    return failure(`Invalid Arch package name: ${inputs.packageName}`);
  }
  if (inputs.packageName.endsWith("-debug")) {
    return failure("Debug packages cannot be published.");
  }
  if (
    inputs.pkgbuildPath !== undefined &&
    (inputs.pkgbuildPath.startsWith("/") ||
      inputs.pkgbuildPath
        .split("/")
        .some((part) => part === "." || part === ".."))
  ) {
    return failure("The PKGBUILD path must be relative without dot segments.");
  }
};

export const provenance = (
  artifact: string,
  packageName: string,
  sourceRepository: string,
  sourceSha: string,
) => ({
  artifact,
  package: packageName,
  source_repository: sourceRepository,
  source_sha: sourceSha,
});

export const dispatchPayload = (
  artifactName: string,
  sourceRepository: string,
  sourceRunId: string,
  sourceSha: string,
) => ({
  event_type: "publish-package",
  client_payload: {
    artifact_name: artifactName,
    source_repository: sourceRepository,
    source_run_id: sourceRunId,
    source_sha: sourceSha,
  },
});

export const sourcePinningScript = String.raw`matched=0
while IFS= read -r source_name; do
  declare -n sources="$source_name"
  for index in "\${!sources[@]}"; do
    value="\${sources[$index]}"; prefix=""
    if [[ "$value" == *::* ]]; then prefix="\${value%%::*}::"; value="\${value##*::}"; fi
    value="\${value%%#*}"
    if [[ "$value" == "$expected_source" ]]; then sources[$index]="\${prefix}\${value}#commit=\${source_sha}"; matched=$((matched + 1)); fi
  done
  unset -n sources
done < <(compgen -A variable | awk '/^source(_[A-Za-z0-9_]+)?$/')
if [[ "$PACKAGE_NAME" == *-git ]]; then
  ((matched == 1)) || { printf '%s must contain exactly one source for %s\n' "$PACKAGE_NAME" "$expected_source" >&2; return 1; }
fi
((matched <= 1)) || { printf 'PKGBUILD contains multiple sources for %s\n' "$expected_source" >&2; return 1; }`.replaceAll(
  "\\${",
  "${",
);

export const sourcePolicyScript = String.raw`while IFS= read -r source; do
  source="\${source##*::}"
  case "$source" in
    git+*) [[ "$source" =~ ^git\+[^#]+\#commit=[a-f0-9]{40}$ ]] || fail "Every Git source must be pinned to a full commit SHA: $source" ;;
    bzr+*|fossil+*|hg+*|svn+*) fail "Unsupported VCS source: $source" ;;
  esac
done < <(awk '$1 ~ /^source(_[A-Za-z0-9_]+)?$/ && $2 == "=" { print $3 }' "$build_root/.SRCINFO")`.replaceAll(
  "\\${",
  "${",
);

const buildScript = String.raw`set -euo pipefail
fail() { printf '%s\n' "$1" >&2; exit 1; }
[[ "$(git -c safe.directory="$GITHUB_WORKSPACE" rev-parse HEAD)" == "$SOURCE_SHA" ]] || fail "Checked out source does not match the event SHA."
package_files_root="$GITHUB_WORKSPACE"
if [[ -n "$PACKAGE_FILES_ARTIFACT_NAME" ]]; then package_files_root="$RUNNER_TEMP/arch-package-files"; fi
selected_pkgbuild="$package_files_root/$PKGBUILD_PATH"
[[ -f "$selected_pkgbuild" && ! -L "$selected_pkgbuild" ]] || fail "PKGBUILD is missing or is not a regular file: $PKGBUILD_PATH"
build_root="$(mktemp -d)"; source_cache="$(mktemp -d)"; package_root="$GITHUB_WORKSPACE/.arch-packages"
trap 'rm -rf -- "$build_root" "$source_cache"' EXIT
if [[ -n "$PACKAGE_FILES_ARTIFACT_NAME" ]]; then
  cp -a -- "$package_files_root/." "$build_root/"; selected_pkgbuild="$build_root/$PKGBUILD_PATH"
else
  cp -a -- "$(dirname -- "$selected_pkgbuild")/." "$build_root/"; selected_pkgbuild="$build_root/$(basename -- "$PKGBUILD_PATH")"
fi
if [[ "$selected_pkgbuild" != "$build_root/PKGBUILD" ]]; then mv -- "$selected_pkgbuild" "$build_root/PKGBUILD"; fi
{
  printf 'expected_source=%q\n' "git+https://github.com/$SOURCE_REPOSITORY.git"
  printf 'source_sha=%q\n' "$SOURCE_SHA"
  cat <<'PINNING'
${sourcePinningScript}
PINNING
} >> "$build_root/PKGBUILD"
rm -rf -- "$package_root"; mkdir -p -- "$package_root"
useradd --create-home --shell /bin/bash archbuild
chown -R archbuild:archbuild "$build_root" "$source_cache" "$package_root"
runuser -u archbuild -- env BUILDDIR="$build_root" SRCDEST="$source_cache" bash -c 'set -euo pipefail; cd "$1"; makepkg --printsrcinfo > .SRCINFO' _ "$build_root"
${sourcePolicyScript}
mapfile -t dependencies < <(awk '$1 ~ /^(depends|makedepends|checkdepends)$/ && $2 == "=" { print $3 }' "$build_root/.SRCINFO" | sort -u)
if ((\${#dependencies[@]})); then
  mapfile -t missing < <(pacman -T -- "\${dependencies[@]}" || :)
  ((\${#missing[@]} == 0)) || pacman -S --noconfirm --needed --asdeps -- "\${missing[@]}"
fi
source_date_epoch="$(date --date="$(git -c safe.directory="$GITHUB_WORKSPACE" show -s --format=%cI "$SOURCE_SHA")" +%s)"
runuser -u archbuild -- env SRCDEST="$source_cache" SOURCE_DATE_EPOCH="$source_date_epoch" bash -c 'set -euo pipefail; cd "$1"; makepkg --noconfirm' _ "$build_root"
shopt -s nullglob; packages=("$build_root"/*.pkg.tar.zst)
((\${#packages[@]})) || fail "makepkg produced no package files."
cp -- "\${packages[@]}" "$package_root/"
transport_packages=(); for package in "\${packages[@]}"; do transport_packages+=("\${package##*/}"); done
tar -C "$package_root" -cf "$RUNNER_TEMP/arch-package-candidate.tar" -- "\${transport_packages[@]}"`.replaceAll(
  "\\${",
  "${",
);

const inspectScript = String.raw`set -euo pipefail
fail() { printf '%s\n' "$1" >&2; exit 1; }
envelope="$CANDIDATE_ENVELOPE_ROOT/arch-package-candidate.tar"
unexpected="$(find "$CANDIDATE_ENVELOPE_ROOT" -mindepth 1 -maxdepth 1 \( ! -type f -o ! -name 'arch-package-candidate.tar' \) -print -quit)"
[[ -z "$unexpected" && -f "$envelope" && ! -L "$envelope" ]] || fail "Candidate artifact does not contain only the expected envelope."
[[ "$(dd if="$envelope" bs=1 skip=257 count=5 status=none)" == ustar ]] || fail "Candidate envelope must be an uncompressed tar archive."
member_list="$(mktemp)"; detail_list="$(mktemp)"; trap 'rm -f -- "$member_list" "$detail_list"' EXIT
tar -tf "$envelope" > "$member_list" || fail "Candidate envelope is not a readable tar archive."
tar -tvf "$envelope" > "$detail_list" || fail "Candidate envelope metadata cannot be read."
mapfile -t members < "$member_list"; mapfile -t details < "$detail_list"
((\${#members[@]} == 1 && \${#details[@]} == 1)) || fail "Candidate envelope must contain exactly one entry."
[[ "\${members[0]}" =~ ^[A-Za-z0-9@._+:~-]+\.pkg\.tar\.zst$ && "\${details[0]:0:1}" == "-" ]] || fail "Candidate envelope contains an unsafe or unexpected entry."
mkdir -p -- "$PACKAGE_ROOT"; tar -C "$PACKAGE_ROOT" -xf "$envelope" --no-same-owner --no-same-permissions
shopt -s nullglob; packages=("$PACKAGE_ROOT"/*.pkg.tar.zst)
((\${#packages[@]} == 1)) || fail "Expected exactly one package, found \${#packages[@]}."
package="\${packages[0]}"
unexpected="$(find "$PACKAGE_ROOT" -mindepth 1 -maxdepth 1 \( ! -type f -o ! -name '*.pkg.tar.zst' \) -print -quit)"
[[ -z "$unexpected" ]] || fail "Candidate contains an unexpected entry: \${unexpected##*/}"
pkgname="$(bsdtar -xOf "$package" .PKGINFO | awk '$1 == "pkgname" { print $3; exit }')"
[[ "$pkgname" == "$PACKAGE_NAME" ]] || fail "Built package is $pkgname, expected $PACKAGE_NAME."
[[ "$pkgname" != *-debug && "\${package##*/}" != *-debug-* ]] || fail "Debug packages cannot be published."
printf '%s' "\${package##*/}"`.replaceAll("\\${", "${");

const mapCommand = Effect.mapError((error: CommandExecutor.CommandError) =>
  failure(
    error.stderr.length > 0
      ? error.stderr
      : `Command failed with exit code ${error.exitCode}: ${error.command}`,
    "Command failed",
  ),
);

const validateContract = Effect.fn("BuildArchPackage.validateContract")(
  function* (inputs: Inputs) {
    const commands = yield* CommandExecutor.Service;
    const fs = yield* FileSystem.FileSystem;
    const allowlistUrl = yield* requireInput(
      inputs.allowlistUrl,
      "allowlist-url",
    );
    const repository = yield* commands
      .run("curl", [
        "--fail",
        "--location",
        "--silent",
        "--show-error",
        `https://api.github.com/repos/${inputs.sourceRepository}`,
      ])
      .pipe(mapCommand);
    const repositoryFile = yield* fs
      .makeTempFileScoped({ prefix: "repository-" })
      .pipe(
        Effect.mapError((error) =>
          failure(String(error), "File operation failed"),
        ),
      );
    yield* fs
      .writeFileString(repositoryFile, repository)
      .pipe(
        Effect.mapError((error) =>
          failure(String(error), "File operation failed"),
        ),
      );
    const visibility = yield* commands
      .run("jq", ["-r", ".visibility", repositoryFile])
      .pipe(mapCommand);
    if (visibility.trim() !== "public")
      return yield* failure("Source repository must be public.");
    const allowlist = yield* commands
      .run("curl", [
        "--fail",
        "--location",
        "--silent",
        "--show-error",
        allowlistUrl,
      ])
      .pipe(mapCommand);
    const allowlistFile = yield* fs
      .makeTempFileScoped({ prefix: "allowlist-" })
      .pipe(
        Effect.mapError((error) =>
          failure(String(error), "File operation failed"),
        ),
      );
    yield* fs
      .writeFileString(allowlistFile, allowlist)
      .pipe(
        Effect.mapError((error) =>
          failure(String(error), "File operation failed"),
        ),
      );
    const allowed = yield* commands
      .exitCode("jq", [
        "-e",
        "--arg",
        "package",
        inputs.packageName,
        "--arg",
        "repository",
        inputs.sourceRepository,
        '.packages[$package].repository == $repository and (.packages[$package].architectures | index("x86_64") != null)',
        allowlistFile,
      ])
      .pipe(mapCommand);
    if (allowed !== 0)
      return yield* failure(
        `${inputs.packageName} is not allowlisted for ${inputs.sourceRepository} on x86_64.`,
      );
  },
);

const build = Effect.fn("BuildArchPackage.build")(function* (inputs: Inputs) {
  const commands = yield* CommandExecutor.Service;
  const pkgbuildPath = yield* requireInput(
    inputs.pkgbuildPath,
    "pkgbuild-path",
  );
  yield* commands
    .stream("bash", ["-c", buildScript], {
      label: "build Arch package",
      env: {
        PACKAGE_NAME: inputs.packageName,
        PACKAGE_FILES_ARTIFACT_NAME: inputs.packageFilesArtifactName ?? "",
        PKGBUILD_PATH: pkgbuildPath,
        SOURCE_REPOSITORY: inputs.sourceRepository,
        SOURCE_SHA: inputs.sourceSha,
      },
    })
    .pipe(mapCommand);
});

const validate = Effect.fn("BuildArchPackage.validate")(function* (
  inputs: Inputs,
) {
  const commands = yield* CommandExecutor.Service;
  const fs = yield* FileSystem.FileSystem;
  const artifact = yield* commands
    .run("bash", ["-c", inspectScript], {
      env: {
        CANDIDATE_ENVELOPE_ROOT: `${process.env.RUNNER_TEMP}/candidate-envelope`,
        PACKAGE_ROOT: `${process.env.RUNNER_TEMP}/candidate`,
        PACKAGE_NAME: inputs.packageName,
      },
    })
    .pipe(mapCommand);
  const filename = artifact.trim();
  const validated = `${process.env.RUNNER_TEMP}/validated`;
  yield* fs
    .makeDirectory(validated, { recursive: true })
    .pipe(
      Effect.mapError((error) =>
        failure(String(error), "File operation failed"),
      ),
    );
  yield* fs
    .copyFile(
      `${process.env.RUNNER_TEMP}/candidate/${filename}`,
      `${validated}/${filename}`,
    )
    .pipe(
      Effect.mapError((error) =>
        failure(String(error), "File operation failed"),
      ),
    );
  yield* fs
    .writeFileString(
      `${validated}/provenance.json`,
      `${JSON.stringify(provenance(filename, inputs.packageName, inputs.sourceRepository, inputs.sourceSha), null, 2)}\n`,
    )
    .pipe(
      Effect.mapError((error) =>
        failure(String(error), "File operation failed"),
      ),
    );
  yield* commands
    .stream("tar", [
      "-C",
      validated,
      "-cf",
      `${process.env.RUNNER_TEMP}/candidate.tar`,
      "--",
      filename,
      "provenance.json",
    ])
    .pipe(mapCommand);
});

const dispatch = Effect.fn("BuildArchPackage.dispatch")(function* (
  inputs: Inputs,
) {
  const commands = yield* CommandExecutor.Service;
  const artifactName = yield* requireInput(
    inputs.artifactName,
    "artifact-name",
  );
  const sourceRunId = yield* requireInput(inputs.sourceRunId, "source-run-id");
  const payload = JSON.stringify(
    dispatchPayload(
      artifactName,
      inputs.sourceRepository,
      sourceRunId,
      inputs.sourceSha,
    ),
  );
  yield* commands
    .stream(
      "bash",
      [
        "-c",
        'printf %s "$DISPATCH_PAYLOAD" | gh api --method POST repos/timmo001/arch-repo/dispatches --input -',
      ],
      { env: { DISPATCH_PAYLOAD: payload } },
    )
    .pipe(mapCommand);
});

export const run = Effect.fn("BuildArchPackage.run")(function* (
  inputs: Inputs,
) {
  const invalid = validateIdentity(inputs);
  if (invalid !== undefined) return yield* invalid;
  switch (inputs.stage) {
    case "validate-contract":
      return yield* validateContract(inputs);
    case "build":
      return yield* build(inputs);
    case "validate":
      return yield* validate(inputs);
    case "dispatch":
      return yield* dispatch(inputs);
  }
});
