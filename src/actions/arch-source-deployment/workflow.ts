import { Api, type GhError } from "@timmo001/effect-gh";
import { Config, Effect, Match, Schema } from "effect";
import { ActionOutputs } from "../../action/ActionOutputs.js";
import { Annotations } from "../../action/Annotations.js";

const SourceRepository = Schema.String.check(
  Schema.isPattern(/^timmo001\/[A-Za-z0-9._-]+$/),
);

const StartInputs = Schema.Struct({
  stage: Schema.Literal("start"),
  sourceRepository: SourceRepository,
  sourceSha: Schema.String.check(Schema.isPattern(/^[a-f0-9]{40}$/)),
  packageName: Schema.String.check(
    Schema.isPattern(/^[a-z0-9@_+][a-z0-9@._+-]*$/),
  ),
  packageFile: Schema.String.check(
    Schema.isPattern(/^[A-Za-z0-9@._+:~-]+\.pkg\.tar\.zst$/),
  ),
});

const FinishInputs = Schema.Struct({
  stage: Schema.Literal("finish"),
  sourceRepository: SourceRepository,
  deploymentId: Schema.String.check(Schema.isPattern(/^[0-9]+$/)),
  environmentUrl: Schema.String,
  jobStatus: Schema.Literals(["success", "failure", "cancelled"]),
});

export const Inputs = Schema.Union([StartInputs, FinishInputs]);

export type Inputs = typeof Inputs.Type;

const Deployment = Schema.Struct({ id: Schema.Number });

// One environment per package keeps -git and release channels apart.
export const environmentName = (packageName: string) =>
  packageName.endsWith("-git")
    ? `arch-git/${packageName}`
    : `arch-bin/${packageName}`;

export const environmentUrl = (packageFile: string) =>
  `https://packages.timmo.dev/x86_64/${encodeURIComponent(packageFile)}`;

export const deploymentRequest = (inputs: typeof StartInputs.Type) => ({
  ref: inputs.sourceSha,
  environment: environmentName(inputs.packageName),
  auto_merge: false,
  required_contexts: [],
  description: `Publish ${inputs.packageName}`,
  payload: { package: inputs.packageName, file: inputs.packageFile },
});

export const finishStatus = (
  inputs: typeof FinishInputs.Type,
  logUrl: string,
) =>
  Match.value(inputs.jobStatus).pipe(
    Match.when("success", () => ({
      state: "success",
      log_url: logUrl,
      environment_url: inputs.environmentUrl,
    })),
    Match.when("failure", () => ({ state: "failure", log_url: logUrl })),
    Match.when("cancelled", () => ({ state: "error", log_url: logUrl })),
    Match.exhaustive,
  );

const toActionFailure = (error: GhError) =>
  new Annotations.ActionFailure({
    title: "GitHub request failed",
    message: Match.value(error).pipe(
      Match.tag(
        "GhCommandError",
        (error) =>
          error.stderr.trim() || `gh exited with code ${error.exitCode}`,
      ),
      Match.tag(
        "GhTimeoutError",
        (error) => `gh timed out after ${error.timeoutMs}ms`,
      ),
      Match.tag("GhPlatformError", "GhDecodeError", (error) =>
        String(error.cause),
      ),
      Match.exhaustive,
    ),
  });

const runLogUrl = Effect.gen(function* () {
  const server = yield* Config.String("GITHUB_SERVER_URL");
  const repository = yield* Config.String("GITHUB_REPOSITORY");
  const runId = yield* Config.String("GITHUB_RUN_ID");

  return `${server}/${repository}/actions/runs/${runId}`;
});

const postStatus = (
  sourceRepository: string,
  deploymentId: string | number,
  body: Readonly<Record<string, string>>,
) =>
  Api.raw({
    method: "POST",
    endpoint: `repos/${sourceRepository}/deployments/${deploymentId}/statuses`,
    body,
  });

export const run = Effect.fn("ArchSourceDeployment.run")(function* (
  inputs: Inputs,
) {
  const logUrl = yield* runLogUrl.pipe(
    Effect.mapError(
      (error) =>
        new Annotations.ActionFailure({
          title: "Missing GitHub run context",
          message: String(error),
        }),
    ),
  );

  if (inputs.stage === "finish") {
    yield* postStatus(
      inputs.sourceRepository,
      inputs.deploymentId,
      finishStatus(inputs, logUrl),
    ).pipe(Effect.mapError(toActionFailure));

    return;
  }

  const deployment = yield* Api.json(
    {
      method: "POST",
      endpoint: `repos/${inputs.sourceRepository}/deployments`,
      body: deploymentRequest(inputs),
    },
    Deployment,
  ).pipe(Effect.mapError(toActionFailure));

  yield* postStatus(inputs.sourceRepository, deployment.id, {
    state: "in_progress",
    log_url: logUrl,
  }).pipe(Effect.mapError(toActionFailure));

  yield* ActionOutputs.setOutput("deployment-id", String(deployment.id));
  yield* ActionOutputs.setOutput(
    "environment-url",
    environmentUrl(inputs.packageFile),
  );
});
