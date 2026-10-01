import { describe, expect, it } from "vitest";
import { Effect, Exit, Schema } from "effect";
import {
  environmentName,
  environmentUrl,
  finishStatus,
  Inputs,
} from "../src/actions/arch-source-deployment/workflow.js";

const decode = (input: Readonly<Record<string, string>>) =>
  Effect.runSyncExit(Schema.decodeUnknownEffect(Inputs)(input));

describe("arch-source-deployment", () => {
  it.each([
    ["ha-bridge-git", "arch-git/ha-bridge-git"],
    ["ha-bridge-bin", "arch-bin/ha-bridge-bin"],
    ["system-bridge", "arch-bin/system-bridge"],
    ["system-bridge-git", "arch-git/system-bridge-git"],
  ])("separates %s into its channel environment", (packageName, expected) => {
    expect(environmentName(packageName)).toBe(expected);
  });

  it("encodes epoch package files in the environment URL", () => {
    expect(environmentUrl("example-1:1.0-1-x86_64.pkg.tar.zst")).toBe(
      "https://packages.timmo.dev/x86_64/example-1%3A1.0-1-x86_64.pkg.tar.zst",
    );
  });

  it("requires the start inputs for the start stage", () => {
    expect(
      Exit.isFailure(
        decode({ stage: "start", sourceRepository: "timmo001/example" }),
      ),
    ).toBe(true);
  });

  it("rejects source repositories outside timmo001", () => {
    expect(
      Exit.isFailure(
        decode({
          stage: "finish",
          sourceRepository: "other/example",
          deploymentId: "1",
          environmentUrl: "https://packages.timmo.dev/x86_64/a.pkg.tar.zst",
          jobStatus: "success",
        }),
      ),
    ).toBe(true);
  });

  it.each([
    ["success", "success"],
    ["failure", "failure"],
    ["cancelled", "error"],
  ] as const)("maps a %s job to a %s deployment", (jobStatus, state) => {
    expect(
      finishStatus(
        {
          stage: "finish",
          sourceRepository: "timmo001/example",
          deploymentId: "1",
          environmentUrl: "https://packages.timmo.dev/x86_64/a.pkg.tar.zst",
          jobStatus,
        },
        "https://github.com/timmo001/arch-repo/actions/runs/1",
      ).state,
    ).toBe(state);
  });
});
