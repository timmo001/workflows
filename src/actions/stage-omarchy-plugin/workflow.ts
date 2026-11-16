import { Effect, FileSystem, PlatformError, Schema } from "effect";
import { join, normalize } from "node:path";
import { ActionOutputs } from "../../action/ActionOutputs.js";
import { Annotations } from "../../action/Annotations.js";
import { CommandExecutor } from "../../services/CommandExecutor.js";

export const Inputs = Schema.Struct({
  "plugin-directory": Schema.String,
  "publish-directory": Schema.String,
  license: Schema.String.pipe(
    Schema.withDecodingDefaultKey(Effect.succeed("LICENSE")),
  ),
});

export interface Inputs extends Schema.Schema.Type<typeof Inputs> {}

const Manifest = Schema.fromJsonString(
  Schema.Struct({
    entryPoints: Schema.Record(Schema.String, Schema.String),
  }),
);

const failure = (message: string) =>
  new Annotations.ActionFailure({ message, title: "Omarchy plugin" });

/** A file git tracks, from one `git ls-files --stage -z` entry. */
export interface TrackedFile {
  readonly mode: string;
  readonly path: string;
}

export const parseLsFiles = (output: string): TrackedFile[] =>
  output
    .split("\0")
    .filter((entry) => entry !== "")
    .map((entry) => {
      const tab = entry.indexOf("\t");

      return {
        mode: entry.slice(0, entry.indexOf(" ")),
        path: entry.slice(tab + 1),
      };
    });

/**
 * The plugin's files: only what git tracks, so stray build output is never
 * published. The directory must be flat, with no links or submodules, and its
 * manifest's entry points must be among the files.
 */
export const pluginFiles = Effect.fn("StageOmarchyPlugin.pluginFiles")(
  function* (directory: string, tracked: readonly TrackedFile[]) {
    const relative = normalize(directory).replace(/\/+$/, "");
    const prefix = relative === "." ? "" : `${relative}/`;
    const names: string[] = [];

    for (const file of tracked) {
      const name = file.path.slice(prefix.length);

      if (name.includes("/")) {
        return yield* failure(
          `${directory} must be flat, but git tracks ${file.path}`,
        );
      }

      if (file.mode !== "100644" && file.mode !== "100755") {
        return yield* failure(
          `${file.path} is a link or submodule, which can't be published`,
        );
      }

      names.push(name);
    }

    if (!names.includes("manifest.json")) {
      return yield* failure(`git tracks no manifest.json in ${directory}`);
    }

    return names.toSorted();
  },
);

export const run = Effect.fn("StageOmarchyPlugin.run")(function* (
  inputs: Inputs,
) {
  const fs = yield* FileSystem.FileSystem;
  const commands = yield* CommandExecutor.Service;
  const source = inputs["plugin-directory"];
  const publish = inputs["publish-directory"];

  const fileFailure =
    (operation: string, path: string) => (error: PlatformError.PlatformError) =>
      failure(`Unable to ${operation} ${path}: ${error.message}`);

  const tracked = yield* commands
    .run("git", ["ls-files", "--stage", "-z", "--", source])
    .pipe(
      Effect.mapError((error) =>
        failure(
          `Unable to list the files git tracks in ${source}: ${error.stderr}`,
        ),
      ),
    );

  const names = yield* pluginFiles(source, parseLsFiles(tracked));

  const manifestPath = join(source, "manifest.json");

  const manifest = yield* fs.readFileString(manifestPath).pipe(
    Effect.mapError(fileFailure("read", manifestPath)),
    Effect.flatMap(Schema.decodeUnknownEffect(Manifest)),
    Effect.mapError((error) =>
      error instanceof Annotations.ActionFailure
        ? error
        : failure(`${manifestPath} has no valid entryPoints: ${String(error)}`),
    ),
  );

  for (const [kind, entry] of Object.entries(manifest.entryPoints)) {
    if (!names.includes(entry)) {
      return yield* failure(
        `The ${kind} entry point ${entry} isn't a file git tracks in ${source}`,
      );
    }
  }

  // The plugin's own licence wins over the repository's
  const license = names.includes("LICENSE") ? undefined : inputs.license;

  if (license !== undefined) {
    const isLink = yield* fs.readLink(license).pipe(
      Effect.as(true),
      Effect.catch(() => Effect.succeed(false)),
    );

    const info = yield* fs
      .stat(license)
      .pipe(Effect.mapError(fileFailure("find the licence", license)));

    if (isLink || info.type !== "File") {
      return yield* failure(`The licence ${license} must be a regular file`);
    }
  }

  const gitEntry = yield* fs
    .exists(join(publish, ".git"))
    .pipe(Effect.mapError(fileFailure("inspect", publish)));

  if (!gitEntry) {
    return yield* failure(`${publish} isn't a git checkout`);
  }

  // Start from an empty tree, so files the plugin dropped are removed too
  const existing = yield* fs
    .readDirectory(publish)
    .pipe(Effect.mapError(fileFailure("read", publish)));

  for (const entry of existing) {
    if (entry === ".git") continue;

    yield* fs
      .remove(join(publish, entry), { recursive: true })
      .pipe(Effect.mapError(fileFailure("remove", join(publish, entry))));
  }

  for (const name of names) {
    yield* fs
      .copyFile(join(source, name), join(publish, name))
      .pipe(Effect.mapError(fileFailure("copy", join(source, name))));
  }

  if (license !== undefined) {
    yield* fs
      .copyFile(license, join(publish, "LICENSE"))
      .pipe(Effect.mapError(fileFailure("copy", license)));
  }

  const published = license === undefined ? names : [...names, "LICENSE"];

  yield* ActionOutputs.setOutput("files", published.toSorted().join("\n"));
  yield* Effect.sync(() =>
    process.stdout.write(
      `Staged ${published.length} files in ${publish}: ${published.join(", ")}\n`,
    ),
  );
});
