---
name: new-module
description: Builds a new business module in three phases (an approved model, a parent ticket with sub-tickets, then the sub-tickets one by one) and continues a module that was started. Use when the user says "new module", "plan and build the <name> module", "continue the module <PREFIX>-123" or "/new-module".
disable-model-invocation: true
metadata:
  pack: core
  stage: Build
---

# New module

Takes a business module from an idea to code. It leaves: an approved model saved in the parent ticket, ordered sub-tickets in Linear, one worktree for the parent ticket, one commit per sub-ticket, and the notes files of the feature. No code is written before the model is approved.

## Input

One of these:

- A new module: its name and what it is for. Example: `/new-module "Inventory: staff record stock per warehouse"`
- A module that was started: the parent ticket id. Example: `/new-module <PREFIX>-123`

## Reads

- Project profile in `AGENTS.md`: `ticket_prefix`, `base_branch`, `worktree_path`, `main_checkout`, `spec_location`, `push`, `allow_no_verify`, `commit_format`, `check_command`, `output_language`, `external_writes`.
- `agent/rules/writing.md`, `agent/rules/git-safety.md`, `agent/rules/ask-first.md`.
- `docs/workflow/working-pattern.md`, `docs/workflow/sources-of-truth.md`.
- `reference.md` beside this file: the shapes of the approved model, the parent ticket and a sub-ticket.
- `docs/` files about architecture, and the code of the apps the module touches.
- Linear, through any tool or MCP server with `linear` in its name. Without access: ask the person for the ticket content; each ticket text is then given to the person as a draft to create by hand. Never invent ticket content.

## Steps

### Phase 0: where to start

1. Read the profile values with `scripts/profile.sh get <key>`.
2. Ask: "Is there already a ticket in Linear for this module?" If the input has a ticket id, confirm that it is the module's ticket instead of asking.
   - Yes: read it in full (description, comments, sub-tickets, linked tickets). It becomes the parent ticket. Never create a second parent ticket.
   - No: the parent ticket is created in Phase 2.
3. If the parent ticket has the section `## Approved model` and sub-tickets, go to Phase 4 (continue).

### Phase 1: the model

4. Understand the request. Ask only what the message and the ticket do not answer, one question at a time: what the module solves, who uses it, what it replaces, which apps it touches, which references exist (documents, designs, the current system).
5. Discovery, read-only: the `docs/` files, the code of the touched apps, existing tickets on the same subject (to avoid duplicates). If the module needs a new app, note it; the `new-app` skill creates it as one of the sub-tickets.
6. Write the proposal in the shape "Approved model" of `reference.md`: boundaries, entities, permissions, numbered objectives, out of scope, numbered open questions (each with your suggested answer).
7. Ask the open questions one at a time. Update the proposal after each answer. Do not fill a product gap with an assumption.
8. Show the full model and ask: "Do you approve this model?" Wait for a clear yes. Without it, stop here.

### Phase 2: tickets

9. Split the objectives into sub-tickets. Each sub-ticket is one change that can be checked alone, in the order they must be built. Each one has its spec inside it (shape in `reference.md`). Objectives left for later become tickets for later, with no spec.
10. Show the list (order, title, one line each) and the parent ticket text. Ask for a yes before writing anything to Linear.
11. Write to Linear, in this order:
    1. The parent ticket: create it, or rewrite the existing ticket in the parent shape. Keep the original text of an existing ticket under "Original request". The section `## Approved model` holds the model, the date, and each question with the person's answer.
    2. The sub-tickets, linked to the parent ticket, with the order number in the title. Reuse existing sub-tickets that fit; do not create duplicates.
    3. The delivery plan in the parent ticket: the ordered list of sub-tickets with links.
12. Write the local files: `local-docs/notes/<module>/overview.md` with the list of linked tickets; `local-docs/notes/<module>/<TICKET-ID>/spec-v1.md` for each sub-ticket (when `spec_location` is `both` or `file`); the approved decisions in `local-docs/notes/decisions.md`; what is undecided in `local-docs/notes/open-questions.md`.

### Phase 3: execution

13. Tell the person how the execution works, and ask for a yes: one worktree and one branch for the parent ticket; the sub-tickets in order; one commit per sub-ticket; push according to the profile's `push`; questions asked when they block.
14. Create the worktree from the main checkout: `make worktree TICKET=<parent number> SLUG=<module-slug>`. Work only inside it. Confirm with `git rev-parse --show-toplevel`.
15. For each sub-ticket, in order:
    1. Say in one sentence which sub-ticket starts.
    2. Execute its spec as the `execute-spec` skill does (its steps 6 to 10), in the parent's worktree. Only that sub-ticket's scope.
    3. Run the profile's `check_command`. It must pass.
    4. Review the change as the `review-diff` skill does. Fix what must be fixed.
    5. Stage the files by name and make one commit in the profile's `commit_format`, with the sub-ticket id. Follow `agent/rules/git-safety.md`.
    6. Follow the profile's `push`.
    7. Update the sub-ticket in Linear (status, what was delivered) and the delivery plan of the parent ticket. Add an entry at the top of the sub-ticket's `log.md` with the commit hash.
    8. If a question blocks this sub-ticket, ask it and wait. Do not skip to the next one unless the person says so.
16. A change to the model during execution (entity, permission, business rule): stop, confirm with the person, add a dated line under "Changes" in `## Approved model`, then update the affected sub-tickets.

### Phase 4: continue a started module

17. Rebuild the state: the parent ticket (`## Approved model`, delivery plan), the status of each sub-ticket, `make worktree-list`, and in the worktree `git status --short` and `git log --oneline` searched for each sub-ticket id. Read the notes files.
18. A sub-ticket in progress with changed files and no commit is interrupted work: read the diff before continuing. Do not commit it unread.
19. Show: delivered (sub-ticket and commit), in progress, left, open questions. Ask what to do: continue the plan (Phase 3, step 15, from the first sub-ticket not delivered), or apply feedback.
20. Feedback: each item becomes a new sub-ticket to execute, or a ticket for later, or a change to the model (step 16). Create the tickets first, show the list, then execute.

## Output

A fixed report:

- **Done:** parent ticket link; `## Approved model` saved (yes or no); each sub-ticket with its link, status and commit hash; worktree folder and branch; pushed or not; paths of the notes files; decisions the person should review.
- **Not done:** sub-tickets not executed or blocked, with the reason; tickets left for later; open questions; what was not verified.
- **Next step:** `open-pr` for the parent ticket when every sub-ticket is committed. Otherwise `new-module <PREFIX>-<parent>` to continue.

## Do not

- Do not create tickets or write code before the model is approved and saved in the parent ticket.
- Do not leave the model only in the conversation.
- Do not create a new parent ticket when one exists. Do not delete the original text of an adopted ticket.
- Do not execute a delivered sub-ticket again unless the person asks.
- Do not edit or commit in the main checkout. Do not create a branch other than the parent's.
- Do not use `git add -A`, `--amend` on a pushed commit, or `--no-verify` unless `allow_no_verify` is `yes`.
- Do not merge. Do not open the pull request here.
- Do not ask several questions in one message.
