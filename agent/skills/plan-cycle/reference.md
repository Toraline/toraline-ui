# Cycle plan: reference

Read by `plan-cycle` and `cycle-mode`. It defines the files of one cycle, the format of `plan.md`, the lanes, the task flows and the estimating rules.

## Files of one cycle

```
local-docs/notes/cycles/<cycle>/
  plan.md                         the live plan; the only file that is edited
  log.md                          newest entry first; what changed and why
  snapshots/<YYYY-MM-DD-HHMM>.md  copies of plan.md; never edited
```

`<cycle>` is the cycle number as Linear shows it. `local-docs/` is in the main checkout and is never committed.

## Format of plan.md

```markdown
# Cycle <cycle>: <first day> to <last day>

## Context you need before reading
- One line per term used below.

## Numbers
| | Hours |
|---|---|
| Capacity (<days> days x <hours per day>) | |
| Estimated, not done | |
| Logged | |

## Days
| Day | Items | Planned hours | Capacity |
|---|---|---|---|

## Items

### <PREFIX>-<n> <short title>
- Link: <Linear link>
- Linear status: <status> (read <YYYY-MM-DD HH:MM>)
- Lane: <lane>
- Flow: <flow>
- Pull requests: <#number, target branch, state> or none
- Estimate: <hours> h (suggested <hours> h, confidence <high|medium|low>: <one sentence>)
- Days: <YYYY-MM-DD, ...> or not planned
- Waiting for: <who or what> or nobody
- Next step: <one sentence>

Tasks:
- [ ] t1 <label> (who: <Person|AI + person|AI>, <hours> h, status: todo)
- [x] t2 <label> (who: Person, 0.5 h, status: done, done <YYYY-MM-DD>)

Time logged:
- <YYYY-MM-DD> <minutes> min on t1: <note>

## Open questions
- Q1 <question>
  - Answer: <empty until the person answers>

## Status
- Done / Not done / What you must do
```

Rules of the format:

1. Item ids: `<PREFIX>-<n>` for a ticket; `OTHER-<n>` for work outside Linear.
2. Task ids are `t1`, `t2`, in order, and are never reused inside an item.
3. Task status is one of `todo`, `in-progress`, `waiting`, `done`. A ticked box and `status: done` always go together.
4. "Estimate" is the person's number once they set it. "suggested" is the agent's number and stays beside it.
5. An item is finished when every task is ticked, or when its Linear status means done.

## The person's entries win

Ticks, task statuses, estimates, days, logged time, notes and tasks the person added are true. Never overwrite, untick, reorder or reword them. When Linear or GitHub disagrees with an entry, keep the entry and report the difference.

A refresh from Linear changes only: "Linear status", "Pull requests", and new tickets of the cycle. The agent may tick a task only when Linear or GitHub proves it (for example: the pull request is merged), and lists every such tick in the report.

## Lanes

| Situation | Lane |
|---|---|
| Linear status means done | Done this cycle |
| Merged, waiting for release | Waiting for release |
| Open pull request, approved, no unresolved thread | Merge when the checks pass |
| Open pull request with changes requested, a conflict, a failing check or unresolved threads | Fix my open pull requests |
| Open pull request with nothing to fix, waiting for a reviewer | Waiting on reviewers |
| Not started or in progress, priority urgent or high | New work, high priority |
| Any other ticket not started or in progress | New work, lower priority |
| `OTHER-<n>` | Other work |

## Task flows

Hours are the person's hands-on hours. A step done by `AI` alone counts 0 hours for the person.

**build** (ticket not started or in progress):
1. Refine the ticket (`/refine-ticket`), when it has no `discovery.md`: AI + person
2. Write the spec (`/create-spec`): AI + person, about 30 % of the hours
3. Execute the spec (`/execute-spec`): AI, about 15 %
4. Review the change (`/review-diff`): Person, about 35 %
5. Test the change: Person, the test hours
6. Commit and open the pull request (`/commit`, `/open-pr`): AI + person, 0.25 h
7. Merge: Person, 0.25 h

**review** (ticket with an open pull request):
1. Check the pull request: conflicts, checks, comments: Person, 0.25 h
2. Check each comment (`/validate-comments`), when a person asked for changes: AI + person
3. Fix what is confirmed (`/fix-pr`); name what, by pull request number: AI + person
4. Review and test the fix: Person
5. Merge: Person, 0.25 h

**other** (`OTHER-<n>`): the person's own steps and hours. Without hours: one task, your estimate, confidence `low`, and an open question asking for the real number.

Put ticket-specific facts (pull request numbers, the conflict, the reviewer) in the task label.

## Estimating

1. The estimate is the person's time working with agents: investigating, steering, reviewing, testing, answering review. It is not typing time.
2. Base it on evidence: the ticket's description and every comment, the ticket's local files, the unresolved review threads, and the code the ticket points to.
3. Use steps of 0.25 h. Give test hours apart from the other hours.
4. Test effort: `quick` (30 minutes or less, one screen), `moderate` (30 to 90 minutes, several steps or data to prepare), `complex` (more than 90 minutes, several roles or a special state).
5. When the evidence is missing, set confidence `low`, say what is missing, and add an open question. Never present a guess as a fact.
6. Calibration: when earlier cycles exist, multiply by "logged divided by estimated" of the same flow, and say so.

## Proposing days

Only when the person asked for a proposal.

1. Order: merges and re-checks that take under 30 minutes; then urgent; then high priority; then fixes on the oldest open pull requests; then the rest.
2. Start `AI` steps early in the day so they run while the person does other work.
3. A long item is spread over 2 or more days.
4. A day's hours are the sum of the person's task hours on it. When a day is over the capacity, show the numbers and ask. Never move an item to another cycle yourself.
5. A day the person chose is never changed without asking.
