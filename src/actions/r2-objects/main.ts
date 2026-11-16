import { Effect } from "effect";
import { ActionInputs } from "../../action/ActionInputs.js";
import { ActionRuntime } from "../../action/ActionRuntime.js";
import { Inputs, run } from "./workflow.js";

const program = Effect.gen(function* () {
  const inputs = yield* ActionInputs.decodeInputs(Inputs, [
    "command",
    "direction",
    "local-path",
    "remote-path",
    "recursive",
    "delete",
    "filters",
    "cache-control",
    "account-id",
    "access-key-id",
    "secret-access-key",
    "bucket",
  ]).pipe(Effect.mapError(ActionRuntime.toActionFailure));

  yield* run(inputs);
});

ActionRuntime.runAction(program, ActionRuntime.platformLayer);
