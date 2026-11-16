import { Effect, Layer } from "effect";
import { FetchHttpClient } from "effect/http";
import { ActionInputs } from "../../action/ActionInputs.js";
import { ActionRuntime } from "../../action/ActionRuntime.js";
import { Inputs, run } from "./workflow.js";

const program = Effect.gen(function* () {
  const inputs = yield* ActionInputs.decodeInputs(Inputs, [
    "checks",
    "timeout-seconds",
    "interval-seconds",
  ]).pipe(Effect.mapError(ActionRuntime.toActionFailure));

  yield* run(inputs);
});

// Each check expects the first response, so redirects aren't followed
const httpLayer = FetchHttpClient.layer.pipe(
  Layer.provide(
    Layer.succeed(FetchHttpClient.RequestInit, { redirect: "manual" }),
  ),
);

ActionRuntime.runAction(
  program.pipe(Effect.provide(httpLayer)),
  ActionRuntime.platformLayer,
);
