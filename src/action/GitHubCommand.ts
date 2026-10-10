import { GhCommandError, type GhError } from "@timmo001/effect-gh";
import { Effect, Match } from "effect";
import { Annotations } from "./Annotations.js";

/** Map a failed effect-gh operation to an action failure that shows gh's stderr. */
export const mapError = (label: string) =>
  Effect.mapError(
    (error: GhError) =>
      new Annotations.ActionFailure({
        title: "Command failed",
        message: Match.value(error).pipe(
          Match.tag(
            "GhCommandError",
            (error) =>
              error.stderr.trim() ||
              `Command failed with exit code ${error.exitCode}: ${label}`,
          ),
          Match.tag(
            "GhTimeoutError",
            (error) => `Command timed out after ${error.timeoutMs}ms: ${label}`,
          ),
          Match.tag(
            "GhOutputLimitError",
            (error) =>
              `Command output passed ${error.limitBytes} bytes: ${label}`,
          ),
          Match.tag("GhPlatformError", "GhDecodeError", (error) =>
            String(error.cause),
          ),
          Match.exhaustive,
        ),
      }),
  );

/**
 * Run a typed effect-gh operation as an action step. A failure writes gh's
 * stderr to the action log before it becomes the action failure. Failures are
 * never retried.
 */
export const run = <A, R>(
  label: string,
  operation: Effect.Effect<A, GhError, R>,
) =>
  operation.pipe(
    Effect.tapError((error) =>
      error instanceof GhCommandError && error.stderr !== ""
        ? writeStderr(
            error.stderr.endsWith("\n") ? error.stderr : `${error.stderr}\n`,
          )
        : Effect.void,
    ),
    mapError(label),
  );

/** Write diagnostic text to the action log. */
export const writeStderr = (text: string) =>
  Effect.sync(() => {
    process.stderr.write(text);
  });

export * as GitHubCommand from "./GitHubCommand.js";
