---
name: workflows-bump-consumers
description: Bump the timmo001/workflows pins in consuming repositories to a release with `mise run bump-consumers`. Use after publishing a timmo001/workflows release when asked to bump, update or roll out the new release to consumers, instead of waiting for Renovate or editing each repository by hand.
---

# Bump consumers

`scripts/bump-consumers.ts` rewrites every
`timmo001/workflows/.github/{workflows,actions}/...@<sha> # <tag>` pin under a
consumer's `.github/` to the release's commit SHA and tag.

## Run it

```bash
mise run bump-consumers                  # dry run against the latest release
mise run bump-consumers -- --push        # commit and push each repository
```

- `--to <tag>` pins an earlier or specific release instead of the latest.
- `--repo <owner/repo>` limits the run to named repositories; repeat it.
- `--owner <login>` changes whose repositories code search covers (default
  `timmo001`).
- `--concurrency <n>` sets how many repositories run at once (default 8).

Discovery uses GitHub code search, so it covers default branches only and
skips archived repositories and forks. Work happens in clean clones under
`$XDG_CACHE_HOME/workflows-bump-consumers`, never in local checkouts, so pull
those afterwards.

## Order

1. Publish the release and wait for its CI first; the script resolves the tag
   through the GitHub API.
2. Dry run and report which repositories would change.
3. Run with `--push` only when the user has asked for the push. It commits
   through `dot git-commit` with `Update timmo001/workflows to <tag>` and pushes
   to each default branch.
4. A failed repository doesn't stop the run; the summary counts it and the
   command exits non-zero. Rerun with `--repo` for just the failures.

Call out releases that rename jobs or change inputs: consumers' required
checks or callers may need changes the pin bump doesn't make.
