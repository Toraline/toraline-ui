---
name: review-diff
description: Reviews the local changes of the current worktree against the project's rules and the ticket's spec, and changes nothing. Use when the user says "review my diff", "check my changes before I commit", "review the diff" or "/review-diff".
disable-model-invocation: true
metadata:
  pack: core
  stage: Deliver
---

# Review diff

Reads the changes in one worktree and lists the problems, compared with the project's rules and with the ticket's spec. It is read-only, so it is safe to run while the work is in progress.

## Input

Nothing is required when the current folder is a ticket's worktree. Optional:

- a ticket id, to review that ticket's worktree from another folder: `/review-diff <PREFIX>-123`
- `--staged`: review only the staged changes
- `--uncommitted`: review only the changes without a commit

## Reads

- Project profile in `AGENTS.md`: `ticket_prefix`, `base_branch`, `worktree_path`, `main_checkout`, `commit_format`, `check_command`, `output_language`.
- `agent/rules/writing.md`, `agent/rules/git-safety.md`, `agent/rules/ask-first.md`.
- The project's own rules: the root `AGENTS.md`, the `AGENTS.md` of each app folder that has changed files (if it exists), and the `docs/` files about standards that they name.
- The ticket's spec: the `## Spec` section of the Linear ticket (through any tool or MCP server with `linear` in its name) and the highest `spec-v<n>.md` in `local-docs/notes/<feature>/<TICKET-ID>/` or `local-docs/notes/<TICKET-ID>/`.

## Steps

1. Read the profile values with `scripts/profile.sh get <key>`.
2. Find the worktree and the ticket.
   - With a ticket id: `make worktree-list`, then use `git -C <folder>` for every command. Do not change folder.
   - Without one: `git rev-parse --show-toplevel` and `git branch --show-current`. Read the ticket number from the branch name (`<prefix>-<n>-<slug>`).
   - If the folder is the main checkout: review only what `git status` shows there, say that it is the main checkout, and say that no ticket was matched.
   - If the ticket cannot be found, ask one question: which ticket is this change for? If the person says none, review against the project's rules only and say so in the report.
3. Get the changes, with read commands only:
   - Default, everything the branch adds: `git diff origin/<base_branch>...HEAD` (commits), `git diff HEAD` (changes without a commit), `git status --short` (new files not tracked; read each one).
   - `--staged`: `git diff --staged`.
   - `--uncommitted`: `git diff HEAD` and the files not tracked.
   - Use the copy of `origin/<base_branch>` that exists locally. Do not fetch. Say in the report that the base may be out of date.
   - No changes: report that and stop.
4. Read the rules of the project (the files in "Reads"). Build the checklist from them. Do not use rules from another project or from memory.
5. Read the spec. Without Linear access, use the local copy and say it was not compared with Linear. Without any spec, say so and skip step 7.
6. Read each changed file in full, not only the changed lines. Check it against:
   - each rule of the project that applies to that file;
   - correctness: wrong conditions, missing empty or error cases, broken callers of a changed function;
   - security: secrets, tokens or `.env` content in the change; user input used without validation; missing permission checks;
   - leftovers: debug output, commented-out code, temporary files, files that should be ignored by git;
   - reuse: new code that duplicates a helper that exists in the repository;
   - tests: changed behavior with no test added or changed.
7. Check the change against the ticket:
   - each item of the spec's scope: done, partly done, not done;
   - each acceptance criterion: met, not met, cannot tell from the diff;
   - each changed file that the spec does not name, and each change in the "Out of scope" list: report it as outside the ticket.
8. Do not run the check command or the tests. Read the last result in `log.md` if it exists and report its date. The person or the `commit` skill runs the checks.
9. Write each finding as `agent/rules/writing.md` requires: first what a person would see go wrong, then the cause, with the file path and line, then the fix in words. Mark a finding "not verified" when you could not confirm it by reading the code. Report only problems; add no optional suggestions unless the person asked for them.
10. Print the report in the chat, in the profile's `output_language`. Save no file.

## Output

First, the review:

- Ticket, worktree folder, branch, what was compared (for example: branch against `origin/<base_branch>`, plus changes without a commit).
- Files reviewed: number. Lines added and removed.
- **Must fix before the commit:** numbered findings (a bug, a secret, a broken rule of the project, an acceptance criterion not met).
- **Should fix:** numbered findings (a missing test, a leftover, a duplicate).
- **Outside the ticket:** files or changes the spec does not ask for.
- **Spec check:** the table of scope items and acceptance criteria with their state.
- **Files with no findings:** the list.

Then the fixed report:

- **Done:** what was reviewed, and against which rule files and which spec version.
- **Not done:** what could not be read or compared (no spec, no Linear access, base not fetched), and that the checks were not run.
- **Next step:** with no "Must fix" findings: `commit`. With "Must fix" findings: fix them in this worktree (the person, or the agent when the person asks), then `review-diff` again.

## Do not

- Do not edit, create, delete, stage or format any file. Do not write to `log.md`.
- Do not run `git add`, `commit`, `stash`, `switch`, `checkout`, `reset`, `fetch`, `pull` or `push`.
- Do not run the check command, the tests or a formatter: they can write files.
- Do not fix a finding in this skill, even a small one. The person decides.
- Do not post the review on GitHub, in Linear or in any other tool.
- Do not review against rules that are not in this repository.
- Do not report a guess as a fact.
