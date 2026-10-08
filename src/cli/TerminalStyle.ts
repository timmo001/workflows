import { Clock, Config, Effect } from "effect";

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

/** A blank line, then a bold cyan heading. */
export const section = (style: Style, title: string, detail?: string) =>
  `\n${style.heading(title)}${detail === undefined ? "" : `  ${style.dim(detail)}`}`;

export const info = (message: string) => `  ${message}`;

export const success = (style: Style, message: string) =>
  `  ${style.success("✓")} ${message}`;

/** A failed item in a list, aligned with {@link success} rows. */
export const failure = (style: Style, message: string) =>
  `  ${style.error("✗")} ${message}`;

export const skip = (style: Style, message: string) =>
  `  ${style.dim(`○ ${message}`)}`;

export const error = (style: Style, message: string) =>
  `  ${style.error("[ERROR]")} ${message}`;

export const plural = (count: number, noun: string, nouns = `${noun}s`) =>
  `${count} ${count === 1 ? noun : nouns}`;

/** The dimmed closing line, timed from `startedAt` in epoch milliseconds. */
export const completedIn = Effect.fn("TerminalStyle.completedIn")(function* (
  style: Style,
  startedAt: number,
) {
  const elapsed = (yield* Clock.currentTimeMillis) - startedAt;
  const seconds = Math.round(elapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const time = minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;

  return `\n  ${style.dim(`Completed in ${time}`)}`;
});

export * as TerminalStyle from "./TerminalStyle.js";
