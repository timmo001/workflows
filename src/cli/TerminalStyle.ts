import { Config, Effect } from "effect";

export interface Style {
  readonly heading: (text: string) => string;
  readonly label: (text: string) => string;
  readonly dim: (text: string) => string;
  readonly success: (text: string) => string;
  readonly warn: (text: string) => string;
  readonly error: (text: string) => string;
  readonly accent: (text: string) => string;
}

const ansi = (code: string) => (text: string) => `\x1b[${code}m${text}\x1b[0m`;

const identity = (text: string) => text;

export const colour: Style = {
  heading: ansi("1;36"),
  label: ansi("1"),
  dim: ansi("2"),
  success: ansi("32"),
  warn: ansi("33"),
  error: ansi("31"),
  accent: ansi("36"),
};

export const plain: Style = {
  heading: identity,
  label: identity,
  dim: identity,
  success: identity,
  warn: identity,
  error: identity,
  accent: identity,
};

const noColour = Config.String("NO_COLOR").pipe(
  Config.map((value) => value !== ""),
  Config.withDefault(false),
);

/** Colour on an interactive stdout with NO_COLOR unset, plain otherwise. */
export const resolve = Effect.gen(function* () {
  const disabled = yield* noColour;

  return process.stdout.isTTY === true && !disabled ? colour : plain;
});

export * as TerminalStyle from "./TerminalStyle.js";
