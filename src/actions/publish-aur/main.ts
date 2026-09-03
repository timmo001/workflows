import { Effect } from "effect";
import { ActionInputs } from "../../action/ActionInputs.js";
import { ActionRuntime } from "../../action/ActionRuntime.js";
import { Inputs, run } from "./workflow.js";

const program = Effect.gen(function* () {
  const inputs = yield* ActionInputs.decodeInputs(Inputs, [
    "stage",
    "packageName",
    "pkgbuildPath",
    "auxiliaryFilePaths",
    "aurSshPrivateKey",
  ]).pipe(Effect.mapError(ActionRuntime.toActionFailure));
  yield* run(inputs);
});

ActionRuntime.runAction(program, ActionRuntime.platformLayer);
