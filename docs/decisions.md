# Decisions

Technical decisions of this repository, newest first. An agent that decides an open choice writes it here, and lists it in the pull request.

Format of one entry:

```
## <YYYY-MM-DD> - <short title> (<TICKET-ID>)
- Decision: <what was chosen>
- Why: <one or two sentences>
- Alternatives: <what was not chosen, one line each>
- Decided by: <the person, or "agent, to be confirmed in review">
```

## 2026-11-15 - Shape of the theme function (TOR-1005)
- Decision: `createTheme(input)` in `packages/tokens/src/create-theme.ts` returns the CSS of one theme as text: one `[data-theme="<name>"]` block with every level 2 token. The input type is `ThemeInput`: `name`, `base` (`"light"` or `"dark"`, the default theme that gives the missing values), `isDefault`, `colors`, `fonts`, `radius`.
- Why: text works everywhere. An app can put it in a `<style>` element on the server, or write it to a CSS file. The block always has every token, so a theme never depends on which other theme was loaded before it.
- Decision: a color key is the token name without `color-`. A key the library has changes that token. Any other key adds the token `--color-<key>`.
- Why: one rule, and the key maps to the CSS variable letter by letter.
- Decision: `createTheme` throws an error for a name that is not lowercase letters, digits and dashes, and for a value that has `;`, `{`, `}`, `<`, `>`, `\` or `/*`.
- Why: an app may build a theme from values it did not write (for example a color a user picked). Such a value must not close the CSS block or the `<style>` element.
- Alternatives: returning an object of variables for the app to turn into CSS; returning only the values that differ from the default theme; separate fields for changed colors and added colors.
- Decided by: agent, to be confirmed in review.

## 2026-11-15 - Token names, token files and the values of the two themes (TOR-1004)
- Decision: the tokens are plain CSS files in `packages/tokens/css/`: `primitives.css` (level 1), `themes/light.css`, `themes/dark.css`, and `index.css`, which imports the three. The same values are TypeScript objects in `packages/tokens/src/` (`primitives`, `lightTheme`, `darkTheme`). A test fails when a CSS file and its TypeScript object differ.
- Why: an app with no build step can use the CSS files as they are, and the theme function (TOR-1005) needs the default values in TypeScript. Writing both by hand, with a test that compares them, needs no generator script.
- Decision: there are 21 level 2 tokens: 16 colors, 3 fonts, `--radius` and `--shadow`. The full list is in `packages/tokens/README.md`. Spacing and font sizes exist only at level 1; phase 3 adds a level 2 token when a component needs one.
- Decision: level 1 names that are not colors are `--space-*`, `--font-size-*`, `--font-stack-*`, `--radius-size-*` and `--shadow-size-*`.
- Why: Tailwind 4 uses the names `--radius-*`, `--shadow-*`, `--text-*` and `--spacing` for its own values. Different names mean a level 1 token never changes a Tailwind class by accident.
- Decision: the purple scale has new numbers, with the old `primary` (`#5e00a1`) as `--purple-500`. The grey scale keeps the old numbers. 5 colors are new (`--purple-50`, `--purple-400`, `--red-300`, `--red-600`, `--green-700`).
- Why: in the old code `purple500` was darker than `primary`, so the numbers were not in order. The new red and green exist because white text on the old red (`#f04848`) has a contrast of 3.67, which is below the 4.5 that accessibility rules (WCAG AA) ask for.
- Decision: in the dark theme `--color-primary` is `--purple-200`, not `--purple-500`.
- Why: `--purple-500` on the dark background has too little contrast to read. A test checks the contrast of 11 text and background pairs in both themes.
- Alternatives: generating the CSS files from TypeScript with a script; keeping the old purple numbers; one `--color-background` token and no `--color-surface-raised` and `--color-surface-muted`.
- Decided by: agent, to be confirmed in review.

## 2026-11-15 - Tooling of version 2 (TOR-1001)
- Decision: npm workspaces as the package manager; Vite 8 in library mode to build the packages, with `tsc` writing the type files; Vitest 5 as the test runner; ESLint 10 with typescript-eslint as the linter; TypeScript 6.0; Node 24.
- Why: npm is already installed and is what the other Toraline repositories use, so nobody installs a new tool. Vite and Vitest share one configuration style, and Storybook (phase 4) can build with Vite too. All five were installed and run on 2026-11-15: build, type check, lint and tests pass.
- Why TypeScript 6.0 and not 7.0: typescript-eslint 8.72 accepts TypeScript below 6.1. TypeScript 7.0.2 exists but the linter does not support it yet.
- Alternatives: pnpm or yarn workspaces (not installed on this machine; the old code had both an npm and a yarn lock file); tsup or tsdown as the build tool; Jest as the test runner (the old code used it through Create React App).
- Decided by: agent, to be confirmed in review.

## 2026-11-15 - The old code moves to legacy/ on the v2 branch (TOR-1000)
- Decision: on the branch `v2`, the old library (Create React App, styled-components 5, Storybook 6) lives in `legacy/` with its own `package.json` and lock files. The repository root is the new workspace.
- Why: npm workspaces need the root `package.json`. Keeping the old `package.json` at the root would install React 18, Create React App and Storybook 6 together with the new packages. In `legacy/` the old code keeps its own dependencies and its own commands, and nothing of it is removed.
- What does not change: the branch `main` still has the old code at the root, and the old package `@toraline/toraline-ui` is still released from `main`.
- Alternatives: leaving the old code at the root and putting the new workspace in a sub-folder.
- Decided by: agent, to be confirmed in review.

## 2026-11-15 - Decisions made by Juliana before version 2 started
- The library is one repository, installed by each app. Package name `@toraline/ui`, on the public npm registry.
- Components come styled. An app can style on top of a component, or change and add theme colors. Themes and fonts are configurable, with a toggle between themes.
- Version 2 is built on a branch `v2` on top of the old code, and released fully before the old code is removed. `v2` becomes the main branch later.
- Monorepo layout: `packages/tokens`, `packages/ui`, later `packages/native`, `apps/catalog` (Storybook).
