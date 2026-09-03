import {
  Effect,
  Exit,
  FileSystem,
  PlatformError,
  Schema,
  SchemaTransformation,
} from "effect";
import { join } from "node:path";
import { Annotations } from "../../action/Annotations.js";

const Json = Schema.String.pipe(
  Schema.decodeTo(Schema.Unknown, SchemaTransformation.fromJsonString()),
);

export type ValidationResult =
  | { readonly _tag: "Valid"; readonly file: string }
  | {
      readonly _tag: "Invalid";
      readonly file: string;
      readonly message: string;
      readonly line?: number | undefined;
      readonly column?: number | undefined;
    };

const parseLocation = (message: string) => {
  const match = /\(line (\d+) column (\d+)\)$/.exec(message);
  if (match === null) return {};
  return {
    line: Number(match[1]),
    column: Number(match[2]),
  };
};

export const validateJsonSource = (
  file: string,
  source: string,
): ValidationResult => {
  if (Exit.isSuccess(Schema.decodeUnknownExit(Json)(source))) {
    return { _tag: "Valid", file } satisfies ValidationResult;
  }

  let message = "Invalid JSON";
  try {
    JSON.parse(source);
  } catch (error) {
    if (error instanceof Error) message = error.message;
  }
  return {
    _tag: "Invalid",
    file,
    message,
    ...parseLocation(message),
  } satisfies ValidationResult;
};

export const discoverJsonFiles = Effect.fn("ValidateJson.discoverJsonFiles")(
  function* (root: string) {
    const fs = yield* FileSystem.FileSystem;
    const files: string[] = [];
    const fileFailure = (
      operation: string,
      path: string,
      error: PlatformError.PlatformError,
    ) =>
      new Annotations.ActionFailure({
        message: `Unable to ${operation} ${path}: ${error}`,
        title: "File operation failed",
      });
    const visit = Effect.fn("ValidateJson.discoverJsonFiles.visit")(function* (
      directory: string,
    ): Effect.fn.Return<void, Annotations.ActionFailure> {
      const entries = yield* fs
        .readDirectory(directory)
        .pipe(
          Effect.mapError((error) =>
            fileFailure("read directory", directory, error),
          ),
        );
      for (const entry of entries.toSorted()) {
        const path = join(directory, entry);
        const symbolicLink = yield* fs.readLink(path).pipe(
          Effect.as(true),
          Effect.catch(() => Effect.succeed(false)),
        );
        if (symbolicLink) continue;

        const info = yield* fs
          .stat(path)
          .pipe(
            Effect.mapError((error) => fileFailure("inspect", path, error)),
          );
        if (info.type === "Directory") {
          yield* visit(path);
        } else if (info.type === "File" && entry.endsWith(".json")) {
          files.push(path);
        }
      }
    });

    yield* visit(root);
    return files.toSorted();
  },
);

const validateFile = Effect.fn("ValidateJson.validateFile")(function* (
  file: string,
) {
  const fs = yield* FileSystem.FileSystem;
  return yield* fs.readFileString(file).pipe(
    Effect.map((source) => validateJsonSource(file, source)),
    Effect.catch((error) =>
      Effect.succeed<ValidationResult>({
        _tag: "Invalid",
        file,
        message: `Unable to read JSON file: ${error}`,
      }),
    ),
  );
});

const writeStdout = (message: string) =>
  Effect.sync(() => process.stdout.write(`${message}\n`));

const writeStderr = (message: string) =>
  Effect.sync(() => process.stderr.write(`${message}\n`));

export const run = Effect.fn("ValidateJson.run")(function* (root = ".") {
  const files = yield* discoverJsonFiles(root);
  if (files.length === 0) {
    yield* writeStdout("No JSON files found to validate.");
    return;
  }

  const annotations = yield* Annotations.Service;
  const results = yield* Effect.forEach(files, validateFile, {
    concurrency: 1,
  });
  const failures = results.filter((result) => result._tag === "Invalid");

  for (const result of results) {
    if (result._tag === "Valid") {
      yield* writeStdout(`${result.file} OK`);
      continue;
    }
    yield* writeStderr(`${result.file}: ${result.message}`);
    yield* annotations.error(result.message, {
      title: "Invalid JSON",
      file: result.file,
      line: result.line,
      column: result.column,
    });
  }

  if (failures.length > 0) {
    const message = `${failures.length} JSON file(s) failed validation.`;
    yield* writeStderr(message);
    return yield* new Annotations.ActionFailure({
      message,
      title: "JSON validation failed",
    });
  }

  yield* writeStdout(`Validated ${files.length} JSON file(s).`);
});
