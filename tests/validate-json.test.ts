import { join } from "node:path";
import { NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { Cause, Effect, Exit, FileSystem } from "effect";
import { Annotations } from "../src/action/Annotations.js";
import {
  discoverJsonFiles,
  run,
  validateJsonSource,
} from "../src/actions/validate-json/workflow.js";
import { tempDirectory } from "./support.js";

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
  it.effect(
    "recursively finds regular JSON files without excluding hidden or vendored directories",
    () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const root = yield* tempDirectory("validate-json-");
        const nested = join(root, ".generated", "vendor");
        yield* fs.makeDirectory(nested, { recursive: true });
        const unusual = join(nested, "file with spaces\nand newline.json");
        yield* fs.writeFileString(unusual, "{}\n");
        yield* fs.writeFileString(join(nested, "ignored.JSON"), "{}\n");
        yield* fs.writeFileString(join(root, "target.json"), "{}\n");
        yield* fs.symlink(join(root, "target.json"), join(root, "linked.json"));
        yield* fs.symlink(nested, join(root, "linked-directory"));

        const files = yield* discoverJsonFiles(root);

        expect(files).toEqual([unusual, join(root, "target.json")]);
      }).pipe(Effect.provide(NodeServices.layer)),
  );
});

describe("validate-json validation", () => {
  it.effect("succeeds when no JSON files exist", () =>
    Effect.gen(function* () {
      const root = yield* tempDirectory("validate-json-");

      const exit = yield* Effect.exit(run(root)).pipe(
        Effect.provide(Annotations.testLayer),
      );

      expect(Exit.isSuccess(exit)).toBe(true);
    }).pipe(Effect.provide(NodeServices.layer)),
  );

  it.effect("annotates every invalid file before failing", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const root = yield* tempDirectory("validate-json-");
      yield* fs.writeFileString(join(root, "valid.json"), "{}\n");
      yield* fs.writeFileString(
        join(root, "first invalid.json"),
        '{"value":}\n',
      );
      const nested = join(root, "nested");
      yield* fs.makeDirectory(nested);
      yield* fs.writeFileString(join(nested, "second.json"), "[1,]\n");

      const { exit, lines } = yield* Effect.gen(function* () {
        const exit = yield* Effect.exit(run(root));
        const annotations = yield* Annotations.TestService;

        return { exit, lines: yield* annotations.lines() };
      }).pipe(Effect.provide(Annotations.testLayer));

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
    }).pipe(Effect.provide(NodeServices.layer)),
  );
});
