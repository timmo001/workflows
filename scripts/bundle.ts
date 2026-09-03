#!/usr/bin/env bun
import { $ } from "bun";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const actions = [
  {
    name: "foundation-smoke",
    entry: "src/actions/foundation-smoke/main.ts",
    outfile: ".github/actions/foundation-smoke/dist/index.js",
  },
  {
    name: "build-arch-package",
    entry: "src/actions/build-arch-package/main.ts",
    outfile: ".github/actions/build-arch-package/dist/index.js",
  },
  {
    name: "publish-aur",
    entry: "src/actions/publish-aur/main.ts",
    outfile: ".github/actions/publish-aur/dist/index.js",
  },
  {
    name: "release-bun-cli",
    entry: "src/actions/release-bun-cli/main.ts",
    outfile: ".github/actions/release-bun-cli/dist/index.js",
  },
  {
    name: "build-python-pypi-release",
    entry: "src/actions/build-python-pypi-release/main.ts",
    outfile: ".github/actions/build-python-pypi-release/dist/index.js",
  },
  {
    name: "validate-js-package",
    entry: "src/actions/validate-js-package/main.ts",
    outfile: ".github/actions/validate-js-package/dist/index.js",
  },
  {
    name: "validate-agent-skills",
    entry: "src/actions/validate-agent-skills/main.ts",
    outfile: ".github/actions/validate-agent-skills/dist/index.js",
  },
  {
    name: "validate-json",
    entry: "src/actions/validate-json/main.ts",
    outfile: ".github/actions/validate-json/dist/index.js",
  },
] as const;

const check = process.argv.includes("--check");

const digest = (bytes: Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");

for (const action of actions) {
  const absoluteOut = join(process.cwd(), action.outfile);
  await mkdir(dirname(absoluteOut), { recursive: true });
  const temporary = `${absoluteOut}.tmp`;
  await $`bun build ${action.entry} --target=node --format=esm --outfile=${temporary}`;
  const next = await readFile(temporary);
  if (check) {
    let current: Uint8Array | undefined;
    try {
      current = await readFile(absoluteOut);
    } catch {
      current = undefined;
    }
    await $`rm -f ${temporary}`;
    if (current === undefined || digest(current) !== digest(next)) {
      console.error(
        `Bundled action is out of date: ${action.outfile}\nRun: bun run bundle`,
      );
      process.exitCode = 1;
      continue;
    }
    console.log(`Bundle up to date: ${action.outfile}`);
    continue;
  }
  await writeFile(absoluteOut, next);
  await $`rm -f ${temporary}`;
  console.log(`Wrote ${action.outfile}`);
}
