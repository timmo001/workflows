import { Effect } from "effect";
import { ActionInputs } from "../../action/ActionInputs.js";
import { ActionRuntime } from "../../action/ActionRuntime.js";
import { Inputs, run } from "./workflow.js";

const program = Effect.gen(function* () {
  const inputs = yield* ActionInputs.decodeInputs(Inputs, [
    "stage",
    "binaryName",
    "packageName",
    "entrypoint",
    "packageConfig",
    "architecture",
    "smokeTestArguments",
    "packagePrepareCommand",
    "archiveExtraPaths",
    "prerelease",
    "releaseVersion",
    "sourceSha",
    "existingRelease",
    "assetRoot",
    "nfpmVersion",
  ]).pipe(Effect.mapError(ActionRuntime.toActionFailure));
  yield* run(inputs);
});

ActionRuntime.runAction(program, ActionRuntime.platformLayer);
