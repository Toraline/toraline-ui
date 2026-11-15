---
name: refine-ticket
description: Reads a ticket with its parent, siblings, sub-tickets and related tickets, the docs and the code, marks each acceptance criterion as existing, partial, new or unclear, asks about the gaps and writes discovery.md. Use when the user says "/refine-ticket", "refine this ticket", "what does this ticket need" or "is this ticket ready for a spec".
disable-model-invocation: true
metadata:
  pack: core
  stage: Plan
---

# Refine ticket

Understands one ticket before any spec or code exists. It leaves `discovery.md` in the ticket's folder in `local-docs/notes/`: what the ticket asks, what already exists, what is new, what is unclear, and the answers the person gave.

## Input

The ticket id, and optional free text to take into account: `/refine-ticket <PREFIX>-<n> front end only`. If the id is missing, ask for it and wait.

## Reads

- Project profile in `AGENTS.md`: `ticket_prefix`, `base_branch`, `main_checkout`, `spec_location`, `output_language`, `external_writes`.
- `agent/rules/writing.md`, `agent/rules/ask-first.md`, `agent/rules/git-safety.md`.
- `agent/skills/refine-ticket/reference.md`: the structure of `discovery.md` and the effort and risk scales.
- `docs/workflow/sources-of-truth.md` (layout of `local-docs/`), every file in `docs/` about the feature.
- `local-docs/notes/` (including `done/`, `decisions.md`, `open-questions.md`).
- Linear, through any tool or MCP server with `linear` in its name. GitHub, through `gh`, read only. The code, read only.

## Steps

1. **Read the ticket in full.** From Linear: title, description, status, priority, labels, assignee, project, cycle, parent ticket, relations, attachments. Read every comment and reply; a comment can overrule the description. Open every attachment and link; if one cannot be opened, say so. Without Linear access, ask the person to paste the ticket's content. Never invent it.
2. **Extract** the problem in one sentence, who is affected, the acceptance criteria as a list, the preconditions, what is out of scope, and each decision made in a comment with its date.
3. **Map the ticket's family.** Do all of these, also when the ticket looks alone:
   - Parent ticket: read it and its comments.
   - Siblings: the other tickets with the same parent ticket.
   - Sub-tickets of this ticket.
   - Related tickets: blocks, blocked by, related, duplicate.
   - Same project and same labels: keep only tickets about the same screen, flow or data.
   - Text search in Linear with the 2 or 3 most specific terms of the ticket.
   For each ticket kept: id, relationship, title, status, and one line saying why it matters here.
4. **Find the pull requests of the family.** For each family ticket that is done or in review: `gh pr list --search "<TICKET-ID>" --state all --json number,title,state,mergedAt,url`. A merged pull request of a sibling shows where the feature lives in the code.
5. **Search the docs.** Search `docs/` and `local-docs/notes/` by every ticket id from steps 1 and 3 and by the terms of the feature, in file names and in file contents. Read each file found in full. Keep: path, date, what it is, and the facts that matter here.
6. **Search the code.** Read only. Before any git command, run `git rev-parse --show-toplevel`; use only `git log`, `git grep`, `git blame`, `git show`. Find:
   - the entry points (screen, route, command) the ticket names, and what guards or flags wrap them;
   - the flow from the entry point to the stored data, step by step;
   - every other caller of the same pieces (changing one changes all of them);
   - the configuration values and flags the area reads;
   - the tests that cover the area and what they check;
   - the last changes in the area: `git log --oneline -n 30 -- <paths>`;
   - the rules in `AGENTS.md` and `docs/` that apply to the area.
7. **Mark each acceptance criterion** as `existing`, `partial` (say which part), `new` or `unclear` (say what is unclear and who can answer). Give one sentence of evidence with the file path. If the ticket has no acceptance criteria, that is the first gap.
8. **List the gaps.** Every input the ticket needs and does not have: a missing criterion, a design, a text, a choice between two readings, a data question, a conflict with a family ticket or with a decision in `decisions.md`.
9. **Ask about the gaps, one question at a time.** Ask first the gaps that the person can answer. Wait for each answer. Record it with the date. Never fill a gap with an assumption. For a gap that another person must answer, write a draft message; do not send it.
10. **Find the ticket's folder.** If a folder named `<TICKET-ID>` exists under `local-docs/notes/`, use it. If not: use `local-docs/notes/<feature>/<TICKET-ID>/` when the parent ticket or a sibling already has a feature folder; otherwise ask one question: "Does this ticket belong to a feature? If yes, which name?" With no feature: `local-docs/notes/<TICKET-ID>/`. If `local-docs/notes/` does not exist, run `make local-docs` first.
11. **Write `discovery.md`** in that folder, with the structure in `reference.md`, in the profile's `output_language`. If `discovery.md` already exists, ask one question: "Update the existing file, or stop?" Mark every fact you did not verify as "not verified".
12. **Update the tracking files.**
   - `log.md` in the ticket's folder: add an entry at the top with the date and "discovery written".
   - `local-docs/notes/<feature>/overview.md`: add the ticket and its family to the linked tickets (create the file if the feature is new).
   - `local-docs/notes/open-questions.md`: add each gap still open, with the date.
   - `local-docs/notes/decisions.md`: add each decision the person made in step 9, with the date.
13. **Offer the Linear update.** Linear is the source of truth. If the answers of step 9 change the acceptance criteria or the scope, show the exact text to add to the ticket and ask: "Write this into the ticket in Linear?" Write it only after a yes. Never change the ticket's status here.
14. **Report**, then stay available: explain a step of the flow, summarize a family ticket's pull request, or give a draft message when asked.

## Output

A fixed report, written in the profile's `output_language`. Do not paste the file.

- **Done:** the path of `discovery.md`; the family table in short form (ticket, relationship, status); each acceptance criterion with its mark; overall effort, risk and confidence, each with one sentence; the tracking files updated; whether Linear was updated.
- **Not done:** gaps still open and who can answer each; links that could not be opened; facts not verified; draft messages not sent.
- **Next step:** `create-spec` when no criterion is `unclear`. If one is: get the open answers, then run `refine-ticket` again.

## Do not

- Do not write the spec, create a worktree, a branch or a commit, or edit code. This skill is read only on the repository.
- Do not skip the family map.
- Do not post, comment, label or change a status in Linear or GitHub. The only write to Linear is step 13, after a yes.
- Do not invent ticket content, an acceptance criterion, a reproduction or an answer to a gap.
- Do not pick a file by its name only; read it in full before using it.
- Do not ask two questions in one message.
- Do not write outside `local-docs/notes/`.
