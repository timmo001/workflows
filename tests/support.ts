import { NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Layer } from "effect";
import { CommandExecutor } from "../src/services/CommandExecutor.js";

// Keep the developer's global and system git config (such as tag.gpgsign) out
// of fixture repositories, so local runs behave like CI.
export const isolatedGitEnv = {
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_NOSYSTEM: "1",
} as const;

Object.assign(process.env, isolatedGitEnv);

export const tempDirectory = (prefix: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    return yield* fs.makeTempDirectoryScoped({ prefix });
  });

export const commandLayer = CommandExecutor.layer.pipe(
  Layer.provide(NodeServices.layer),
);

export const platformLayer = Layer.mergeAll(NodeServices.layer, commandLayer);

export const exec = (
  command: string,
  args: readonly string[],
  options?: CommandExecutor.CommandOptions,
) =>
  Effect.gen(function* () {
    const commands = yield* CommandExecutor.Service;

    return yield* commands.run(command, args, options);
  });

export const inDirectory = (directory: string) =>
  Effect.acquireRelease(
    Effect.sync(() => {
      const previous = process.cwd();
      process.chdir(directory);

      return previous;
    }),
    (previous) => Effect.sync(() => process.chdir(previous)),
  );

export const withEnv = (name: string, value: string) =>
  Effect.acquireRelease(
    Effect.sync(() => {
      const previous = process.env[name];
      process.env[name] = value;

      return previous;
    }),
    (previous) =>
      Effect.sync(() => {
        if (previous === undefined) delete process.env[name];
        else process.env[name] = previous;
      }),
  );

export const git = (args: readonly string[], cwd: string) =>
  exec("git", args, { cwd }).pipe(Effect.map((output) => output.trim()));

export const initRepo = Effect.fn("Test.initRepo")(function* (root: string) {
  yield* git(["init", "-b", "main"], root);
  yield* git(["config", "user.email", "test@example.com"], root);
  yield* git(["config", "user.name", "test"], root);
  yield* git(["commit", "--allow-empty", "-m", "init"], root);

  return yield* git(["rev-parse", "HEAD"], root);
});
