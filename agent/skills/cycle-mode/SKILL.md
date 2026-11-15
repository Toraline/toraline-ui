---
name: cycle-mode
description: Daily use of the cycle plan, where each message logs time, ticks a task, reschedules an item or refreshes the plan from Linear. Use when the user says "/cycle-mode", "where am I this week", "log time on a ticket" or "refresh the cycle plan".
disable-model-invocation: true
metadata:
  pack: core
  stage: Plan
---

# Cycle mode

Turns the conversation into the assistant for one cycle plan. It shows where the person stands today, then treats every message as a change to the plan until the person leaves the mode. It leaves an updated `plan.md`, a new snapshot and a new log entry in `local-docs/notes/cycles/<cycle>/`.

## Input

The cycle number is optional: `/cycle-mode 12`. Without it, use the folder in `local-docs/notes/cycles/` whose dates contain today. If none does, ask for the number and wait.

## Reads

- Project profile in `AGENTS.md`: `ticket_prefix`, `output_language`.
- `agent/rules/writing.md`, `agent/rules/ask-first.md`, `agent/rules/git-safety.md`.
- `agent/skills/plan-cycle/reference.md`: the format of `plan.md`, "The person's entries win", the lanes, the task flows.
- `local-docs/notes/cycles/<cycle>/plan.md` and the 3 newest entries of `log.md`.
- Linear (any tool or MCP server with `linear` in its name) and GitHub (`gh`), read only, and only on a refresh.

## Steps

1. **Load the plan.** Read `plan.md`. If it does not exist, say "Cycle `<cycle>` has no plan yet. Run `/plan-cycle <cycle>`." and stop. Get today's date and time from the machine.
2. **Show where the person stands**, in one short message:
   1. Today: the items planned for today, each with its next unticked task.
   2. In motion: tasks with status `in-progress` or `waiting` (with the "waiting for" text).
   3. Numbers: hours left to do against capacity left; time logged today; items with no day.
   4. Open questions with no answer, by id.
   5. The sentence: "Cycle mode is on. Tell me what to change, or ask what is next."
3. **Handle each message as a change to the plan** until the person says "exit cycle mode". For each one:
   1. Read `plan.md` again before writing. The person may have edited it.
   2. Change only what was asked. Keep every other line as it is.
   3. Confirm in one line what changed, with the item id.
   4. Keep the line in a running list for the log.

| The person says (examples) | Do |
|---|---|
| "log 45 minutes on `<PREFIX>-<n>` review, note ..." | Add a line under "Time logged" of that item |
| "tick t2 of `<PREFIX>-<n>`" | Tick the task; set `status: done` and the date |
| "`<PREFIX>-<n>` t3 is waiting for the reviewer" | Set the task status and "Waiting for" |
| "add a task to `<PREFIX>-<n>`: ..., 30 minutes" | Append it with the next free task id |
| "move `<PREFIX>-<n>` to Thursday" / "plan it for 2 hours" | Set "Days" and "Estimate"; update the "Days" table |
| "add: a meeting on Wednesday, 30 minutes" | New `OTHER-<n>` item with one task |
| "`<PREFIX>-<n>` is done" | Tick every open task; add the time when the person gives it |
| "Q2: ..." | Write the answer under the question, then apply it to the items it names |
| "what is next?" | Name one next step: from today's items, then tasks in motion, then the shortest item left |
| "where am I?" | Do step 2 again with a fresh read |
| "refresh" | Do step 4 |
| "end of day" | Do step 5, then list what was logged today and what is planned for tomorrow |

   When a message does not say which item, which task or which day, ask one short question before writing. When a message is clearly about other work, ask once whether to leave the mode.
4. **Refresh from Linear** (on "refresh" only).
   1. Read the cycle's tickets assigned to the person and their open and merged pull requests, as in `plan-cycle` steps 3 and 4. Without Linear access, ask the person what changed. Never invent it.
   2. Build the list of changes before writing anything:

| Change found | Do |
|---|---|
| New ticket in the cycle | Add an item with lane, estimate and tasks, as in `plan-cycle` steps 5 and 6 |
| Ticket no longer in the cycle | Keep it. Ask whether to remove it |
| Linear status changed | Update "Linear status" and "Lane". Change no task because of it |
| Pull request opened, merged, closed, approved, in conflict, or with new threads | Update "Pull requests" and "Next step" |
| A task proven done by Linear or GitHub | Tick it, and list it in the report |
| Linear is ahead of or behind the person's ticks | Change nothing. List the difference in the report |
| An unfinished item whose days are all in the past | Propose a new day. Change it only after a yes |

   3. Write the changes, then do step 5.
5. **Save history.** On "refresh", "end of day", "exit cycle mode", or after 10 changes:
   1. Recompute the "Numbers" and "Days" tables of `plan.md`.
   2. Copy `plan.md` to `snapshots/<YYYY-MM-DD-HHMM>.md` (local time of the machine).
   3. Add an entry at the top of `log.md`: the snapshot name, the running list of changes, what the person changed in the file by hand since the last snapshot, the open questions.
6. **Leave the mode.** On "exit cycle mode": do step 5 if anything changed since the last snapshot, write the report, and say that cycle mode is off.

## Output

A fixed report, written in the profile's `output_language`, on "refresh", "end of day" and "exit cycle mode":

- **Done:** a table "item, change" in one plain line each; hours left against capacity left; time logged against the estimate; the paths of `plan.md`, the new snapshot and `log.md`.
- **Not done:** changes that wait for the person's answer; differences between Linear and the plan; data that was not verified.
- **Next step:** `cycle-mode` again tomorrow. For the item named by "what is next?": the skill for its Linear status, from `docs/workflow/status-skills.md` (for example `refine-ticket` or `create-spec`).

## Do not

- Do not write to Linear or GitHub. A task ticked here does not change the ticket's status in Linear; the person changes it there.
- Do not overwrite, untick, reorder or reword anything the person entered: ticks, hours, days, notes, tasks.
- Do not delete a time entry, a ticked task or an item without the person's answer.
- Do not move an item to another cycle yourself. Show the overload and ask.
- Do not edit a file in `snapshots/`.
- Do not run a git command that changes state, and do not write outside `local-docs/notes/cycles/<cycle>/`.
- Do not ask two questions in one message.
