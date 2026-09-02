import { Context, Effect, Layer, Schema, Stream } from "effect";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";

export class CommandError extends Schema.TaggedError<CommandError>()(
  "CommandError",
  {
    command: Schema.String,
    exitCode: Schema.Int,
    stderr: Schema.String,
  },
) {}

export interface CommandOptions {
  readonly cwd?: string | undefined;
  readonly env?: Readonly<Record<string, string>> | undefined;
}

export interface CommandResult {
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number;
}

export interface Interface {
  readonly capture: (
    command: string,
    args: readonly string[],
    options?: CommandOptions,
  ) => Effect.Effect<CommandResult, CommandError>;
  readonly run: (
    command: string,
    args: readonly string[],
    options?: CommandOptions,
  ) => Effect.Effect<string, CommandError>;
  readonly exitCode: (
    command: string,
    args: readonly string[],
    options?: CommandOptions,
  ) => Effect.Effect<number, CommandError>;
}

const error = (command: string, cause: unknown) =>
  new CommandError({ command, exitCode: -1, stderr: String(cause) });

const collectText = (stream: Stream.Stream<Uint8Array, unknown>) =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runFold(
      () => "",
      (all, chunk) => all + chunk,
    ),
  );

export class Service extends Context.Service<Service, Interface>()(
  "@timmo001/workflows/CommandExecutor",
) {}

export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
    const make = (
      command: string,
      args: readonly string[],
      options?: CommandOptions,
    ) =>
      ChildProcess.make(command, args, {
        cwd: options?.cwd,
        env: options?.env,
        extendEnv: true,
      });
    const capture = Effect.fn("CommandExecutor.capture")(function* (
      command: string,
      args: readonly string[],
      options?: CommandOptions,
    ) {
      const label = `${command} ${args.join(" ")}`.trim();
      return yield* Effect.scoped(
        Effect.gen(function* () {
          const handle = yield* spawner.spawn(make(command, args, options));
          const [stdout, stderr, exitCode] = yield* Effect.all(
            [
              collectText(handle.stdout),
              collectText(handle.stderr),
              handle.exitCode,
            ],
            { concurrency: "unbounded" },
          );
          return {
            stdout,
            stderr: stderr.trim(),
            exitCode: Number(exitCode),
          };
        }).pipe(
          Effect.mapError((cause) =>
            cause instanceof CommandError ? cause : error(label, cause),
          ),
        ),
      );
    });
    const run = Effect.fn("CommandExecutor.run")(function* (
      command: string,
      args: readonly string[],
      options?: CommandOptions,
    ) {
      const result = yield* capture(command, args, options);
      if (result.exitCode !== 0) {
        return yield* new CommandError({
          command: `${command} ${args.join(" ")}`.trim(),
          exitCode: result.exitCode,
          stderr: result.stderr,
        });
      }
      return result.stdout;
    });
    const exitCode = Effect.fn("CommandExecutor.exitCode")(function* (
      command: string,
      args: readonly string[],
      options?: CommandOptions,
    ) {
      const code = yield* spawner
        .exitCode(make(command, args, options))
        .pipe(
          Effect.mapError((cause) =>
            error(`${command} ${args.join(" ")}`.trim(), cause),
          ),
        );
      return Number(code);
    });
    return Service.of({ capture, run, exitCode });
  }),
);

export * as CommandExecutor from "./CommandExecutor.js";
