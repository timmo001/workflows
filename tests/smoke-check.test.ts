import { describe, expect, it } from "@effect/vitest";
import { Effect, Exit, Fiber, Layer } from "effect";
import { HttpClient, HttpClientResponse } from "effect/http";
import { TestClock } from "effect/testing";
import {
  lookupThrough,
  resolveAddresses,
  type Resolve,
} from "../src/actions/smoke-check/PublicLookup.js";
import { parseChecks, run } from "../src/actions/smoke-check/workflow.js";

const dnsError = (code: string) =>
  Object.assign(new Error(`query ${code}`), { code });

const fakeResolver = (
  v4: string[] | string,
  v6: string[] | string,
): Resolve & { readonly asked: string[] } => {
  const asked: string[] = [];

  const answer = (family: string, value: string[] | string) => () => {
    asked.push(family);

    return Array.isArray(value)
      ? Promise.resolve(value)
      : Promise.reject(dnsError(value));
  };

  return { asked, resolve4: answer("A", v4), resolve6: answer("AAAA", v6) };
};

describe("smoke-check public lookup", () => {
  it("returns IPv4 addresses before IPv6", async () => {
    expect(
      await resolveAddresses(
        fakeResolver(["192.0.2.1"], ["2001:db8::1"]),
        "example.com",
        0,
      ),
    ).toEqual([
      { address: "192.0.2.1", family: 4 },
      { address: "2001:db8::1", family: 6 },
    ]);
  });

  it("asks only for the family net.connect wants", async () => {
    const resolver = fakeResolver(["192.0.2.1"], ["2001:db8::1"]);

    await resolveAddresses(resolver, "example.com", 4);

    expect(resolver.asked).toEqual(["A"]);
  });

  it("treats NXDOMAIN as no address yet, and unreachable resolvers apart", async () => {
    expect(
      await resolveAddresses(
        fakeResolver("ENOTFOUND", "ENODATA"),
        "new.example.com",
        0,
      ),
    ).toEqual([]);

    expect(
      await resolveAddresses(
        fakeResolver("ETIMEOUT", "ECONNREFUSED"),
        "example.com",
        0,
      ),
    ).toBe("unreachable");
  });

  it("fails the connection with ENOTFOUND while the name has no address", async () => {
    const lookup = lookupThrough(() => fakeResolver("ENOTFOUND", "ENODATA"));

    const code = await new Promise((resolve) =>
      lookup("new.example.com", { all: true }, (error) => resolve(error?.code)),
    );

    expect(code).toBe("ENOTFOUND");
  });

  it("answers in the shape net.connect asked for", async () => {
    const lookup = lookupThrough(() => fakeResolver(["192.0.2.1"], []));

    const single = await new Promise((resolve) =>
      lookup("example.com", {}, (_error, address, family) =>
        resolve([address, family]),
      ),
    );

    const all = await new Promise((resolve) =>
      lookup("example.com", { all: true }, (_error, addresses) =>
        resolve(addresses),
      ),
    );

    expect(single).toEqual(["192.0.2.1", 4]);
    expect(all).toEqual([{ address: "192.0.2.1", family: 4 }]);
  });
});

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
