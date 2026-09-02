import { Schema } from "effect";

const inputEnvName = (name: string) =>
  `INPUT_${name.replace(/ /g, "_").toUpperCase()}`;

export const readRawInput = (name: string): string | undefined => {
  const value = process.env[inputEnvName(name)];
  return value === undefined || value === "" ? undefined : value;
};

export const readInputs = (names: readonly string[]) => {
  const inputs: Record<string, string | undefined> = {};
  for (const name of names) {
    inputs[name] = readRawInput(name);
  }
  return inputs satisfies Record<string, string | undefined>;
};

export const decodeInputs = <S extends Schema.Top>(
  schema: S,
  names: readonly string[],
) => Schema.decodeUnknownEffect(schema)(readInputs(names));

export * as ActionInputs from "./ActionInputs.js";
