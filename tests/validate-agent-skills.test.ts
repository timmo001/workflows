import { join } from "node:path";
import { NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { Cause, Effect, Exit, FileSystem, Layer } from "effect";
import { Annotations } from "../src/action/Annotations.js";
import {
  discoverSkillDirectories,
  parseSkillRoots,
  run,
} from "../src/actions/validate-agent-skills/workflow.js";
import { CommandExecutor } from "../src/services/CommandExecutor.js";
import { tempDirectory } from "./support.js";

const makeSkill = (root: string, name: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const directory = join(root, name);
    yield* fs.makeDirectory(directory, { recursive: true });
    yield* fs.writeFileString(
      join(directory, "SKILL.md"),
      `---\nname: ${name}\ndescription: Test skill\n---\n`,
    );

    return directory;
  });

const recordingLayer = (
  recorded: string[],
  failures: ReadonlySet<string> = new Set(),
) =>
  Layer.succeed(
    CommandExecutor.Service,
    CommandExecutor.Service.of({
      capture: () => Effect.die("capture is unused"),
      run: () => Effect.die("run is unused"),
      exitCode: () => Effect.die("exitCode is unused"),
      stream: Effect.fn("ValidateAgentSkillsTest.stream")(
        function* (
          command,
          args,
        ): Effect.fn.Return<void, CommandExecutor.CommandError> {
          const directory = args[args.length - 1] ?? "";
          recorded.push(`${command}:${directory}`);

          if (failures.has(directory)) {
            return yield* new CommandExecutor.CommandError({
              command: `skills-ref validate ${directory}`,
              exitCode: 1,
              stderr: "invalid skill",
            });
          }
        },
      ),
    }),
  );

const runValidation = (skillRoots: string, failures?: ReadonlySet<string>) => {
  const recorded: string[] = [];

  const result = Effect.gen(function* () {
    const exit = yield* Effect.exit(run({ skillRoots }));
    const annotations = yield* Annotations.TestService;

    return { exit, lines: yield* annotations.lines() };
  }).pipe(
    Effect.provide(recordingLayer(recorded, failures)),
    Effect.provide(Annotations.testLayer),
  );

  return { recorded, result };
};

describe("validate-agent-skills root parsing", () => {
  it("preserves whitespace-delimited roots", () => {
    expect(
      parseSkillRoots(" .agents/skills\n.opencode/skills  skills "),
    ).toEqual([".agents/skills", ".opencode/skills", "skills"]);
    expect(parseSkillRoots("  ")).toEqual([]);
  });
});

describe("validate-agent-skills discovery", () => {
  it.effect("ignores absent and empty roots", () =>
    Effect.gen(function* () {
      const root = yield* tempDirectory("agent-skills-empty-");

      const discovered = yield* discoverSkillDirectories([
        join(root, "absent"),
        root,
      ]);

      expect(discovered).toEqual([]);
    }).pipe(Effect.provide(NodeServices.layer)),
  );

  it.effect("follows root and skill directory symlinks", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const root = yield* tempDirectory("agent-skills-links-");
      const skills = join(root, "skills");
      const targets = join(root, "targets");
      yield* fs.makeDirectory(skills);
      const target = yield* makeSkill(targets, "linked-target");
      yield* fs.symlink(target, join(skills, "linked-skill"));
      const rootLink = join(root, "skills-link");
      yield* fs.symlink(skills, rootLink);

      const discovered = yield* discoverSkillDirectories([rootLink]);

      expect(discovered).toEqual([join(rootLink, "linked-skill")]);
    }).pipe(Effect.provide(NodeServices.layer)),
  );
});

describe("validate-agent-skills validation", () => {
  it.effect("succeeds when no skills are present", () =>
    Effect.gen(function* () {
      const root = yield* tempDirectory("agent-skills-none-");
      const { recorded, result } = runValidation(`${root}/absent ${root}`);
      const { exit, lines } = yield* result;

      expect(Exit.isSuccess(exit)).toBe(true);
      expect(recorded).toEqual([]);
      expect(lines).toEqual([]);
    }).pipe(Effect.provide(NodeServices.layer)),
  );

  it.effect(
    "validates skill directory names containing spaces as one argument",
    () =>
      Effect.gen(function* () {
        const root = yield* tempDirectory("agent-skills-spaces-");
        const skill = yield* makeSkill(root, "skill with spaces");
        const { recorded, result } = runValidation(root);
        const { exit } = yield* result;

        expect(Exit.isSuccess(exit)).toBe(true);
        expect(recorded).toEqual([`python:${skill}`]);
      }).pipe(Effect.provide(NodeServices.layer)),
  );

  it.effect(
    "reports every structural and skills-ref failure before failing",
    () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const root = yield* tempDirectory("agent-skills-failures-");
        const invalid = yield* makeSkill(root, "invalid");
        const valid = yield* makeSkill(root, "valid");
        const missing = join(root, "missing-file");
        yield* fs.makeDirectory(missing);

        const { recorded, result } = runValidation(root, new Set([invalid]));
        const { exit, lines } = yield* result;
        expect(Exit.isFailure(exit)).toBe(true);

        if (Exit.isFailure(exit)) {
          const error = Cause.squash(exit.cause);

          if (!(error instanceof Annotations.ActionFailure)) throw error;
          expect(error.message).toBe("2 skill(s) failed validation.");
        }

        expect(recorded).toEqual([`python:${invalid}`, `python:${valid}`]);
        expect(lines).toEqual([
          `::error title=Invalid Agent Skill,file=${invalid}/SKILL.md::skills-ref validation failed: ${invalid}`,
          `::error title=Missing Agent Skill definition,file=${missing}/SKILL.md::Skill directory missing SKILL.md: ${missing}`,
        ]);
      }).pipe(Effect.provide(NodeServices.layer)),
  );
});
