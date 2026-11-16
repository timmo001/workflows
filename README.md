# GitHub Actions Shared Workflows

Reusable GitHub Actions workflows shared across my projects. They cover common
build, lint, test, security, release and repository maintenance tasks.

## Usage

Call a workflow from a job in your repository:

<!-- markdownlint-disable MD013 -->

```yaml
name: Lint

on:
  ...

jobs:
  lint:
    uses: timmo001/workflows/.github/workflows/lint-general.yml@a884a1a831cd482dfeff570bda660aee5baa328c # master
```

<!-- markdownlint-enable MD013 -->

Workflows are stored in [`.github/workflows`](.github/workflows). Check the
selected file's `workflow_call` section for its supported inputs, secrets and
outputs before using it. Pass non-default inputs with `with` and required
secrets with `secrets`.

Pin cross-repository calls to a full commit SHA. This prevents an upstream
change from altering a workflow without a corresponding update in the calling
repository.

Some reusable workflows run repository-owned Node actions from
[`.github/actions`](.github/actions). Those actions are bundled JavaScript
committed with the workflow revision. Callers keep the same one-line
`uses: timmo001/workflows/.github/workflows/...@<sha>` interface; they do not
check out this repository or install its Node tooling. Inside this repository,
workflows reference sibling actions with `$/.github/actions/<name>` so the
action resolves from the same commit as the workflow.

When action sources, the lockfile, or action metadata change,
`sync-action-bundles.yml` rebuilds `dist` and commits it to the open pull
request.
`validate-actions.yml` still fails if a committed bundle is out of date.

## hk base

[`hk/base.pkl`](hk/base.pkl) is a shared [hk](https://hk.jdx.dev) config with
the checks `lint-general.yml` runs (markdownlint-cli2, yamllint, actionlint,
ShellCheck), plus Oxlint for repositories with their own Oxlint config. Each
runs on the files a push changes, before it leaves the machine. It is
check-only and has no pre-commit hook. `publish-hk-base.yml` attaches it to
every release as `hk-base@<tag>.0`.

Amend it from a repository's `hk.pkl` and add the repository's own steps:

<!-- markdownlint-disable MD013 -->

```pkl
amends "package://github.com/timmo001/workflows/releases/download/<tag>/hk-base@<tag>.0#/base.pkl"

hooks {
  ["pre-push"] {
    steps {
      ["validate"] { check = "mise run validate" }
    }
  }
}
```

<!-- markdownlint-enable MD013 -->

Pin `npm:markdownlint-cli2`, `yamllint`, `actionlint` and `shellcheck` in the
repository's `mise.toml`. The Oxlint step runs `bunx oxlint`, so it uses the
repository's own Oxlint version, and passes when a push only touches files its
config ignores. Install hk's hooks once per machine with
`hk install --global --mise`.

## Scope

The collection includes reusable workflows for:

- Building Node.js and Python projects
- Linting source code, configuration and documentation
- Running tests, dependency reviews and CodeQL analysis
- Preparing stable Python distributions from immutable release source
- Building allowlisted Arch packages from exact source commits
- Building and releasing Home Assistant cards and command-line tools
- Building multi-arch container images and Home Assistant app changelogs
- Sending Home Assistant app releases to a shared app repository
- Building, linting and attaching Bun CLI and Arch package artefacts
- Signing Android apps and publishing them to a shared F-Droid repository
- Managing dependency updates, labels, stale items and releases
- Deploying Alchemy stacks to Cloudflare
- Publishing to R2, purging Cloudflare's cache and smoke-checking URLs
- Running mise tasks, checking generated docs and building Android apps
- Validating and publishing Omarchy shell plugins

These workflows reflect the requirements of my projects. Review the workflow
contract and implementation before using one elsewhere, particularly its
permissions, runner assumptions and expected project files.

`lint-oxlint.yml` installs a project's locked dependencies and runs its `lint`
script. It uses Bun by default; set `package-manager: pnpm` for pnpm projects.
The caller owns its Oxlint config, rule packages and warning policy. The
workflow sets up Node.js for JavaScript plugins and supports a package
directory through `code-path`.

`lint-general.yml` runs markdownlint, yamllint and actionlint as steps of one
`Lint` job, so a run bills one job instead of one per linter. ShellCheck
(`lint-shell`) and Agent Skills validation (`lint-skills`) are opt-in. Every
enabled linter runs even when an earlier one fails. The check context is
`<caller job id> / Lint`.

Every job sets `timeout-minutes`, so a hung step fails within minutes instead
of running to GitHub's six-hour default.

`build-bun-cli.yml` installs tools with mise, then runs
`mise run check ::: test ::: build` in one invocation, so independent tasks run
in parallel and shared dependencies run once, followed by the optional
multi-line `smoke-test` input. Callers define those mise tasks and own their
lockfile policy. The job is named `Build`; a reusable-workflow job appears in
check contexts as `<caller job id> / Build`, so update required checks
accordingly.

`build-container-image.yml` builds a Dockerfile for amd64 and arm64 on native
runners, pushes each by digest to GHCR and tags one multi-arch manifest with
`version`, its `major.minor` and, unless `latest: false`, `latest`. The caller
job needs `contents: read` and `packages: write`. `home-assistant: true` adds
the `io.hass.type`, `io.hass.arch` and `io.hass.version` labels the Supervisor
reads from a prebuilt app image. `push: false` only checks that both
architectures build, with no registry access, for pull requests. Call it once
per image; jobs are named `Image (amd64)`, `Image (arm64)` and `Manifest`.

To build from files an earlier job in the same run made, such as a release
archive, set `artifact-pattern` to the artifacts' name or a glob. They're
merged into one folder and passed to the build as the `artifact-context` build
context (default `artifact`), which replaces a Dockerfile stage of that name.
`smoke-test` takes trusted shell commands run against each architecture's image
before anything is pushed, with `IMAGE` naming a local copy of it.

`home-assistant-app-changelog.yml` copies a published stable release's notes to
the app's `changelog-path` on the default branch, where the Supervisor shows
them in the update dialog. Pass a `token` secret that can push there, such as a
fine-grained admin token with Contents write when a ruleset blocks
`GITHUB_TOKEN`. A failure only warns, so it never fails the release. The job is
named `Changelog`.

`home-assistant-app-dispatch.yml` sends a published stable release's repository
and tag to a shared Home Assistant app repository as a `repository_dispatch`
(`event-type`, default `app-release`), so that repository can copy the app
folder from the tag. Call it after the image is pushed, and pass the shared
repository as `repository` and a `token` secret with Contents write on it, which
GitHub requires to send a dispatch. The job is named `Dispatch`.

`lint-arch-pkgbuild.yml` runs namcap in an Arch container over the files or
directories listed in `pkgbuild-paths` (newline-separated, default `.scripts`).
Directories are searched for `PKGBUILD*`. Paths must stay inside the workspace
and the lint fails when nothing is found. Any namcap output fails the lint;
`exclude-rules` takes a comma-separated list of namcap rules to skip, for
example `redundant_makedepends` when a VCS package also needs `git` at runtime.

`release-bun-cli-linux.yml` accepts two opt-in inputs. `attest: true` attests
the release binaries and packages and uploads
`<package-name or binary-name>-<version>.sigstore.json`; the calling job then
needs `contents: write`, `id-token: write` and `attestations: write`.
`version-define` names a `bun build --define` key that receives the release
version.

`publish-npm-package.yml` and `publish-jsr-package.yml` check that the release
tag matches the committed `package.json` and `jsr.json` versions. For a package
that commits a placeholder version and takes its version from the tag, set
`version-from-release-tag: true` to write the tag into both files first. The JSR
workflow then publishes with `--allow-dirty`, since those files are left
modified.

`publish-android-release.yml` builds an existing release's tag with mise and
the caller's `build-command`, signs it with the `ANDROID_KEYSTORE_*` and
`ANDROID_KEY_*` secrets, attaches `<asset-name>-<tag>.apk` to the release and
adds it to the shared F-Droid repository on R2 (`R2_*` secrets), using the
caller's `fdroid-directory` for its `config.yml` and listing. Without the
signing secrets it skips with a notice, and without the R2 secrets it attaches
the APK and skips F-Droid. It installs fdroidserver in a virtual environment
from the runner's Python rather than with mise, as fdroidserver ships only as
source and can't be locked. Because it builds
the tag, a caller can run it again for a release that's already out, such as
from `workflow_dispatch`. The calling job needs `contents: write`, and the job
is named `Publish`.

`attach-release-arch-package.yml` takes the artifact produced by
`build-arch-package.yml`, attests the package and uploads it with its bundle to
an existing release through the `publish-release-assets` action. Its caller
needs the same permissions as above.

The `prepare-arch-bin` action renders a `-bin` PKGBUILD from a release: it
downloads `SHA256SUMS`, fills `pkgver` and the checksums in a template, and can
generate shell completions from the released binary; completions download the
x86_64 tarball, verify its checksum and run it, so they need an x86_64 runner. `publish-release-assets`
attests files and uploads them to a release.

`build-python-pypi-release.yml` must be called from a workflow triggered by a
published stable GitHub Release. The release tag must point to source that
already declares the same stable PEP 440 version. The workflow validates the
source and built distributions, then exposes the artifact name to a publishing
job in the caller repository. PyPI Trusted Publishing does not currently
support reusable workflows, so the caller must download that artifact and
publish it with `id-token: write`. The shared workflow does not accept package
index credentials or modify the source repository.

`build-arch-package.yml` builds only package and repository pairs listed in the
public `timmo001/arch-repo` allowlist on its `main` branch, and the protected
publisher checks them again before signing. Its
`ARCH_REPO_DISPATCH_TOKEN` secret must be a fine-grained token selected only for
`timmo001/arch-repo`, with Contents write permission. The protected publisher
uses a separate `SOURCE_ARTIFACT_TOKEN`, selected only for source repositories
and granted Actions read and Deployments read and write permissions. Build jobs
never receive either token or the publisher's signing and R2 credentials.

`.github/actions/arch-source-deployment` lets the `timmo001/arch-repo`
publisher record each publication as a deployment on the source repository at
the published commit. The `start` stage creates the deployment and marks it in
progress, linked to the publish run; the `finish` stage records success, with a
link to the package file, or failure. Each package gets its own environment,
`arch-git/<package>` for `-git` packages and `arch-bin/<package>` otherwise, so
a new publish only supersedes earlier deployments of the same package. Pass a
token with Deployments write permission on the source repositories as
`GH_TOKEN`.

`.github/actions/attest-release-assets` is a step-level action rather than a
reusable workflow. Run it in the job that already holds the final files, before
they are published:

<!-- markdownlint-disable MD013 -->

```yaml
permissions:
  contents: write # only if the job also uploads release assets
  id-token: write
  attestations: write
steps:
  - id: attest
    uses: timmo001/workflows/.github/actions/attest-release-assets@<sha> # master
    with:
      subject-patterns: |
        dist/*.deb
        dist/*-setup.exe
      bundle-path: dist/my-app.sigstore.json
```

<!-- markdownlint-enable MD013 -->

Each pattern must match exactly one regular file inside the workspace, and file
names must be unique, so a missing or extra file fails the job. All files are
covered by one SLSA build provenance attestation from `actions/attest`, stored
against the calling repository. The `subjects` output lists the attested paths
so the caller can upload that same set. The action does not create, edit or
upload releases. It runs in the caller's job, so the signer identity is the
calling workflow, and it makes no SLSA Build Level 3 claim. Verify with
`gh attestation verify <file> --repo <owner>/<repo>`, adding
`--bundle <path>` to check against a downloaded bundle.

## Alchemy deploys

`deploy-alchemy.yml` deploys an Alchemy stack to Cloudflare by running one of
the caller's mise tasks (`task`, default `deploy`), so the task stays the one
place that builds the stack and runs `alchemy deploy`. It works for a docs site
and for an app Worker with its D1 and R2 bindings alike, so there's one
workflow rather than a docs and an app version that would only differ in the
task name. It checks out the full history (`fetch-depth`, default `0`, as Blume
reads last-modified dates from git), installs only `install-args` with mise
(default `bun node`) and sets `stage` (default `prod`) as `ALCHEMY_STAGE`,
which a task that passes `--stage` itself overrides. `timeout-minutes` defaults
to 20.

Pass `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` as secrets, usually
written to the repository by its own `stacks/github.ts` stack. Keep that stack
out of CI.

Values the stack reads at deploy time, such as a Worker's vars and secrets
(`Config.string`, `Config.redacted`), go in `env` (plain) and the `SECRET_ENV`
secret (masked), one `NAME=value` per line. They're set for the deploy step
only. Names the workflow sets itself, such as `CLOUDFLARE_*`, `ALCHEMY_STAGE`,
`GITHUB_*` and `MISE_*`, are refused. Reusable workflows can't take secrets by
arbitrary names, so `SECRET_ENV` gathers them; build it from the caller's own
secrets:

<!-- markdownlint-disable MD013 -->

```yaml
    with:
      env: |
        PUBLIC_URL=https://events.example.dev
    secrets:
      CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
      CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      SECRET_ENV: |
        WEBHOOK_SECRET=${{ secrets.WEBHOOK_SECRET }}
```

<!-- markdownlint-enable MD013 -->

`smoke-check` takes `<url> <expected status>` pairs, one per line, checked
after the deploy by the `smoke-check` action. Each is retried every 5 seconds
until it matches or `smoke-check-seconds` (default 120) runs out, as a new
custom domain can return 500s for a minute after its first deploy. Redirects
aren't followed, so a redirect Worker can be checked for its `301`.

The caller keeps the triggers, path filters and concurrency. Deploys should
queue rather than cancel, so a stack update never stops halfway: use one
concurrency group per stage, shared by every workflow that changes it, with
`cancel-in-progress: false`. The job is named `Deploy`, so its check context is
`<caller job id> / Deploy`.

<!-- markdownlint-disable MD013 -->

```yaml
name: Deploy

on:
  push:
    branches:
      - main
    paths:
      - .github/workflows/deploy.yml
      - alchemy.run.ts
      - bun.lock
      - mise.toml
  workflow_dispatch: {}

concurrency:
  group: alchemy-prod
  cancel-in-progress: false

permissions:
  contents: read

jobs:
  deploy:
    uses: timmo001/workflows/.github/workflows/deploy-alchemy.yml@<sha> # master
    with:
      task: docs:deploy
      smoke-check: |
        https://example.timmo.dev 200
    secrets:
      CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
      CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

<!-- markdownlint-enable MD013 -->

These are placeholders that fail without doing anything. Their inputs and
secrets are set out, but they aren't ready to call:

- `plan-alchemy.yml` (job `Plan`): runs a plan task, such as a pull request
  check. It needs a decision on keeping the Cloudflare token away from pull
  request code first.
- `deploy-alchemy-preview.yml` (job `Deploy preview`): deploys a pull request
  to its own stage, `pr-<number>` by default.
- `destroy-alchemy-preview.yml` (job `Destroy preview`): destroys that stage
  when the pull request closes. Retained resources, such as D1 databases and R2
  buckets with `RemovalPolicy.retain()`, stay behind unless the stack retains
  them only on prod. Prod is never destroyed from CI.

## Cloudflare actions

Step-level actions for jobs that publish to Cloudflare outside an Alchemy
stack, such as a package repository on R2. Each is called as
`uses: timmo001/workflows/.github/actions/<name>@<sha> # master`.

`smoke-check` checks that URLs return an expected status, retrying until a
shared time limit. `checks` takes one `<url> <status>` pair per line;
`timeout-seconds` (default 120) and `interval-seconds` (default 5) set the
retries. Redirects aren't followed. `Jtalk/url-health-check-action` only
checks for success, so it can't expect a `301` or a `404`.

`r2-objects` runs `aws s3 sync`, `cp` or `rm` (`command`) against an R2 bucket
with the aws CLI the runner image ships, so sync keeps aws's own comparison
and filter rules. `direction` is `up` (default) or `down`; `local-path` is the
file or directory and `remote-path` the key or prefix in the bucket. `delete`
(sync), `recursive` (cp and rm), `cache-control` (uploads) and `filters` (one
`include <pattern>` or `exclude <pattern>` per line, in aws's order) are
optional. Pass `account-id`, `access-key-id`, `secret-access-key` and `bucket`
from the caller's `R2_*` secrets. The marketplace R2 actions only upload, with
no download, sync, delete or filters.

<!-- markdownlint-disable MD013 -->

```yaml
- uses: timmo001/workflows/.github/actions/r2-objects@<sha> # master
  with:
    command: sync
    local-path: repo/
    remote-path: repo/
    filters: |
      exclude *
      include *.apk
    cache-control: public, max-age=31536000, immutable
    account-id: ${{ secrets.R2_ACCOUNT_ID }}
    access-key-id: ${{ secrets.R2_ACCESS_KEY_ID }}
    secret-access-key: ${{ secrets.R2_SECRET_ACCESS_KEY }}
    bucket: ${{ secrets.R2_BUCKET }}
```

<!-- markdownlint-enable MD013 -->

`cloudflare-purge-cache` purges `files`, one absolute URL per line, from a
zone's cache in batches of 30, and fails with Cloudflare's errors when the
purge is refused. Pass `zone-id` and an `api-token` with Zone > Cache Purge.
The marketplace purge actions are Docker actions with few users, and the API
call is small enough to own rather than hand a zone token to.

`checkout-mise` is a composite action that checks out the caller's repository
without persisting credentials (`fetch-depth`, default `1`) and installs its
mise tools (`install-args`, default every tool) from `working-directory`
(default `.`). `deploy-alchemy.yml`, `run-mise-task.yml`, `check-docs.yml` and
`build-android.yml` use it, and so will the Alchemy placeholders.

## mise project jobs

Jobs that repeat across projects whose tasks live in `mise.toml`. Each keeps
the task as the one place that says what the job does, and the caller keeps
its triggers, path filters and concurrency.

`run-mise-task.yml` checks out the repository, installs its mise tools and runs
`mise run <task>`. `task` is required and takes several tasks the way
`mise run` does, such as `check ::: test`, which run in parallel. `smoke-test`
takes trusted shell commands run afterwards, such as a built CLI's `--help`.
`install-args` (default every tool), `working-directory` (default `.`),
`fetch-depth` (default `1`) and `timeout-minutes` (default 30) are optional.
The job is named after `name`, or the task when that's empty, so its check
context is `<caller job id> / <name>`. Call it once per job, such as a `check`
and a `test` job.

<!-- markdownlint-disable MD013 -->

```yaml
jobs:
  smoke:
    uses: timmo001/workflows/.github/workflows/run-mise-task.yml@<sha> # master
    with:
      name: CLI smoke check
      task: build
      smoke-test: bun dist/index.js --help
```

<!-- markdownlint-enable MD013 -->

`check-docs.yml` checks a docs site whose pages are partly generated, such as
a command or MCP tool reference. It runs `generate-task` (default `docs:gen`),
fails if that changed or added files under `generated-paths` (one per line;
empty checks the whole working tree), then runs `task` (default `docs:build`,
such as `docs:check ::: docs:build`) and any `extra-checks` commands from the
repository root. An empty `generate-task` skips the regenerate and its check.
It checks out the full history for Blume (`fetch-depth`, default `0`). The job
is named `Docs`.

<!-- markdownlint-disable MD013 -->

```yaml
jobs:
  docs:
    uses: timmo001/workflows/.github/workflows/check-docs.yml@<sha> # master
    with:
      generated-paths: |
        docs/src/content/docs/commands
        docs/commands-sidebar.json
      extra-checks: cd docs && bun run --parallel --no-exit-on-error check validate
```

<!-- markdownlint-enable MD013 -->

`build-android.yml` builds an Android app for pull requests and uploads its
APKs. Its inputs match `publish-android-release.yml`'s, so the two jobs read
alike: `working-directory`, `mise-install-args`, `setup-command`,
`build-command` (required), plus `apk-directory` (required), the APK folder
uploaded as `artifact-name` (default `android-apk`). The job is named `Build`.

`publish-aur.yml` can prepare its own files: set `prepare-command` to a trusted
command that writes the final AUR files to `$AUR_PACKAGE_DIR` from the full
git history, such as `.scripts/linux/prepare-aur.sh "$AUR_PACKAGE_DIR"`, and
leave `artifact-name` empty. `prepare-mise: true` installs the repository's
mise tools first. The extra job is named `Prepare AUR package`; callers that
pass `artifact-name` skip it.

## Omarchy plugins

`validate-omarchy-plugin.yml` runs Omarchy's `bin/omarchy-plugin-validate`
over `plugin-directory` (default `.`) and lints the directory's QML with
`qmllint`, in the pinned `archlinux` image with Arch's Quickshell and Qt.
`omarchy-repository` (default `omacom/omarchy`) and `omarchy-ref` (default
`quattro`) choose the validator. `qmllint-args` defaults to
`--import disable --unqualified disable`; pass `""` to lint strictly. The job
is named `Validate plugin`.

`publish-omarchy-plugin.yml` copies a plugin to its own publish repository and
commits `Publish from <repository>@<sha>` when anything changed. Only files git
tracks in `plugin-directory` (required) are published, so stray build output
never is, plus the repository's `LICENSE` unless the plugin has its own. The
directory must be flat, with no links, and the manifest's entry points must be
among its files. Pass `publish-repository` and a `DEPLOY_KEY` or `PUSH_TOKEN`
secret that can push to it. The `commit` output is the pushed SHA, or empty
when nothing changed. The job is named `Publish plugin`. The
`stage-omarchy-plugin` action does the copying and can be used on its own.

<!-- markdownlint-disable MD013 -->

```yaml
jobs:
  validate:
    uses: timmo001/workflows/.github/workflows/validate-omarchy-plugin.yml@<sha> # master
    with:
      plugin-directory: omarchy-plugin
  publish:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: validate
    uses: timmo001/workflows/.github/workflows/publish-omarchy-plugin.yml@<sha> # master
    with:
      plugin-directory: omarchy-plugin
      publish-repository: timmo001/omarchy-notes
    secrets:
      DEPLOY_KEY: ${{ secrets.OMARCHY_PLUGIN_DEPLOY_KEY }}
```

<!-- markdownlint-enable MD013 -->

## Container images for several targets

`build-container-image.yml` builds one image per call. A Dockerfile with
several published targets, such as a server image and a Home Assistant app
image, calls it once per target with its own `image` and `target`. Digest
artifacts are keyed by image, so the calls don't clash.
