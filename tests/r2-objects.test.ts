import { describe, expect, it } from "@effect/vitest";
import { Effect, Exit, Schema } from "effect";
import { awsArgs, Inputs } from "../src/actions/r2-objects/workflow.js";

const decode = (inputs: Record<string, string>) =>
  Schema.decodeUnknownEffect(Inputs)({
    "account-id": "0123456789abcdef0123456789abcdef",
    "access-key-id": "key",
    "secret-access-key": "secret",
    bucket: "packages",
    ...inputs,
  });

describe("r2-objects arguments", () => {
  it.effect("uploads with ordered filters and a cache-control header", () =>
    Effect.gen(function* () {
      const args = yield* awsArgs(
        yield* decode({
          command: "sync",
          "local-path": "repo/",
          "remote-path": "repo/",
          filters: "exclude *\ninclude *.apk",
          "cache-control": "public, max-age=31536000, immutable",
        }),
      );

      expect(args).toEqual([
        "sync",
        "repo/",
        "s3://packages/repo/",
        "--no-progress",
        "--exclude",
        "*",
        "--include",
        "*.apk",
        "--cache-control",
        "public, max-age=31536000, immutable",
      ]);
    }),
  );

  it.effect("downloads by swapping source and destination", () =>
    Effect.gen(function* () {
      const args = yield* awsArgs(
        yield* decode({
          command: "sync",
          direction: "down",
          "local-path": "state/",
          "remote-path": "/x86_64/",
          delete: "true",
        }),
      );

      expect(args).toEqual([
        "sync",
        "s3://packages/x86_64/",
        "state/",
        "--no-progress",
        "--delete",
      ]);
    }),
  );

  it.effect("removes one object, or a prefix with recursive", () =>
    Effect.gen(function* () {
      expect(
        yield* awsArgs(
          yield* decode({ command: "rm", "remote-path": "x86_64/a.pkg" }),
        ),
      ).toEqual(["rm", "s3://packages/x86_64/a.pkg"]);

      expect(
        yield* awsArgs(
          yield* decode({
            command: "rm",
            "remote-path": "previews/",
            recursive: "true",
          }),
        ),
      ).toEqual(["rm", "s3://packages/previews/", "--recursive"]);
    }),
  );

  it.effect("rejects options that don't apply to the command", () =>
    Effect.gen(function* () {
      for (const inputs of [
        { command: "cp", "remote-path": "a" },
        { command: "cp", "local-path": "a", delete: "true" },
        { command: "sync", "local-path": "a", recursive: "true" },
        {
          command: "sync",
          direction: "down",
          "local-path": "a",
          "cache-control": "no-store",
        },
        { command: "rm", "cache-control": "no-store" },
        { command: "sync", "local-path": "a", filters: "only *.apk" },
      ]) {
        expect(
          Exit.isFailure(yield* Effect.exit(awsArgs(yield* decode(inputs)))),
        ).toBe(true);
      }

      for (const inputs of [
        { command: "mv", "local-path": "a" },
        { command: "rm", bucket: "Not_A_Bucket" },
        { command: "rm", "account-id": "not-hex" },
      ]) {
        expect(Exit.isFailure(yield* Effect.exit(decode(inputs)))).toBe(true);
      }
    }),
  );
});
