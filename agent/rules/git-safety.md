# Git safety

What an agent never does with git, in any project. The values in backticks come from the project profile in `AGENTS.md`.

1. **One worktree and one branch per ticket.** Create it with `make worktree TICKET=<n> SLUG=<short-slug>`. It starts from `origin/<base_branch>`. For a branch that already exists (a pull request to fix, a branch whose worktree was removed): `make worktree-attach TICKET=<n> BRANCH=<branch>`. A skill that needs a worktree at another path creates it with `git worktree add` and prints the path, so the person can remove it.
2. **Main checkout.** When the profile says `main_checkout` is `protected`, never run `git add`, `commit`, `switch`, `checkout`, `stash` or `reset` there, and never edit files there. `scripts/guard-main-checkout.sh` blocks these commands in Claude Code. Two exceptions: files under `local-docs/` (git ignores that folder), and the profile table in `AGENTS.md` when the `start` skill fills the `<ask>` values (the change is then committed through a ticket's worktree, like any other change).
3. **Before any branch change**, check where you are: `git rev-parse --show-toplevel`. If it is the main checkout, stop.
4. **Stage files by name.** Never `git add -A` or `git add .`.
5. **Commit message** follows the profile's `commit_format`. One commit per ticket or sub-ticket.
6. **Never `--amend`** a commit that was pushed. Never force-push a shared branch.
7. **`--no-verify`** is forbidden unless the profile's `allow_no_verify` is `yes`.
8. **Secrets.** Never commit `.env` files (only `.env.example`), tokens, keys or passwords. Never invent a secret. The pre-commit hook `scripts/check-secrets.sh` refuses such a commit.
9. **Push.** Follow the profile's `push`: `push` means push after committing and report what was pushed; `ask` means stop and ask first.
10. **Never merge** a pull request and never enable auto-merge, unless the person asks for that pull request by name.
11. **Remove a worktree only with the script**: `make worktree-remove TICKET=<n>`. It refuses when work would be lost.
12. **Other people's branches and repositories**: read only, unless the person asks.
