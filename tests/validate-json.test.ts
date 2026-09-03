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
import { Cause, Effect, Exit } from "effect";
import { describe, expect, it } from "vitest";
import { Annotations } from "../src/action/Annotations.js";
import {
  discoverJsonFiles,
  run,
  validateJsonSource,
} from "../src/actions/validate-json/workflow.js";

const withTempDirectory =
  (test: (root: string) => Promise<void>) => async () => {
    const root = mkdtempSync(join(tmpdir(), "validate-json-"));
    try {
      await test(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  };

describe("validate-json parsing", () => {
  it("matches JSONLint for duplicate keys, BOMs, numbers, and scalars", () => {
    for (const source of [
      '{"key":1,"key":2}',
      "0",
      "-1.5e+2",
      "true",
      '"value"',
    ]) {
      expect(validateJsonSource("test.json", source)._tag).toBe("Valid");
    }
    for (const source of ["\uFEFF{}", "01", "1.", "NaN", ""]) {
      expect(validateJsonSource("test.json", source)._tag).toBe("Invalid");
    }
  });
});

describe("validate-json discovery", () => {
  it(
    "recursively finds regular JSON files without excluding hidden or vendored directories",
    withTempDirectory(async (root) => {
      const nested = join(root, ".generated", "vendor");
      mkdirSync(nested, { recursive: true });
      const unusual = join(nested, "file with spaces\nand newline.json");
      writeFileSync(unusual, "{}\n");
      writeFileSync(join(nested, "ignored.JSON"), "{}\n");
      writeFileSync(join(root, "target.json"), "{}\n");
      symlinkSync(join(root, "target.json"), join(root, "linked.json"));
      symlinkSync(nested, join(root, "linked-directory"), "dir");

      const files = await Effect.runPromise(
        discoverJsonFiles(root).pipe(Effect.provide(NodeServices.layer)),
      );
      expect(files).toEqual([unusual, join(root, "target.json")]);
    }),
  );
});

describe("validate-json validation", () => {
  it(
    "succeeds when no JSON files exist",
    withTempDirectory(async (root) => {
      const exit = await Effect.runPromise(
        Effect.exit(run(root)).pipe(
          Effect.provide(Annotations.testLayer),
          Effect.provide(NodeServices.layer),
        ),
      );
      expect(Exit.isSuccess(exit)).toBe(true);
    }),
  );

  it(
    "annotates every invalid file before failing",
    withTempDirectory(async (root) => {
      writeFileSync(join(root, "valid.json"), "{}\n");
      writeFileSync(join(root, "first invalid.json"), '{"value":}\n');
      const nested = join(root, "nested");
      mkdirSync(nested);
      writeFileSync(join(nested, "second.json"), "[1,]\n");

      const program = Effect.gen(function* () {
        const exit = yield* Effect.exit(run(root));
        const annotations = yield* Annotations.TestService;
        return { exit, lines: yield* annotations.lines() };
      }).pipe(
        Effect.provide(Annotations.testLayer),
        Effect.provide(NodeServices.layer),
      );
      const { exit, lines } = await Effect.runPromise(program);

      expect(Exit.isFailure(exit)).toBe(true);
      if (Exit.isFailure(exit)) {
        const error = Cause.squash(exit.cause);
        if (!(error instanceof Annotations.ActionFailure)) throw error;
        expect(error.message).toBe("2 JSON file(s) failed validation.");
      }
      expect(lines).toHaveLength(2);
      expect(lines[0]).toContain(
        `::error title=Invalid JSON,file=${join(root, "first invalid.json")}::`,
      );
      expect(lines[1]).toContain(
        `::error title=Invalid JSON,file=${join(nested, "second.json")}::`,
      );
    }),
  );
});
