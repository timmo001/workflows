import { Effect, Schema } from "effect";
import { Annotations } from "../../action/Annotations.js";
import { CommandExecutor } from "../../services/CommandExecutor.js";

const BooleanInput = (fallback: "true" | "false") =>
  Schema.Literals(["true", "false"]).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed(fallback)),
  );

export const Inputs = Schema.Struct({
  command: Schema.Literals(["sync", "cp", "rm"]),
  direction: Schema.Literals(["up", "down"]).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed("up" as const)),
  ),
  "local-path": Schema.optionalKey(Schema.String),
  "remote-path": Schema.String.pipe(
    Schema.withDecodingDefaultKey(Effect.succeed("")),
  ),
  recursive: BooleanInput("false"),
  delete: BooleanInput("false"),
  filters: Schema.optionalKey(Schema.String),
  "cache-control": Schema.optionalKey(Schema.String),
  "account-id": Schema.String.check(Schema.isPattern(/^[a-f0-9]{32}$/)),
  "access-key-id": Schema.String,
  "secret-access-key": Schema.String,
  bucket: Schema.String.check(
    Schema.isPattern(/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/),
  ),
});

export interface Inputs extends Schema.Schema.Type<typeof Inputs> {}

const failure = (message: string) =>
  new Annotations.ActionFailure({ message, title: "R2 objects" });

/** One `include <pattern>` or `exclude <pattern>` per line, kept in order as aws applies them. */
export const parseFilters = Effect.fn("R2Objects.parseFilters")(function* (
  text: string,
) {
  const args: string[] = [];

  for (const line of text.split("\n").map((line) => line.trim())) {
    if (line === "" || line.startsWith("#")) continue;

    const match = /^(include|exclude)\s+(\S.*)$/.exec(line);

    if (match === null) {
      return yield* failure(
        `Expected "include <pattern>" or "exclude <pattern>", got "${line}"`,
      );
    }

    args.push(`--${match[1]}`, match[2] ?? "");
  }

  return args;
});

/** The `aws s3` arguments for the inputs, without the endpoint. */
export const awsArgs = Effect.fn("R2Objects.awsArgs")(function* (
  inputs: Inputs,
) {
  const remote = `s3://${inputs.bucket}/${inputs["remote-path"].replace(/^\/+/, "")}`;
  const local = inputs["local-path"];

  const filters =
    inputs.filters === undefined ? [] : yield* parseFilters(inputs.filters);

  if (inputs.command === "rm") {
    if (inputs.delete === "true" || inputs["cache-control"] !== undefined) {
      return yield* failure("rm takes no delete or cache-control");
    }

    return [
      "rm",
      remote,
      ...(inputs.recursive === "true" ? ["--recursive"] : []),
      ...filters,
    ];
  }

  if (local === undefined) {
    return yield* failure(`${inputs.command} needs a local-path`);
  }

  if (inputs.command === "cp" && inputs.delete === "true") {
    return yield* failure("delete only applies to sync");
  }

  if (inputs.command === "sync" && inputs.recursive === "true") {
    return yield* failure("sync is always recursive; leave recursive unset");
  }

  if (inputs.direction === "down" && inputs["cache-control"] !== undefined) {
    return yield* failure("cache-control only applies to uploads");
  }

  const [source, destination] =
    inputs.direction === "up" ? [local, remote] : [remote, local];

  return [
    inputs.command,
    source,
    destination,
    "--no-progress",
    ...(inputs.recursive === "true" ? ["--recursive"] : []),
    ...(inputs.delete === "true" ? ["--delete"] : []),
    ...filters,
    ...(inputs["cache-control"] === undefined
      ? []
      : ["--cache-control", inputs["cache-control"]]),
  ];
});

export const run = Effect.fn("R2Objects.run")(function* (inputs: Inputs) {
  const commands = yield* CommandExecutor.Service;
  const args = yield* awsArgs(inputs);

  yield* commands
    .stream(
      "aws",
      [
        "s3",
        ...args,
        "--endpoint-url",
        `https://${inputs["account-id"]}.r2.cloudflarestorage.com`,
      ],
      {
        env: {
          AWS_ACCESS_KEY_ID: inputs["access-key-id"],
          AWS_SECRET_ACCESS_KEY: inputs["secret-access-key"],
          AWS_DEFAULT_REGION: "auto",
        },
        label: `aws s3 ${args.join(" ")}`,
      },
    )
    .pipe(
      Effect.mapError((error) =>
        failure(
          error.stderr.length > 0
            ? error.stderr
            : `aws s3 ${inputs.command} failed with exit code ${error.exitCode}`,
        ),
      ),
    );
});
