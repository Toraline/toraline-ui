#!/usr/bin/env bash
# Checks the machine and the project. Each failure prints its fix.
set -uo pipefail
root="$(git rev-parse --show-toplevel)"; cd "$root"
fail=0
ok()   { echo "OK      $*"; }
warn() { echo "WARNING $*"; }
bad()  { echo "FAIL    $*"; fail=1; }

echo "=== doctor: $(basename "$root") ==="

# Node
if [ -f .nvmrc ]; then
  want="$(tr -d 'v \n' < .nvmrc)"
  if command -v node >/dev/null 2>&1; then
    have="$(node -p 'process.versions.node')"
    case "$have" in "$want"*) ok "Node v$have" ;; *) bad "Node v$have, the project uses v$want (.nvmrc). Fix: nvm install && nvm use" ;; esac
  else bad "Node not found. Fix: install nvm, then: nvm install"; fi
fi

# .env
if [ -f .env.example ]; then
  if [ -f .env ]; then
    missing="$(grep -oE '^[A-Z0-9_]+=' .env.example | tr -d '=' | while read -r k; do grep -qE "^$k=" .env || printf '%s ' "$k"; done)"
    [ -z "$missing" ] && ok ".env has every key of .env.example" || warn ".env is missing: $missing"
  else warn ".env does not exist. Fix: cp .env.example .env"; fi
fi

# GitHub
if ! command -v gh >/dev/null 2>&1; then warn "GitHub CLI not found. Fix: brew install gh && gh auth login"
elif gh auth status >/dev/null 2>&1; then ok "GitHub CLI signed in"
else warn "GitHub CLI not signed in. Fix: gh auth login"; fi

# Linear
if grep -qs 'mcp.linear.app' .mcp.json; then ok "Linear for Claude Code (.mcp.json). Sign in inside Claude Code the first time."
else warn "Linear is not in .mcp.json"; fi
if grep -qs 'mcp.linear.app' .cursor/mcp.json; then ok "Linear for Cursor (.cursor/mcp.json). Sign in: Cursor Settings > MCP > linear"
else warn "Linear is not in .cursor/mcp.json"; fi

# Skills: one folder, linked for both tools
for tool in .claude .cursor; do
  if [ -L "$tool/skills" ] && [ -d "$tool/skills" ]; then ok "$tool/skills links to agent/skills"
  else bad "$tool/skills is not a link to agent/skills. Fix: make sync-skills"; fi
done
count="$(find agent/skills -maxdepth 2 -name SKILL.md 2>/dev/null | wc -l | tr -d ' ')"
[ "$count" -gt 0 ] && ok "$count skills in agent/skills" || bad "no skills in agent/skills. Fix: make sync-skills"

# Core version
src="${BOILERPLATE_DIR:-$HOME/code/repos/monorepo-boilerplate}"
mine="$(cat agent/CORE_VERSION 2>/dev/null || echo none)"
if [ -f "$src/agent/CORE_VERSION" ] && [ "$(cd "$src" && pwd)" != "$root" ]; then
  theirs="$(cat "$src/agent/CORE_VERSION")"
  [ "$mine" = "$theirs" ] && ok "core $mine (same as the boilerplate)" || warn "core $mine, the boilerplate has $theirs. Fix: make sync-skills"
else ok "core $mine"; fi

# Profile
for key in ticket_prefix base_branch push finished_status; do
  v="$(bash scripts/profile.sh get "$key")"
  [ -n "$v" ] && ok "profile $key = $v" || warn "profile $key is not set in AGENTS.md. Fix: run the start skill"
done

# Hooks
[ "$(git config core.hooksPath || true)" = ".githooks" ] && ok "secret check runs before each commit" || warn "secret check is off. Fix: make hooks"

# local-docs
[ -d local-docs/notes ] && ok "local-docs/notes exists" || warn "local-docs is missing. Fix: make local-docs"

# Worktrees
wt="$(git worktree list --porcelain 2>/dev/null | grep -c '^worktree ')"
[ "$wt" -ge 20 ] && warn "$wt worktrees. Remove the finished ones: make worktree-remove TICKET=<n>" || ok "$wt worktree(s)"

echo
[ "$fail" -eq 0 ] && echo "All required checks passed." || echo "Fix the FAIL lines above and run make doctor again."
exit "$fail"
