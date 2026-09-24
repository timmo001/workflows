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
`sync-action-bundles.yml` rebuilds `dist` and either commits it to the open
pull request or opens an automerging pull request on `master`.
`validate-actions.yml` still fails if a committed bundle is out of date.

## Scope

The collection includes reusable workflows for:

- Building Node.js, Python, .NET and container projects
- Linting source code, configuration and documentation
- Running tests, dependency reviews and CodeQL analysis
- Preparing stable Python distributions from immutable release source
- Building allowlisted Arch packages from exact source commits
- Building and releasing Home Assistant cards and command-line tools
- Managing dependency updates, labels, stale items and releases

These workflows reflect the requirements of my projects. Review the workflow
contract and implementation before using one elsewhere, particularly its
permissions, runner assumptions and expected project files.

`lint-oxlint.yml` installs a Bun project's locked dependencies and runs its
`lint` script. The caller owns its Oxlint config, rule packages and warning
policy. The workflow sets up Node.js for JavaScript plugins and supports a
package directory through `code-path`.

`build-python-pypi-release.yml` must be called from a workflow triggered by a
published stable GitHub Release. The release tag must point to source that
already declares the same stable PEP 440 version. The workflow validates the
source and built distributions, then exposes the artifact name to a publishing
job in the caller repository. PyPI Trusted Publishing does not currently
support reusable workflows, so the caller must download that artifact and
publish it with `id-token: write`. The shared workflow does not accept package
index credentials or modify the source repository.

`build-arch-package.yml` builds only package and repository pairs pinned in the
public `timmo001/arch-repo` allowlist revision embedded in the workflow. Its
`ARCH_REPO_DISPATCH_TOKEN` secret must be a fine-grained token selected only for
`timmo001/arch-repo`, with Contents write permission. The protected publisher
uses a separate `SOURCE_ARTIFACT_TOKEN`, selected only for source repositories
and granted Actions read permission. Build jobs never receive either token or
the publisher's signing and R2 credentials.

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
