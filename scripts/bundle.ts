#!/usr/bin/env bun
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Clock, Console, Effect, FileSystem, Layer, Path } from "effect";
import { Command, Flag } from "effect/cli";
import { TerminalStyle } from "../src/cli/TerminalStyle.js";
import { CommandExecutor } from "../src/services/CommandExecutor.js";

const actions = [
  "foundation-smoke",
  "build-arch-package",
  "publish-aur",
  "release-bun-cli",
  "prepare-arch-bin",
  "build-python-pypi-release",
  "validate-js-package",
  "validate-agent-skills",
  "validate-json",
  "arch-source-deployment",
] as const;

type Outcome = "written" | "current" | "stale";

const bundleAction = Effect.fn("bundleAction")(function* (
  name: string,
  check: boolean,
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const executor = yield* CommandExecutor.Service;
  const outfile = path.join(".github", "actions", name, "dist", "index.js");
  const temporary = `${outfile}.tmp`;

  yield* fs.makeDirectory(path.dirname(outfile), { recursive: true });

  // The Git-pinned SDK exposes TypeScript through its bun export; output stays Node ESM.
  yield* executor.run("bun", [
    "build",
    path.join("src", "actions", name, "main.ts"),
    "--target=node",
    "--conditions=bun",
    "--format=esm",
    `--outfile=${temporary}`,
  ]);

  const next = yield* fs.readFileString(temporary);

  yield* fs.remove(temporary);

  if (!check) {
    yield* fs.writeFileString(outfile, next);

    return "written" satisfies Outcome;
  }

  const current = yield* fs
    .readFileString(outfile)
    .pipe(Effect.orElseSucceed(() => undefined));

  return current === next
    ? ("current" satisfies Outcome)
    : ("stale" satisfies Outcome);
});

const bundle = Command.make(
  "bundle",
  {
    check: Flag.Boolean("check").pipe(
      Flag.withDescription("Fail when a committed bundle is out of date"),
      Flag.withDefault(false),
    ),
  },
  Effect.fn("bundle")(function* ({ check }) {
    const startedAt = yield* Clock.currentTimeMillis;
    const style = yield* TerminalStyle.resolve;
    const width = Math.max(...actions.map((name) => name.length));

    yield* Console.log(
      TerminalStyle.section(
        style,
        check ? "Check action bundles" : "Bundle actions",
        TerminalStyle.plural(actions.length, "action"),
      ),
    );

    const outcomes = yield* Effect.forEach(
      actions,
      (name) => bundleAction(name, check),
      { concurrency: 4 },
    );

    for (const [index, name] of actions.entries()) {
      const label = style.accent(name.padEnd(width));

      yield* Console.log(
        outcomes[index] === "stale"
          ? TerminalStyle.failure(style, `${label}  out of date`)
          : TerminalStyle.success(
              style,
              `${label}  ${style.dim(outcomes[index] === "written" ? "written" : "up to date")}`,
            ),
      );
    }

    const stale = outcomes.filter((outcome) => outcome === "stale").length;
    const fresh = outcomes.length - stale;

    const summary = [
      fresh > 0 &&
        TerminalStyle.success(
          style,
          check
            ? `${TerminalStyle.plural(fresh, "bundle")} up to date`
            : `Wrote ${TerminalStyle.plural(fresh, "bundle")}`,
        ),
      stale > 0 &&
        TerminalStyle.error(
          style,
          `${TerminalStyle.plural(stale, "bundle")} out of date, run ${style.success("mise run bundle")}`,
        ),
    ].filter((line) => line !== false);

    yield* Console.log(TerminalStyle.section(style, "Summary"));
    yield* Console.log(summary.join("\n"));
    yield* Console.log(yield* TerminalStyle.completedIn(style, startedAt));

    if (stale > 0) {
      yield* Effect.sync(() => {
        process.exitCode = 1;
      });
    }
  }),
).pipe(Command.withDescription("Build the committed action bundles"));

bundle.pipe(
  Command.run({ version: "0.0.0" }),
  Effect.provide(
    CommandExecutor.layer.pipe(Layer.provideMerge(NodeServices.layer)),
  ),
  NodeRuntime.runMain,
);
