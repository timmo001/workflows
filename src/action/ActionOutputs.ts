import { Effect, FileSystem } from "effect";
import { randomBytes } from "node:crypto";

const githubOutputPath = () => process.env.GITHUB_OUTPUT;

export const setOutput = (
  name: string,
  value: string,
): Effect.Effect<void, never, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const path = githubOutputPath();
    if (path === undefined) {
      yield* Effect.sync(() => {
        process.stdout.write(`::set-output name=${name}::${value}\n`);
      });
      return;
    }
    const fs = yield* FileSystem.FileSystem;
    const delimiter = `ghadelim_${randomBytes(16).toString("hex")}`;
    yield* fs
      .writeFileString(
        path,
        `${name}<<${delimiter}\n${value}\n${delimiter}\n`,
        {
          flag: "a",
        },
      )
      .pipe(Effect.orDie);
  });

export * as ActionOutputs from "./ActionOutputs.js";
