# Refine ticket: reference

Read by `refine-ticket`. It defines the structure of `discovery.md` and the scales for effort and risk.

## Where the file goes

```
local-docs/notes/<feature>/<TICKET-ID>/discovery.md    the ticket belongs to a feature
local-docs/notes/<TICKET-ID>/discovery.md              the ticket has no feature
```

The same folder later holds `spec-v1.md`, `comments-v1.md` and `log.md`. Linear is the source of truth; these files track the data and the linked tickets.

## Structure of discovery.md

Use exactly these sections, in this order. Write for a reader who has never heard of the feature. Each section must be understood without opening the ticket.

```markdown
# <TICKET-ID> <ticket title>: discovery

- Ticket: <Linear link>
- Status: <status> | Priority: <priority> | Cycle: <cycle or none>
- Parent ticket: <id and title, or none> | Sub-tickets: <count> | Related tickets: <count>
- Feature: <name, or none>
- Written: <YYYY-MM-DD HH:MM>
- Source: <Linear, or "pasted by the person">

## Context you need before reading
One line per term, screen, flow, role or tool used below. No code.

## What the ticket asks for
The problem, who it affects, what "done" looks like for the user.

| # | Acceptance criterion | Mark | Evidence |
|---|---|---|---|
| 1 | ... | existing / partial / new / unclear | one sentence, with the file path |

Out of scope: ...
Decisions in the ticket's comments: date, decision.

## The ticket's family
| Ticket | Relationship | Title | Status | Why it matters here | Pull request |
|---|---|---|---|---|---|

Then one short paragraph per ticket that changes how this one must be done.

## What the docs already say
One line per file: path, date, what it is, the facts that matter here.

## How the feature works today
Numbered steps from the entry point to the stored data, in plain words, with the file path in parentheses.
- Flags and configuration: ...
- Other callers of the same pieces: each with what would break if it changed.
- Tests that exist: what each one checks.
- Recent changes: date, what changed.
- Rules that apply: each in one sentence.

## Risks
One block per risk: what a user would see, why it is a risk here, how to avoid it.

## Gaps
| # | What is missing | Who can answer | Answer (with date), or "open" |
|---|---|---|---|

## Draft messages
One per open gap that another person must answer: the exact text. Not sent.

## Suggested approach
5 to 10 numbered steps: where the change goes, in which order, what to reuse, what to test.

## Effort and risk
| # | Criterion | Mark | Effort | Risk | Why (points at the evidence above) |
|---|---|---|---|---|---|

- Overall effort: <value>, with the largest cost in one sentence.
- Overall risk: <value>, with the riskiest piece in one sentence.
- What could change the estimate: each open gap, and how far the estimate moves.
- Confidence: <low / medium / high>, and why.

## Status
- Done: ...
- Not done: ...
- What you must do: ...
```

## Marks

| Mark | Meaning |
|---|---|
| existing | The code already does this. Name the file that proves it |
| partial | Part of it exists. Say which part exists and which does not |
| new | Nothing does this today |
| unclear | The criterion can be read in 2 or more ways, or an input is missing. Say what, and who can answer |

## Effort scale

| Effort | Meaning |
|---|---|
| Trivial | Under half a day. One file, no new data, existing tests cover it |
| Small | Half a day to 1 day. A few files in one layer, no change to stored data |
| Medium | 2 to 3 days. More than one layer, or a change to stored data, or a new flag, or new tests |
| Large | 1 week or more. A new flow, an outside service, shared code with many callers, or several unknowns |

## Risk scale

| Risk | Meaning |
|---|---|
| Low | Behind a flag or on a new screen; nothing else reads the changed pieces; simple to undo |
| Medium | Shared code with a few callers, or a write to stored data, or a visible change with no flag |
| High | Money, permissions, data that belongs to another account, a write to an outside service, a change to a table in use, or shared code with many callers |

Every rating points at evidence in the file: which files, how many callers, which tests exist. A rating with no evidence is written as "not verified".
