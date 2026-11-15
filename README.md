# toraline-ui

The component library of Toraline: styled React components, with configurable themes and fonts. Each Toraline app installs it.

**This is the branch `v2`.** Version 2 is being built here. The old library is unchanged in [`legacy/`](legacy/), and is still released from the branch `main` as `@toraline/toraline-ui`.

## What is where

| Path | Content | State |
|---|---|---|
| `packages/tokens` | Design tokens, the light and dark themes, the function that builds a theme, and the Tailwind CSS 4 preset | Built in phase 2. See [its README](packages/tokens/README.md) |
| `packages/ui` | The styled components, published as `@toraline/ui` | Has the theme provider and toggle, and 6 components built in phase 3: Button, Input, Toggle, Tabs, BreadCrumbs, SplitButton. It also has the rules every component follows and the template of a component. See [its README](packages/ui/README.md) |
| `apps/catalog` | The catalog: Storybook 10, with a control in the toolbar that changes the theme of every story | Set up in phase 4. See [its README](apps/catalog/README.md) |
| `apps/playground` | A private Next.js app that tests the themes and shows every component in a real page | See [its README](apps/playground/README.md) |
| `legacy/` | The old library: Create React App, styled-components 5, Storybook 6 | Unchanged |
| `docs/decisions.md` | Technical decisions, newest first | |
| `AGENTS.md`, `agent/` | How AI agents work in this repository | |

## Commands

Run them from the repository root. Node 24.

```bash
npm install      # once
make check       # build, type check, lint and tests of every package
make catalog     # open the catalog (Storybook) on http://localhost:6006
make catalog-build # build the static catalog into apps/catalog/storybook-static
make doctor      # check the machine and the project
```

The old library has its own commands inside `legacy/`: `npm install`, `npm run build`, `npm run storybook`.
