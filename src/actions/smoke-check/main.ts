import { Effect } from "effect";
import { ActionInputs } from "../../action/ActionInputs.js";
import { ActionRuntime } from "../../action/ActionRuntime.js";
import * as PublicDnsHttpClient from "./PublicDnsHttpClient.js";
import { Inputs, run } from "./workflow.js";

const program = Effect.gen(function* () {
  const inputs = yield* ActionInputs.decodeInputs(Inputs, [
    "checks",
    "timeout-seconds",
    "interval-seconds",
  ]).pipe(Effect.mapError(ActionRuntime.toActionFailure));

  yield* run(inputs);
});

// Each check expects the first response, so redirects aren't followed, and
// hostnames resolve through public resolvers on every attempt, so a new
// domain's NXDOMAIN cached by the runner doesn't outlast its first deploy.
ActionRuntime.runAction(
  program.pipe(Effect.provide(PublicDnsHttpClient.layer)),
  ActionRuntime.platformLayer,
);
