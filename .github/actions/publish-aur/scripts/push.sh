#!/usr/bin/env bash
set -euo pipefail

ssh_root="$(mktemp -d)"
trap 'rm -rf -- "$ssh_root"' EXIT
chmod 0700 "$ssh_root"
printf '%s\n' "$AUR_SSH_PRIVATE_KEY" > "$ssh_root/private_key"
chmod 0600 "$ssh_root/private_key"

# Ed25519 host key published at https://aur.archlinux.org.
printf '%s\n' \
  'aur.archlinux.org ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEuBKrPzbawxA/k2g6NcyV5jmqwJ2s+zpgZGZ7tpLIcN' \
  > "$ssh_root/known_hosts"

git -C "$AUR_ROOT" remote set-url origin "ssh://aur@aur.archlinux.org/${PACKAGE_NAME}.git"
GIT_SSH_COMMAND="ssh -i $ssh_root/private_key -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o CheckHostIP=no -o UserKnownHostsFile=$ssh_root/known_hosts" \
  git -C "$AUR_ROOT" push origin HEAD:master
