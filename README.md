# toraline-ui

**English** | [Português](README.pt-BR.md)

The component library of Toraline: styled React components, with configurable themes and fonts. Each Toraline app installs it.

The default look is the look of the app Intraweb, an app of Toraline: the same colors, fonts, radius sizes and shadows, with the same token names and the same Tailwind class names (phase 6, TOR-1122).

**To use the library in an app, read the [guide](docs/guide.md):** install it, build the theme of the app, and style on top of a component.

**The catalog is online: https://toraline-ui.vercel.app/** It shows every component in every theme, the guide, and every token. The control **Language** in its toolbar shows the guide and the tokens page in English or in Portuguese.

**The packages are on npm.** `@toraline.tech/ui` and `@toraline.tech/tokens`, version `0.3.0`, published on 2026-11-16. The first version, `0.1.0`, was published on 2026-11-15. Versions that start with `0` are a pre-release: tested in Toraline's own apps, and props and tokens may still change. How a version is published: [docs/releasing.md](docs/releasing.md). What changed in each version: [CHANGELOG.md](CHANGELOG.md).

**This is the branch `main`**, the new library (version 2). Until 2026-11-15 it was named `v2`. The old library is unchanged in [`legacy/`](legacy/), and on the branch `old-package`, which was named `main` until that day. Its package is `@toraline/toraline-ui`.

## What is where

| Path | Content | State |
|---|---|---|
| `packages/tokens` | Design tokens, the light and dark themes, the function that builds a theme, and the Tailwind CSS 4 preset. Published as `@toraline.tech/tokens` | Built in phase 2. Since phase 6 the tokens have the names and the values of Intraweb. See [its README](packages/tokens/README.md) |
| `packages/ui` | The styled components. Published as `@toraline.tech/ui` | Has the theme provider and toggle, and the components. Buttons and navigation: Button, ButtonLink, IconButton, SplitButton, TabNav, Tabs, BreadCrumbs. Form controls: Field, TextInput, Textarea, Select, DecimalInput, Checkbox, CheckboxControl, Toggle. Feedback: StatusBadge, CountBadge, Panel, EmptyState, StatCard, ProgressBar, ProgressRing. Overlays: Modal, Drawer, DiscardConfirmation, DeleteOverlay, ActionMenu, Popover, Tooltip, CloseButton. Data: DataTable, DataGrid, ListItem, DetailPanel. Since phase 7 they have the variants, sizes and props of the same components of the app Intraweb. It also has the rules every component follows and the template of a component. See [its README](packages/ui/README.md) |
| `apps/catalog` | The catalog: Storybook 10, with a control in the toolbar that changes the theme of every story | Built in phase 4. Has the guide as its first page, the stories of every component and of the theme toggle, a page with every token, and an accessibility check that runs on every story in both themes. See [its README](apps/catalog/README.md) |
| `apps/playground` | A private Next.js app that tests the themes and shows every component in a real page | See [its README](apps/playground/README.md) |
| `legacy/` | The old library: Create React App, styled-components 5, Storybook 6 | Unchanged |
| `docs/guide.md` | The guide for a person who uses the library in an app: install, build a theme, style on top. The catalog shows the same file as its first page | Written in phase 4 |
| `docs/releasing.md` | The steps to publish a version of the two packages to npm, and how to undo a wrong release | Written in phase 5 |
| `CHANGELOG.md` | What changed in each version of the two packages | |
| `.github/workflows/release.yml` | The workflow that publishes the two packages. It runs only when a person starts it by hand | Published `0.1.0` and `0.2.0` on 2026-11-15, and `0.3.0` on 2026-11-16 |
| `docs/decisions.md` | Technical decisions, newest first | |
| `AGENTS.md`, `agent/` | How AI agents work in this repository | |

## Commands

Run them from the repository root. Node 24.

```bash
npm install      # once
make check       # build, type check, lint and tests of every package, and the story tests of the catalog
make catalog     # open the catalog (Storybook) on http://localhost:6006
make catalog-build # build the static catalog into apps/catalog/storybook-static
make catalog-test  # run every story as a test, in each theme, with the accessibility check
make pack        # build the two packages, write their tarballs into .pack/tarballs/ and list the files of each
make version VERSION=0.1.1  # set the version of the two packages
make doctor      # check the machine and the project
```

The old library has its own commands inside `legacy/`: `npm install`, `npm run build`, `npm run storybook`.
