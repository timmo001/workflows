# Agent instructions

## Layout

- `.github/workflows/`: reusable workflows (`workflow_call`) consumed by other
  repositories pinned to a commit SHA. Several also run on `push` and
  `pull_request` here, so this repository lints itself with them.
- `.github/actions/<name>/`: actions called by those workflows. Most are Node
  actions (`using: node24`, `main: dist/index.js`) built from TypeScript.
  `setup-actionlint`, `attest-release-assets` and `publish-release-assets` are
  plain composite actions with no source in `src/`.
- `src/actions/<name>/`: Node action source. `workflow.ts` exports the input
  `Schema` and `run`, so tests can import them. `main.ts` decodes inputs with
  `ActionInputs.decodeInputs`, calls `run` and hands the program to
  `ActionRuntime.runAction`.
- `src/action/`: shared action runtime (inputs, outputs, annotations, GitHub
  commands). `src/services/`: shared services such as `CommandExecutor`.
- `tests/<name>.test.ts`: one file per action, using helpers from
  `tests/support.ts` and fixtures in `tests/fixtures/`.

## Workflow contracts

- A workflow's inputs, secrets, outputs and job names are a public contract.
  Renaming or removing one breaks callers, and a job name change also changes
  their required check context (`<caller job id> / <job name>`). Call that out
  and update `README.md` when a contract or documented behaviour changes.
- Reference actions in this repository with `uses: $/.github/actions/<name>` so
  they resolve from the same commit as the workflow. `.github/actionlint.yaml`
  ignores the error actionlint 1.7.12 still raises for this syntax.
- Pin third-party actions to a full commit SHA with a `# vX.Y.Z` comment.
  Renovate (`timmo001/renovate-config`) updates them, and updates tool versions
  marked with a `# renovate:` comment.
- Every job sets `timeout-minutes`.

## Node actions

To add one:

1. Create `src/actions/<name>/workflow.ts` and `main.ts` following an existing
   action, failing with `Annotations.ActionFailure`.
2. Add the action to the `actions` list in `scripts/bundle.ts`.
3. Add `.github/actions/<name>/action.yml` pointing at `dist/index.js`.
4. Run `mise run bundle` and commit the generated `dist/index.js`.

The bundles are committed. After changing `src/`, `package.json`, `bun.lock` or
`tsconfig.json`, run `mise run bundle`, or `bundle:check` fails.
`sync-action-bundles.yml` also rebuilds them on pull requests and `master`.

## Tasks

`mise.toml` pins Bun and Node and is the only place tasks are combined.
`package.json` scripts each run one command; don't add aggregates there.

- `validate` is the full suite CI runs in `validate-actions.yml`.
- The tests need `bsdtar` (`libarchive-tools`) and Python's `packaging` module
  on the system, as CI installs them with apt.
- To add a check, add its `package.json` script, a mise task that runs it, and
  that task to `validate`.

## Synced files

`.agents/skills/` and `skills-lock.json` are synced from `timmo001/skills` and
other skill sources. Don't edit them here; change the source repository.
