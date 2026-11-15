# toraline-ui

The component library of Toraline: styled React components, with configurable themes and fonts. Each Toraline app installs it.

**This is the branch `v2`.** Version 2 is being built here. The old library is unchanged in [`legacy/`](legacy/), and is still released from the branch `main` as `@toraline/toraline-ui`.

## What is where

| Path | Content | State |
|---|---|---|
| `packages/tokens` | Design tokens, themes, and the function that builds a theme | Skeleton. Built in phase 2 |
| `packages/ui` | The styled components, published as `@toraline/ui` | Skeleton. Built in phase 3 |
| `apps/catalog` | The catalog (Storybook) | Placeholder. Built in phase 4 |
| `legacy/` | The old library: Create React App, styled-components 5, Storybook 6 | Unchanged |
| `docs/decisions.md` | Technical decisions, newest first | |
| `AGENTS.md`, `agent/` | How AI agents work in this repository | |

## Commands

Run them from the repository root. Node 24.

```bash
npm install      # once
make check       # build, type check, lint and tests of every package
make doctor      # check the machine and the project
```

The old library has its own commands inside `legacy/`: `npm install`, `npm run build`, `npm run storybook`.
