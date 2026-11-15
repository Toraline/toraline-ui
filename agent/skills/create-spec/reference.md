# create-spec: shapes

Used by `SKILL.md` in this folder. Replace every `<placeholder>`. Remove a section only when it truly does not apply, and say so in one line.

## Shape of the spec

This is the text that goes under `## Spec` in the Linear ticket and into `spec-v<n>.md`.

```markdown
# Spec v<n>: <ticket title> (<PREFIX>-<n>)

## Goal
One or two sentences: what a person can do or see after this change that they cannot today.

## Type
One of: new behavior, bug fix, change to existing behavior, documentation.

## Before you start
- Read `AGENTS.md`, `agent/rules/writing.md`, `agent/rules/git-safety.md`, `agent/rules/ask-first.md`.
- Work only in the ticket's worktree: `make worktree TICKET=<n> SLUG=<slug>` (base: `<base_branch>`).
- Read these files first: <exact paths, each with one line saying why>.

## Scope
Numbered list of the changes. Each item: the file path, what changes, and the existing code to copy the pattern from.

## Out of scope
What this ticket does not change, even if it looks related.

## For a bug fix only
- Steps to reproduce.
- What happens now. What must happen.
- Cause, if known. Write "not verified" when it is a guess.

## Acceptance criteria
Numbered. Each one can be checked with yes or no.

## Tests
- Automated tests to add or change, with file paths.
- Manual checks, as numbered steps, with the data needed.

## Checks that must pass
`<check_command>`

## Risks
What can break outside the changed files, and how to check it.

## Open questions
Things the person has not decided. Empty when there are none. The executing agent stops and asks if one of them blocks the work.

## When done
Write `log.md`, then report Done / Not done / Next step. Do not commit unless the skill being run says so.
```

## Shape of `overview.md`

One per feature, in `local-docs/notes/<feature>/overview.md`.

```markdown
# <Feature name>

## Context you need before reading
One line per term used below.

## What it is
Two or three sentences: what the feature does and for whom.

## Linked tickets

| Ticket | Title | Role | Status | Spec |
|---|---|---|---|---|
| <PREFIX>-<n> | <title> | parent ticket / sub-ticket / related / blocks / blocked by | <Linear status> | v<n> or none |

## Status
- Done: ...
- Not done: ...
- What you must do: ...
```

The table is a tracking copy. When it disagrees with Linear, Linear is right: correct the table.
