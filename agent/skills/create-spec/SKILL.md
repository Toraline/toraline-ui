---
name: create-spec
description: Writes the spec of one ticket from its discovery, saves it in the Linear ticket and as a local copy. Use when the user says "create the spec", "write the spec for <PREFIX>-123" or "/create-spec".
disable-model-invocation: true
metadata:
  pack: core
  stage: Plan
---

# Create spec

Turns one refined ticket into a spec: the instruction an agent executes for that ticket. It leaves the spec in the Linear ticket, a copy `spec-v<n>.md` in the ticket's notes folder, and an updated list of linked tickets in the feature's `overview.md`. It changes no code.

## Input

The ticket id or its Linear link. Optional: extra context (links, decisions, limits).

Example: `/create-spec <PREFIX>-123`

If the ticket is missing, ask for it and wait. Never take the ticket from the current branch name or from an earlier spec in the same conversation.

## Reads

- Project profile in `AGENTS.md`: `ticket_prefix`, `spec_location`, `base_branch`, `check_command`, `output_language`, `external_writes`.
- `agent/rules/writing.md`, `agent/rules/git-safety.md`, `agent/rules/ask-first.md`.
- `docs/workflow/sources-of-truth.md` (where the files go).
- `reference.md` beside this file (the shape of the spec and of `overview.md`).
- The ticket's notes folder: `local-docs/notes/<feature>/<TICKET-ID>/`, or `local-docs/notes/<TICKET-ID>/` when the ticket has no feature. Mainly `discovery.md`.
- The Linear ticket, through any tool or MCP server with `linear` in its name.

## Steps

1. Read the profile values with `scripts/profile.sh get <key>`. If `ticket_prefix` is empty, stop and name the `start` skill.
2. Read the Linear ticket in full: title, description, status, labels, comments, parent ticket, sub-tickets, related and blocking tickets. Without Linear access, ask the person to paste the ticket and the list of its linked tickets. Never invent ticket content.
3. Find the notes folder: look for a folder named `<PREFIX>-<n>` under `local-docs/notes/`, at depth 1 or 2. Read `discovery.md`.
   - No `discovery.md`: stop. Report that the discovery is missing. Next step: `refine-ticket`.
   - No `local-docs/` folder: tell the person to run `make local-docs`, then continue.
4. Read the code and the documents that the discovery names. Check that each file path it cites exists. Read only. Change no file in the repository and switch no branch.
5. Check for an existing spec: a `## Spec` section in the ticket description, or `spec-v*.md` files in the notes folder. If one exists, ask one question: replace it with a new version, or stop. The new version number is the highest existing number plus 1. Never overwrite an existing `spec-v<n>.md`.
6. List what is still unknown: goal, out of scope, acceptance criteria, which apps are touched, data that must exist to test, any product decision. Ask about each unknown, one question at a time, and wait for each answer. Do not fill a gap with an assumption.
7. Write the spec text using the shape in `reference.md`. Rules for the text:
   - It is complete without the conversation: an agent with no other context can execute it.
   - Exact file paths, exact names, exact commands. Every path was checked in step 4.
   - It states the worktree command (`make worktree TICKET=<n> SLUG=<slug>`), the base branch from the profile, and the check command from the profile.
   - It tells the executing agent to read the three rule files by path. It does not copy their text.
   - It uses the profile's `output_language`.
8. Show the person a short summary: goal, scope, out of scope, files to change, acceptance criteria, and what you could not verify. Ask: "Is this spec correct?" Wait for a clear yes. If the person asks for changes, apply them and ask again.
9. Save the spec according to `spec_location`:
   - `both`: do 9a, then 9b.
   - `ticket`: do only 9a.
   - `file`: do only 9b.
   - Any other value: stop and ask what it means.
   - 9a. Linear (source of truth): in the ticket description, write the section `## Spec` with the spec text below it. If the section exists, replace only that section. Keep every other part of the description unchanged. If the write fails, do not retry in another way: put the exact text in the report under "Draft message" for the person to paste.
   - 9b. Local copy: write `spec-v<n>.md` in the notes folder. Start it with "Context you need before reading" and end it with the status block, as `agent/rules/writing.md` requires. Add one line at the top: the ticket id, the Linear link, the version, the date.
10. Update `local-docs/notes/<feature>/overview.md` (only when the ticket has a feature). Create it from the shape in `reference.md` if it does not exist. In its list of linked tickets, add or update the row of this ticket: id, title, role (this ticket, parent ticket, sub-ticket, related, blocks, blocked by), status, spec version. Add the rows of the linked tickets found in step 2.
11. Add an entry at the top of `log.md` in the notes folder: date, "spec v<n> written", where it was saved.
12. Do not change the ticket's status unless the person asks. Do not start the implementation.

## Output

A fixed report:

- **Done:** spec version; whether the Linear ticket was updated; path of `spec-v<n>.md`; path of `overview.md` and the rows changed; path of `log.md`.
- **Not done:** what was skipped or failed, and why (for example: no Linear access, so the spec text is under "Draft message"). What was not verified.
- **Next step:** `execute-spec` with the same ticket id.

## Do not

- Do not write a spec without a discovery, and do not write one for a ticket you could not read.
- Do not invent file paths, endpoints, criteria or ticket content.
- Do not edit code, create a worktree, switch a branch, commit or push.
- Do not write to Linear before the person confirms the spec in step 8.
- Do not delete or rewrite parts of the ticket description outside `## Spec`.
- Do not post a comment in Linear or in any other tool.
- Do not ask several questions in one message.
