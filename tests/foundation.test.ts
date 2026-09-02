import { NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { Effect, FileSystem, Layer } from "effect";
import { Annotations } from "../src/action/Annotations.js";
import { CommandExecutor } from "../src/services/CommandExecutor.js";

const commandLayer = CommandExecutor.layer.pipe(
  Layer.provide(NodeServices.layer),
);

describe("CommandExecutor", () => {
  it.effect("captures stdout and exit code", () =>
    Effect.gen(function* () {
      const commands = yield* CommandExecutor.Service;
      const result = yield* commands.capture("printf", ["hello"]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe("hello");
    }).pipe(Effect.provide(commandLayer)),
  );

  it.effect("fails run on non-zero exit", () =>
    Effect.gen(function* () {
      const commands = yield* CommandExecutor.Service;
      const error = yield* Effect.flip(commands.run("false", []));
      expect(error._tag).toBe("CommandError");
      expect(error.exitCode).toBe(1);
    }).pipe(Effect.provide(commandLayer)),
  );
});

describe("Annotations", () => {
  it.effect("records workflow commands", () =>
    Effect.gen(function* () {
      const annotations = yield* Annotations.TestService;
      yield* annotations.error("boom", { title: "Broken" });
      yield* annotations.warning("careful");
      yield* annotations.group("section");
      yield* annotations.endGroup();
      const lines = yield* annotations.lines();
      expect(lines).toEqual([
        "::error title=Broken::boom",
        "::warning::careful",
        "::group::section",
        "::endgroup::",
      ]);
    }).pipe(Effect.provide(Annotations.testLayer)),
  );
});

describe("scoped temporary resources", () => {
  it.effect("creates and cleans temporary directories", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Effect.scoped(
        Effect.gen(function* () {
          const temporary = yield* fs.makeTempDirectoryScoped({
            prefix: "workflows-temp-",
          });
          yield* fs.writeFileString(`${temporary}/probe.txt`, "ok\n");
          const exists = yield* fs.exists(`${temporary}/probe.txt`);
          expect(exists).toBe(true);
          return temporary;
        }),
      );
      const existsAfter = yield* fs.exists(path);
      expect(existsAfter).toBe(false);
    }).pipe(Effect.provide(NodeServices.layer)),
  );
});
