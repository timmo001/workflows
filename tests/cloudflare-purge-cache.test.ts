import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Schema } from "effect";
import { HttpBody, HttpClient, HttpClientResponse } from "effect/http";
import { run } from "../src/actions/cloudflare-purge-cache/workflow.js";

const PurgeBody = Schema.fromJsonString(
  Schema.Struct({ files: Schema.Array(Schema.String) }),
);

const fakeCloudflare = (answer: () => Response) => {
  const batches: (readonly string[])[] = [];
  const headers: (string | undefined)[] = [];

  const client = HttpClient.make((request) =>
    Effect.gen(function* () {
      if (request.body instanceof HttpBody.Uint8Array) {
        const body = yield* Schema.decodeUnknownEffect(PurgeBody)(
          new TextDecoder().decode(request.body.body),
        ).pipe(Effect.orDie);

        batches.push(body.files);
      }

      headers.push(request.headers["authorization"]);

      return HttpClientResponse.fromWeb(request, answer());
    }),
  );

  return {
    batches,
    headers,
    layer: Layer.succeed(HttpClient.HttpClient, client),
  };
};

const inputs = (files: string) => ({
  "zone-id": "0123456789abcdef0123456789abcdef",
  "api-token": "token",
  files,
});

describe("cloudflare-purge-cache", () => {
  it.effect("purges in batches of 30 with the token", () =>
    Effect.gen(function* () {
      const fake = fakeCloudflare(() =>
        Response.json({ success: true, errors: [] }),
      );

      const urls = Array.from(
        { length: 31 },
        (_, index) => `https://packages.example.com/${index}`,
      );

      yield* run(inputs(`# mutable files\n${urls.join("\n")}\n`)).pipe(
        Effect.provide(fake.layer),
      );

      expect(fake.batches).toEqual([urls.slice(0, 30), urls.slice(30)]);
      expect(fake.headers).toEqual(["Bearer token", "Bearer token"]);
    }),
  );

  it.effect("fails with Cloudflare's errors when the purge is refused", () =>
    Effect.gen(function* () {
      const fake = fakeCloudflare(() =>
        Response.json(
          {
            success: false,
            errors: [{ code: 10000, message: "Authentication error" }],
          },
          { status: 403 },
        ),
      );

      const failure = yield* run(inputs("https://example.com/a")).pipe(
        Effect.provide(fake.layer),
        Effect.flip,
      );

      expect(failure.message).toBe("10000: Authentication error");
    }),
  );

  it.effect("fails when the answer isn't Cloudflare's JSON", () =>
    Effect.gen(function* () {
      const fake = fakeCloudflare(
        () => new Response("<html>bad gateway</html>", { status: 502 }),
      );

      const failure = yield* run(inputs("https://example.com/a")).pipe(
        Effect.provide(fake.layer),
        Effect.flip,
      );

      expect(failure.message).toMatch(/^Cloudflare's purge API didn't answer/);
    }),
  );

  it.effect("rejects lines that aren't URLs before calling Cloudflare", () =>
    Effect.gen(function* () {
      const fake = fakeCloudflare(() =>
        Response.json({ success: true, errors: [] }),
      );

      const failure = yield* run(inputs("packages.example.com/a")).pipe(
        Effect.provide(fake.layer),
        Effect.flip,
      );

      expect(failure.message).toBe(
        'Expected an http(s) URL, got "packages.example.com/a"',
      );
      expect(fake.batches).toEqual([]);
    }),
  );
});
