import { NodeHttpClient } from "@effect/platform-node";
import { Effect } from "effect";
import { ActionInputs } from "../../action/ActionInputs.js";
import { ActionRuntime } from "../../action/ActionRuntime.js";
import { publicLookup } from "./PublicLookup.js";
import { Inputs, run } from "./workflow.js";

const program = Effect.gen(function* () {
  const inputs = yield* ActionInputs.decodeInputs(Inputs, [
    "checks",
    "timeout-seconds",
    "interval-seconds",
  ]).pipe(Effect.mapError(ActionRuntime.toActionFailure));

  yield* run(inputs);
});

// Undici doesn't follow redirects, as each check expects the first response.
// Hostnames resolve through public resolvers on every connection, so a new
// domain's NXDOMAIN cached by the runner doesn't outlast its first deploy.
const httpLayer = NodeHttpClient.layerUndiciOptions({
  connect: { lookup: publicLookup },
});

ActionRuntime.runAction(
  program.pipe(Effect.provide(httpLayer)),
  ActionRuntime.platformLayer,
);
