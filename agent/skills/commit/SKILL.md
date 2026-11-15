---
name: commit
description: Stages the ticket's files by name and writes one commit in the project's commit format, after the project's checks pass. Use when the user says "commit", "commit this ticket", "save the change" or "/commit".
disable-model-invocation: true
metadata:
  pack: core
  stage: Deliver
---

# Commit

Turns the change in a ticket's worktree into one commit. It leaves one new commit on the ticket's branch and one new line in the ticket's log. It does not push.

## Input

Optional: the ticket id. Example: `/commit <PREFIX>-<n>`. Without it, the skill reads the ticket id from the current branch name.

## Reads

- Project profile in `AGENTS.md`: `ticket_prefix`, `main_checkout`, `commit_format`, `check_command`, `allow_no_verify`, `output_language`. Read one value with `bash scripts/profile.sh get <key>`.
- `agent/rules/git-safety.md`, `agent/rules/ask-first.md`, `agent/rules/writing.md`.
- The ticket's notes folder: `local-docs/notes/<feature>/<PREFIX>-<n>/`, or `local-docs/notes/<PREFIX>-<n>/` when the ticket has no feature. `local-docs/` is in the main checkout, not in the worktree.

## Steps

1. **Find the ticket.** Use, in this order: the id the person gave; the current branch name (`git branch --show-current`, which contains `<prefix>-<n>` in lower case). If neither gives an id, or the two disagree, ask which ticket this is. Never invent an id.
2. **Find the worktree.** Run `make worktree-list` and pick the worktree whose branch contains the ticket id. If there is none, stop and report it. Run every later command inside that worktree.
3. **Check where you are.** Run `git rev-parse --show-toplevel`. If it is the main checkout and the profile's `main_checkout` is `protected`, stop. Do not stage or commit there.
4. **List what changed.** Run `git status --porcelain` and `git diff --cached --stat`.
   - Nothing changed and nothing staged: stop and report "nothing to commit".
   - Files are already staged: the person chose them. Commit exactly those files. Stage nothing else. List the files left out in the report.
   - Nothing is staged: go to step 5.
5. **Choose the files of the ticket.** Read the diff of each changed file (`git diff -- <path>`). A file belongs to the ticket when the spec (`spec-v<n>.md` in the notes folder, highest `<n>`) or the ticket asks for that change.
   - Leave out: `.env` files (except `.env.example`), keys, tokens, dependency folders, build output, editor settings, temporary files.
   - If you cannot tell whether a file belongs to the ticket, ask about that one file and wait.
   - If the change mixes two unrelated pieces of work, say which paths belong to each and ask which one to commit now.
6. **Run the checks.** Run the profile's `check_command` from the worktree root. If it fails, stop. Show the failing output. Do not commit.
7. **Stage by name.** `git add <path> <path> ...` with each chosen path. Never `git add -A`, `git add .` or `git commit -a`.
8. **Write the message.** Read the staged diff (`git diff --cached`). Fill each placeholder of the profile's `commit_format`:
   - the ticket id is `<PREFIX>-<n>` from step 1;
   - a `type` placeholder is one of `feat`, `fix`, `docs`, `test`, `refactor`, `style`, `perf`, `build`, `ci`, `chore`, chosen from what the diff does, not from the file names;
   - a `scope` placeholder is the area that changed;
   - the summary says what the change does, in the imperative, lower case, with no final period. The first line has at most 72 characters.
   - Add a body only when the reason for the change is not clear from the summary.
9. **Commit.** `git commit -m "<first line>"` (add `-m "<body>"` when there is a body). One commit per ticket or sub-ticket.
   - If a check that runs before the commit fails (for example `scripts/check-secrets.sh`), show the full error and stop. Fix the cause; do not skip the check.
   - Use `--no-verify` only when the profile's `allow_no_verify` is `yes`, and say in the report that the checks were skipped.
10. **Confirm.** Run `git log -1 --stat` and `git status --porcelain`.
11. **Log.** Add one line at the top of `log.md` in the ticket's notes folder: date, short hash, branch name, first line of the message.

## Output

A fixed report:

- **Done:** the commit (short hash and first line), the branch name, the files committed, the result of `check_command`.
- **Not done:** the files left out and why; whether checks were skipped; "not pushed" (this skill never pushes).
- **Next step:** `/open-pr <PREFIX>-<n>`. It pushes or asks, as the profile's `push` says.

## Do not

- Do not use `--no-verify` unless the profile's `allow_no_verify` is `yes`.
- Do not use `--amend` on a commit that was pushed.
- Do not push, merge, switch branches, stash, reset or discard files.
- Do not unstage files the person staged.
- Do not commit when `check_command` fails.
- Do not put two tickets in one commit.
- Do not invent a ticket id.
