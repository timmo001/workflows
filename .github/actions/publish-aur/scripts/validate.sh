#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "::error::$1"
  exit 1
}

validate_path() {
  local path="$1"

  [[ -n "$path" ]] || fail "Package file paths must not be empty."
  [[ "$path" != /* ]] || fail "Package file paths must be relative: $path"
  [[ ! "$path" =~ (^|/)\.\.?(/|$) ]] || fail "Package file paths must not contain dot segments: $path"
  [[ ! "$path" =~ (^|/)\.git(/|$) ]] || fail "Package file paths must not contain .git: $path"
  [[ ! "$path" =~ [[:cntrl:]] ]] || fail "Package file paths must not contain control characters."
}

resolve_file() {
  local path="$1"
  local resolved

  validate_path "$path"
  [[ -f "$ARTIFACT_ROOT/$path" && ! -L "$ARTIFACT_ROOT/$path" ]] || fail "Package file is missing or is not a regular file: $path"
  resolved="$(realpath -e -- "$ARTIFACT_ROOT/$path")"
  [[ "$resolved" == "$ARTIFACT_ROOT"/* ]] || fail "Package file resolves outside the artifact: $path"
  printf '%s\n' "$resolved"
}

copy_file() {
  local source="$1"
  local relative="$2"
  local destination_root="$3"

  mkdir -p -- "$destination_root/$(dirname -- "$relative")"
  cp -- "$source" "$destination_root/$relative"
}

trap 'rm -rf -- "${build_root:-}" "${srcinfo_root:-}"; rm -f -- "${dependency_srcinfo:-}" "${makepkg_script:-}" "${srcinfo_script:-}"' EXIT

[[ "$PACKAGE_NAME" =~ ^[a-z0-9@_+][a-z0-9@._+-]*$ ]] || fail "Invalid Arch package base: $PACKAGE_NAME"

ARTIFACT_ROOT="$(realpath -e -- "$ARTIFACT_ROOT")"
pkgbuild_source="$(resolve_file "$PKGBUILD_PATH")"
declare -A managed_paths=([PKGBUILD]=1)
declare -a auxiliary_paths=()
declare -a auxiliary_sources=()

while IFS= read -r path || [[ -n "$path" ]]; do
  [[ -n "$path" ]] || continue
  validate_path "$path"
  case "$path" in
    PKGBUILD | */PKGBUILD | .SRCINFO | */.SRCINFO | MANIFEST | CHECKSUMS)
      fail "Reserved auxiliary file path: $path"
      ;;
  esac
  case "$path" in
    */*)
      [[ "$path" =~ ^keys/pgp/[^/]+\.asc$ || "$path" =~ ^LICENSES/[^/]+$ ]] \
        || fail "Unsupported AUR auxiliary file path: $path"
      ;;
  esac
  [[ -z "${managed_paths[$path]+x}" ]] || fail "Duplicate package file path: $path"
  managed_paths["$path"]=1
  auxiliary_paths+=("$path")
  auxiliary_sources+=("$(resolve_file "$path")")
done <<< "$AUXILIARY_FILE_PATHS"

for command in awk cut find git gpg makepkg pacman pacman-conf realpath runuser sed sha256sum useradd; do
  command -v "$command" >/dev/null || fail "The Arch image does not provide $command."
done

build_root="$(mktemp -d)"
copy_file "$pkgbuild_source" PKGBUILD "$build_root"
for index in "${!auxiliary_paths[@]}"; do
  copy_file "${auxiliary_sources[$index]}" "${auxiliary_paths[$index]}" "$build_root"
done

dependency_srcinfo="$(mktemp)"
srcinfo_script="$(mktemp)"
cat > "$srcinfo_script" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
cd "$1"
makepkg --printsrcinfo
EOF
chmod 0755 "$srcinfo_script"
id -u aurbuild >/dev/null 2>&1 && fail "The Arch image must not define the aurbuild user."
useradd -m -s /bin/bash aurbuild
chown -R aurbuild:aurbuild "$build_root"
env -u MISE_CACHE_DIR -u MISE_DATA_DIR -u MISE_INSTALL_PATH \
  PATH=/usr/local/sbin:/usr/local/bin:/usr/bin \
  runuser -u aurbuild -- "$srcinfo_script" "$build_root" > "$dependency_srcinfo"
build_architecture="$(pacman-conf Architecture)"
mapfile -t package_dependencies < <(
  awk -v architecture="$build_architecture" '
    /^[^[:space:]]/ { in_pkgbase = 0 }
    $1 == "pkgbase" { in_pkgbase = 1 }
    in_pkgbase && ($1 == "depends" || $1 == "makedepends" || $1 == "checkdepends" ||
      $1 == "depends_" architecture || $1 == "makedepends_" architecture ||
      $1 == "checkdepends_" architecture) { dependencies[$3] = 1 }
    END { for (dependency in dependencies) print dependency }
  ' "$dependency_srcinfo"
)
rm -f -- "$dependency_srcinfo"
if ((${#package_dependencies[@]})); then
  mapfile -t missing_dependencies < <(pacman -T -- "${package_dependencies[@]}" || :)
  if ((${#missing_dependencies[@]})); then
    pacman -Syu --needed --noconfirm --asdeps -- "${missing_dependencies[@]}"
  fi
fi

if [[ -d "$build_root/keys/pgp" ]]; then
  while IFS= read -r -d '' key; do
    env -u MISE_CACHE_DIR -u MISE_DATA_DIR -u MISE_INSTALL_PATH \
      PATH=/usr/local/sbin:/usr/local/bin:/usr/bin \
      runuser -u aurbuild -- gpg --batch --import "$key"
  done < <(find "$build_root/keys/pgp" -maxdepth 1 -type f -name '*.asc' -print0)
fi

makepkg_script="$(mktemp)"
cat > "$makepkg_script" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
cd "$1"
makepkg --syncdeps --noconfirm
EOF
chmod 0755 "$makepkg_script"
env -u MISE_CACHE_DIR -u MISE_DATA_DIR -u MISE_INSTALL_PATH \
  PATH=/usr/local/sbin:/usr/local/bin:/usr/bin \
  runuser -u aurbuild -- "$makepkg_script" "$build_root"
rm -f -- "$makepkg_script"

rm -rf -- "$VALIDATED_ROOT"
mkdir -p -- "$VALIDATED_ROOT"
copy_file "$pkgbuild_source" PKGBUILD "$VALIDATED_ROOT"
for index in "${!auxiliary_paths[@]}"; do
  copy_file "${auxiliary_sources[$index]}" "${auxiliary_paths[$index]}" "$VALIDATED_ROOT"
done

srcinfo_root="$(mktemp -d)"
cp -a -- "$VALIDATED_ROOT/." "$srcinfo_root/"
chown -R aurbuild:aurbuild "$srcinfo_root"
cat > "$srcinfo_script" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
cd "$1"
makepkg --printsrcinfo > .SRCINFO
EOF
chmod 0755 "$srcinfo_script"
env -u MISE_CACHE_DIR -u MISE_DATA_DIR -u MISE_INSTALL_PATH \
  PATH=/usr/local/sbin:/usr/local/bin:/usr/bin \
  runuser -u aurbuild -- "$srcinfo_script" "$srcinfo_root"
rm -f -- "$srcinfo_script"
cp -- "$srcinfo_root/.SRCINFO" "$VALIDATED_ROOT/.SRCINFO"

srcinfo_package="$(awk '$1 == "pkgbase" && $2 == "=" { print $3; exit }' "$VALIDATED_ROOT/.SRCINFO")"
[[ "$srcinfo_package" == "$PACKAGE_NAME" ]] || fail ".SRCINFO declares pkgbase '$srcinfo_package', expected '$PACKAGE_NAME'."

{
  printf 'PKGBUILD\n'
  if ((${#auxiliary_paths[@]})); then
    printf '%s\n' "${auxiliary_paths[@]}"
  fi
  printf '.SRCINFO\n'
} > "$VALIDATED_ROOT/MANIFEST"

: > "$VALIDATED_ROOT/CHECKSUMS"
while IFS= read -r path; do
  printf '%s\t%s\n' "$(sha256sum -- "$VALIDATED_ROOT/$path" | cut -d ' ' -f 1)" "$path" >> "$VALIDATED_ROOT/CHECKSUMS"
done < "$VALIDATED_ROOT/MANIFEST"
