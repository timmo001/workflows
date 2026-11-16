import { Clock, Effect, Schedule, Schema } from "effect";
import { HttpClient } from "effect/http";
import { Annotations } from "../../action/Annotations.js";

const Seconds = (minimum: number, fallback: string) =>
  Schema.NumberFromString.check(
    Schema.isInt(),
    Schema.isGreaterThanOrEqualTo(minimum),
  ).pipe(Schema.withDecodingDefaultKey(Effect.succeed(fallback)));

export const Inputs = Schema.Struct({
  checks: Schema.String,
  "timeout-seconds": Seconds(0, "120"),
  "interval-seconds": Seconds(1, "5"),
});

export interface Inputs extends Schema.Schema.Type<typeof Inputs> {}

const Check = Schema.Struct({
  url: Schema.String.check(Schema.isPattern(/^https?:\/\/\S+$/)),
  status: Schema.NumberFromString.check(
    Schema.isInt(),
    Schema.isBetween({ minimum: 100, maximum: 599 }),
  ),
});

export interface Check extends Schema.Schema.Type<typeof Check> {}

class Miss extends Schema.TaggedError<Miss>()("Miss", {
  received: Schema.String,
}) {}

const failure = (message: string) =>
  new Annotations.ActionFailure({ message, title: "Smoke check" });

/** One `<url> <status>` pair per line; blank lines and # comments are skipped. */
export const parseChecks = Effect.fn("SmokeCheck.parseChecks")(function* (
  text: string,
) {
  const checks: Check[] = [];

  for (const line of text.split("\n").map((line) => line.trim())) {
    if (line === "" || line.startsWith("#")) continue;

    const [url = "", status = "", ...rest] = line.split(/\s+/);

    if (rest.length > 0) {
      return yield* failure(`Expected "<url> <status>", got "${line}"`);
    }

    checks.push(
      yield* Schema.decodeUnknownEffect(Check)({ url, status }).pipe(
        Effect.mapError(() =>
          failure(
            `Expected an http(s) URL and a status from 100 to 599, such as "https://example.com 200", got "${line}"`,
          ),
        ),
      ),
    );
  }

  if (checks.length === 0) return yield* failure("No checks to run");

  return checks;
});

const attempt = Effect.fn("SmokeCheck.attempt")(function* (check: Check) {
  const response = yield* HttpClient.get(check.url).pipe(
    Effect.timeout("10 seconds"),
    Effect.mapError(
      (error) => new Miss({ received: `no response (${error.message})` }),
    ),
  );

  if (response.status !== check.status) {
    return yield* new Miss({ received: String(response.status) });
  }
});

const writeStdout = (message: string) =>
  Effect.sync(() => process.stdout.write(`${message}\n`));

/**
 * Checks each URL in turn. Every check retries until it returns its status or
 * the shared time limit runs out, as a new custom domain can return
 * Cloudflare 500s for a minute after its first deploy.
 */
export const run = Effect.fn("SmokeCheck.run")(function* (inputs: Inputs) {
  const checks = yield* parseChecks(inputs.checks);
  const timeoutMillis = inputs["timeout-seconds"] * 1000;
  const intervalMillis = inputs["interval-seconds"] * 1000;
  const deadline = (yield* Clock.currentTimeMillis) + timeoutMillis;

  for (const check of checks) {
    yield* attempt(check).pipe(
      Effect.retry({
        schedule: Schedule.spaced(intervalMillis),
        while: (miss: Miss) =>
          Effect.gen(function* () {
            const now = yield* Clock.currentTimeMillis;

            if (now + intervalMillis > deadline) return false;

            yield* writeStdout(
              `${check.url} returned ${miss.received}, expected ${check.status}; retrying`,
            );

            return true;
          }),
      }),
      Effect.mapError((miss) =>
        failure(
          `${check.url} returned ${miss.received}, expected ${check.status}`,
        ),
      ),
    );

    yield* writeStdout(`${check.url} returned ${check.status}`);
  }
});
