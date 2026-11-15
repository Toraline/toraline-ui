#!/usr/bin/env bash
# Read one value of the project profile (the table in AGENTS.md).
# Usage: scripts/profile.sh get <key> [default]
set -euo pipefail

root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
# In a worktree, AGENTS.md of the worktree is used; it is the same file.
file="$root/AGENTS.md"

[ "${1:-}" = "get" ] && [ -n "${2:-}" ] || { echo "Usage: scripts/profile.sh get <key> [default]" >&2; exit 2; }
key="$2"; default="${3:-}"

value=""
if [ -f "$file" ]; then
  value="$(awk -F'|' -v k="$key" '
    { gsub(/^[ \t]+|[ \t]+$/, "", $2); gsub(/`/, "", $2) }
    $2 == k { v = $3; gsub(/^[ \t]+|[ \t]+$/, "", v); gsub(/`/, "", v); print v; exit }
  ' "$file")"
fi

case "$value" in
  ""|"<ask>"*) printf '%s\n' "$default" ;;
  *) printf '%s\n' "$value" ;;
esac
