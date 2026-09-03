import { Effect, FileSystem, Schema } from "effect";
import { join } from "node:path";
import { Annotations } from "../../action/Annotations.js";
import { CommandExecutor } from "../../services/CommandExecutor.js";

export const Inputs = Schema.Struct({
  skillRoots: Schema.String,
});
export interface Inputs extends Schema.Schema.Type<typeof Inputs> {}

export type ValidationResult =
  | { readonly _tag: "Valid"; readonly skillDirectory: string }
  | { readonly _tag: "MissingSkillFile"; readonly skillDirectory: string }
  | { readonly _tag: "SkillsRefFailure"; readonly skillDirectory: string };

export const parseSkillRoots = (value: string) =>
  value.trim() === "" ? [] : value.trim().split(/\s+/);

const isDirectory = Effect.fn("ValidateAgentSkills.isDirectory")(function* (
  path: string,
) {
  const fs = yield* FileSystem.FileSystem;
  return yield* fs.stat(path).pipe(
    Effect.map((info) => info.type === "Directory"),
    Effect.catch(() => Effect.succeed(false)),
  );
});

const isFile = Effect.fn("ValidateAgentSkills.isFile")(function* (
  path: string,
) {
  const fs = yield* FileSystem.FileSystem;
  return yield* fs.stat(path).pipe(
    Effect.map((info) => info.type === "File"),
    Effect.catch(() => Effect.succeed(false)),
  );
});

export const discoverSkillDirectories = Effect.fn(
  "ValidateAgentSkills.discoverSkillDirectories",
)(function* (roots: readonly string[]) {
  const fs = yield* FileSystem.FileSystem;
  const directories: string[] = [];

  for (const root of roots) {
    if (!(yield* isDirectory(root))) continue;
    const entries = yield* fs
      .readDirectory(root)
      .pipe(Effect.catch(() => Effect.succeed([])));
    for (const entry of entries.toSorted()) {
      if (entry.startsWith(".")) continue;
      const path = join(root, entry);
      if (yield* isDirectory(path)) directories.push(path);
    }
  }

  return directories;
});

const writeStdout = (message: string) =>
  Effect.sync(() => process.stdout.write(`${message}\n`));

const writeStderr = (message: string) =>
  Effect.sync(() => process.stderr.write(`${message}\n`));

export const validateSkill = Effect.fn("ValidateAgentSkills.validateSkill")(
  function* (skillDirectory: string) {
    const annotations = yield* Annotations.Service;
    const skillFile = join(skillDirectory, "SKILL.md");
    if (!(yield* isFile(skillFile))) {
      const message = `Skill directory missing SKILL.md: ${skillDirectory}`;
      yield* writeStderr(message);
      yield* annotations.error(message, {
        title: "Missing Agent Skill definition",
        file: skillFile,
      });
      return {
        _tag: "MissingSkillFile",
        skillDirectory,
      } satisfies ValidationResult;
    }

    const commands = yield* CommandExecutor.Service;
    const valid = yield* commands
      .stream("python", ["-m", "skills_ref.cli", "validate", skillDirectory], {
        label: `skills-ref validate ${skillDirectory}`,
      })
      .pipe(
        Effect.as(true),
        Effect.catch((_error: CommandExecutor.CommandError) =>
          Effect.succeed(false),
        ),
      );
    if (!valid) {
      const message = `skills-ref validation failed: ${skillDirectory}`;
      yield* writeStderr(message);
      yield* annotations.error(message, {
        title: "Invalid Agent Skill",
        file: skillFile,
      });
      return {
        _tag: "SkillsRefFailure",
        skillDirectory,
      } satisfies ValidationResult;
    }

    return { _tag: "Valid", skillDirectory } satisfies ValidationResult;
  },
);

export const run = Effect.fn("ValidateAgentSkills.run")(function* (
  inputs: Inputs,
) {
  const skillDirectories = yield* discoverSkillDirectories(
    parseSkillRoots(inputs.skillRoots),
  );
  if (skillDirectories.length === 0) {
    yield* writeStdout("No skills found to validate.");
    return;
  }

  const results = yield* Effect.forEach(skillDirectories, validateSkill, {
    concurrency: 1,
  });
  const checked = results.filter(
    (result) => result._tag !== "MissingSkillFile",
  ).length;
  const failures = results.filter((result) => result._tag !== "Valid").length;

  if (failures > 0) {
    const message = `${failures} skill(s) failed validation.`;
    yield* writeStderr(message);
    return yield* new Annotations.ActionFailure({
      message,
      title: "Agent Skill validation failed",
    });
  }

  yield* writeStdout(`Validated ${checked} skill(s) with skills-ref.`);
});
