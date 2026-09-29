import { createHash } from "node:crypto";
import { join } from "node:path";
import { NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Exit, FileSystem, Layer } from "effect";
import {
  type Inputs,
  run,
  validateIdentity,
} from "../src/actions/publish-aur/workflow.js";
import { CommandExecutor } from "../src/services/CommandExecutor.js";
import { tempDirectory, withEnv } from "./support.js";

const actionPath = join(process.cwd(), ".github/actions/publish-aur");

const validInputs = {
  stage: "verify",
  packageName: "example-git",
  actionPath,
} satisfies Inputs;

const commandLayer = CommandExecutor.layer.pipe(
  Layer.provide(NodeServices.layer),
);

const git = Effect.fn("PublishAurTest.git")(function* (
  args: readonly string[],
) {
  const commands = yield* CommandExecutor.Service;

  return (yield* commands.run("git", args)).trim();
});

const runStage = (inputs: Inputs) =>
  Effect.exit(run(inputs)).pipe(Effect.provide(commandLayer));

const writeValidatedPackage = Effect.fn("PublishAurTest.writeValidatedPackage")(
  function* (root: string, pkgbuild: string) {
    const fs = yield* FileSystem.FileSystem;
    yield* fs.makeDirectory(root, { recursive: true });
    yield* fs.writeFileString(join(root, "PKGBUILD"), pkgbuild);
    yield* fs.writeFileString(
      join(root, ".SRCINFO"),
      "pkgbase = example-git\n",
    );
    yield* fs.writeFileString(join(root, "MANIFEST"), "PKGBUILD\n.SRCINFO\n");

    const checksum = Effect.fn("PublishAurTest.checksum")(function* (
      path: string,
    ) {
      return createHash("sha256")
        .update(yield* fs.readFile(join(root, path)))
        .digest("hex");
    });

    yield* fs.writeFileString(
      join(root, "CHECKSUMS"),
      `${yield* checksum("PKGBUILD")}\tPKGBUILD\n${yield* checksum(".SRCINFO")}\t.SRCINFO\n`,
    );
  },
);

describe("publish-aur contract", () => {
  it("accepts the existing package name contract", () => {
    expect(validateIdentity(validInputs)).toBeUndefined();
  });

  it.each(["Example", "-example", "example package", "example/control\n"])(
    "rejects an invalid package base: %s",
    (packageName) => {
      expect(
        validateIdentity({ ...validInputs, packageName })?.message,
      ).toContain("Invalid Arch package base");
    },
  );
});

describe("publish-aur artifact protocol", () => {
  it.effect("accepts matching manifest checksums and rejects tampering", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const root = yield* tempDirectory("publish-aur-verify-");
      const validated = join(root, "aur-validated");
      yield* withEnv("RUNNER_TEMP", root);
      yield* writeValidatedPackage(validated, "pkgname=example-git\n");
      expect(Exit.isSuccess(yield* runStage(validInputs))).toBe(true);
      yield* fs.writeFileString(
        join(validated, "PKGBUILD"),
        "pkgname=tampered\n",
      );
      expect(Exit.isFailure(yield* runStage(validInputs))).toBe(true);
    }).pipe(Effect.provide(NodeServices.layer), Effect.provide(commandLayer)),
  );
});

describe("publish-aur Git reconciliation", () => {
  it.effect.each([
    { validatedPkgbuild: "pkgname=example-git\n", expected: "false" },
    { validatedPkgbuild: "pkgname=example-git\npkgver=2\n", expected: "true" },
  ])(
    "reports the expected changed output %#",
    ({ validatedPkgbuild, expected }) =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const root = yield* tempDirectory("publish-aur-prepare-");
        const remote = join(root, "remote.git");
        const seed = join(root, "seed");
        const validated = join(root, "aur-validated");
        const clone = join(root, "aur-repository");
        const output = join(root, "github-output");
        yield* git(["init", "--bare", "--initial-branch=master", remote]);
        yield* git(["clone", remote, seed]);
        yield* git(["-C", seed, "config", "user.name", "Test"]);
        yield* git([
          "-C",
          seed,
          "config",
          "user.email",
          "test@example.invalid",
        ]);
        yield* writeValidatedPackage(seed, "pkgname=example-git\n");
        yield* git(["-C", seed, "add", "PKGBUILD", ".SRCINFO"]);
        yield* git(["-C", seed, "commit", "-m", "Initial package"]);
        yield* git(["-C", seed, "push", "origin", "HEAD:master"]);
        yield* writeValidatedPackage(validated, validatedPkgbuild);
        yield* fs.writeFileString(output, "");

        yield* withEnv("RUNNER_TEMP", root);
        yield* withEnv("GITHUB_OUTPUT", output);

        const exit = yield* runStage({
          stage: "prepare",
          packageName: "example-git",
          aurCloneUrl: remote,
          actionPath,
        });

        expect(Exit.isSuccess(exit)).toBe(true);
        expect(yield* fs.readFileString(output)).toBe(`changed=${expected}\n`);
        expect(
          yield* git(["-C", clone, "log", "-1", "--format=%an <%ae>"]),
        ).toBe(
          expected === "true"
            ? "GitHub Actions <41898282+github-actions[bot]@users.noreply.github.com>"
            : "Test <test@example.invalid>",
        );
      }).pipe(Effect.provide(NodeServices.layer), Effect.provide(commandLayer)),
  );
});
