---
name: continue
description: Picks up a ticket whose work stopped and says where it stands and what is left, as an ordered list. Use when the user says "continue <PREFIX>-123", "where did I stop", "what is left on this ticket" or "/continue".
disable-model-invocation: true
metadata:
  pack: core
  stage: Build
---

# Continue

Reads everything that exists about one ticket (notes folder, Linear ticket, worktree, pull request) and reports the current state and the ordered list of what is left. It is read-only: it changes no file, no branch, no ticket and no pull request.

## Input

The ticket id or its Linear link. Optional: the pull request link, and free text to take into account (for example: "I already fixed the checks").

Example: `/continue <PREFIX>-123`

If the ticket is missing, ask for it and wait.

## Reads

- Project profile in `AGENTS.md`: `ticket_prefix`, `base_branch`, `worktree_path`, `main_checkout`, `check_command`, `output_language`.
- `agent/rules/writing.md`, `agent/rules/git-safety.md`, `agent/rules/ask-first.md`.
- `docs/workflow/status-skills.md` (which skill fits which state).
- The ticket's notes folder: `local-docs/notes/<feature>/<TICKET-ID>/` or `local-docs/notes/<TICKET-ID>/`: `discovery.md`, every `spec-v<n>.md`, every `comments-v<n>.md`, `log.md`. Also the feature's `overview.md`, `local-docs/notes/decisions.md` and `local-docs/notes/open-questions.md` (only the entries that name this ticket).
- The Linear ticket, through any tool or MCP server with `linear` in its name.
- The worktree and the pull request of the ticket, with read commands only.

## Steps

1. Read the profile values with `scripts/profile.sh get <key>`.
2. Read the notes folder. Find it by the folder name `<PREFIX>-<n>` under `local-docs/notes/`, at depth 1 or 2 (also under `done/`). Read every file in it fully. For each file, keep: its date, what was done, what was decided, what was left open. A missing folder is a fact to report, not an error.
3. Read the Linear ticket fresh: description, `## Spec` section, status, comments, parent ticket, sub-tickets, related and blocking tickets. Without Linear access, ask the person to paste the ticket; if they do not, continue and mark the Linear rows "not verified". Never invent ticket content.
4. Read the worktree state. Use read commands only.
   - `make worktree-list` to find the ticket's worktree.
   - In the worktree: `git -C <folder> status --short`, `git -C <folder> diff --stat`, `git -C <folder> log --oneline origin/<base_branch>..HEAD`.
   - Is the branch on the remote, and are there commits that are not pushed: `git -C <folder> status -sb`.
   - No worktree: say so. Check whether a branch for the ticket exists with `git branch -a --list '*<prefix>-<n>-*'`.
5. Read the pull request, if any. Use the GitHub command line tool or any GitHub tool available.
   - Find it: `gh pr list --head <branch> --state all`.
   - Read it: state (open, draft, merged, closed), base branch, review decision, each check with its result, whether it has conflicts, the number of open review comments and who wrote them.
   - For each failed check, read its log and keep the first error message.
   - Compare everything with the latest commit of the branch. A comment or a failure recorded against an older commit is reported as "old", not as open.
   - No pull request, or no GitHub access: say so.
6. Compare the sources.
   - The spec in Linear and the highest `spec-v<n>.md`: equal or different.
   - Each acceptance criterion of the spec against the diff: met, not met, or cannot tell.
   - The last `log.md` entry against the real state of the worktree. If they disagree, the real state is right; report the difference.
   - Files changed without a commit, with no log entry: this is interrupted work. Report the files. Do not judge them finished.
7. Build the list of what is left. Order: first what blocks (failing checks, conflicts, changes requested, unanswered open questions), then spec steps not done, then acceptance criteria not met, then uncommitted or unpushed work, then open review comments, then follow-ups. For each item: what it is, who does it (the person or the agent), and the skill that does it, using `docs/workflow/status-skills.md`.
8. Report in the chat, in the profile's `output_language`, following `agent/rules/writing.md`. Then wait for the person's instruction. A request to fix something is done by the skill named for that item, not by this skill.

## Output

First, the state:

| Area | State | Detail |
|---|---|---|
| Linear | status | one sentence |
| Spec | version; Linear and local copy equal or different | |
| Worktree | none, or folder and branch | files changed, commits not pushed |
| Checks | passed / failed / not run | failing check names |
| Pull request | none / open / draft / merged / closed | review decision, conflicts, open comments |

Then "What is left, in order": the numbered list from step 7.

Then the fixed report:

- **Done:** what was read (each source, with its path or link) and what is finished on the ticket.
- **Not done:** each source that could not be read, and each fact marked "not verified".
- **Next step:** the skill for item 1 of the list, by name, with the ticket id.

## Do not

- Do not edit, create or delete any file. Do not write to `log.md`.
- Do not run `git add`, `commit`, `switch`, `checkout`, `stash`, `reset`, `merge`, `pull` or `push`. Do not create or remove a worktree.
- Do not run the check command or the tests: they can write files. Report the last recorded result and say it is not fresh.
- Do not change the Linear ticket. Do not post, reply, resolve or approve anything on the pull request.
- Do not reuse data from earlier in the conversation for the current state: read it again.
- Do not present a guess as a fact. Write "not verified".
- Do not start fixing. This skill only reports.
