import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NodeServices } from "@effect/platform-node";
import { Cause, Effect, Exit, Layer } from "effect";
import { describe, expect, it } from "vitest";
import { Annotations } from "../src/action/Annotations.js";
import {
  discoverSkillDirectories,
  parseSkillRoots,
  run,
} from "../src/actions/validate-agent-skills/workflow.js";
import { CommandExecutor } from "../src/services/CommandExecutor.js";

const makeSkill = (root: string, name: string) => {
  const directory = join(root, name);
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    join(directory, "SKILL.md"),
    `---\nname: ${name}\ndescription: Test skill\n---\n`,
  );
  return directory;
};

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
  const program = Effect.gen(function* () {
    const exit = yield* Effect.exit(run({ skillRoots }));
    const annotations = yield* Annotations.TestService;
    return { exit, lines: yield* annotations.lines() };
  }).pipe(
    Effect.provide(recordingLayer(recorded, failures)),
    Effect.provide(Annotations.testLayer),
    Effect.provide(NodeServices.layer),
  );
  return { recorded, result: Effect.runPromise(program) };
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
  it("ignores absent and empty roots", async () => {
    const root = mkdtempSync(join(tmpdir(), "agent-skills-empty-"));
    try {
      const discovered = await Effect.runPromise(
        discoverSkillDirectories([join(root, "absent"), root]).pipe(
          Effect.provide(NodeServices.layer),
        ),
      );
      expect(discovered).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("follows root and skill directory symlinks", async () => {
    const root = mkdtempSync(join(tmpdir(), "agent-skills-links-"));
    try {
      const skills = join(root, "skills");
      const targets = join(root, "targets");
      mkdirSync(skills);
      const target = makeSkill(targets, "linked-target");
      symlinkSync(target, join(skills, "linked-skill"), "dir");
      const rootLink = join(root, "skills-link");
      symlinkSync(skills, rootLink, "dir");

      const discovered = await Effect.runPromise(
        discoverSkillDirectories([rootLink]).pipe(
          Effect.provide(NodeServices.layer),
        ),
      );
      expect(discovered).toEqual([join(rootLink, "linked-skill")]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("validate-agent-skills validation", () => {
  it("succeeds when no skills are present", async () => {
    const root = mkdtempSync(join(tmpdir(), "agent-skills-none-"));
    try {
      const { recorded, result } = runValidation(`${root}/absent ${root}`);
      const { exit, lines } = await result;
      expect(Exit.isSuccess(exit)).toBe(true);
      expect(recorded).toEqual([]);
      expect(lines).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("validates skill directory names containing spaces as one argument", async () => {
    const root = mkdtempSync(join(tmpdir(), "agent-skills-spaces-"));
    try {
      const skill = makeSkill(root, "skill with spaces");
      const { recorded, result } = runValidation(root);
      const { exit } = await result;
      expect(Exit.isSuccess(exit)).toBe(true);
      expect(recorded).toEqual([`python:${skill}`]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("reports every structural and skills-ref failure before failing", async () => {
    const root = mkdtempSync(join(tmpdir(), "agent-skills-failures-"));
    try {
      const invalid = makeSkill(root, "invalid");
      const valid = makeSkill(root, "valid");
      const missing = join(root, "missing-file");
      mkdirSync(missing);

      const { recorded, result } = runValidation(root, new Set([invalid]));
      const { exit, lines } = await result;
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
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
