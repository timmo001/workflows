import { Context, Effect, Layer, Ref, Schema } from "effect";

export interface AnnotationProperties {
  readonly title?: string | undefined;
  readonly file?: string | undefined;
  readonly line?: number | undefined;
  readonly column?: number | undefined;
}

export interface Interface {
  readonly error: (
    message: string,
    properties?: AnnotationProperties,
  ) => Effect.Effect<void>;
  readonly warning: (
    message: string,
    properties?: AnnotationProperties,
  ) => Effect.Effect<void>;
  readonly notice: (
    message: string,
    properties?: AnnotationProperties,
  ) => Effect.Effect<void>;
  readonly group: (title: string) => Effect.Effect<void>;
  readonly endGroup: () => Effect.Effect<void>;
}

export class Service extends Context.Service<Service, Interface>()(
  "@timmo001/workflows/Annotations",
) {}

const escapeData = (value: string) =>
  value.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");

const escapeProperty = (value: string) =>
  escapeData(value).replace(/:/g, "%3A").replace(/,/g, "%2C");

const formatCommand = (
  command: string,
  message: string,
  properties?: AnnotationProperties,
) => {
  const parts: string[] = [];
  if (properties?.title !== undefined)
    parts.push(`title=${escapeProperty(properties.title)}`);
  if (properties?.file !== undefined)
    parts.push(`file=${escapeProperty(properties.file)}`);
  if (properties?.line !== undefined) parts.push(`line=${properties.line}`);
  if (properties?.column !== undefined) parts.push(`col=${properties.column}`);
  const suffix = parts.length > 0 ? ` ${parts.join(",")}` : "";
  return `::${command}${suffix}::${escapeData(message)}`;
};

export const layer = Layer.sync(Service, () => {
  const write = (line: string) =>
    Effect.sync(() => {
      process.stdout.write(`${line}\n`);
    });
  return Service.of({
    error: Effect.fn("Annotations.error")(function* (
      message: string,
      properties?: AnnotationProperties,
    ) {
      yield* write(formatCommand("error", message, properties));
    }),
    warning: Effect.fn("Annotations.warning")(function* (
      message: string,
      properties?: AnnotationProperties,
    ) {
      yield* write(formatCommand("warning", message, properties));
    }),
    notice: Effect.fn("Annotations.notice")(function* (
      message: string,
      properties?: AnnotationProperties,
    ) {
      yield* write(formatCommand("notice", message, properties));
    }),
    group: Effect.fn("Annotations.group")(function* (title: string) {
      yield* write(`::group::${escapeData(title)}`);
    }),
    endGroup: Effect.fn("Annotations.endGroup")(function* () {
      yield* write("::endgroup::");
    }),
  });
});

export interface TestInterface extends Interface {
  readonly lines: () => Effect.Effect<ReadonlyArray<string>>;
}

export class TestService extends Context.Service<TestService, TestInterface>()(
  "@timmo001/workflows/Annotations/Test",
) {}

export const testLayer = Layer.effectContext(
  Effect.gen(function* () {
    const recorded = yield* Ref.make<ReadonlyArray<string>>([]);
    const write = (line: string) =>
      Ref.update(recorded, (lines) => [...lines, line]);
    const service = TestService.of({
      error: Effect.fn("Annotations.Test.error")(function* (
        message: string,
        properties?: AnnotationProperties,
      ) {
        yield* write(formatCommand("error", message, properties));
      }),
      warning: Effect.fn("Annotations.Test.warning")(function* (
        message: string,
        properties?: AnnotationProperties,
      ) {
        yield* write(formatCommand("warning", message, properties));
      }),
      notice: Effect.fn("Annotations.Test.notice")(function* (
        message: string,
        properties?: AnnotationProperties,
      ) {
        yield* write(formatCommand("notice", message, properties));
      }),
      group: Effect.fn("Annotations.Test.group")(function* (title: string) {
        yield* write(`::group::${escapeData(title)}`);
      }),
      endGroup: Effect.fn("Annotations.Test.endGroup")(function* () {
        yield* write("::endgroup::");
      }),
      lines: Effect.fn("Annotations.Test.lines")(function* () {
        return yield* Ref.get(recorded);
      }),
    });
    return Context.empty().pipe(
      Context.add(Service, service),
      Context.add(TestService, service),
    );
  }),
);

export class ActionFailure extends Schema.TaggedError<ActionFailure>()(
  "ActionFailure",
  {
    message: Schema.String,
    title: Schema.optionalKey(Schema.String),
  },
) {}

export * as Annotations from "./Annotations.js";
