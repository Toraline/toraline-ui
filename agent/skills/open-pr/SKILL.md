---
name: open-pr
description: Pushes the ticket's branch and opens its pull request to the base branch (or asks first, as the profile says), then reviews the pull request against the ticket's acceptance criteria. Use when the user says "open the pull request", "push this ticket", "publish the change" or "/open-pr".
disable-model-invocation: true
metadata:
  pack: core
  stage: Deliver
---

# Open pull request

Publishes the commits of one ticket and checks them against what the ticket asked for. It leaves the branch on the remote, one open pull request, and a review of that pull request in the ticket's log.

## Input

The ticket id. Example: `/open-pr <PREFIX>-<n>`. Without it, the skill reads the id from the current branch name.

## Reads

- Project profile in `AGENTS.md`: `ticket_prefix`, `base_branch`, `main_checkout`, `push`, `external_writes`, `spec_location`, `output_language`. Read one value with `bash scripts/profile.sh get <key>`.
- `agent/rules/git-safety.md`, `agent/rules/ask-first.md`, `agent/rules/writing.md`.
- The ticket in Linear, through any tool or MCP server with `linear` in its name: description, acceptance criteria, comments.
- The ticket's notes folder: `local-docs/notes/<feature>/<PREFIX>-<n>/`, or `local-docs/notes/<PREFIX>-<n>/` when the ticket has no feature. Files used: `spec-v<n>.md` (highest `<n>`), `log.md`.
- The repository's pull request template, when a file named `pull_request_template.md` exists in `.github/`.

## Steps

1. **Find the ticket and its worktree.** Take the id from the input or from the branch name. Run `make worktree-list` and pick the worktree whose branch contains the id. If there is none, stop and report it. Run every later git command inside that worktree.
2. **Check the state.**
   - `git status --porcelain` shows changes: stop. The next step is `/commit`.
   - `git fetch origin <base_branch>`, then `git log --oneline origin/<base_branch>..HEAD`. No commits: stop and report "nothing to publish".
3. **Read the ticket.** Read it in Linear. Without access to Linear, ask the person to paste the ticket's description and acceptance criteria. Never invent them. Linear wins when it disagrees with the local spec file.
4. **Look for a pull request.** `gh pr list --head <branch> --state open --json number,url,baseRefName`.
   - One exists and its base is `base_branch`: this run is a later push. Go to step 5, skip step 6.
   - One exists with another base: stop and tell the person. Do not change the base.
5. **Push, as the profile's `push` says.**
   - `push`: run `git push -u origin <branch>`. Always name the remote and the branch.
   - `ask`: show the branch, the remote and the list of commits from step 2. Ask "Push these <k> commits to `origin/<branch>`?" and wait for the answer. On no, stop.
   - If the push is refused, show the error and stop. Never force-push.
6. **Open the pull request.** Only when step 4 found none.
   - If the profile's `external_writes` does not list opening a pull request, ask first and wait.
   - Title: the ticket id and the ticket's title.
   - Body, written to a temporary file: what a person sees that is different; what changed in the code; how to check it; the checks that were run and their results; the link to the ticket. Use the repository's template when it exists. Use the profile's `output_language`.
   - `gh pr create --base <base_branch> --head <branch> --title "<title>" --body-file <file>`.
7. **Review the pull request against the ticket.** Read `gh pr diff <number>`. For a long diff, read it file by file. For each acceptance criterion give one verdict:
   - **Met**: the diff does it. Name the file and the lines you read.
   - **Partly met**: say which part is missing.
   - **Not met**: nothing in the diff does it.
   - **Not verified**: you could not confirm it by reading. Say what a person must test.
   Then list every change in the diff that no criterion asks for.
8. **Record.**
   - Add an entry at the top of `log.md` in the ticket's notes folder: date, branch, commits pushed, pull request URL, the verdict of each criterion.
   - In Linear, add the pull request link to the ticket and set the ticket's status to the one that means "in review". Do this only when every criterion is Met or Not verified.
9. **Do not post the review.** The review stays in `log.md` and in the report. If the person wants it on GitHub or Linear, add a "Draft message" with the exact text and ask before posting.

## Output

A fixed report:

- **Done:** what was pushed (branch, remote, each commit's short hash and first line); the pull request URL, marked "new" or "existing"; one line per acceptance criterion with its verdict; the path of `log.md`.
- **Not done:** the push or the pull request that was not made, and why; criteria that are Partly met, Not met or Not verified; changes outside the ticket's scope.
- **Next step:** criteria Partly met or Not met: fix them in the worktree, then `/commit`, then `/open-pr` again. Otherwise: `/validate-comments <PREFIX>-<n>` when reviewers have commented.

## Do not

- Do not push when the profile's `push` is `ask` and the person has not said yes.
- Do not push to `base_branch`. Do not force-push.
- Do not merge the pull request. Do not turn on auto-merge.
- Do not change the base of an existing pull request.
- Do not post a comment or a review on GitHub or Linear without the person's yes.
- Do not remove the worktree. `/fix-pr` needs it.
- Do not invent acceptance criteria. If the ticket has none, say so and ask the person what "done" means for this ticket.
