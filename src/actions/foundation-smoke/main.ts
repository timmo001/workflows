import { Effect, FileSystem, Schema } from "effect";
import { ActionInputs } from "../../action/ActionInputs.js";
import { ActionOutputs } from "../../action/ActionOutputs.js";
import { ActionRuntime } from "../../action/ActionRuntime.js";
import { Annotations } from "../../action/Annotations.js";
import { CommandExecutor } from "../../services/CommandExecutor.js";

const Inputs = Schema.Struct({
  message: Schema.String,
});

const program = Effect.gen(function* () {
  const annotations = yield* Annotations.Service;
  const commands = yield* CommandExecutor.Service;
  const fs = yield* FileSystem.FileSystem;
  const inputs = yield* ActionInputs.decodeInputs(Inputs, ["message"]).pipe(
    Effect.mapError(ActionRuntime.toActionFailure),
  );

  yield* annotations.group("Foundation smoke");
  const temporary = yield* fs
    .makeTempDirectoryScoped({
      prefix: "workflows-foundation-",
    })
    .pipe(Effect.orDie);
  yield* fs
    .writeFileString(`${temporary}/message.txt`, `${inputs.message}\n`)
    .pipe(Effect.orDie);
  const echoed = yield* commands
    .run("cat", [`${temporary}/message.txt`])
    .pipe(Effect.mapError(ActionRuntime.toActionFailure));
  const trimmed = echoed.trim();
  if (trimmed !== inputs.message) {
    return yield* new Annotations.ActionFailure({
      message: `Expected echoed message ${JSON.stringify(inputs.message)}, got ${JSON.stringify(trimmed)}`,
      title: "Smoke check mismatch",
    });
  }
  yield* ActionOutputs.setOutput("echoed", trimmed);
  yield* annotations.notice(`Foundation smoke passed: ${trimmed}`);
  yield* annotations.endGroup();
});

ActionRuntime.runAction(program, ActionRuntime.platformLayer);
