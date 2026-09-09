import { Gh, type GhError, type GhOptions } from "@timmo001/effect-gh";
import { Effect, Stream } from "effect";
import { Annotations } from "./Annotations.js";

export const make = Effect.fn("GitHubCommand.make")(function* (label: string) {
  const gh = yield* Gh;
  let stderrTail = "";
  const writeStderr = (text: string) =>
    Effect.sync(() => {
      process.stderr.write(text);
      stderrTail = `${stderrTail}${text}`.slice(-16 * 1024);
    });
  const mapError = Effect.mapError(
    (error: GhError) =>
      new Annotations.ActionFailure({
        title: "Command failed",
        message:
          error._tag === "GhCommandError"
            ? stderrTail.trim() ||
              `Command failed with exit code ${error.exitCode}: ${label}`
            : error._tag === "GhTimeoutError"
              ? `Command timed out after ${error.timeoutMs}ms: ${label}`
              : String(error.cause),
      }),
  );
  const stream = Effect.fn("GitHubCommand.stream")(function* (
    args: readonly string[],
    options: GhOptions & { readonly suppressStdout?: boolean } = {},
  ) {
    yield* gh.stream(args, options).pipe(
      Stream.runForEach((chunk) =>
        chunk._tag === "Stderr"
          ? writeStderr(chunk.text)
          : Effect.sync(() => {
              if (!options.suppressStdout) process.stdout.write(chunk.text);
            }),
      ),
      mapError,
    );
  });
  return { stream, writeStderr, mapError };
});

export * as GitHubCommand from "./GitHubCommand.js";
