import { afterEach, describe, expect, it } from "vitest";
import { Effect, Schema } from "effect";
import { ActionInputs } from "../src/action/ActionInputs.js";

const originalEnv = { ...process.env };

afterEach(() => {
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnv)) {
      delete process.env[key];
    }
  }
  Object.assign(process.env, originalEnv);
});

describe("ActionInputs", () => {
  it("maps hyphenated input names to INPUT_ env vars", () => {
    process.env["INPUT_WHO-TO-GREET"] = "Mona";
    expect(ActionInputs.readRawInput("who-to-greet")).toBe("Mona");
  });

  it("treats empty strings as missing", () => {
    process.env.INPUT_MESSAGE = "";
    expect(ActionInputs.readRawInput("message")).toBeUndefined();
  });

  it("decodes required inputs through Schema", async () => {
    process.env.INPUT_MESSAGE = "foundation-ok";
    const Inputs = Schema.Struct({
      message: Schema.String,
    });
    const decoded = await Effect.runPromise(
      ActionInputs.decodeInputs(Inputs, ["message"]),
    );
    expect(decoded).toEqual({ message: "foundation-ok" });
  });

  it("fails when a required input is missing", async () => {
    delete process.env.INPUT_MESSAGE;
    const Inputs = Schema.Struct({
      message: Schema.String,
    });
    const exit = await Effect.runPromiseExit(
      ActionInputs.decodeInputs(Inputs, ["message"]),
    );
    expect(exit._tag).toBe("Failure");
  });
});
