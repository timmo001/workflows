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

## Bun CLI releases

`release-bun-cli-linux.yml` compiles Bun CLIs for x86_64 and aarch64, then
publishes tarballs, Debian packages, RPM packages and `SHA256SUMS`. The caller
owns its nFPM configuration and any package preparation commands:

```yaml
jobs:
  release:
    permissions:
      contents: write
    uses: timmo001/workflows/.github/workflows/release-bun-cli-linux.yml@<full-sha>
    with:
      binary-name: example
      entrypoint: src/index.ts
      package-config: .scripts/linux/nfpm.yaml
      smoke-test-arguments: |-
        help
        root
      package-prepare-command: >-
        ./dist/release/root/example completions bash > example.bash
```

`smoke-test-arguments` and `package-prepare-command` are trusted caller
configuration. Do not populate them from pull request content.

## AUR publication

Callers prepare and upload their final PKGBUILD and auxiliary files before
calling `publish-aur.yml`. The workflow builds the package, generates
`.SRCINFO`, verifies a checksummed manifest and publishes only the validated
files:

```yaml
jobs:
  publish:
    permissions:
      contents: read
    uses: timmo001/workflows/.github/workflows/publish-aur.yml@<full-sha>
    with:
      package-name: example-bin
      artifact-name: >-
        aur-example-bin-${{ github.run_id }}-${{ github.run_attempt }}
      auxiliary-file-paths: |-
        example.bash
        example.fish
        _example
        LICENSE
    secrets:
      AUR_SSH_PRIVATE_KEY: ${{ secrets.AUR_SSH_PRIVATE_KEY }}
```

The same contract supports source-backed `-git` packages when the uploaded
artifact contains only a prepared `PKGBUILD`.

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
