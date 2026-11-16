import { Effect, Layer } from "effect";
import { HttpClient, HttpClientError, HttpClientResponse } from "effect/http";
import * as http from "node:http";
import * as https from "node:https";
import { publicLookup } from "./PublicLookup.js";

/**
 * An HttpClient over node:http(s) that resolves hostnames with publicLookup
 * and doesn't follow redirects. It only reads the status and headers, which
 * is all a smoke check needs, and drains the body. Node's own http keeps
 * undici out of the bundle, as Bun bakes undici's absolute file path into it.
 */
const client = HttpClient.make((request, url, signal) =>
  Effect.callback<
    HttpClientResponse.HttpClientResponse,
    HttpClientError.HttpClientError
  >((resume) => {
    const transportFailure = (cause: Error) =>
      new HttpClientError.HttpClientError({
        reason: new HttpClientError.TransportError({ request, cause }),
      });

    const outgoing = (url.protocol === "https:" ? https : http).request(
      url,
      {
        method: request.method,
        headers: request.headers,
        lookup: publicLookup,
        signal,
      },
      (incoming) => {
        incoming.resume();

        const headers = new Headers();

        for (const [name, value] of Object.entries(incoming.headers)) {
          if (value !== undefined) {
            headers.set(name, Array.isArray(value) ? value.join(", ") : value);
          }
        }

        resume(
          Effect.try({
            try: () =>
              HttpClientResponse.fromWeb(
                request,
                new Response(null, {
                  status: incoming.statusCode ?? 0,
                  headers,
                }),
              ),
            catch: (cause) =>
              transportFailure(
                cause instanceof Error ? cause : new Error(String(cause)),
              ),
          }),
        );
      },
    );

    outgoing.on("error", (cause) =>
      resume(Effect.fail(transportFailure(cause))),
    );
    outgoing.end();

    return Effect.sync(() => outgoing.destroy());
  }),
);

export const layer = Layer.succeed(HttpClient.HttpClient, client);
