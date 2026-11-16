import { Effect, Schema } from "effect";
import { HttpClient, HttpClientRequest, HttpClientResponse } from "effect/http";
import { Annotations } from "../../action/Annotations.js";

export const Inputs = Schema.Struct({
  "zone-id": Schema.String.check(Schema.isPattern(/^[a-f0-9]{32}$/)),
  "api-token": Schema.String,
  files: Schema.String,
});

export interface Inputs extends Schema.Schema.Type<typeof Inputs> {}

const PurgeResponse = Schema.Struct({
  success: Schema.Boolean,
  errors: Schema.Array(
    Schema.Struct({ code: Schema.Number, message: Schema.String }),
  ),
});

// Small enough for every plan's per-request URL limit
export const batchSize = 30;

const failure = (message: string) =>
  new Annotations.ActionFailure({ message, title: "Cache purge" });

/** One absolute URL per line; blank lines and # comments are skipped. */
export const parseFiles = Effect.fn("PurgeCache.parseFiles")(function* (
  text: string,
) {
  const files: string[] = [];

  for (const line of text.split("\n").map((line) => line.trim())) {
    if (line === "" || line.startsWith("#")) continue;

    if (!/^https?:\/\/\S+$/.test(line)) {
      return yield* failure(`Expected an http(s) URL, got "${line}"`);
    }

    files.push(line);
  }

  if (files.length === 0) return yield* failure("No files to purge");

  return files;
});

const purge = Effect.fn("PurgeCache.purge")(function* (
  inputs: Inputs,
  files: readonly string[],
) {
  const response = yield* HttpClientRequest.post(
    `https://api.cloudflare.com/client/v4/zones/${inputs["zone-id"]}/purge_cache`,
  ).pipe(
    HttpClientRequest.bearerToken(inputs["api-token"]),
    HttpClientRequest.bodyJsonUnsafe({ files }),
    HttpClient.execute,
    Effect.flatMap(
      HttpClientResponse.schemaJson(Schema.Struct({ body: PurgeResponse })),
    ),
    Effect.map(({ body }) => body),
    Effect.mapError((error) =>
      failure(`Cloudflare's purge API didn't answer: ${error.message}`),
    ),
  );

  if (!response.success) {
    return yield* failure(
      response.errors.length === 0
        ? "Cloudflare refused the purge without saying why"
        : response.errors
            .map((error) => `${error.code}: ${error.message}`)
            .join("\n"),
    );
  }
});

export const run = Effect.fn("PurgeCache.run")(function* (inputs: Inputs) {
  const files = yield* parseFiles(inputs.files);

  for (let start = 0; start < files.length; start += batchSize) {
    yield* purge(inputs, files.slice(start, start + batchSize));
  }

  yield* Effect.sync(() =>
    process.stdout.write(
      `Purged ${files.length} URL${files.length === 1 ? "" : "s"}\n`,
    ),
  );
});
