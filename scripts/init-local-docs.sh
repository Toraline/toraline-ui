#!/usr/bin/env bash
# Creates local-docs/ for this user. The folder is in .gitignore: it is never committed.
# Never overwrites. Safe to run again.
set -euo pipefail
root="$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")"
cd "$root"
mkdir -p local-docs/notes/done local-docs/notes/cycles
[ -f local-docs/README.md ] || cat > local-docs/README.md <<'DOC'
# local-docs

Private to this user. Never committed.

- `notes/<feature>/<TICKET-ID>/` - everything about one ticket: discovery, spec copy, comments, log.
- `notes/<TICKET-ID>/` - a ticket with no feature.
- `notes/done/` - finished work.
- `notes/cycles/` - cycle plan snapshots.
- `notes/decisions.md`, `notes/open-questions.md`

The Linear ticket is the source of truth. These files track the data and the linked tickets.
DOC
[ -f local-docs/notes/decisions.md ] || printf '# Decisions\n\nNewest first. One dated entry per decision.\n' > local-docs/notes/decisions.md
[ -f local-docs/notes/open-questions.md ] || printf '# Open questions\n\nThings not decided yet, each with the date it was written down.\n' > local-docs/notes/open-questions.md
echo "local-docs ready in $root/local-docs"
