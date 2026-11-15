---
name: bug-bash
description: Runs a testing session on one area - one dated parent ticket, then each request from the tester becomes a sub-ticket and one commit, all in one worktree and one pull request. Use when the user says "bug bash", "I am going to test X and ask for fixes" or "/bug-bash".
disable-model-invocation: true
metadata:
  pack: core
  stage: Deliver
---

# Bug bash

A session where a person tests an area and asks for fixes while testing. It leaves one parent ticket with the record of the session, one sub-ticket and one commit per request, one worktree, one pull request and a log.

## Input

The area being tested. Example: `/bug-bash <area>`. To continue a session: `/bug-bash <PREFIX>-<n>` with the parent ticket's id.

## Reads

- Project profile in `AGENTS.md`: `ticket_prefix`, `base_branch`, `main_checkout`, `push`, `allow_no_verify`, `commit_format`, `check_command`, `external_writes`, `output_language`. Read one value with `bash scripts/profile.sh get <key>`.
- `agent/rules/git-safety.md`, `agent/rules/ask-first.md`, `agent/rules/writing.md`.
- The documentation of the area under `docs/`, when it exists.
- Linear, through any tool or MCP server with `linear` in its name. Without access: ask the person to create each ticket and give you its id. Never invent an id.
- The parent ticket's notes folder: `local-docs/notes/<feature>/<PREFIX>-<n>/`, or `local-docs/notes/<PREFIX>-<n>/` when the area is not a feature.

## Steps

1. **Collect the session data.** Ask only for what is missing, one question at a time:
   - the area tested (required);
   - the environment: local, or a deployed one with its URL;
   - who tests (default: the current person) and which account or role they use;
   - the version tested: `git rev-parse --short HEAD` and the branch for local, or the deployed commit.
2. **Create the parent ticket.** Title: `Bug bash: <area>, <YYYY-MM-DD>` with today's date. Description: the session data, an empty "Findings" table (sub-ticket, type, summary, commit and branch, status), "Areas tested", "Notes", "Summary". Show the title and description and ask before creating it, unless the profile's `external_writes` lists creating Linear tickets. Set its status to the one that means "in progress".
3. **Create the worktree.** `make worktree TICKET=<parent n> SLUG=bug-bash-<area>`. Every change of the session happens there. Create the notes folder and `log.md` with the session data.
4. **Tell the tester to start.** Give the parent ticket's link, the worktree path and the branch name.
5. **For each message from the tester**, repeat steps 6 to 10.
6. **Classify each request in the message:**

   | Type | Meaning | What happens |
   |---|---|---|
   | Bug | Something is broken | Sub-ticket with: how to reproduce, expected, actual. Fixed now |
   | Improvement | It works, but should be different | Sub-ticket. Done now |
   | Plan | Too large for the session, or needs a model first | Ticket linked to the parent. No code |
   | Question | The tester asks how something works | Answer. One line in the log. No ticket |
   | Cannot reproduce | You followed the steps and saw no problem | Log what you tried. Ask for more detail |

   If a request can be read in two ways that change the result, ask about that request before doing it. Continue with the others.
7. **Create the sub-tickets of the message.** Show the list (type and title of each) and ask "Create these <k> sub-tickets?", unless the profile's `external_writes` lists creating Linear tickets. Each has the parent ticket as its parent. Show the created ids with links.
8. **Do each sub-ticket, one at a time:**
   - set its status to the one that means "in progress";
   - reproduce the bug first, then make the smallest change that fixes it;
   - run the profile's `check_command`; if it fails, fix the cause before committing;
   - stage the changed files by name and write one commit in the profile's `commit_format`, with the sub-ticket's id;
   - set its status to the one that means "in review".
9. **Push and pull request, as the profile's `push` says.** `push`: `git push -u origin <branch>` after each commit. `ask`: ask before the first push of each message.
   - The first push opens the one pull request of the session, as a draft: `gh pr create --draft --base <base_branch> --head <branch>`, titled like the parent ticket. If `external_writes` does not list opening a pull request, ask first.
   - Later pushes update the same pull request. Update its list of sub-tickets and commits in the body.
10. **Record and answer.**
    - Add one row per request to the "Findings" table of the parent ticket and to `log.md`. Mark the area as tested.
    - Answer the tester in a few lines: what changed, the commit **and its branch**, how to check it. When the test runs on a deployed environment, say that the fix reaches it only after the pull request is merged and deployed.
11. **End the session** when the tester says it is finished:
    - fill "Summary" in the parent ticket: totals per type, areas tested and not tested, what is pending (plans, requests not reproduced, open questions);
    - copy unanswered items to `local-docs/notes/open-questions.md`;
    - move the parent ticket to the profile's `finished_status` (default `Needs QA`). Never move it to a status that means "done".

## Output

A fixed report:

- **Done:** the parent ticket's link; one line per sub-ticket (id, type, commit with its branch, status); the pull request URL; what was pushed; the path of `log.md`.
- **Not done:** plans not started; requests not reproduced; open questions; commits not pushed; "the pull request is still a draft".
- **Next step:** the person marks the pull request ready for review. Then `/validate-comments <PREFIX>-<n>` when reviewers have commented.

## Do not

- Do not change code without a sub-ticket. Do not put two requests in one commit.
- Do not invent steps to reproduce a bug.
- Do not create test data in a production environment.
- Do not create a second worktree, branch or pull request for the same session.
- Do not name a commit without its branch.
- Do not use `git add -A`, `--amend`, or `--no-verify` (unless the profile's `allow_no_verify` is `yes`).
- Do not merge the pull request or mark it ready for review unless the person asks.
