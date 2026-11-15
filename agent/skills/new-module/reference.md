# new-module: shapes

Used by `SKILL.md` in this folder. Replace every `<placeholder>`. Write the texts in the profile's `output_language`.

## Approved model

Goes in the parent ticket under `## Approved model`. Before approval, the same shape is the proposal.

```markdown
## Approved model

Approved on <YYYY-MM-DD> by <who approved, as the person states it>.

### What the module is
Two or three sentences: what it solves, who uses it, what it replaces.

### Boundaries
- Apps touched: <list>. New app needed: yes / no.
- What this module owns (data and screens).
- What it reads from other modules, and what other modules read from it.

### Entities
| Entity | What it is, in plain words | Main fields | Belongs to |
|---|---|---|---|

### Permissions
| Role | Can see | Can create or change | Cannot |
|---|---|---|---|

### Names
| Word a person sees | Name in the code |
|---|---|

### Objectives
1. <One thing a person can do when this is delivered.>
2. ...

### Out of scope
- <What this version does not do.>

### Questions and answers
1. <Question> - Answer: <the person's answer>

### Changes
- <YYYY-MM-DD>: <what changed in the model after approval, and why>
```

## Parent ticket

```markdown
# <Module name>

## Goal
One or two sentences.

## Approved model
(the section above)

## Delivery plan
| # | Sub-ticket | Status | Commit |
|---|---|---|---|
| 1 | <PREFIX>-<n> <title> | <status> | <hash or empty> |

## Tickets for later
- <PREFIX>-<n> <title>

## Open questions
- <question, with the date>

## Original request
<The text the ticket had before it became the parent ticket. Unchanged.>
```

## Sub-ticket

Title: `<order number>. <what a person can do after it>`.

```markdown
## Goal
One sentence.

## Depends on
<Sub-tickets that must be delivered first, or "nothing".>

## Spec
<The spec, in the shape defined in `agent/skills/create-spec/reference.md`.>

## Delivered
<Filled in after the commit: what was done, the commit hash, what was not verified.>
```

## Rules for splitting

1. One sub-ticket is one change that passes the check command alone.
2. Order: data and rules first, then the screens that use them, then permissions checks across the module, then documentation.
3. A sub-ticket that needs a decision not yet made is not created. The decision goes to "Open questions".
4. An objective outside this version becomes a ticket for later, with no spec.
