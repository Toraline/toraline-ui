# Sources of truth

Where each kind of thing lives. When two places disagree, the one in the "Wins" column is right.

| Thing | Lives in | Committed? | Wins |
|---|---|---|---|
| A ticket: scope, status, spec | Linear | - | Linear |
| Per-ticket working files: discovery, spec copy, comment checks, log | `local-docs/notes/<feature>/<TICKET-ID>/` | No, per user | Linear |
| Shared documentation: architecture, decisions, how-to | `docs/` | Yes | `docs/` |
| How agents work here | `AGENTS.md`, `agent/rules/`, `agent/skills/` | Yes | These files |
| Values that differ between projects | The project profile in `AGENTS.md` | Yes | The profile |
| Core skills, rules, scripts | The boilerplate repository; copied here by `make sync-skills` | Yes | The boilerplate |
| Skills of this project only | `agent/skills/<name>/` with `pack: project` | Yes | This repository |
| Personal skills of one person | That person's own skills folder, outside every repository | No | - |
| Secrets | `.env` on each machine | Never | - |

## Layout of local-docs

```
local-docs/                 made per user, in .gitignore
  notes/
    <feature>/              a feature, area or main name
      overview.md           what it is, with the linked tickets
      <TICKET-ID>/          a ticket that belongs to the feature
        discovery.md
        spec-v1.md
        comments-v1.md
        log.md
    <TICKET-ID>/            a ticket with no feature
    done/                   finished work
    reviews/                reviews of other people's pull requests
    reports/                reports that belong to no ticket (standup, context dumps, babysit runs)
    cycles/                 cycle plan snapshots
    decisions.md
    open-questions.md
```

Create it with `make local-docs`.
