import { Effect, Schema } from "effect";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Annotations } from "../../action/Annotations.js";
import { CommandExecutor } from "../../services/CommandExecutor.js";

export const Stage = Schema.Literals(["validate", "verify", "prepare", "push"]);

export const Inputs = Schema.Struct({
  stage: Stage,
  packageName: Schema.String,
  pkgbuildPath: Schema.optionalKey(Schema.String),
  auxiliaryFilePaths: Schema.optionalKey(Schema.String),
  aurSshPrivateKey: Schema.optionalKey(Schema.String),
  aurCloneUrl: Schema.optionalKey(Schema.String),
  actionPath: Schema.optionalKey(Schema.String),
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
  if (!/^[a-z0-9@_+][a-z0-9@._+-]*$/.test(inputs.packageName)) {
    return failure(`Invalid Arch package base: ${inputs.packageName}`);
  }
};

const mapCommand = Effect.mapError((error: CommandExecutor.CommandError) =>
  failure(
    error.stderr.length > 0
      ? error.stderr
      : `Command failed with exit code ${error.exitCode}: ${error.command}`,
    "Command failed",
  ),
);

const installedActionPath = dirname(dirname(fileURLToPath(import.meta.url)));

const runScript = (
  inputs: Inputs,
  name: string,
  env: Readonly<Record<string, string>>,
) =>
  Effect.gen(function* () {
    const commands = yield* CommandExecutor.Service;
    yield* commands
      .stream(
        "bash",
        [
          join(
            inputs.actionPath ?? installedActionPath,
            "scripts",
            `${name}.sh`,
          ),
        ],
        {
          label: `${name} AUR package`,
          env,
        },
      )
      .pipe(mapCommand);
  });

const validate = Effect.fn("PublishAur.validate")(function* (inputs: Inputs) {
  const pkgbuildPath = yield* requireInput(
    inputs.pkgbuildPath,
    "pkgbuild-path",
  );
  yield* runScript(inputs, "validate", {
    ARTIFACT_ROOT: `${process.env.RUNNER_TEMP}/aur-input`,
    AUXILIARY_FILE_PATHS: inputs.auxiliaryFilePaths ?? "",
    PACKAGE_NAME: inputs.packageName,
    PKGBUILD_PATH: pkgbuildPath,
    VALIDATED_ROOT: `${process.env.RUNNER_TEMP}/aur-validated`,
  });
});

const verify = Effect.fn("PublishAur.verify")(function* (inputs: Inputs) {
  yield* runScript(inputs, "verify", {
    PACKAGE_NAME: inputs.packageName,
    VALIDATED_ROOT: `${process.env.RUNNER_TEMP}/aur-validated`,
  });
});

const prepare = Effect.fn("PublishAur.prepare")(function* (inputs: Inputs) {
  yield* runScript(inputs, "prepare", {
    AUR_CLONE_URL:
      inputs.aurCloneUrl ??
      `https://aur.archlinux.org/${inputs.packageName}.git`,
    AUR_ROOT: `${process.env.RUNNER_TEMP}/aur-repository`,
    PACKAGE_NAME: inputs.packageName,
    VALIDATED_ROOT: `${process.env.RUNNER_TEMP}/aur-validated`,
  });
});

const push = Effect.fn("PublishAur.push")(function* (inputs: Inputs) {
  const privateKey = yield* requireInput(
    inputs.aurSshPrivateKey,
    "aur-ssh-private-key",
  );
  yield* runScript(inputs, "push", {
    AUR_ROOT: `${process.env.RUNNER_TEMP}/aur-repository`,
    AUR_SSH_PRIVATE_KEY: privateKey,
    PACKAGE_NAME: inputs.packageName,
  });
});

export const run = Effect.fn("PublishAur.run")(function* (inputs: Inputs) {
  const invalid = validateIdentity(inputs);
  if (invalid !== undefined) return yield* invalid;
  switch (inputs.stage) {
    case "validate":
      return yield* validate(inputs);
    case "verify":
      return yield* verify(inputs);
    case "prepare":
      return yield* prepare(inputs);
    case "push":
      return yield* push(inputs);
  }
});
