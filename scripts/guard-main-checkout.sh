#!/usr/bin/env bash
# Blocks git commands that change the main checkout, when the project profile
# says main_checkout is "protected". Work happens in one worktree per ticket.
#
# Claude Code runs this as a PreToolUse hook for the Bash tool (.claude/settings.json).
# It reads the hook's JSON from stdin. Exit code 2 blocks the command and shows the message.
# By hand: echo '{"cwd":"'"$PWD"'","tool_input":{"command":"git commit -m x"}}' | scripts/guard-main-checkout.sh
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
input="$(cat)"

read_json() {
  printf '%s' "$input" | python3 -I -c '
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(0)
print(d.get("cwd", "") or "")
print((d.get("tool_input") or {}).get("command", "") or "")
' 2>/dev/null
}

out="$(read_json)"
cwd="$(printf '%s\n' "$out" | sed -n '1p')"
cmd="$(printf '%s\n' "$out" | sed -n '2,$p')"
[ -n "$cmd" ] || exit 0

# Only git commands that change the checkout.
printf '%s' "$cmd" | grep -Eq '(^|[;&|[:space:]])git([[:space:]]+-C[[:space:]]+[^[:space:]]+)?[[:space:]]+(add|commit|switch|checkout|stash|reset)([[:space:]]|$)' || exit 0

# Where the command runs: "git -C <dir>" wins, then "cd <dir> &&", then the hook's cwd.
dir="$(printf '%s' "$cmd" | sed -nE 's/.*git[[:space:]]+-C[[:space:]]+("([^"]+)"|([^[:space:]]+)).*/\2\3/p' | head -1)"
[ -n "$dir" ] || dir="$(printf '%s' "$cmd" | sed -nE 's/^[[:space:]]*cd[[:space:]]+("([^"]+)"|([^[:space:];&]+)).*/\2\3/p' | head -1)"
[ -n "$dir" ] || dir="${cwd:-$PWD}"
case "$dir" in /*) ;; *) dir="${cwd:-$PWD}/$dir" ;; esac
[ -d "$dir" ] || exit 0

top="$(git -C "$dir" rev-parse --show-toplevel 2>/dev/null)" || exit 0
gitdir="$(git -C "$dir" rev-parse --path-format=absolute --git-dir 2>/dev/null)"
common="$(git -C "$dir" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)"
[ "$gitdir" = "$common" ] || exit 0   # a worktree: allowed

mode="$(cd "$top" && bash "$HERE/profile.sh" get main_checkout open 2>/dev/null)"
[ "$mode" = "protected" ] || exit 0

# A repository with no commit yet has no worktrees to use.
git -C "$top" rev-parse --verify -q HEAD >/dev/null || exit 0

echo "Blocked: this command changes the main checkout ($top), and the project profile says main_checkout is protected." >&2
echo "Work in the ticket's worktree instead: make worktree TICKET=<n> SLUG=<short-slug>" >&2
exit 2
