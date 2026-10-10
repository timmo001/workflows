---
name: effect-gh
description: Use @timmo001/effect-gh for GitHub CLI integration in Effect TypeScript code. Apply when adding or changing gh-backed API requests, repository, issue, pull request or workflow operations, streaming output, or migrating hand-written gh subprocess wrappers to Effect.
compatibility: Requires TypeScript, @timmo001/effect-gh with its compatible Effect peer, and an Effect platform adapter providing ChildProcessSpawner. Running operations requires an installed, authenticated GitHub CLI. Consumers choose the runtime and platform.
---

# Effect GH

Prefer `@timmo001/effect-gh` when an Effect application needs the GitHub CLI's
authentication, repository context or command behaviour. Use its services and
operations instead of rebuilding subprocess execution, JSON decoding and
cancellation. It wraps the actual `gh` executable; direct GitHub HTTP integrations
have a different transport contract.

## Read the current contract

1. Inspect the consumer's manifest and lockfile for the SDK and Effect versions.
   Read the installed SDK README and declarations, and match the platform adapter
   to the SDK's Effect peer. If adding the dependency, verify its available release
   and peer requirements before choosing versions.
2. Read the relevant current docs before coding:
   - [README](https://github.com/timmo001/effect-gh/blob/main/README.md): setup,
     operations, errors, pagination and streams.
   - [Package manifest](https://github.com/timmo001/effect-gh/blob/main/package.json)
     and [exports](https://github.com/timmo001/effect-gh/blob/main/src/index.ts):
     dependency requirements and public surface.
   - [Notification example](https://github.com/timmo001/effect-gh/blob/main/examples/notifications.ts):
     nullable responses and mutations with empty output.
   - [Workflow example](https://github.com/timmo001/effect-gh/blob/main/examples/workflow-runs.ts):
     REST page envelopes and run attempts.
     These links follow development. Prefer the installed release's docs and source
     when they differ. Inspect installed `gh` help for required flags.

## Use the package

1. Choose the smallest public operation that fits. Use `Repository`, `Issue`,
   `PullRequest`, `Workflow`, `Release`, `Label`, `Auth`, `Extension`, `Search`
   and `Cli` for their typed operations, selecting `fields` where the operation
   takes them. Use `Api.json`, `Api.pages`, `Api.empty`, `Api.text` or
   `Api.headers` with a response schema for other endpoints. When a CLI command
   has no typed operation, add one to effect-gh rather than calling the `Gh`
   service's raw `execute`, `json` or `stream` methods from the consumer; the
   `timmo-effect/no-raw-gh` lint rule flags those calls and direct `gh` spawns.
   Confirm signatures from the current exports.
2. Provide the SDK layer with the consumer's `ChildProcessSpawner`. Keep runtime
   execution at the application boundary. A Node consumer can compose it like this:

   ```ts
   import { NodeServices } from "@effect/platform-node";
   import { Api, layer } from "@timmo001/effect-gh";
   import { Effect, Layer, Schema } from "effect";

   const ghLayer = layer({ timeout: "30 seconds" }).pipe(
     Layer.provide(NodeServices.layer),
   );

   const viewer = Api.json(
     { endpoint: "user", method: "GET" },
     Schema.Struct({ login: Schema.String }),
   ).pipe(Effect.provide(ghLayer));
   ```

   This constructs an effect; the caller decides when to run it. Supply working
   directory, repository, host and timeout deliberately where context matters.
   Reuse gh authentication rather than retrieving or logging tokens.

3. Preserve boundary semantics:
   - Decode JSON with a response Schema. Use raw output for empty or non-JSON
     responses, and JSON request bodies rather than CLI field interpolation.
   - Specify API methods explicitly. Paginated results are arrays of decoded
     pages; flatten only after decoding each endpoint's page shape.
   - Treat pending and failed PR checks as structured results where the wrapper
     supports them. Preserve genuine typed failures and Effect interruption.
   - Consume output and watches as Streams. Keep their scope owned by the caller;
     early termination cancels work and does not prove a successful final exit.
   - Keep retries explicit and bounded at a known-idempotent boundary. A failed
     mutation may already have taken effect; replaying emitted streams can
     duplicate output. Use `Gh.retryTransient`, `isTransient`, `isRateLimited`
     and `RateLimit.cached` rather than local message lists or rate-limit caches,
     then map `GhError` into the consumer's own error type.
4. Verify the integration through the public SDK boundary. Typecheck layer and
   Schema requirements, test argument construction and relevant failure paths
   with a supplied test spawner, and run the consumer's normal checks. When
   replacing an existing wrapper, account for its pagination, retry, timeout and
   error contracts rather than assuming it is a drop-in replacement.
