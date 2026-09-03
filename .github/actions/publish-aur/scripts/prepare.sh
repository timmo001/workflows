#!/usr/bin/env bash
set -euo pipefail

git -c init.defaultBranch=master clone "$AUR_CLONE_URL" "$AUR_ROOT"

declare -a managed_paths=()
while IFS= read -r path || [[ -n "$path" ]]; do
  mkdir -p -- "$AUR_ROOT/$(dirname -- "$path")"
  rm -f -- "$AUR_ROOT/$path"
  cp --no-dereference -- "$VALIDATED_ROOT/$path" "$AUR_ROOT/$path"
  managed_paths+=("$path")
done < "$VALIDATED_ROOT/MANIFEST"

git -C "$AUR_ROOT" --literal-pathspecs add -f -- "${managed_paths[@]}"
if git -C "$AUR_ROOT" diff --cached --quiet --exit-code; then
  echo "changed=false" >> "$GITHUB_OUTPUT"
  echo "No AUR package changes to publish."
  exit 0
fi

git -C "$AUR_ROOT" config user.name "GitHub Actions"
git -C "$AUR_ROOT" config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git -C "$AUR_ROOT" commit -m "Update package metadata"
echo "changed=true" >> "$GITHUB_OUTPUT"
