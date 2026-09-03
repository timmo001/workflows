#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "::error::$1"
  exit 1
}

validate_path() {
  local path="$1"

  [[ -n "$path" ]] || fail "Validated package file paths must not be empty."
  [[ "$path" != /* ]] || fail "Validated package file paths must be relative: $path"
  [[ ! "$path" =~ (^|/)\.\.?(/|$) ]] || fail "Validated package file paths must not contain dot segments: $path"
  [[ ! "$path" =~ (^|/)\.git(/|$) ]] || fail "Validated package file paths must not contain .git: $path"
  [[ ! "$path" =~ [[:cntrl:]] ]] || fail "Validated package file paths must not contain control characters."
}

[[ "$PACKAGE_NAME" =~ ^[a-z0-9@_+][a-z0-9@._+-]*$ ]] || fail "Invalid Arch package base: $PACKAGE_NAME"
[[ -f "$VALIDATED_ROOT/MANIFEST" && ! -L "$VALIDATED_ROOT/MANIFEST" ]] || fail "Validated package manifest is missing."
[[ -f "$VALIDATED_ROOT/CHECKSUMS" && ! -L "$VALIDATED_ROOT/CHECKSUMS" ]] || fail "Validated package checksums are missing."

VALIDATED_ROOT="$(realpath -e -- "$VALIDATED_ROOT")"
declare -A managed_paths=()
manifest_count=0
while IFS= read -r path || [[ -n "$path" ]]; do
  validate_path "$path"
  [[ "$path" != MANIFEST && "$path" != CHECKSUMS ]] || fail "Reserved path in validated package manifest: $path"
  case "$path" in
    PKGBUILD | .SRCINFO) ;;
    keys/pgp/*.asc | LICENSES/*)
      [[ "$path" != */*/*/* ]] || fail "Unsupported validated AUR file path: $path"
      ;;
    */*)
      fail "Unsupported validated AUR file path: $path"
      ;;
  esac
  [[ -z "${managed_paths[$path]+x}" ]] || fail "Duplicate validated package file path: $path"
  [[ -f "$VALIDATED_ROOT/$path" && ! -L "$VALIDATED_ROOT/$path" ]] || fail "Validated package file is missing or is not a regular file: $path"
  resolved="$(realpath -e -- "$VALIDATED_ROOT/$path")"
  [[ "$resolved" == "$VALIDATED_ROOT"/* ]] || fail "Validated package file resolves outside the artifact: $path"
  managed_paths["$path"]=1
  manifest_count=$((manifest_count + 1))
done < "$VALIDATED_ROOT/MANIFEST"

[[ -n "${managed_paths[PKGBUILD]+x}" ]] || fail "Validated package does not contain PKGBUILD."
[[ -n "${managed_paths[.SRCINFO]+x}" ]] || fail "Validated package does not contain .SRCINFO."

declare -A checksummed_paths=()
checksum_count=0
while IFS=$'\t' read -r expected path || [[ -n "$expected$path" ]]; do
  [[ "$expected" =~ ^[0-9a-f]{64}$ ]] || fail "Invalid validated package checksum."
  [[ -n "${managed_paths[$path]+x}" ]] || fail "Checksum references an unmanaged package file: $path"
  [[ -z "${checksummed_paths[$path]+x}" ]] || fail "Duplicate checksum for package file: $path"
  actual="$(sha256sum -- "$VALIDATED_ROOT/$path" | cut -d ' ' -f 1)"
  [[ "$actual" == "$expected" ]] || fail "Checksum mismatch for validated package file: $path"
  checksummed_paths["$path"]=1
  checksum_count=$((checksum_count + 1))
done < "$VALIDATED_ROOT/CHECKSUMS"
[[ "$checksum_count" -eq "$manifest_count" ]] || fail "Validated package checksum count does not match its manifest."

while IFS= read -r -d '' file; do
  relative="${file#"$VALIDATED_ROOT"/}"
  case "$relative" in
    MANIFEST | CHECKSUMS)
      continue
      ;;
  esac
  [[ -n "${managed_paths[$relative]+x}" ]] || fail "Undeclared file in validated package: $relative"
done < <(find "$VALIDATED_ROOT" -type f -print0)

symlink="$(find "$VALIDATED_ROOT" -type l -print -quit)"
[[ -z "$symlink" ]] || fail "Symlinks are not permitted in validated package artifacts."

srcinfo_package="$(awk '$1 == "pkgbase" && $2 == "=" { print $3; exit }' "$VALIDATED_ROOT/.SRCINFO")"
[[ "$srcinfo_package" == "$PACKAGE_NAME" ]] || fail ".SRCINFO declares pkgbase '$srcinfo_package', expected '$PACKAGE_NAME'."
