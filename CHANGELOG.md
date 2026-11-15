# Changes

What changed in each version of `@toraline/ui` and `@toraline/tokens`, newest first. The two packages always have the same version, so one list covers both. The steps of a release are in [docs/releasing.md](docs/releasing.md).

The old package `@toraline/toraline-ui` (versions 0 and 1) is not in this list.

## 2.0.0-beta.0 (not published yet)

The first version of the new library. It replaces `@toraline/toraline-ui`, and nothing of the old package works unchanged with it.

- `@toraline/tokens`: the design tokens as CSS files, the themes `light` and `dark`, the function `createTheme` that builds the theme of an app, the functions that save the chosen theme in a cookie, and the Tailwind CSS 4 preset.
- `@toraline/ui`: the components Button, Input, Toggle, Tabs, BreadCrumbs and SplitButton, their styles (`@toraline/ui/styles.css`), and the theme provider, hook and toggle (`@toraline/ui/theme`).
- Needs React 19. Tailwind CSS 4 is optional.
