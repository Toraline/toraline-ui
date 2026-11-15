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
