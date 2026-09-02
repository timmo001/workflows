import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Effect, Layer, Schema, type Scope } from "effect";
import { Annotations } from "./Annotations.js";
import { CommandExecutor } from "../services/CommandExecutor.js";

export const platformLayer = Layer.mergeAll(
  NodeServices.layer,
  Annotations.layer,
  CommandExecutor.layer.pipe(Layer.provide(NodeServices.layer)),
);

export type KnownActionError =
  | Annotations.ActionFailure
  | CommandExecutor.CommandError
  | Schema.SchemaError;

export const toActionFailure = (
  error: KnownActionError,
): Annotations.ActionFailure => {
  if (error instanceof Annotations.ActionFailure) {
    return error;
  }
  if (Schema.isSchemaError(error)) {
    return new Annotations.ActionFailure({
      message: String(error),
      title: "Invalid action inputs",
    });
  }
  return new Annotations.ActionFailure({
    message:
      error.stderr.length > 0
        ? error.stderr
        : `Command failed with exit code ${error.exitCode}: ${error.command}`,
    title: "Command failed",
  });
};

export const runAction = <A, R>(
  program: Effect.Effect<A, Annotations.ActionFailure, R>,
  layer: Layer.Layer<Exclude<R, Scope.Scope>>,
): void => {
  const completed = Effect.scoped(program).pipe(
    Effect.provide(layer),
    Effect.catch((error: Annotations.ActionFailure) =>
      Effect.gen(function* () {
        const annotations = yield* Annotations.Service;
        yield* annotations.error(
          error.message,
          error.title === undefined ? undefined : { title: error.title },
        );
        return yield* Effect.fail(error);
      }).pipe(Effect.provide(Annotations.layer)),
    ),
    Effect.catch(() =>
      Effect.sync(() => {
        process.exitCode = 1;
      }),
    ),
  );
  NodeRuntime.runMain(completed, { disableErrorReporting: true });
};

export * as ActionRuntime from "./ActionRuntime.js";
