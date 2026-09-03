import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NodeServices } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";
import {
  type Inputs,
  run,
  validateIdentity,
} from "../src/actions/publish-aur/workflow.js";
import { CommandExecutor } from "../src/services/CommandExecutor.js";

const actionPath = join(process.cwd(), ".github/actions/publish-aur");

const validInputs: Inputs = {
  stage: "verify",
  packageName: "example-git",
  actionPath,
};

const git = (args: string[]) =>
  execFileSync("git", args, { encoding: "utf8" }).trim();

const commandLayer = CommandExecutor.layer.pipe(
  Layer.provide(NodeServices.layer),
);

const runStage = (inputs: Inputs) =>
  Effect.runPromiseExit(run(inputs).pipe(Effect.provide(commandLayer)));

const writeValidatedPackage = (root: string, pkgbuild: string) => {
  mkdirSync(root, { recursive: true });
  writeFileSync(join(root, "PKGBUILD"), pkgbuild);
  writeFileSync(join(root, ".SRCINFO"), "pkgbase = example-git\n");
  writeFileSync(join(root, "MANIFEST"), "PKGBUILD\n.SRCINFO\n");
  const checksum = (path: string) =>
    execFileSync("sha256sum", [join(root, path)], { encoding: "utf8" })
      .split(" ", 1)[0]
      ?.trim();
  writeFileSync(
    join(root, "CHECKSUMS"),
    `${checksum("PKGBUILD")}\tPKGBUILD\n${checksum(".SRCINFO")}\t.SRCINFO\n`,
  );
};

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
  it("accepts matching manifest checksums and rejects tampering", async () => {
    const root = mkdtempSync(join(tmpdir(), "publish-aur-verify-"));
    try {
      const validated = join(root, "aur-validated");
      process.env.RUNNER_TEMP = root;
      writeValidatedPackage(validated, "pkgname=example-git\n");
      expect(await runStage(validInputs)).toMatchObject({ _tag: "Success" });
      writeFileSync(join(validated, "PKGBUILD"), "pkgname=tampered\n");
      expect(await runStage(validInputs)).toMatchObject({ _tag: "Failure" });
    } finally {
      delete process.env.RUNNER_TEMP;
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("publish-aur Git reconciliation", () => {
  it.each([
    ["pkgname=example-git\n", "false"],
    ["pkgname=example-git\npkgver=2\n", "true"],
  ])(
    "reports the expected changed output %#",
    async (validatedPkgbuild, expected) => {
      const root = mkdtempSync(join(tmpdir(), "publish-aur-prepare-"));
      try {
        const remote = join(root, "remote.git");
        const seed = join(root, "seed");
        const validated = join(root, "aur-validated");
        const clone = join(root, "aur-repository");
        const output = join(root, "github-output");
        git(["init", "--bare", "--initial-branch=master", remote]);
        git(["clone", remote, seed]);
        git(["-C", seed, "config", "user.name", "Test"]);
        git(["-C", seed, "config", "user.email", "test@example.invalid"]);
        writeValidatedPackage(seed, "pkgname=example-git\n");
        git(["-C", seed, "add", "PKGBUILD", ".SRCINFO"]);
        git(["-C", seed, "commit", "-m", "Initial package"]);
        git(["-C", seed, "push", "origin", "HEAD:master"]);
        writeValidatedPackage(validated, validatedPkgbuild);
        writeFileSync(output, "");

        process.env.RUNNER_TEMP = root;
        process.env.GITHUB_OUTPUT = output;
        expect(
          await runStage({
            stage: "prepare",
            packageName: "example-git",
            aurCloneUrl: remote,
            actionPath,
          }),
        ).toMatchObject({ _tag: "Success" });

        expect(readFileSync(output, "utf8")).toBe(`changed=${expected}\n`);
        expect(git(["-C", clone, "log", "-1", "--format=%an <%ae>"])).toBe(
          expected === "true"
            ? "GitHub Actions <41898282+github-actions[bot]@users.noreply.github.com>"
            : "Test <test@example.invalid>",
        );
      } finally {
        delete process.env.RUNNER_TEMP;
        delete process.env.GITHUB_OUTPUT;
        rmSync(root, { recursive: true, force: true });
      }
    },
  );
});
