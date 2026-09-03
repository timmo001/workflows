import { afterEach, describe, expect, it } from "vitest";
import { Effect, Schema } from "effect";
import { ActionInputs } from "../src/action/ActionInputs.js";

const inputName = "INPUT_OPTIONALVALUE";

afterEach(() => {
  delete process.env[inputName];
});

describe("ActionInputs", () => {
  it("omits empty optional inputs before schema decoding", async () => {
    process.env[inputName] = "";
    const schema = Schema.Struct({
      optionalValue: Schema.optionalKey(Schema.String),
    });

    await expect(
      Effect.runPromise(ActionInputs.decodeInputs(schema, ["optionalValue"])),
    ).resolves.toEqual({});
  });
});
