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
