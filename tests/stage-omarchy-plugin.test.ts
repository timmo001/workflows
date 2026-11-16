import { join } from "node:path";
import { describe, expect, it } from "@effect/vitest";
import { Effect, FileSystem } from "effect";
import {
  parseLsFiles,
  pluginFiles,
  run,
} from "../src/actions/stage-omarchy-plugin/workflow.js";
import {
  git,
  initRepo,
  inDirectory,
  platformLayer,
  tempDirectory,
  withEnv,
} from "./support.js";

const manifest = JSON.stringify({
  entryPoints: { service: "Service.qml", barWidget: "BarWidget.qml" },
});

const files = (paths: string[], mode = "100644") =>
  paths.map((path) => ({ mode, path }));

describe("stage-omarchy-plugin file list", () => {
  it("parses git ls-files --stage -z", () => {
    expect(
      parseLsFiles(
        "100644 aaa 0\tplugin/a b.qml\x00120000 bbb 0\tplugin/link\x00",
      ),
    ).toEqual([
      { mode: "100644", path: "plugin/a b.qml" },
      { mode: "120000", path: "plugin/link" },
    ]);
  });

  it.effect("takes the flat tracked files, relative to the directory", () =>
    Effect.gen(function* () {
      expect(
        yield* pluginFiles(
          "./plugin/",
          files(["plugin/manifest.json", "plugin/BarWidget.qml"]),
        ),
      ).toEqual(["BarWidget.qml", "manifest.json"]);

      expect(
        yield* pluginFiles(".", files(["manifest.json", "Panel.qml"])),
      ).toEqual(["Panel.qml", "manifest.json"]);
    }),
  );

  it.effect("rejects subdirectories, links and a missing manifest", () =>
    Effect.gen(function* () {
      for (const [directory, tracked] of [
        ["plugin", files(["plugin/manifest.json", "plugin/icons/a.svg"])],
        [
          "plugin",
          [
            ...files(["plugin/manifest.json"]),
            ...files(["plugin/link.qml"], "120000"),
          ],
        ],
        ["plugin", files(["plugin/Panel.qml"])],
      ] as const) {
        const failure = yield* Effect.flip(pluginFiles(directory, tracked));

        expect(failure.title).toBe("Omarchy plugin");
      }
    }),
  );
});

describe("stage-omarchy-plugin run", () => {
  it.effect(
    "replaces the publish checkout with the tracked plugin files and licence",
    () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const root = yield* tempDirectory("stage-omarchy-plugin-");
        const output = join(root, "output");

        yield* initRepo(root);
        yield* fs.makeDirectory(join(root, "plugin"));
        yield* fs.writeFileString(join(root, "plugin/manifest.json"), manifest);
        yield* fs.writeFileString(join(root, "plugin/Service.qml"), "service");
        yield* fs.writeFileString(join(root, "plugin/BarWidget.qml"), "bar");
        yield* fs.writeFileString(join(root, "LICENSE"), "licence");
        yield* git(["add", "."], root);
        yield* fs.writeFileString(join(root, "plugin/untracked.qml"), "stray");

        yield* fs.makeDirectory(join(root, "publish/.git"), {
          recursive: true,
        });
        yield* fs.writeFileString(join(root, "publish/stale.qml"), "old");
        yield* fs.writeFileString(output, "");

        yield* inDirectory(root);
        yield* withEnv("GITHUB_OUTPUT", output);

        yield* run({
          "plugin-directory": "plugin",
          "publish-directory": "publish",
          license: "LICENSE",
        });

        expect(
          (yield* fs.readDirectory(join(root, "publish"))).toSorted(),
        ).toEqual([
          ".git",
          "BarWidget.qml",
          "LICENSE",
          "Service.qml",
          "manifest.json",
        ]);
        expect(yield* fs.readFileString(join(root, "publish/LICENSE"))).toBe(
          "licence",
        );
        expect(yield* fs.readFileString(output)).toContain(
          "BarWidget.qml\nLICENSE\nService.qml\nmanifest.json\n",
        );
      }).pipe(Effect.scoped, Effect.provide(platformLayer)),
  );

  it.effect("fails when an entry point isn't tracked", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const root = yield* tempDirectory("stage-omarchy-plugin-");

      yield* initRepo(root);
      yield* fs.makeDirectory(join(root, "plugin"));
      yield* fs.writeFileString(join(root, "plugin/manifest.json"), manifest);
      yield* fs.writeFileString(join(root, "plugin/Service.qml"), "service");
      yield* fs.writeFileString(join(root, "LICENSE"), "licence");
      yield* git(["add", "."], root);
      yield* fs.makeDirectory(join(root, "publish/.git"), { recursive: true });

      yield* inDirectory(root);

      const failure = yield* Effect.flip(
        run({
          "plugin-directory": "plugin",
          "publish-directory": "publish",
          license: "LICENSE",
        }),
      );

      expect(failure.message).toBe(
        "The barWidget entry point BarWidget.qml isn't a file git tracks in plugin",
      );
    }).pipe(Effect.scoped, Effect.provide(platformLayer)),
  );
});
