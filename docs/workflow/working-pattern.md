# Working pattern

The flow of one piece of work, in order. Each step is one skill. Each skill ends by naming the next one.

| # | Step | Skill | What exists after it |
|---|---|---|---|
| 1 | Decide what to do now | `/start` | You know which skill to run |
| 2 | Plan the week | `/plan-cycle`, then `/cycle-mode` each day | A cycle plan with estimates |
| 3 | Understand the ticket | `/refine-ticket` | A discovery file: what exists, what is new, what is unclear |
| 4 | Write the instruction | `/create-spec` | The spec, in the Linear ticket and in the local tracking file |
| 5 | Build | `/execute-spec` | A worktree, a branch, the change, the checks passing |
| 6 | Check your own change | `/review-diff` | A list of problems, or none |
| 7 | Save | `/commit` | One commit in the profile's format |
| 8 | Publish | `/open-pr` | A pull request, reviewed against the ticket |
| 9 | Handle review | `/validate-comments`, then `/fix-pr` | Every comment checked, the confirmed ones fixed |
| 10 | Ship | `/release` | A release ticket and pull request text |

Stopped in the middle: `/continue <ticket>` reads the ticket's folder and says what is left.

## Fixed rules

1. One ticket, one worktree, one branch: `make worktree TICKET=<n> SLUG=<short-slug>`.
2. Linear is the source of truth for a ticket. The local files in `local-docs/notes/` track the data and the linked tickets.
3. A new module needs an approved model before any code (`/new-module`).
4. The rules in `agent/rules/` apply to every step.
5. When the agent's work on a ticket is finished, the ticket moves to the profile's `finished_status` (default `Needs QA`). An agent never moves a ticket to done by itself.

## Words

| Word | Meaning |
|---|---|
| ticket | One unit of work in Linear |
| parent ticket | A ticket that groups sub-tickets |
| feature | A named area of work that can hold several tickets |
| spec | The instruction an agent executes for one ticket |
| cycle | One week of planned work |
| log | Append-only record of what happened, newest first |
| decisions | Dated list of decisions |
| open questions | Things not decided yet |
