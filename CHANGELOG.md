# Changes

What changed in each version of `@toraline.tech/ui` and `@toraline.tech/tokens`, newest first. The two packages always have the same version, so one list covers both. The steps of a release are in [docs/releasing.md](docs/releasing.md).

The old package `@toraline/toraline-ui` (versions 0 and 1) is not in this list.

## 0.1.0 (2026-11-15)

The first version of the new library. Inside Toraline it is called "V2". It is a pre-release: tested in Toraline's own apps, not used for real yet. Version `1.0.0` comes after the full rebrand. It replaces `@toraline/toraline-ui`, and nothing of the old package works unchanged with it.

- `@toraline.tech/tokens`: the design tokens as CSS files, the themes `light` and `dark`, the function `createTheme` that builds the theme of an app, the functions that save the chosen theme in a cookie, and the Tailwind CSS 4 preset. The tokens have the names and the values of the design system of the app Intraweb.
- `@toraline.tech/ui`: the components Button, Input, Toggle, Tabs, BreadCrumbs and SplitButton, the CSS line that makes Tailwind CSS build their classes (`@toraline.tech/ui/tailwind.css`), and the theme provider, hook and toggle (`@toraline.tech/ui/theme`).
- Needs React 19 and Tailwind CSS 4.

### The default look is the look of Intraweb (phase 6, TOR-1122)

Intraweb is an app of Toraline. Since this change the default look of the library is the look of Intraweb, and the tokens and the Tailwind classes have the names Intraweb uses. Nothing was published before this change, so no published version breaks. These points break an app that used the packages from `make pack` before 2026-11-15. The full table old name → new name is in [docs/decisions.md](docs/decisions.md), in the entries of TOR-1131 and TOR-1134.

- **Breaking: the level 2 color tokens have new names.** The 17 color tokens are replaced by 59 tokens in 5 groups, with the names of Intraweb: `--bg-*` (a background), `--text-*` (a text), `--border-*` (a border), `--icon-*` (an icon), `--data-*` (a chart or a progress bar). Examples: `--bg-page`, `--bg-surface`, `--bg-primary`, `--text-primary`, `--text-inverse`, `--border-default`, `--border-focus`.
- **Breaking: the Tailwind classes of the colors have new names, and a token is a class of its group only.** `--bg-primary` is the class `bg-primary` and nothing else; `--text-primary` is `text-primary`; `--border-default` is `border-default`; `--icon-default` is `text-icon`; `--border-focus` is also `outline-focus`. Two class names existed before and now mean something else: `text-primary` is the main text color (it was the brand color; the brand color as text is now `text-brand`), and `bg-surface` is a card or a field (it was the page; the page is now `bg-page`).
- **Breaking: the level 1 colors are the color scales of Intraweb.** `--color-slate-*`, `--color-brand-*`, `--color-pink-*`, `--color-cream-100`, `--color-green-*`, `--color-orange-*`, `--color-red-*`. The first colors of the library are removed. Each scale color is also a Tailwind color (`bg-brand-700`), and replaces the Tailwind color with the same name (`red-600`).
- **Breaking: the light and the dark theme have the values of Intraweb.** The main color is a blue-grey (`#42637c` in the light theme, `#8eaec5` in the dark theme). It was another color.
- **Breaking: one radius token and one shadow token become 4 and 5.** `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl` (classes `rounded-md` to `rounded-2xl`) and `--shadow-sm`, `--shadow-card`, `--shadow-lg`, `--shadow-xl`, `--shadow-2xl` (classes with the same names). The level 1 radius and shadow sizes are removed.
- **Breaking: the default fonts are Inter (normal text) and Poppins in the weights 400, 500 and 600 (headings and buttons).** They were the fonts of the device. The library downloads no font: the app loads the two fonts, with `next/font` and the variables `--font-inter` and `--font-poppins`, or with font files whose family names are `Inter` and `Poppins`. The guide shows both ways. An app that loads no font shows a font of the device.
- **Breaking: `createTheme`, the keys of `colors`.** A key is now the full name of a token without the two dashes: `"bg-primary"`, not a name without its group. A new name that starts with `bg-`, `text-`, `border-`, `icon-` or `data-` adds a token of that group and one Tailwind class (`"bg-promo"` adds `--bg-promo` and `bg-promo`). Any other new name still adds `--color-<name>`, a color for every CSS property. `createTheme` throws an error for a name with no group that is the end of a class of the library, for example `primary`; the error names the token to write.
- **Breaking: `createTheme`, the field `radius`.** One value now changes `--radius-md`. An object changes each size: `{ md, lg, xl, "2xl" }`.
- **Breaking: `createTailwindTheme`** writes a color of one group as a line of a block `@theme inline`. An app does not read that text, so an app changes nothing.
- **Breaking: the type `ThemeColorName`** is now the name of a color token (`"bg-primary"`). `ThemeTokenName` and `themeTokenNames` have the new names. The object `primitives` has the new level 1 names.
- **Breaking: the look of the 6 components.** Each part has the token of the same part of Intraweb's component. The `danger` Button is red text on a white background with a red border (it was a red background). The `secondary` Button and the field of Input have a grey border. A switch that is on has the main color (it was green). A selected tab has the brand color. Buttons and tabs have the font Poppins in the weight 500. Props and behaviour do not change.
- New: `createTheme` accepts `shadows` (`sm`, `card`, `lg`, `xl`, `2xl`).
- New: the 9 text styles of Intraweb, as classes of the Tailwind preset: `heading-page`, `heading-section`, `heading-card`, `display-number`, `display-number-sm`, `label`, `label-lg`, `label-sm`, `caption-overline`. The same values are the object `textStyles`.
- New: the class `font-sans` for `--font-body`, the name Intraweb uses.
- New: the list `colorTokenNames` and the type `ColorTokenName`.
- Known: some pairs of Intraweb's colors have a contrast below the accessibility limits, for example the border of a field (1.24 in the light theme; the limit for the border of a control is 3). The values were not changed. The table is in `packages/tokens/README.md`.

What an app that used the earlier packages must change:

1. Rename the token classes and the CSS variables in its own code, with the table of `docs/decisions.md`.
2. Rename the keys of `colors` in its `theme.config.ts` to full token names.
3. Load Inter and Poppins (guide 1, steps 4 and 5), or set its own fonts through `createTheme`.
4. Put `bg-page text-primary` on `<body>`.
- The components are styled with Tailwind CSS 4 classes that read the tokens. The CSS file of an app has 3 lines: `@import "tailwindcss";`, `@import "@toraline.tech/tokens/css/tailwind.css";` and `@import "@toraline.tech/ui/tailwind.css";`. A Tailwind class that an app gives in `className` replaces the class of the library for the same CSS property.
