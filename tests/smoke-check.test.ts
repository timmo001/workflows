import { describe, expect, it } from "@effect/vitest";
import { Effect, Exit, Fiber, Layer } from "effect";
import { HttpClient, HttpClientResponse } from "effect/http";
import { TestClock } from "effect/testing";
import { parseChecks, run } from "../src/actions/smoke-check/workflow.js";

const fakeClient = (statuses: number[]) => {
  const requests: string[] = [];

  const client = HttpClient.make((request) =>
    Effect.sync(() => {
      requests.push(request.url);

      return HttpClientResponse.fromWeb(
        request,
        new Response(null, { status: statuses.shift() ?? 500 }),
      );
    }),
  );

  return { requests, layer: Layer.succeed(HttpClient.HttpClient, client) };
};

describe("smoke-check parsing", () => {
  it.effect("reads url and status pairs, skipping blanks and comments", () =>
    Effect.gen(function* () {
      const checks = yield* parseChecks(
        "\n# docs\nhttps://example.com 200\n  http://example.com/old   301  \n",
      );

      expect(checks).toEqual([
        { url: "https://example.com", status: 200 },
        { url: "http://example.com/old", status: 301 },
      ]);
    }),
  );

  it.effect("rejects missing statuses, extra fields and other schemes", () =>
    Effect.gen(function* () {
      for (const text of [
        "https://example.com",
        "https://example.com 200 extra",
        "https://example.com 99",
        "ftp://example.com 200",
        "# only a comment",
      ]) {
        expect(Exit.isFailure(yield* Effect.exit(parseChecks(text)))).toBe(
          true,
        );
      }
    }),
  );
});

describe("smoke-check run", () => {
  it.effect("retries a check until it returns its status", () =>
    Effect.gen(function* () {
      const fake = fakeClient([500, 404, 200, 301]);

      const fiber = yield* run({
        checks: "https://example.com 200\nhttps://example.com/old 301",
        "timeout-seconds": 120,
        "interval-seconds": 5,
      }).pipe(Effect.provide(fake.layer), Effect.forkChild);

      yield* TestClock.adjust("10 seconds");
      yield* Fiber.join(fiber);

      expect(fake.requests).toEqual([
        "https://example.com",
        "https://example.com",
        "https://example.com",
        "https://example.com/old",
      ]);
    }),
  );

  it.effect("fails once the shared time limit runs out", () =>
    Effect.gen(function* () {
      const fake = fakeClient([]);

      const fiber = yield* run({
        checks: "https://example.com 200",
        "timeout-seconds": 10,
        "interval-seconds": 5,
      }).pipe(Effect.provide(fake.layer), Effect.flip, Effect.forkChild);

      yield* TestClock.adjust("30 seconds");
      const failure = yield* Fiber.join(fiber);

      expect(failure.message).toBe(
        "https://example.com returned 500, expected 200",
      );
      // At 0, 5 and 10 seconds; a fourth at 15 would pass the limit
      expect(fake.requests).toHaveLength(3);
    }),
  );
});
