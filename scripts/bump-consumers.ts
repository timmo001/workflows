#!/usr/bin/env bun
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import {
  Api,
  Release,
  Repository,
  Search,
  layer as ghLayer,
  type Gh,
  type GhError,
} from "@timmo001/effect-gh";
import {
  Clock,
  Config,
  Console,
  Effect,
  FileSystem,
  Layer,
  Match,
  Option,
  Path,
  Schema,
  type PlatformError,
} from "effect";
import { Command, Flag } from "effect/cli";
import { TerminalStyle } from "../src/cli/TerminalStyle.js";
import { CommandExecutor } from "../src/services/CommandExecutor.js";

const source = "timmo001/workflows";

const pin =
  /(timmo001\/workflows\/\.github\/(?:workflows|actions)\/[^@\s]+)@[0-9a-f]{40}(?: *#[^\n]*)?/g;

type Outcome = "updated" | "current" | "skipped" | "failed";

interface Report {
  readonly outcome: Outcome;
  readonly lines: readonly string[];
}

interface ChangedFile {
  readonly path: string;
  readonly pins: number;
}

const { plural } = TerminalStyle;

const Commit = Schema.Struct({ sha: Schema.String });

const RepositoryInfo = Schema.Struct({
  archived: Schema.Boolean,
  fork: Schema.Boolean,
  default_branch: Schema.String,
});

const cacheRoot = Config.String("XDG_CACHE_HOME").pipe(
  Config.orElse(() =>
    Config.String("HOME").pipe(Config.map((home) => `${home}/.cache`)),
  ),
);

const describeError = (
  error: GhError | CommandExecutor.CommandError | PlatformError.PlatformError,
) =>
  Match.value(error).pipe(
    Match.tag("CommandError", (error) => error.stderr || error.command),
    Match.tag("GhCommandError", (error) => error.stderr || error.stdout),
    Match.orElse(String),
  );

const resolveRelease = Effect.fn("resolveRelease")(function* (
  to: Option.Option<string>,
) {
  const tag = Option.isSome(to)
    ? to.value
    : (yield* Release.view({ repo: source, fields: ["tagName"] })).tagName;

  const commit = yield* Api.json(
    { endpoint: `repos/${source}/commits/${tag}`, method: "GET" },
    Commit,
  );

  return { tag, sha: commit.sha };
});

const discover = Effect.fn("discover")(function* (owner: string) {
  const results = yield* Search.code({
    query: `${source}/.github/`,
    owner,
    limit: 1000,
  });

  const repos = new Set(
    results.map((result) => result.repository.nameWithOwner),
  );

  repos.delete(source);

  return [...repos].toSorted();
});

const prepareClone = Effect.fn("prepareClone")(function* (
  directory: string,
  repo: string,
  branch: string,
) {
  const fs = yield* FileSystem.FileSystem;
  const executor = yield* CommandExecutor.Service;

  if (!(yield* fs.exists(directory))) {
    yield* Repository.clone({
      repository: repo,
      directory,
      gitArgs: ["--quiet", "--filter=blob:none"],
    });

    return;
  }

  const git = (...args: string[]) =>
    executor.run("git", ["-C", directory, ...args]);

  yield* git("fetch", "--quiet", "origin", branch);
  yield* git(
    "checkout",
    "--quiet",
    "--force",
    "-B",
    branch,
    `origin/${branch}`,
  );
  yield* git("clean", "--quiet", "-fdx");
});

const bumpFiles = Effect.fn("bumpFiles")(function* (
  directory: string,
  replacement: string,
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const github = path.join(directory, ".github");

  if (!(yield* fs.exists(github))) return [];

  const files = yield* fs.readDirectory(github, { recursive: true });
  const changed: ChangedFile[] = [];

  for (const file of files.toSorted()) {
    if (!/\.ya?ml$/.test(file)) continue;

    const target = path.join(github, file);
    const current = yield* fs.readFileString(target);
    const next = current.replace(pin, replacement);

    if (next === current) continue;

    yield* fs.writeFileString(target, next);
    changed.push({
      path: path.join(".github", file),
      pins: current.match(pin)?.length ?? 0,
    });
  }

  return changed;
});

const bumpRepository = Effect.fn("bumpRepository")(
  function* (
    repo: string,
    options: {
      readonly cacheDirectory: string;
      readonly tag: string;
      readonly replacement: string;
      readonly push: boolean;
      readonly style: TerminalStyle.Style;
    },
  ): Effect.fn.Return<
    Report,
    GhError | CommandExecutor.CommandError | PlatformError.PlatformError,
    Gh | CommandExecutor.Service | FileSystem.FileSystem | Path.Path
  > {
    const { style } = options;
    const path = yield* Path.Path;
    const executor = yield* CommandExecutor.Service;

    const info = yield* Api.json(
      { endpoint: `repos/${repo}`, method: "GET" },
      RepositoryInfo,
    );

    if (info.archived || info.fork) {
      return {
        outcome: "skipped",
        lines: [
          TerminalStyle.skip(
            style,
            `${repo}  skipped, ${info.archived ? "archived" : "fork"}`,
          ),
        ],
      };
    }

    const directory = path.join(options.cacheDirectory, repo);

    yield* prepareClone(directory, repo, info.default_branch);

    const changed = yield* bumpFiles(directory, options.replacement);

    if (changed.length === 0) {
      return {
        outcome: "current",
        lines: [
          TerminalStyle.skip(style, `${repo}  already on ${options.tag}`),
        ],
      };
    }

    let action: string;

    if (options.push) {
      yield* executor.run(
        "dot",
        [
          "git",
          "commit",
          "-m",
          `Update ${source} to ${options.tag}`,
          ...changed.flatMap((file) => ["--path", file.path]),
          "--push",
        ],
        { cwd: directory },
      );

      const commit = yield* executor.run("git", [
        "-C",
        directory,
        "rev-parse",
        "--short",
        "HEAD",
      ]);

      action = `${style.success("pushed")} ${style.warn(commit.trim())}`;
    } else {
      yield* executor.run("git", [
        "-C",
        directory,
        "checkout",
        "--quiet",
        "--",
        ".",
      ]);

      action = style.warn("would update");
    }

    const pins = changed.reduce((sum, file) => sum + file.pins, 0);
    const width = Math.max(...changed.map((file) => file.path.length));

    const stats = [
      action,
      plural(changed.length, "file"),
      plural(pins, "pin"),
    ].join(style.dim(" · "));

    return {
      outcome: "updated",
      lines: [
        "",
        `  ${style.label(style.accent(repo))}  ${stats}`,
        ...changed.map(
          (file) =>
            `      ${style.warn("M")}  ${file.path.padEnd(width)}  ${style.dim(plural(file.pins, "pin"))}`,
        ),
      ],
    };
  },
  (effect, repo, { style }) =>
    effect.pipe(
      Effect.catch((error) => {
        const [first = "", ...rest] = describeError(error).trim().split("\n");

        return Effect.succeed<Report>({
          outcome: "failed",
          lines: [
            "",
            TerminalStyle.failure(style, `${style.label(repo)}  ${first}`),
            ...rest.map((line) => `      ${style.dim(line)}`),
          ],
        });
      }),
    ),
);

const bumpConsumers = Command.make(
  "bump-consumers",
  {
    to: Flag.String("to").pipe(
      Flag.withDescription("Release tag to pin, defaults to the latest"),
      Flag.optional,
    ),
    owner: Flag.String("owner").pipe(
      Flag.withDescription("Owner whose repositories are searched"),
      Flag.withDefault("timmo001"),
    ),
    repo: Flag.String("repo").pipe(
      Flag.withDescription("Only bump this repository, repeatable"),
      Flag.atLeast(0),
    ),
    push: Flag.Boolean("push").pipe(
      Flag.withDescription("Commit and push through dot git commit"),
      Flag.withDefault(false),
    ),
    concurrency: Flag.Int("concurrency").pipe(
      Flag.withDescription("Repositories to process at once"),
      Flag.withDefault(8),
    ),
  },
  Effect.fn("bumpConsumers")(function* ({
    to,
    owner,
    repo,
    push,
    concurrency,
  }) {
    const path = yield* Path.Path;
    const startedAt = yield* Clock.currentTimeMillis;
    const style = yield* TerminalStyle.resolve;

    const { tag, sha } = yield* resolveRelease(to);
    const repos = repo.length > 0 ? repo : yield* discover(owner);

    const cacheDirectory = path.join(
      yield* cacheRoot,
      "workflows-bump-consumers",
    );

    yield* Console.log(
      TerminalStyle.section(style, `Bump ${source} to ${tag}`, sha.slice(0, 7)),
    );

    yield* Console.log(
      TerminalStyle.info(
        style.dim(
          [
            push ? "Pushing" : "Dry run",
            plural(repos.length, "repository", "repositories"),
            push ? "commits to each default branch" : "pass --push to commit",
          ].join(" · "),
        ),
      ),
    );

    const outcomes = yield* Effect.forEach(
      repos,
      (name) =>
        bumpRepository(name, {
          cacheDirectory,
          tag,
          replacement: `$1@${sha} # ${tag}`,
          push,
          style,
        }).pipe(
          Effect.tap((report) => Console.log(report.lines.join("\n"))),
          Effect.map((report) => report.outcome),
        ),
      { concurrency: Math.max(1, concurrency) },
    );

    const count = (outcome: Outcome) =>
      outcomes.filter((item) => item === outcome).length;

    const summary = [
      count("updated") > 0 &&
        TerminalStyle.success(
          style,
          `${push ? "Pushed" : "Would update"} ${plural(count("updated"), "repository", "repositories")}`,
        ),
      count("current") > 0 &&
        TerminalStyle.skip(style, `${count("current")} already on ${tag}`),
      count("skipped") > 0 &&
        TerminalStyle.skip(style, `${count("skipped")} skipped`),
      count("failed") > 0 &&
        TerminalStyle.error(style, `${count("failed")} failed`),
    ].filter((line) => line !== false);

    yield* Console.log(TerminalStyle.section(style, "Summary"));
    yield* Console.log(summary.join("\n"));
    yield* Console.log(yield* TerminalStyle.completedIn(style, startedAt));

    if (count("failed") > 0) {
      yield* Effect.sync(() => {
        process.exitCode = 1;
      });
    }
  }),
).pipe(
  Command.withDescription(
    `Bump ${source} pins in consuming repositories to a release`,
  ),
);

bumpConsumers.pipe(
  Command.run({ version: "0.0.0" }),
  Effect.provide(
    Layer.mergeAll(CommandExecutor.layer, ghLayer()).pipe(
      Layer.provideMerge(NodeServices.layer),
    ),
  ),
  NodeRuntime.runMain,
);
