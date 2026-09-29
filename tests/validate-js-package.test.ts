import { join } from "node:path";
import { NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { Cause, Effect, Exit, FileSystem, Layer, Schema } from "effect";
import { Annotations } from "../src/action/Annotations.js";
import {
  compareJsrVersions,
  compareReleaseTag,
  type Inputs,
  jsrDryRunArgs,
  npmPackDryRunArgs,
  run,
  trustedBashArgs,
  VersionManifestFromJson,
} from "../src/actions/validate-js-package/workflow.js";
import { CommandExecutor } from "../src/services/CommandExecutor.js";
import { tempDirectory } from "./support.js";

const commandLayer = CommandExecutor.layer.pipe(
  Layer.provide(NodeServices.layer),
);

type RecordedCommand = {
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string | undefined;
  readonly label: string | undefined;
};

const recordingLayer = (recorded: Array<RecordedCommand>) =>
  Layer.succeed(
    CommandExecutor.Service,
    CommandExecutor.Service.of({
      capture: () => Effect.die("capture is unused"),
      run: () => Effect.die("run is unused"),
      exitCode: () => Effect.die("exitCode is unused"),
      stream: (command, args, options) =>
        Effect.sync(() => {
          recorded.push({
            command,
            args: [...args],
            cwd: options?.cwd,
            label: options?.label,
          });
        }),
    }),
  );

const runWith = (inputs: Inputs, layer: Layer.Layer<CommandExecutor.Service>) =>
  Effect.exit(Effect.scoped(run(inputs))).pipe(
    Effect.provide(layer),
    Effect.provide(NodeServices.layer),
  );

const runRecorded = (inputs: Inputs) => {
  const recorded: Array<RecordedCommand> = [];

  return {
    recorded,
    exit: runWith(inputs, recordingLayer(recorded)),
  };
};

const runReal = (inputs: Inputs) => runWith(inputs, commandLayer);

const failureMessage = (
  exit: Exit.Exit<unknown, Annotations.ActionFailure>,
) => {
  if (!Exit.isFailure(exit)) return undefined;
  const error = Cause.squash(exit.cause);

  return error instanceof Annotations.ActionFailure ? error.message : undefined;
};

const writeManifest = (root: string, filename: string, version: string) =>
  FileSystem.FileSystem.pipe(
    Effect.flatMap((fs) =>
      fs.writeFileString(
        join(root, filename),
        `${JSON.stringify({ name: "@scope/pkg", version }, null, 2)}\n`,
      ),
    ),
  );

describe("validate-js-package version comparison", () => {
  it("accepts an exact release tag match", () => {
    expect(compareReleaseTag("1.2.3", "1.2.3")).toBeUndefined();
  });

  it("rejects a tag that differs by a v prefix", () => {
    expect(compareReleaseTag("v1.2.3", "1.2.3")?.message).toBe(
      "Release tag v1.2.3 does not match package version 1.2.3",
    );
  });

  it("accepts matching package.json and jsr.json versions", () => {
    expect(compareJsrVersions("1.2.3", "1.2.3")).toBeUndefined();
  });

  it("rejects mismatched package.json and jsr.json versions", () => {
    expect(compareJsrVersions("1.2.3", "1.2.4")?.message).toBe(
      "package.json and jsr.json versions differ",
    );
  });

  it("decodes a version from JSON with extra package fields", () => {
    const decoded = Schema.decodeUnknownSync(VersionManifestFromJson)(
      '{"name":"@scope/pkg","version":"1.2.3","scripts":{"build":"bun run build"}}',
    );

    expect(decoded).toEqual({ version: "1.2.3" });
  });
});

describe("validate-js-package command contract", () => {
  it("keeps trusted Bash flags", () => {
    expect(trustedBashArgs("bun run check")).toEqual([
      "-euo",
      "pipefail",
      "-c",
      "bun run check",
    ]);
  });

  it("keeps npm and JSR dry-run argv", () => {
    expect(npmPackDryRunArgs).toEqual(["pack", "--dry-run"]);
    expect(jsrDryRunArgs("0.14.3")).toEqual([
      "jsr@0.14.3",
      "publish",
      "--dry-run",
    ]);
  });
});

describe("validate-js-package workflow YAML", () => {
  it.effect("keeps npm trusted publishing in the reusable workflow", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;

      const workflow = yield* fs.readFileString(
        ".github/workflows/publish-npm-package.yml",
      );

      expect(workflow).toContain("id-token: write");
      expect(workflow).toContain("run: npm publish --access public");
      expect(workflow).toContain("uses: $/.github/actions/validate-js-package");
    }).pipe(Effect.provide(NodeServices.layer)),
  );

  it.effect("keeps JSR trusted publishing in the reusable workflow", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;

      const workflow = yield* fs.readFileString(
        ".github/workflows/publish-jsr-package.yml",
      );

      expect(workflow).toContain("id-token: write");
      expect(workflow).toContain('run: bunx "jsr@$JSR_CLI_VERSION" publish');
      expect(workflow).not.toContain("publish --dry-run");
      expect(workflow).toContain("uses: $/.github/actions/validate-js-package");
    }).pipe(Effect.provide(NodeServices.layer)),
  );

  it.effect("validates the build contract without publishing", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;

      const workflow = yield* fs.readFileString(
        ".github/workflows/build-bun-package.yml",
      );

      expect(workflow).toContain("contract: build");
      expect(workflow).not.toContain("npm publish");
      expect(workflow).not.toContain("id-token: write");
    }).pipe(Effect.provide(NodeServices.layer)),
  );
});

describe("validate-js-package contracts", () => {
  it.effect("runs the build check, build, and dry-run sequence", () =>
    Effect.gen(function* () {
      const root = yield* tempDirectory("js-package-build-");

      const { recorded, exit } = runRecorded({
        contract: "build",
        packagePath: root,
        checkCommand: "bun run check",
        buildCommand: "bun run build",
        jsrCliVersion: "0.14.3",
      });

      expect((yield* exit)._tag).toBe("Success");
      expect(recorded).toEqual([
        {
          command: "bash",
          args: ["-euo", "pipefail", "-c", "bun run check"],
          cwd: root,
          label: "check package",
        },
        {
          command: "bash",
          args: ["-euo", "pipefail", "-c", "bun run build"],
          cwd: root,
          label: "build package",
        },
        {
          command: "npm",
          args: ["pack", "--dry-run"],
          cwd: root,
          label: "npm pack --dry-run",
        },
        {
          command: "bunx",
          args: ["jsr@0.14.3", "publish", "--dry-run"],
          cwd: root,
          label: "jsr publish --dry-run",
        },
      ]);
    }).pipe(Effect.provide(NodeServices.layer)),
  );

  it.effect(
    "compares the npm release tag before running trusted commands",
    () =>
      Effect.gen(function* () {
        const root = yield* tempDirectory("js-package-npm-");

        yield* writeManifest(root, "package.json", "1.2.3");

        const { recorded, exit } = runRecorded({
          contract: "npm",
          packagePath: root,
          checkCommand: "bun run check",
          buildCommand: "bun run build",
          releaseTag: "9.9.9",
        });

        const result = yield* exit;
        expect(failureMessage(result)).toBe(
          "Release tag 9.9.9 does not match package version 1.2.3",
        );
        expect(recorded).toEqual([]);
      }).pipe(Effect.provide(NodeServices.layer)),
  );

  it.effect(
    "runs the npm check, build, and pack sequence after a tag match",
    () =>
      Effect.gen(function* () {
        const root = yield* tempDirectory("js-package-npm-");

        yield* writeManifest(root, "package.json", "1.2.3");

        const { recorded, exit } = runRecorded({
          contract: "npm",
          packagePath: root,
          checkCommand: "bun run check",
          buildCommand: "bun run build",
          releaseTag: "1.2.3",
        });

        expect((yield* exit)._tag).toBe("Success");
        expect(recorded.map((command) => command.command)).toEqual([
          "bash",
          "bash",
          "npm",
        ]);
        expect(recorded[2]).toEqual({
          command: "npm",
          args: ["pack", "--dry-run"],
          cwd: root,
          label: "npm pack --dry-run",
        });
      }).pipe(Effect.provide(NodeServices.layer)),
  );

  it.effect("compares jsr.json before the release tag", () =>
    Effect.gen(function* () {
      const root = yield* tempDirectory("js-package-jsr-");

      yield* writeManifest(root, "package.json", "1.2.3");
      yield* writeManifest(root, "jsr.json", "1.2.4");

      const { recorded, exit } = runRecorded({
        contract: "jsr",
        packagePath: root,
        checkCommand: "bun run check",
        releaseTag: "1.2.3",
      });

      const result = yield* exit;
      expect(failureMessage(result)).toBe(
        "package.json and jsr.json versions differ",
      );
      expect(recorded).toEqual([]);
    }).pipe(Effect.provide(NodeServices.layer)),
  );

  it.effect("rejects a JSR tag mismatch after the manifests agree", () =>
    Effect.gen(function* () {
      const root = yield* tempDirectory("js-package-jsr-");

      yield* writeManifest(root, "package.json", "1.2.3");
      yield* writeManifest(root, "jsr.json", "1.2.3");

      const { recorded, exit } = runRecorded({
        contract: "jsr",
        packagePath: root,
        checkCommand: "bun run check",
        releaseTag: "9.9.9",
      });

      const result = yield* exit;
      expect(failureMessage(result)).toBe(
        "Release tag 9.9.9 does not match package version 1.2.3",
      );
      expect(recorded).toEqual([]);
    }).pipe(Effect.provide(NodeServices.layer)),
  );

  it.effect("runs only the JSR check command after versions match", () =>
    Effect.gen(function* () {
      const root = yield* tempDirectory("js-package-jsr-");

      yield* writeManifest(root, "package.json", "1.2.3");
      yield* writeManifest(root, "jsr.json", "1.2.3");

      const { recorded, exit } = runRecorded({
        contract: "jsr",
        packagePath: root,
        checkCommand: "bun run check",
        releaseTag: "1.2.3",
      });

      expect((yield* exit)._tag).toBe("Success");
      expect(recorded).toEqual([
        {
          command: "bash",
          args: ["-euo", "pipefail", "-c", "bun run check"],
          cwd: root,
          label: "check package",
        },
      ]);
    }).pipe(Effect.provide(NodeServices.layer)),
  );

  it.effect("fails when package.json is missing a string version", () =>
    Effect.gen(function* () {
      const root = yield* tempDirectory("js-package-invalid-");

      const fs = yield* FileSystem.FileSystem;
      yield* fs.writeFileString(
        join(root, "package.json"),
        '{"name":"@scope/pkg"}\n',
      );

      const { recorded, exit } = runRecorded({
        contract: "npm",
        packagePath: root,
        checkCommand: "true",
        buildCommand: "true",
        releaseTag: "1.0.0",
      });

      const result = yield* exit;
      expect(failureMessage(result)).toContain("Invalid package.json");
      expect(recorded).toEqual([]);
    }).pipe(Effect.provide(NodeServices.layer)),
  );
});

describe("validate-js-package trusted Bash", () => {
  it.effect("fails a pipeline when pipefail is required", () =>
    Effect.gen(function* () {
      const root = yield* tempDirectory("js-package-pipefail-");

      yield* writeManifest(root, "package.json", "1.0.0");
      yield* writeManifest(root, "jsr.json", "1.0.0");

      const exit = yield* runReal({
        contract: "jsr",
        packagePath: root,
        checkCommand: "false | true",
        releaseTag: "1.0.0",
      });

      expect(exit._tag).toBe("Failure");
    }).pipe(Effect.provide(NodeServices.layer)),
  );

  it.effect("runs the check command in the package path", () =>
    Effect.gen(function* () {
      const root = yield* tempDirectory("js-package-cwd-");

      const nested = join(root, "pkg");
      const fs = yield* FileSystem.FileSystem;
      yield* fs.makeDirectory(nested);
      yield* writeManifest(nested, "package.json", "1.0.0");
      yield* writeManifest(nested, "jsr.json", "1.0.0");

      const exit = yield* runReal({
        contract: "jsr",
        packagePath: nested,
        checkCommand: "printf ok > checked",
        releaseTag: "1.0.0",
      });

      expect(exit._tag).toBe("Success");
      expect(yield* fs.exists(join(root, "checked"))).toBe(false);
      expect(yield* fs.readFileString(join(nested, "checked"))).toBe("ok");
    }).pipe(Effect.provide(NodeServices.layer)),
  );
});
