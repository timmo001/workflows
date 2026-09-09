import { it } from "@effect/vitest";
import { layer } from "@timmo001/effect-gh";
import { Deferred, Effect, Fiber, Layer, Sink, Stream } from "effect";
import { TestClock } from "effect/testing";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";
import { afterEach, expect, vi } from "vitest";
import { GitHubCommand } from "../src/action/GitHubCommand.js";

const fakeSpawner = Effect.fn("test.fakeSpawner")(function* (
  output: (index: number) => Partial<ChildProcessSpawner.ChildProcessHandle>,
) {
  const spawned = yield* Deferred.make<void>();
  const commands: ChildProcess.Command[] = [];
  let releases = 0;
  const spawn = Effect.fn("test.spawn")(function* (
    command: ChildProcess.Command,
  ) {
    const handle = ChildProcessSpawner.makeHandle({
      pid: ChildProcessSpawner.ProcessId(1),
      exitCode: Effect.succeed(ChildProcessSpawner.ExitCode(0)),
      isRunning: Effect.succeed(false),
      kill: () => Effect.void,
      stdin: Sink.drain,
      stdout: Stream.empty,
      stderr: Stream.empty,
      all: Stream.empty,
      getInputFd: () => Sink.drain,
      getOutputFd: () => Stream.empty,
      unref: Effect.succeed(Effect.void),
      ...output(commands.length),
    });
    return yield* Effect.acquireRelease(
      Effect.sync(() => {
        commands.push(command);
        return handle;
      }).pipe(Effect.tap(() => Deferred.succeed(spawned, undefined))),
      () =>
        Effect.sync(() => {
          releases++;
        }),
    );
  });
  return {
    spawned,
    commands,
    releases: () => releases,
    layer: Layer.succeed(
      ChildProcessSpawner.ChildProcessSpawner,
      ChildProcessSpawner.make(spawn),
    ),
  };
});

const text = (value: string) => Stream.succeed(new TextEncoder().encode(value));

afterEach(() => vi.restoreAllMocks());

it.effect(
  "retains the action's stderr tail across commands, streams output, and does not retry",
  () =>
    Effect.gen(function* () {
      const stdout = vi
        .spyOn(process.stdout, "write")
        .mockImplementation(() => true);
      const stderr = vi
        .spyOn(process.stderr, "write")
        .mockImplementation(() => true);
      const warning = `${"e".repeat(20_000)} last warning\n`;
      const fake = yield* fakeSpawner((index) =>
        index === 0
          ? { stdout: text("hidden"), stderr: text(warning) }
          : {
              stdout: text("upload output"),
              exitCode: Effect.succeed(ChildProcessSpawner.ExitCode(17)),
            },
      );
      const github = yield* GitHubCommand.make("publish GitHub release").pipe(
        Effect.provide(layer().pipe(Layer.provide(fake.layer))),
      );
      const args = ["release", "view", "literal $(touch nope)"];
      yield* github.stream(args, {
        suppressStdout: true,
        cwd: "/work",
        env: { GH_TOKEN: "fixture-token" },
      });
      const failure = yield* github
        .stream(["release", "upload", "tag", "asset with spaces"])
        .pipe(Effect.flip);
      expect(failure.title).toBe("Command failed");
      expect(failure.message).toBe(warning.slice(-16 * 1024).trim());
      expect(stdout.mock.calls).toEqual([["upload output"]]);
      expect(stderr.mock.calls).toEqual([[warning]]);
      expect(fake.releases()).toBe(2);
      expect(fake.commands).toHaveLength(2);
      expect(fake.commands[0]).toMatchObject({
        command: "gh",
        args,
        options: {
          cwd: "/work",
          extendEnv: true,
          shell: false,
          env: { GH_TOKEN: "fixture-token" },
        },
      });
    }),
);

it.effect("keeps the exit-code fallback when gh fails silently", () =>
  Effect.gen(function* () {
    const fake = yield* fakeSpawner(() => ({
      exitCode: Effect.succeed(ChildProcessSpawner.ExitCode(7)),
    }));
    const github = yield* GitHubCommand.make("publish GitHub release").pipe(
      Effect.provide(layer().pipe(Layer.provide(fake.layer))),
    );
    const failure = yield* github
      .stream(["release", "create", "tag"])
      .pipe(Effect.flip);
    expect(failure.message).toBe(
      "Command failed with exit code 7: publish GitHub release",
    );
    expect(fake.commands).toHaveLength(1);
    expect(fake.releases()).toBe(1);
  }),
);

it.effect("closes the SDK child scope on timeout without retrying", () =>
  Effect.gen(function* () {
    const fake = yield* fakeSpawner(() => ({
      stdout: Stream.never,
      exitCode: Effect.never,
    }));
    const github = yield* GitHubCommand.make("dispatch").pipe(
      Effect.provide(layer().pipe(Layer.provide(fake.layer))),
    );
    const fiber = yield* github
      .stream(["api", "endpoint"], { timeout: "5 seconds" })
      .pipe(Effect.flip, Effect.forkChild);
    yield* Deferred.await(fake.spawned);
    yield* TestClock.adjust("5 seconds");
    const failure = yield* Fiber.join(fiber);
    expect(failure.title).toBe("Command failed");
    expect(failure.message).toBe("Command timed out after 5000ms: dispatch");
    expect(fake.commands).toHaveLength(1);
    expect(fake.releases()).toBe(1);
  }),
);

it.effect(
  "interruption closes the SDK child scope without producing an action failure",
  () =>
    Effect.gen(function* () {
      const fake = yield* fakeSpawner(() => ({
        stdout: Stream.never,
        exitCode: Effect.never,
      }));
      const github = yield* GitHubCommand.make("publish GitHub release").pipe(
        Effect.provide(layer().pipe(Layer.provide(fake.layer))),
      );
      let failed = false;
      const fiber = yield* github
        .stream(["release", "upload", "tag", "asset"])
        .pipe(
          Effect.tapError(() =>
            Effect.sync(() => {
              failed = true;
            }),
          ),
          Effect.forkChild,
        );
      yield* Deferred.await(fake.spawned);
      yield* Fiber.interrupt(fiber);
      expect(failed).toBe(false);
      expect(fake.releases()).toBe(1);
      expect(fake.commands).toHaveLength(1);
    }),
);
