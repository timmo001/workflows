import { Effect } from "effect";
import { FetchHttpClient } from "effect/http";
import { ActionInputs } from "../../action/ActionInputs.js";
import { ActionRuntime } from "../../action/ActionRuntime.js";
import { Inputs, run } from "./workflow.js";

const program = Effect.gen(function* () {
  const inputs = yield* ActionInputs.decodeInputs(Inputs, [
    "zone-id",
    "api-token",
    "files",
  ]).pipe(Effect.mapError(ActionRuntime.toActionFailure));

  yield* run(inputs);
});

ActionRuntime.runAction(
  program.pipe(Effect.provide(FetchHttpClient.layer)),
  ActionRuntime.platformLayer,
);
