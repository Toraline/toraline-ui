---
name: release
description: Prepares the release ticket and the text of the release pull request from what was merged since the last release. Never merges. Use when the user says "prepare the release", "what goes in this release", "release <version>" or "/release".
disable-model-invocation: true
metadata:
  pack: core
  stage: Deliver
---

# Release

Works out which pull requests and tickets are in the next release, and what can go wrong. It leaves one release ticket in Linear, the release pull request's title and body in a local file, and a log. A person merges.

## Input

Optional: the version, and the number of the release pull request. Example: `/release <version>`.

## Reads

- Project profile in `AGENTS.md`: `ticket_prefix`, `base_branch`, `external_writes`, `output_language`. Read one value with `bash scripts/profile.sh get <key>`.
- `agent/rules/git-safety.md`, `agent/rules/ask-first.md`, `agent/rules/writing.md`.
- The project's documentation about deployment and rollback under `docs/`, when it exists.
- GitHub, through the `gh` CLI. Linear, through any tool or MCP server with `linear` in its name. Without access to Linear: ask the person for the tickets' content. Never invent it.
- The release ticket's notes folder: `local-docs/notes/<PREFIX>-<n>/`, created in step 7.

## Steps

1. **Find the last release.** `git fetch origin --tags`, then `gh release list --limit 5` and `git tag --sort=-creatordate | head -5`. Also search Linear for the last release ticket. If you cannot find a last release, ask: "Which commit or tag was the last release?" and wait.
2. **Decide the version.** Use the version the person gave. Otherwise propose the next one in the pattern of the earlier versions and confirm it in step 6. If a release ticket for this version is already open, update it. Never create a second one.
3. **Find the release pull request.** How a project releases is not in the profile. Read the deployment documentation. If it does not say, ask: "How is a release made here: a tag on `<base_branch>`, or a pull request from one branch into another?" and wait.
   - Release by pull request: `gh pr list --state open --base <release target>`. If none is open, say so. Do not create it unless the person asks.
   - Release by tag: there is no release pull request. Step 8 writes release notes with the same content.
4. **List what is in the release.**
   - `git log --oneline <last release>..origin/<branch being released>`.
   - `gh pr list --base <base_branch> --state merged --search "merged:>=<date of the last release>" --json number,title,body,headRefName,mergedAt,url`.
   - Leave out a pull request whose change is already released: none of its files differ between the last release and the branch being released (`git diff --name-only`).
   - Take the ticket ids (`<PREFIX>-<n>`) from titles, bodies, branch names and commit messages. Read each ticket in Linear: title, status, parent ticket. A parent ticket is listed with the sub-tickets that are in the diff.
   - A pull request with no ticket is listed as "no ticket". Anything without evidence in git or GitHub becomes a question in the draft.
5. **Find the risks.** Read the diff between the last release and the branch being released. Read, do not only list:
   - each database migration: what it creates, what it removes or changes, whether it can be undone, and whether the earlier code still runs after it;
   - new settings and environment variables (compare `.env.example`);
   - behaviour a person will see change; data that must be created after the deploy;
   - the checks of the release pull request: `gh pr checks <number>`. A failing or missing check is a **blocking** risk.
   Write each risk with five parts: what it is; what breaks and who notices; how to know (a command or a URL); what to do before the merge; what to do if it happens. Write the rollback as ordered steps. If the documentation does not say how to roll back, write "rollback: not documented" as a blocking risk.
6. **Show the draft and wait.** Version; the release pull request; a table of tickets (id, title, status, pull request); pull requests with no ticket; pull requests left out as already released; risks; actions before and after the deploy; questions. Ask "Create the release ticket with this content?" and wait for the answer.
7. **Create the release ticket** in Linear after the yes. Title: `Release <version>`. Description: the draft of step 6, with a checklist to verify after the deploy. Link every ticket of the table as related, and link the release pull request. Then create `local-docs/notes/<PREFIX>-<n>/` for the release ticket.
8. **Write the pull request text.** Save `release-pr.md` in that folder: the title `Release <version>` and the body. The body says what changes for the people who use each app, then lists the tickets and pull requests, the risks, the actions before and after the deploy, and the link to the release ticket. Use the profile's `output_language`.
   - Do not apply it to GitHub unless the profile's `external_writes` lists editing a pull request, or the person says yes. The command is `gh pr edit <number> --title "Release <version>" --body-file <path>`.
9. **Record.** Set the release ticket's status to the one that means "in review". Add an entry at the top of `log.md` in the same folder: date, version, last release, number of tickets and pull requests, blocking risks.
10. **After the merge**, when the person runs the skill again for the same version: confirm the deploy with the checklist of the release ticket, report what you could not verify, and draft the comment "Released in <version>" for each included ticket. Ask before posting the comments and before closing the release ticket.

## Output

A fixed report:

- **Done:** the release ticket's link; the path of `release-pr.md`; the release pull request URL, or "none open"; totals (tickets, pull requests, pull requests with no ticket); each blocking risk in one line.
- **Not done:** whether the text was applied to the pull request; tickets you could not read; checks you could not run; questions with no answer; "nothing was merged".
- **Next step:** the person reviews and merges the release pull request. Then `/release <version>` again for the checks after the merge.

## Do not

- Do not merge, push, tag, deploy, create a branch or turn on auto-merge.
- Do not invent tickets, versions, risks or test results.
- Do not create a second release ticket for the same version.
- Do not change the status of the included tickets.
- Do not change anything in a production environment. Report what you find and ask.
- Do not write a risk without saying what to do about it.
