# toraline-ui

The component library of Toraline: styled React components, with configurable themes and fonts. Each Toraline app installs it.

**To use the library in an app, read the [guide](docs/guide.md):** install it, build the theme of the app, and style on top of a component.

**The new packages are not published yet.** `@toraline.tech/ui` and `@toraline.tech/tokens` are not on the npm registry. The first version will be `2.0.0-beta.0`. How a version is published: [docs/releasing.md](docs/releasing.md). What changed in each version: [CHANGELOG.md](CHANGELOG.md).

**This is the branch `main`**, the new library (version 2). Until 2026-11-15 it was named `v2`. The old library is unchanged in [`legacy/`](legacy/), and on the branch `old-package`, which was named `main` until that day. Its package is `@toraline/toraline-ui`.

## What is where

| Path | Content | State |
|---|---|---|
| `packages/tokens` | Design tokens, the light and dark themes, the function that builds a theme, and the Tailwind CSS 4 preset. To be published as `@toraline.tech/tokens` | Built in phase 2. See [its README](packages/tokens/README.md) |
| `packages/ui` | The styled components. To be published as `@toraline.tech/ui` | Has the theme provider and toggle, and 6 components built in phase 3: Button, Input, Toggle, Tabs, BreadCrumbs, SplitButton. It also has the rules every component follows and the template of a component. See [its README](packages/ui/README.md) |
| `apps/catalog` | The catalog: Storybook 10, with a control in the toolbar that changes the theme of every story | Built in phase 4. Has the guide as its first page, the stories of the 6 components and of the theme toggle, a page with every token, and an accessibility check that runs on every story in both themes. See [its README](apps/catalog/README.md) |
| `apps/playground` | A private Next.js app that tests the themes and shows every component in a real page | See [its README](apps/playground/README.md) |
| `legacy/` | The old library: Create React App, styled-components 5, Storybook 6 | Unchanged |
| `docs/guide.md` | The guide for a person who uses the library in an app: install, build a theme, style on top. The catalog shows the same file as its first page | Written in phase 4 |
| `docs/releasing.md` | The steps to publish a version of the two packages to npm, and how to undo a wrong release | Written in phase 5. Nothing is published yet |
| `CHANGELOG.md` | What changed in each version of the two packages | |
| `.github/workflows/release.yml` | The workflow that publishes the two packages. It runs only when a person starts it by hand | Has never run |
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
make version VERSION=2.0.0-beta.1  # set the version of the two packages
make doctor      # check the machine and the project
```

The old library has its own commands inside `legacy/`: `npm install`, `npm run build`, `npm run storybook`.
