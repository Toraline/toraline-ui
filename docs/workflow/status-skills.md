# Linear status to skill

Which skill to run for a ticket, by its status in Linear. Status names differ between workspaces; match by meaning.

| Ticket status (meaning) | Skill |
|---|---|
| Not refined yet (Backlog, Triage) | `/refine-ticket` |
| Refined, no spec (Todo) | `/create-spec` |
| Has a spec, not started | `/execute-spec` |
| In progress, work stopped | `/continue` |
| Change ready, not committed | `/review-diff`, then `/commit` |
| Committed, no pull request | `/open-pr` |
| In review, comments open | `/validate-comments`, then `/fix-pr` |
| Merged, waiting for release | `/release` |

With the team pack on: `/pr-status` for one pull request, `/babysit` for all of yours, `/review-pr` for someone else's.
