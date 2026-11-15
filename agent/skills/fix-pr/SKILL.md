---
name: fix-pr
description: Fixes the review comments that validate-comments confirmed, inside the ticket's worktree, runs the checks, commits, and pushes or asks as the profile says. Use when the user says "fix the pull request", "fix the confirmed comments", "address the review" or "/fix-pr".
disable-model-invocation: true
metadata:
  pack: core
  stage: Deliver
---

# Fix pull request

Applies the fixes that the latest `comments-v<n>.md` marks as "Fix now". It leaves one new commit on the pull request's branch, the comments file updated with what was pushed, and one new entry in the ticket's log. It posts nothing.

## Input

The ticket id. Example: `/fix-pr <PREFIX>-<n>`.

## Reads

- Project profile in `AGENTS.md`: `ticket_prefix`, `base_branch`, `main_checkout`, `push`, `allow_no_verify`, `commit_format`, `check_command`, `output_language`. Read one value with `bash scripts/profile.sh get <key>`.
- `agent/rules/git-safety.md`, `agent/rules/ask-first.md`, `agent/rules/writing.md`.
- The ticket's notes folder: `local-docs/notes/<feature>/<PREFIX>-<n>/`, or `local-docs/notes/<PREFIX>-<n>/` when the ticket has no feature. Files used: `comments-v<n>.md` (highest `<n>`), `spec-v<n>.md`, `log.md`.
- The pull request, through the `gh` CLI.

## Steps

1. **Find the comments file.** Open the highest `comments-v<n>.md` in the ticket's notes folder. If there is none, stop. The next step is `/validate-comments <PREFIX>-<n>`.
2. **Build the checklist.** One item per comment whose "What to do" is "Fix now" and whose "Pushed" is `No` or `Partial`. No items: stop and report "nothing to fix". Do not add comments with any other "What to do".
3. **Check the pull request.** `gh pr view <number> --json state,headRefName,headRefOid,baseRefName,mergeable`.
   - Merged or closed: stop and report it.
   - The head commit differs from the "Commit checked" in the comments file: the code changed after the check. Ask: "The branch has new commits since the comments were checked. Run `/validate-comments` again first?" and wait.
4. **Find the worktree.** Run `make worktree-list` and pick the worktree whose branch is the pull request's branch. If there is none, create it with `make worktree-attach TICKET=<n> BRANCH=<branch>`. Run `git rev-parse --show-toplevel` there. If it is the main checkout and the profile's `main_checkout` is `protected`, stop.
5. **Bring the worktree up to date.** `git status --porcelain` must be empty; if not, stop and report the files. Then `git pull --ff-only origin <branch>`. If it fails, stop and report it.
6. **Conflicts with the base branch.** Only when step 3 says the pull request has conflicts:
   - `git fetch origin <base_branch>`, then `git merge origin/<base_branch>`.
   - For each file in conflict, read both sides and their recent history (`git log --oneline -5 -- <path>` on each side). Keep the work of both sides.
   - Resolve without asking: imports, edits in different parts of a file, generated files (run the generator again), lock files (run the install again).
   - Stop and ask when both sides change the same logic with different intent, or when you cannot verify the resulting behaviour.
   - Write each resolution in the log entry of step 11: file, what each side changed, how you resolved it, the risk.
7. **Fix each item.** Read the comment's block in the comments file, then the current code, then make the smallest change that fixes it. Follow the project's coding rules in `AGENTS.md`.
   - Stay in scope: change only what the checklist asks.
   - If a fix needs a decision the file does not contain, stop that item and ask one question. Continue with the other items.
   - If you start a subagent for the fix, tell it to read `agent/rules/git-safety.md`, `agent/rules/ask-first.md` and `agent/rules/writing.md` by path, to work only inside the worktree's path, and give it the checklist. Review its result against the checklist before step 8.
8. **Run the checks.** Run the profile's `check_command` from the worktree root. If it fails, fix the cause and run it again. After 3 failed runs, stop and report the failing output. Do not commit.
9. **Commit.** Stage the changed files by name. Write one commit in the profile's `commit_format`, with the ticket id, saying what changed (not "fix comments"). Never `--amend`. Use `--no-verify` only when the profile's `allow_no_verify` is `yes`.
10. **Push, as the profile's `push` says.**
    - `push`: `git push origin <branch>`.
    - `ask`: show the branch and the commit, ask "Push this commit to `origin/<branch>`?" and wait.
    - Never force-push.
11. **Record.**
    - In the comments file, set "Pushed" for each item: `Yes (<short hash>)`, `Partial` or `No`. When the commit is not pushed, write `No (committed <short hash>, not pushed)`.
    - Add an entry at the top of `log.md`: date, branch, commit, one line per item (file, what changed, why it fixes the comment, the risk), the result of each check, conflict resolutions, anything a person must test by hand.

## Output

A fixed report:

- **Done:** each item fixed, with its comment number and file; the commit (short hash, first line, branch); whether it was pushed and where; the result of `check_command`; the paths of the comments file and `log.md`.
- **Not done:** each item skipped or waiting for an answer, and why; conflicts left for the person; "no reply was posted and no thread was resolved".
- **Next step:** the person posts the draft replies from the comments file. Then `/validate-comments <PREFIX>-<n>` to confirm that no comment is still open.

## Do not

- Do not post, reply to or resolve comments on GitHub or Linear.
- Do not fix a comment that `validate-comments` did not mark "Fix now".
- Do not work in the main checkout when `main_checkout` is `protected`.
- Do not merge the pull request, rebase the branch or force-push.
- Do not commit when `check_command` fails.
- Do not edit generated files by hand. Run their generator.
- Do not remove the worktree.
