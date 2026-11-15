---
name: plan-cycle
description: Builds the plan for one cycle (one week of work) from Linear, with an estimate and a task list per ticket, and saves it with a snapshot in local-docs. Use when the user says "/plan-cycle", "plan my week", "plan the cycle" or "what is in this cycle".
disable-model-invocation: true
metadata:
  pack: core
  stage: Plan
---

# Plan cycle

Builds the plan for one Linear cycle: every ticket assigned to the person in that cycle, its pull requests, an estimate in hours, a task list, and the open questions the plan needs answered. It leaves `plan.md`, a first snapshot and a first log entry in `local-docs/notes/cycles/<cycle>/`.

## Input

The cycle number as Linear shows it: `/plan-cycle 12`. If it is missing, ask for it and wait.

## Reads

- Project profile in `AGENTS.md`: `ticket_prefix`, `base_branch`, `output_language`, `packs`.
- `agent/rules/writing.md`, `agent/rules/ask-first.md`, `agent/rules/git-safety.md`.
- `agent/skills/plan-cycle/reference.md`: the format of `plan.md`, the lanes, the task flows, the estimating rules.
- `docs/workflow/sources-of-truth.md`, `docs/workflow/status-skills.md`.
- `local-docs/notes/cycles/*/plan.md` and `log.md` of earlier cycles (for calibration).
- `local-docs/notes/**/<TICKET-ID>/` of each ticket in the cycle: `discovery.md`, `spec-v1.md`, `comments-v1.md`, `log.md`.
- Linear, through any tool or MCP server with `linear` in its name. GitHub, through `gh`, read only.

## Steps

1. **Check for an existing plan.** If `local-docs/notes/cycles/<cycle>/plan.md` exists, stop and ask one question: "Cycle `<cycle>` already has a plan. Refresh it with `/cycle-mode <cycle>`, or build it again? Building again keeps your ticks, your hours and your days." Wait for the answer. If `local-docs/notes/` does not exist, run `make local-docs` first.
2. **Read earlier cycles.** For each earlier `plan.md`, compare the estimated hours with the logged hours per flow (the flows are in `reference.md`). Keep the ratio "logged divided by estimated" for step 6. With no earlier cycle, say so in the report.
3. **Get the cycle from Linear.** Find the team whose key is the profile's `ticket_prefix`. Find the cycle with the given number. Read its first and last day. List the tickets of that cycle assigned to the person, with: id, title, status, priority, estimate, labels, project, parent ticket, link.
   - Cycle not found: say so and stop.
   - No Linear access: ask the person to paste the cycle's dates and ticket list. Never invent a ticket.
4. **Get the pull requests.** Read only. Run `gh pr list --author @me --state open --json number,title,headRefName,baseRefName,isDraft,reviewDecision,mergeable,statusCheckRollup,url`. Match a pull request to a ticket by the ticket id in the branch name or title. Count the unresolved review threads of each one. A ticket in a review status with no pull request is an open question.
5. **Give each ticket a lane.** Use the lane table in `reference.md`. Match Linear statuses by meaning, as in `docs/workflow/status-skills.md`.
6. **Estimate each ticket that is not done.** Follow "Estimating" in `reference.md`: read the ticket's description and every comment, its local files, its unresolved review threads and the code it points to. Give the hours of the person, a confidence (`high`, `medium`, `low`) and one sentence saying why. Multiply by the ratio from step 2 when one exists, and say that you did. Build the task list from the matching flow in `reference.md`.
7. **Ask for work outside Linear.** One question: "Is there other work this cycle that is not in Linear, for example reviews for other people, documents or meetings?" Add each answer as an item with the id `OTHER-<n>`, the person's hours, or your estimate with confidence `low`.
8. **Ask for the capacity.** One question: "How many hours per day do you work on this, and on which days of the cycle?" Do not assume a number.
9. **Ask about the days.** One question: "Do you want me to propose a day for each item, or will you set the days yourself?"
   - The person sets them: leave every item with no day.
   - Propose: order by the rule in `reference.md` ("Proposing days"). Show the hours per day against the capacity. When a day is over the capacity, show it and ask what to move. Never decide it yourself.
10. **Write `local-docs/notes/cycles/<cycle>/plan.md`** in the format of `reference.md`, in the profile's `output_language`. Each thing you could not verify becomes a numbered entry under "Open questions" (`Q1`, `Q2`). Always add one when the total estimated hours are more than the capacity.
11. **Save the first snapshot.** Copy `plan.md` to `local-docs/notes/cycles/<cycle>/snapshots/<YYYY-MM-DD-HHMM>.md` (local time of the machine). A snapshot is never edited afterwards.
12. **Start the log.** Create `local-docs/notes/cycles/<cycle>/log.md` with one dated entry: the snapshot name, the number of items, the total hours, the capacity, the open questions.
13. **Report**, then ask the first open question as one question. Ask the next one only after the answer. Write each answer under its question in `plan.md` and apply it to the plan.

## Output

A fixed report, written in the profile's `output_language`:

- **Done:** the path of `plan.md`, of the snapshot and of `log.md`; a table "lane, number of items, hours"; total estimated hours against the capacity, with the difference.
- **Not done:** tickets that could not be read or estimated, and why; data that came from the person instead of Linear; the open questions by id.
- **Next step:** `cycle-mode` (daily use of this plan). For a ticket that is not refined yet: `refine-ticket`.

## Do not

- Do not write to Linear or GitHub: no comment, no status change, no estimate, no label, no merge, no re-run of a check.
- Do not run a git command that changes state. This skill needs no worktree.
- Do not invent a ticket, an estimate source or a pull request state. Say "not verified" when you did not open it.
- Do not overwrite hours, ticks, days or notes the person entered in an existing `plan.md`.
- Do not move an item to another cycle, and do not remove an item, without the person's answer.
- Do not put a secret, a token or personal data of a third person in the plan.
- Do not write outside `local-docs/notes/cycles/<cycle>/`.
