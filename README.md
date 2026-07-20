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
- Building and releasing Home Assistant cards and command-line tools
- Managing dependency updates, labels, stale items and releases

These workflows reflect the requirements of my projects. Review the workflow
contract and implementation before using one elsewhere, particularly its
permissions, runner assumptions and expected project files.
