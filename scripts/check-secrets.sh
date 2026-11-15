#!/usr/bin/env bash
# Refuses a commit that adds a password, token, private key or connection string.
# Runs as the git pre-commit hook (.githooks/pre-commit). Install: make hooks
set -euo pipefail

patterns='(ghp_[A-Za-z0-9]{20,}|gho_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,}|sk_live_[A-Za-z0-9]{10,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{30,}|xox[baprs]-[A-Za-z0-9-]{10,}|ntn_[A-Za-z0-9]{20,}|lin_api_[A-Za-z0-9]{20,}|figd_[A-Za-z0-9_-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|[a-z]+://[^/ :@]+:[^/ @]{3,}@[A-Za-z0-9.-]+)'

found=0
while IFS= read -r file; do
  [ -n "$file" ] || continue
  case "$file" in
    .env.example|*.lock|package-lock.json|scripts/check-secrets.sh) continue ;;
    .env|.env.*) echo "Refused: $file is an env file and must not be committed." >&2; found=1; continue ;;
  esac
  if git diff --cached -U0 -- "$file" | grep -E '^\+' | grep -Ev '^\+\+\+' | grep -Eq "$patterns"; then
    echo "Refused: $file adds something that looks like a secret." >&2
    found=1
  fi
done < <(git diff --cached --name-only --diff-filter=ACM)

if [ "$found" -ne 0 ]; then
  echo "Remove the secret (use a placeholder and keep the real value in .env), then commit again." >&2
  exit 1
fi
