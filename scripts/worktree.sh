#!/usr/bin/env bash
# One worktree and one branch per ticket (docs/workflow/working-pattern.md).
# Used by the Makefile: make worktree / worktree-remove / worktree-list.
# Reads the project profile in AGENTS.md: ticket_prefix, base_branch, worktree_path.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="$HERE/$(basename "${BASH_SOURCE[0]}")"
WARN_AT=20

die() { printf '\033[31m%s\033[0m\n' "$*" >&2; exit 1; }
profile() { bash "$HERE/profile.sh" get "$1" "${2:-}"; }

usage() {
  cat <<'USAGE'
Usage:
  scripts/worktree.sh create <ticket-number> <slug> [person]   create the worktree and branch of a ticket
  scripts/worktree.sh attach <ticket-number> <branch>          create the worktree of a ticket on a branch that already exists
  scripts/worktree.sh setup                                    prepare the current worktree (.env)
  scripts/worktree.sh remove <ticket-number> [--force]         remove the worktree and branch of a finished ticket
  scripts/worktree.sh list                                     list the worktrees
USAGE
}

# Main checkout, also when called from inside a worktree.
main_root() { dirname "$(git rev-parse --path-format=absolute --git-common-dir)"; }

prefix_lower() {
  local p; p="$(profile ticket_prefix)"
  [ -n "$p" ] || die "ticket_prefix is not set in the project profile (AGENTS.md). Run the start skill, or fill it in."
  printf '%s' "$p" | tr '[:upper:]' '[:lower:]'
}

worktree_path() {
  local root repo pattern
  root="$(main_root)"; repo="$(basename "$root")"
  pattern="$(profile worktree_path '../<repo>-<prefix>-<n>')"
  pattern="${pattern//<repo>/$repo}"
  pattern="${pattern//<prefix>/$(prefix_lower)}"
  pattern="${pattern//<n>/$1}"
  case "$pattern" in
    /*) printf '%s' "$pattern" ;;
    *) printf '%s/%s' "$root" "$pattern" ;;
  esac
}

default_person() {
  local name; name="$(git config user.name || true)"; name="${name%% *}"
  printf '%s' "$name" | iconv -f UTF-8 -t ASCII//TRANSLIT 2>/dev/null | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9-'
}

cmd_setup() {
  local root here src
  here="$(git rev-parse --show-toplevel)"; root="$(main_root)"
  cd "$here"
  if [ "$here" = "$root" ]; then echo "This is the main checkout; nothing to prepare."; return 0; fi
  src="${ROOT_WORKTREE_PATH:-$root}/.env"
  if [ -f .env ]; then echo ".env: already exists"
  elif [ -f "$src" ]; then cp "$src" .env; echo ".env: copied from $src"
  elif [ -f .env.example ]; then cp .env.example .env; echo ".env: the main checkout has no .env; copied from .env.example (fill the values)"
  fi
  # A project's own setup step (for example values a worktree needs in .env).
  # The file belongs to the project: make sync-skills never creates, changes or removes it.
  if [ -f "$here/scripts/worktree-setup.local.sh" ]; then
    MAIN_CHECKOUT="$root" bash "$here/scripts/worktree-setup.local.sh"
  fi
  echo "Worktree ready in $here."
}

cmd_create() {
  local ticket="${1:-}" slug="${2:-}" person="${3:-}" root path branch base prefix
  [[ $ticket =~ ^[0-9]+$ ]] || die "Give the ticket number: make worktree TICKET=123 SLUG=short-slug"
  [[ $slug =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]] || die "SLUG must be short kebab-case (example: local-setup)"
  person="${person:-$(default_person)}"
  [ -n "$person" ] || die "Could not read your name from git config user.name; pass PERSON=yourname"
  root="$(main_root)"; prefix="$(prefix_lower)"; base="$(profile base_branch main)"
  path="$(worktree_path "$ticket")"
  branch="$person/$prefix-$ticket-$slug"
  [ ! -e "$path" ] || die "$path already exists (make worktree-list shows the worktrees)"
  git -C "$root" fetch origin "$base" --quiet
  git -C "$root" worktree add -b "$branch" "$path" "origin/$base"
  # No upstream until the first push, so an accidental git push does not go to the base branch.
  git -C "$path" branch --unset-upstream 2>/dev/null || true
  (cd "$path" && ROOT_WORKTREE_PATH="$root" bash "$SCRIPT" setup)
  echo ""
  echo "Branch: $branch"
  echo "Folder: $(cd "$path" && pwd)"
}

cmd_attach() {
  local ticket="${1:-}" branch="${2:-}" root path
  [[ $ticket =~ ^[0-9]+$ ]] || die "Give the ticket number: make worktree-attach TICKET=123 BRANCH=name"
  [ -n "$branch" ] || die "Give the branch: make worktree-attach TICKET=123 BRANCH=name"
  root="$(main_root)"; path="$(worktree_path "$ticket")"
  [ ! -e "$path" ] || die "$path already exists (make worktree-list shows the worktrees)"
  git -C "$root" fetch origin --quiet
  if git -C "$root" rev-parse --verify -q "refs/heads/$branch" >/dev/null; then
    git -C "$root" worktree add "$path" "$branch"
  elif git -C "$root" rev-parse --verify -q "refs/remotes/origin/$branch" >/dev/null; then
    git -C "$root" worktree add -b "$branch" "$path" "origin/$branch"
  else
    die "The branch $branch does not exist here or on origin."
  fi
  (cd "$path" && ROOT_WORKTREE_PATH="$root" bash "$SCRIPT" setup)
  echo ""
  echo "Branch: $branch"
  echo "Folder: $(cd "$path" && pwd)"
}

cmd_remove() {
  local ticket="${1:-}" force="${2:-}" root path branch pending base
  [[ $ticket =~ ^[0-9]+$ ]] || die "Give the ticket number: make worktree-remove TICKET=123"
  root="$(main_root)"; base="$(profile base_branch main)"
  path="$(worktree_path "$ticket")"
  [ -d "$path" ] || die "There is no worktree in $path"
  branch="$(git -C "$path" branch --show-current)"
  if [ "$force" != "--force" ]; then
    [ -z "$(git -C "$path" status --porcelain)" ] || die "There are uncommitted changes in $path. Commit them, discard them, or use FORCE=1."
    git -C "$root" fetch origin --quiet
    if git -C "$path" rev-parse --verify -q "origin/$branch" >/dev/null; then
      pending="$(git -C "$path" rev-list --count "origin/$branch..HEAD")"
    else
      pending="$(git -C "$path" rev-list --count "origin/$base..HEAD")"
    fi
    [ "$pending" = 0 ] || die "$pending commit(s) of $branch are not on the remote and not in $base. Push them or use FORCE=1."
    git -C "$root" worktree remove "$path"
  else
    git -C "$root" worktree remove --force "$path"
  fi
  [ -z "$branch" ] || git -C "$root" branch -D "$branch"
  git -C "$root" worktree prune
  echo "Removed: $path and the branch $branch"
}

cmd_list() {
  local root count
  root="$(main_root)"
  git -C "$root" worktree list
  count="$(git -C "$root" worktree list --porcelain | grep -c '^worktree ')"
  if [ "$count" -ge "$WARN_AT" ]; then
    echo ""
    echo "WARNING: $count worktrees in this repository. Remove the finished ones with make worktree-remove TICKET=<n>."
  fi
}

case "${1:-}" in
  create) shift; cmd_create "$@" ;;
  attach) shift; cmd_attach "$@" ;;
  setup) cmd_setup ;;
  remove) shift; cmd_remove "$@" ;;
  list) cmd_list ;;
  *) usage; exit 1 ;;
esac
