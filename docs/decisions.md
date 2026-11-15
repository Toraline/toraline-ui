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

## 2026-11-15 - The theme function, the preset and the components use only the new names (TOR-1136)
- State: no file outside this file and `legacy/` has an old token name or an old token class. The script `scripts/find-old-token-names.mjs` reads every file that git tracks and prints the lines that have one. On 2026-11-15 it printed `0 lines in 177 files`. It is not part of `make check`.
- What moved in which commit. Tailwind cannot give a class name two meanings at once, so the parts that read a token moved in the commit that renamed the token: the preset, `createTheme`, `createTailwindTheme`, the color classes of the components, the catalog and the playground in the commit of TOR-1131; the radius and shadow classes in the commit of TOR-1134; the font tokens in the commit of TOR-1135. The commit of this entry has what was left: the font of the buttons and the tabs, the setup of `tailwind-merge`, `docs/guide.md`, the two package READMEs, `CHANGELOG.md`, the READMEs of the playground and of the catalog, and the script above.
- Decision: Button, the two buttons of SplitButton, ThemeToggle and the tabs of Tabs have `font-heading font-medium`: Poppins in the weight 500, as the Button and the tabs of Intraweb. Input, Toggle, BreadCrumbs and the actions of the menu keep `font-body` (Inter).
- Decision: a class with `font-heading` never has `font-bold`. The apps load Poppins in the weights 400, 500 and 600 only; a weight of 700 would be drawn by the browser from the weight 600.
- Decision: `tailwind-merge` gets a setup, in `packages/ui/src/shared/class-names.ts` (`extendTailwindMerge`). It was used with no setup before (entry of TOR-1205). Two things are added:
  - `shadow-card` is a shadow. Checked on 2026-11-15 with `tailwind-merge` 3.7.0: with no setup it reads `shadow-card` as a shadow color, because `card` is not one of the shadow sizes of Tailwind. `classNames("shadow-card", "shadow-lg")` then kept both classes.
  - The 9 text styles are one group: only the last text style stays. A text style also removes an earlier class for the font, the font size, the line height, the font weight, the letter spacing, the capital letters and the width of digits, because it sets them.
- Why nothing more: the color classes need no setup. `tailwind-merge` reads any name after `bg-`, `text-`, `border-`, `outline-` or `ring-` as a color when it is not one of Tailwind's own names for another property. The tests of `class-names.test.ts` check every one of the 20 background tokens, the 15 text color tokens and the 14 border color tokens: a text color next to a font size (`text-primary` and `text-sm`), a border color next to a border width and a border style (`border-default` and `border`), a background color next to a background size and position (`bg-surface` and `bg-cover`).
- Known limit: a class for a font size or a font weight that comes before or after a text style always wins over the text style. Tailwind writes the text styles before those classes in the built CSS (checked with Tailwind 4.3.5), and `tailwind-merge` removes only the earlier class. No component uses a text style yet.
- Checked on 2026-11-15, with the 2 package files of `make pack`, in a new app made by `create-next-app` 16.4.6 (Tailwind CSS 4.3.3) that followed `docs/guide.md` step by step, and in a new app made by `npm create vite@latest` (Vite 8.3.8) for the section "Without Next.js". After guide 1 the Button has the background `rgb(66, 99, 124)`, which is `#42637c`, the value of `--bg-primary` in Intraweb's `light.css`. With the theme button the page changes to the values of Intraweb's dark theme, and a Button with the colors of the library becomes `rgb(142, 174, 197)` (`#8eaec5`). The full results are in `apps/catalog/README.md`, and the values of every component in both themes are in `apps/playground/README.md`.
- Not done in this phase, on purpose (the task keeps them for phase 7): the heights, paddings and font sizes of the components are not the ones of Intraweb; the Input keeps the outline of the library when it has the focus; the preset has no base styles for `<body>`, headings and placeholders, which Intraweb's `globals.css` has, so an app writes `bg-page text-primary` on `<body>` itself.
- Alternatives: a list of every token class in the setup of `tailwind-merge`; `clsx` alone, as Intraweb; a check of old names inside `make check`.
- Decided by: agent, to be confirmed in review.

## 2026-11-15 - Default fonts: Inter and Poppins, named by the library and loaded by the app (TOR-1135)
- Decision: the default font of normal text is Inter (`--font-body`), and the default font of headings and buttons is Poppins in the weights 400, 500 and 600 (`--font-heading`). They are the fonts of Intraweb. This replaces, in the entry of TOR-1007, "the default fonts are system font stacks".
- Decision: the library downloads no font and ships no font file. Its level 1 tokens name the fonts: `--font-stack-sans: var(--font-inter, "Inter"), ui-sans-serif, system-ui, sans-serif` and `--font-stack-display: var(--font-poppins, "Poppins"), ui-sans-serif, system-ui, sans-serif` (new token). A test fails when a file of the library has a font file, an `@font-face` rule or an import of `next/font`.
- Why `var(--font-inter, "Inter")`: `next/font` gives a font a family name that the app cannot choose, and puts the font in a CSS variable that the app names. Intraweb names the variables `--font-inter` and `--font-poppins`. The token reads that variable when the app defines it on `<html>`, and the family name `Inter` when it does not. So one value works for a Next.js app (with `next/font`) and for any other app (with a font file whose family name is `Inter`). Checked on 2026-11-15: in the built playground (`next/font/local`) the font of `<body>` is `inter, "inter Fallback", ui-sans-serif, system-ui, sans-serif`; in the catalog (`@font-face` rules, family names `Inter` and `Poppins`, no variable) the two fonts are shown too.
- Limit: the classes of `next/font` must be on `<html>`. The tokens are defined on `<html>`, and a CSS variable is read where the token is defined. With the classes on `<body>`, the token does not see the variable and the browser shows a font of the device. The guide says this.
- The fallback fonts after the name, `ui-sans-serif, system-ui, sans-serif`, are the ones of Intraweb's `globals.css`. An app that loads no font shows a font of the device.
- Decision: the preset adds the class `font-sans` for `--font-body` (`@theme inline { --font-sans: var(--font-body); }`). `font-sans` and `font-heading` are the two font classes of Intraweb. `font-body` stays.
- Decision: the guide shows two ways to load the fonts. For Next.js: `next/font/google` with the variables `--font-inter` and `--font-poppins` (steps 4 and 5 of guide 1). For another app: the npm packages `@fontsource/inter` and `@fontsource/poppins`, whose family names are `Inter` and `Poppins` (checked in the files of version 5.3.0 of both packages). Not `@fontsource-variable/inter`: its family name is `Inter Variable`.
- Decision: an app still sets other fonts through the theme function (`fonts.body`, `fonts.heading`, `fonts.mono`), unchanged.
- Decision (playground): `app/fonts.ts` loads Inter and Poppins with `next/font/local`, from files committed in `apps/playground/app/fonts/`: `inter-latin-wght-normal.woff2` (48,256 bytes, from the npm package `@fontsource-variable/inter` 5.3.0) and `poppins-latin-400-normal.woff2`, `-500-`, `-600-` (7,884, 7,748 and 8,000 bytes, from `@fontsource/poppins` 5.3.0), with their licenses (SIL Open Font License 1.1). `make check` needs no network, as the entry of TOR-1007 decided for Fraunces. The files have the Latin letters only, which cover English and Portuguese.
- Decision (playground): the themes `light` and `dark` keep the default fonts. A third theme of the app, `paper`, has Fraunces for the headings, so the playground still tests a font set through the theme function.
- Decision (catalog): `apps/catalog/.storybook/preview.css` loads the same 4 files with `@font-face` rules, so the catalog shows the real fonts and its story tests need no network.
- Alternatives: shipping the font files in `@toraline.tech/ui`; the family names alone (`"Inter", ...`), which do not work with `next/font`; the variables alone (`var(--font-inter), ...`), which do not work with a plain font file; a font loading helper in the library.
- Decided by: agent, to be confirmed in review.

## 2026-11-15 - Radius sizes, shadows and text styles of Intraweb (TOR-1134)
- Decision: the level 2 tokens `--radius` and `--shadow` are replaced by the 4 radius sizes and the 5 shadows of Intraweb, with the same names and values: `--radius-md` (`0.5rem`), `--radius-lg` (`0.75rem`), `--radius-xl` (`1rem`), `--radius-2xl` (`1.25rem`), and `--shadow-sm`, `--shadow-card`, `--shadow-lg`, `--shadow-xl`, `--shadow-2xl`. The Tailwind classes are `rounded-md` to `rounded-2xl` and `shadow-sm` to `shadow-2xl`. There are now 75 level 2 tokens. The level 1 tokens `--radius-size-*` and `--shadow-size-*` are removed: nothing points to them.
- Old name → new name: `--radius` and the class `rounded` → `--radius-md` and `rounded-md`. `--shadow` and the class `shadow` → the shadow of the part: `--shadow-lg` and `shadow-lg` for a menu, `--shadow-card` and `shadow-card` for a card.
- Decision: they are level 2 tokens, with a value in each theme. The light and the dark theme have the same values.
- Why: in Intraweb they are in the `@theme` block, and the themes cozy, old and glass change them. A level 2 token is what a theme of an app can change through the theme function.
- Decision: the preset declares the shadows in a block `@theme inline` (`--shadow-card: var(--shadow-card)`), so the class reads the token and follows the theme. This is the mechanism the library already had for `--shadow` (entry of TOR-1008).
- Difference from Intraweb: Intraweb declares the shadows in a plain `@theme` block. Tailwind then copies the value into the class, and Intraweb's themes change a shadow with a CSS rule for each class (`[data-theme="cozy"] .shadow-card { --tw-shadow: ... }`). The class names are the same. With the library a theme changes a shadow by changing the token. Known limit of `inline`: the Tailwind classes that give a shadow another color (`shadow-red-500`) have no effect on these 5 shadows.
- Decision: `createTheme` accepts `radius` as one value or as an object, and a new field `shadows`. One value changes `--radius-md`, the corner of a button and a field, which is what `radius` changed before. An object changes each size it names (`md`, `lg`, `xl`, `2xl`). `shadows` has `sm`, `card`, `lg`, `xl`, `2xl`.
- Decision: the 9 text styles of Intraweb are classes of the preset, written with `@utility`, with the same names and declarations: `heading-page`, `heading-section`, `heading-card`, `display-number`, `display-number-sm`, `label`, `label-lg`, `label-sm`, `caption-overline`. The same values are the TypeScript object `textStyles`. They are not level 2 tokens: no theme of Intraweb changes them, and their font is the token `--font-heading`.
- Decision: the sizes of the text styles stay in `rem`, as in Intraweb. No component of the library uses a text style in this phase, so the rule "no length in `rem` in the classes of a component" (test `packages/ui/src/tailwind.test.tsx`) still holds.
- Not copied: Intraweb's utility `select-chevron`. It is the arrow of a select field, not a text style, and the library has no select.
- The tokens page of the catalog shows the 4 radius sizes, the 5 shadows and a table of the 9 text styles.
- Decision: the classes of the components move in this commit: `rounded` → `rounded-md`, and the menu of SplitButton gets `rounded-lg` and `shadow-lg`, the classes of Intraweb's menu of actions.
- Alternatives: keeping `--radius` and `--shadow` next to the new tokens; a plain `@theme` block for the shadows, as in Intraweb; text styles as level 2 tokens, one for each property.
- Decided by: agent, to be confirmed in review.

## 2026-11-15 - The light and the dark theme have the values of Intraweb (TOR-1133)
- Decision: every level 2 color token of the themes `light` and `dark` has the value of Intraweb's `styles/themes/light.css` and `styles/themes/dark.css`, written the same way: the light theme points to level 1 colors (`var(--color-slate-100)`), the dark theme has raw values (`#0c111d`).
- Decision: copies of the two files are in `packages/tokens/src/intraweb-fixtures/light.css` and `dark.css`. The first comment of each copy names the source file, the commit of the repository `prontera-e-juno` (`f8ad4c2`) and the date of the copy (2026-11-15). The test `packages/tokens/src/intraweb.test.ts` compares the 59 color tokens of each theme with its copy: the names, the values and the order.
- Why a copy: this repository cannot read the repository of Intraweb in the CI. When Intraweb changes a value, a person copies the file again, and the test then shows which tokens differ.
- Decision: the first level 1 colors of the library (purple, grey, `--red-*`, `--green-*`, `--black`, `--white`) are removed. No level 2 token points to them any more.
- Not copied from Intraweb's theme files, on purpose:
  - The dark theme of Intraweb also gives dark values to Tailwind colors (`--color-white`, `--color-zinc-*`, `--color-red-*`, `--color-amber-*`, `--color-emerald-700`, `--color-sky-*`), for old screens of Intraweb that use those classes directly. The library has no such screen. Its level 1 colors are the same in every theme.
  - The block `[data-theme] [data-theme="light"]` of `light.css`, which gives a light part inside another theme its font, radius sizes and small shadow back. In the library every theme block has every level 2 token, so an element with `data-theme="light"` inside a dark page already gets all of them.
- Contrast: the values were not changed. These pairs are below the limits of the accessibility rules (WCAG AA: 4.5 for text, 3 for the border of a control). The test `packages/tokens/src/tokens.test.ts` records each number, and `packages/tokens/README.md` has the same table:

| Pair | Light | Dark | Limit |
|---|---|---|---|
| `--text-tertiary` on `--bg-page` | 4.48 | 5.67 | 4.5 |
| `--text-tertiary` on `--bg-muted` | 4.48 | 4.27 | 4.5 |
| `--text-muted` on `--bg-surface` | 2.58 | 2.91 | 4.5 |
| `--border-default` on `--bg-surface` | 1.24 | 1.45 | 3 |
| `--border-strong` on `--bg-surface` | 1.47 | 1.82 | 3 |
| `--border-hover` on `--bg-surface` | 2.58 | 2.91 | 3 |
| `--border-danger` on `--bg-surface` | 1.42 | 1.75 | 3 |

- What this means for the components: no component puts text that a person must read on a pair of this table. A tab or a link that is not selected is `text-secondary` (6.92 on the page), not `text-tertiary`. The label of a disabled switch is `text-tertiary` on the page (4.48); the rule does not cover a disabled control. The border of a field, of a secondary button, of a danger button and of a switch that is off is below 3. Before this phase the border of a field had a contrast above 3 (entry of TOR-1004); with the values of Intraweb it is 1.24 (light) and 1.45 (dark). The story tests (axe-core) pass in both themes; axe-core does not check the contrast of a border.
- Decided by: agent, to be confirmed in review. The contrast table is for Juliana: the fix, if she wants one, is a change in Intraweb's design system.

## 2026-11-15 - Level 2 color tokens: the names of Intraweb, and one Tailwind class for each group (TOR-1131)
- Decision: the level 2 color tokens of `@toraline.tech/tokens` have the names of the design system of the app Intraweb. There are 59, in 5 groups: 20 `--bg-*` (a background), 15 `--text-*` (a text), 14 `--border-*` (a border), 3 `--icon-*` (an icon) and 7 `--data-*` (a chart or a progress bar). The list is taken from Intraweb's files `styles/themes/light.css` and `styles/themes/dark.css`. No level 2 token named `--color-*` is left in `packages/tokens`.
- Why: phase 6 (TOR-1122). A component copied from Intraweb then needs no change, and Intraweb can install the library with its own token names.
- The table old name → new name. An old token had one name for every use. In Intraweb each use has its own token, so one old token can have more than one new token:

| Old token | New token | Note |
|---|---|---|
| `--color-surface` | `--bg-page` (the page) and `--bg-surface` (a field) | |
| `--color-surface-raised` | `--bg-surface` | A card, a menu, a secondary button |
| `--color-surface-muted` | `--bg-subtle` (a part under the pointer, a disabled part) and `--bg-muted` | |
| `--color-text` | `--text-primary` | Also `--text-strong` (a label) and `--text-body` (normal text) |
| `--color-text-muted` | `--text-tertiary` (a hint, a placeholder, a disabled part) and `--text-secondary` (a tab or a link that is not selected) | Not `--text-muted`: in Intraweb that token is for decoration and its contrast is below 4.5 |
| `--color-border` | `--border-default` | Also `--border-subtle` (a menu) |
| `--color-border-strong` | `--border-strong` | The border of a field is now `--border-default`, as in Intraweb |
| `--color-primary` | `--bg-primary` (a background), `--text-brand` (a text), `--border-brand` (a border), `--icon-brand` (an icon) | |
| `--color-primary-hover` | `--bg-primary-hover` | |
| `--color-primary-foreground` | `--text-inverse` | |
| `--color-danger` | `--text-danger` (a text), `--border-danger` (the border of a danger button), `--border-invalid` (the border of a field with an error) | Intraweb has no strong red background. Its danger button is red text on `--bg-surface` |
| `--color-danger-hover` | `--bg-danger-subtle` | The background of a danger button under the pointer |
| `--color-danger-foreground` | None | No part has text on a strong red background any more |
| `--color-success` | `--text-success` (a text), `--bg-success` (a quiet background), `--border-success`, `--data-success` | The switch that is on now has `--bg-primary`, as the checkbox of Intraweb |
| `--color-success-foreground` | None | The thumb of a switch that is on has `--bg-surface` |
| `--color-focus-ring` | `--border-focus` | Class `outline-focus` |
| `--color-overlay` | `--bg-overlay` | |
| A color an app added, `--color-<name>` | `--bg-<name>`, `--text-<name>`, `--border-<name>`, `--icon-<name>`, `--data-<name>`, or still `--color-<name>` | See the keys of `colors` below |

- The old Tailwind class → the new Tailwind class: `bg-surface` (the page) → `bg-page`; `bg-surface-raised` → `bg-surface`; `bg-surface-muted` → `bg-subtle` or `bg-muted`; `text-text` → `text-primary`; `text-text-muted` → `text-tertiary` or `text-secondary`; `border-border` → `border-default`; `border-border-strong` → `border-strong`; `text-primary` (the brand color as text) → `text-brand`; `border-primary` → `border-brand`; `text-primary-foreground` → `text-inverse`; `text-danger` and `border-danger` keep their names; `bg-danger` → none; `outline-focus-ring` → `outline-focus`. Two class names stay and change their meaning: `text-primary` was the brand color and is now the main text color; `bg-surface` was the page and is now a card or a field.
- The 9 level 2 tokens that are not colors keep their names in this entry: `--font-body`, `--font-heading`, `--font-mono`, `--text-sm`, `--text-base`, `--text-lg`, `--spacing`, `--radius`, `--shadow`. The entries of TOR-1134 and TOR-1135 change the radius, the shadow and the fonts.
- Decision: `--text-sm`, `--text-base` and `--text-lg` (font sizes) and `--text-primary` (a color) both start with `--text-`. The list `colorTokenNames` of the package says which tokens are colors.
- Why: these are the names of Intraweb and of Tailwind, and Tailwind itself has `text-sm` and `text-red-500`. A color token of an app cannot take the name of a font size: `createTheme` refuses `text-xs` to `text-9xl`.
- Decision: the Tailwind preset makes each color token a class of its group only, with the same `@theme inline` block as Intraweb's `globals.css`: `--background-color-<name>: var(--bg-<name>)` gives `bg-<name>`, `--text-color-<name>: var(--text-<name>)` gives `text-<name>`, `--border-color-<name>: var(--border-<name>)` gives `border-<name>`, `--text-color-icon...: var(--icon-...)` gives `text-icon`, `text-icon-strong` and `text-icon-brand`, `--color-data-<name>: var(--data-<name>)` gives a class for every property, and 2 more lines give `outline-focus` and `ring-info`. A test compares the block of the preset with a copy of Intraweb's block (`src/intraweb-fixtures/globals-utilities.css`), and another test builds every class with Tailwind 4.3.5.
- Why: the task of the phase asks for the same class names as Intraweb. With one class for each group, `bg-primary` (the brand color) and `text-primary` (the main text color) are two tokens with no clash.
- Not in the documentation: the table "Theme variable namespaces" of the page "Theme variables" of Tailwind (read on 2026-11-15) lists `--color-*` and does not list `--background-color-*`, `--text-color-*`, `--border-color-*`, `--outline-color-*` or `--ring-color-*`. They are in the code of Tailwind 4.3.5 (`node_modules/tailwindcss/dist/lib.js` looks for `--background-color` before `--color`), and Intraweb uses them. The same page documents `@theme inline` for a theme variable that points to another variable.
- Decision (the theme function): the shape of `createTheme` and `createTailwindTheme` does not change. A key of `colors` is now the full name of a token, without the two dashes:
  - the name of a color token of the library (`bg-primary`) changes that token;
  - another name that starts with `bg-`, `text-`, `border-`, `icon-` or `data-` (`bg-promo`) adds a token of that group, `--bg-promo`, with the class of that group;
  - any other name (`promo`) adds `--color-promo`, a color for every CSS property, as before.
- Decision: `createTheme` throws an error for a key with no group that is the end of a class of the library (`primary`, `surface`, `brand`, `danger`, `icon`, `focus`, `info` and the others).
- Why: before this phase `primary` changed the main color. With the new names it would add `--color-primary`, and the classes `bg-primary` and `text-primary` would still read the tokens of the library, so the app would see no change and no error. The error names the token to write.
- Decision: `createTailwindTheme` writes a color of one group as `@theme inline { --background-color-promo: var(--bg-promo, #b34700); }`. The value after the comma is the value of the first theme that has the color, as before.
- Decision: the light and the dark theme get the values of Intraweb in the same commit as the names.
- Why: 42 of the 59 names have no old token, and the old palette has no value for them (for example a very light red for `--bg-danger-subtle`). The preset, the theme function, the classes of the components, the catalog and the playground also move in this commit, because Tailwind cannot give the class `text-primary` its old meaning and its new meaning at once. The commit of TOR-1133 adds the comparison with Intraweb's files, and the commit of TOR-1136 moves what is left.
- Decision: the colors of each component, following the component of Intraweb where there is one:
  - Button `primary`: `bg-primary text-inverse`, `hover:bg-primary-hover`. `secondary`: `border-default bg-surface text-strong`, `hover:border-hover hover:bg-subtle`. `danger`: `border-danger bg-surface text-danger`, `hover:bg-danger-subtle`. These are the classes of Intraweb's `components/ui/button.tsx`.
  - Button, disabled: `border-default bg-subtle text-tertiary` for every variant. Intraweb uses `opacity-50`. The library keeps its own rule (entry of TOR-1010): a disabled button must still have a contrast of 4.5.
  - Input: field `border-default bg-surface text-primary`, placeholder `text-tertiary`, `hover:border-hover`, `focus-visible:border-focus`, error `border-invalid`, disabled `bg-subtle text-tertiary`, label `text-strong`, error message `text-danger`. These are the tokens of Intraweb's `components/ui/form-controls.tsx`. One difference stays: the field with the focus keeps the outline of the library (2 pixels, `outline-focus`); Intraweb draws a ring of 3 pixels in `ring-info` and no outline.
  - Tabs: a tab `text-secondary`, `hover:text-primary`, selected `text-brand` with a line `border-b-brand`; the line of the row `border-b-default`. These are the tokens of Intraweb's `TabNav`. The tab under the pointer no longer gets a background.
  - SplitButton: the two buttons as the primary Button. The menu `border-subtle bg-surface`, an action `text-body`, `hover:bg-subtle focus:bg-subtle`: the tokens of Intraweb's `ActionMenu`.
  - Toggle, BreadCrumbs and ThemeToggle have no component in Intraweb. Toggle follows Intraweb's checkbox: off `border-strong bg-surface`, on `border-brand bg-primary`; the thumb is `text-icon` (off) and `bg-surface` (on). BreadCrumbs: a link `text-secondary`, `hover:text-brand`, the current page `text-primary`. ThemeToggle has the colors of the secondary Button.
- Not done here: the sizes of the components (heights, paddings, font sizes) are not changed to the sizes of Intraweb. The task of the phase keeps variants, sizes and new components for phase 7.
- Alternatives: keeping `--color-*` names and mapping them to Intraweb's class names only in the preset; one generic `--color-<name>` for every added color, with a class for every property, as before (the classes `text-brand` and `border-brand` of an added color `brand` would clash with the tokens of the library); a temporary layer of old names so that the components could move in a later commit.
- Decided by: agent, to be confirmed in review.

## 2026-11-15 - Level 1 colors: the color scales of Intraweb (TOR-1132)
- Decision: the level 1 colors of `@toraline.tech/tokens` are the 7 color scales of the design system of the app Intraweb: slate and brand (50 to 900), pink, cream, green, orange and red. 37 colors. Each has the name and the value of the `@theme` block of Intraweb's `globals.css`, for example `--color-brand-700: #42637c`.
- Why: phase 6 (TOR-1122) makes the default look of the library the look of Intraweb, so that Intraweb can install the library and look the same.
- Decision: the names start with `--color-`, as in Intraweb. The other level 1 tokens keep their names (`--space-*`, `--font-size-*`, `--font-stack-*`).
- Why: `--color-*` is the Tailwind CSS 4 namespace for colors (documentation of Tailwind, page "Theme variables", table "Theme variable namespaces", read on 2026-11-15). So each level 1 color is also a Tailwind color class (`bg-brand-700`), and a component copied from Intraweb that uses such a class works unchanged. The entry of TOR-1004 chose names outside the Tailwind namespaces so that a level 1 token never changes a Tailwind class. For colors this entry replaces that choice, on purpose: `--color-red-600` of Intraweb replaces `red-600` of Tailwind, as it does in Intraweb.
- Decision: the colors are written in two places: `css/primitives.css` (plain CSS variables on `:root`, for an app with no Tailwind) and an `@theme` block of the Tailwind preset `css/tailwind.css` (so Tailwind makes the classes). A test compares both with `src/primitives.ts`.
- Decision: Intraweb's scale `zinc` is not copied. In Intraweb it is a copy of slate for old screens that still use the Tailwind color `zinc`.
- Decision: a copy of Intraweb's `@theme` block is in `packages/tokens/src/intraweb-fixtures/globals-theme.css`, with the commit and the date of the copy. The test `src/intraweb.test.ts` compares the level 1 colors with it.
- Alternatives: keeping the names without `color-` (`--brand-700`) and mapping them in the preset; only an `@theme` block and no plain CSS file.
- Decided by: agent, to be confirmed in review.

## 2026-11-15 - The components are styled with Tailwind CSS 4 classes (TOR-1205)
- Decision: every component of `@toraline.tech/ui` is styled only with Tailwind CSS 4 classes, written in its `.tsx` file the way the app Intraweb writes its components: one text of classes for each variant and each size (`Record<ButtonVariant, string>`). The classes read the tokens through the Tailwind preset of `@toraline.tech/tokens`. The package has no CSS file for a component and no class name of its own. No token was renamed, and the look did not change.
- Why: the approved design says "Components are styled with Tailwind 4 classes that read the tokens". The code gave each component its own class in plain CSS files, and Tailwind was optional.
- Replaces, in the entry of TOR-1006: "the library's component styles are a plain CSS file, with every rule in the cascade layer `components`".
- Replaces, in the entry of TOR-1009: "each component has its own CSS file", "the CSS selects that attribute", "the package does not use `tailwind-merge`", "the app's classes win because of the cascade layer", and the test `styles.test.ts`. What stays from TOR-1009: the lists of variants and sizes, `data-variant` and `data-size`, a state written once as the attribute a screen reader reads, the file `<name>-options.ts`, and the 4 size tokens.
- Replaces, in the entry of TOR-1019: "`peerDependencies` of `@toraline.tech/ui` stay `react` and `react-dom`", and, for `@toraline.tech/ui`, "`exports` gives each CSS file by name".
- Decision: an app's Tailwind builds the classes of the components because of one line in the CSS file of the app: `@import "@toraline.tech/ui/tailwind.css";`. That file has one rule, `@source "../dist";`, which tells Tailwind to read the built files of the package. The app writes 3 lines in all: `tailwindcss`, the preset of the tokens, and this file.
- Why: Tailwind 4 does not read the folder `node_modules`. Its documentation, page "Detecting classes in source files", section "Explicitly registering sources", names `@source` for a library built with Tailwind, with a path relative to the CSS file. With the path inside the package, the app does not write a path into `node_modules`. Checked on 2026-11-15 with the 2 package files of `make pack`, in an app made by `create-next-app` 16.4.6 (Tailwind 4.3.3) and in an app made by `npm create vite@latest` (Vite 8.3.8, Tailwind 4.3.5): the built CSS had the classes of the components. The results are in `apps/catalog/README.md`.
- Decision: `tailwindcss` `^4.0.0` is a required peer dependency of `@toraline.tech/ui`. It stays an optional peer dependency of `@toraline.tech/tokens`.
- Why: a component has no style without Tailwind. The tokens alone (CSS variables, the theme function) work with no Tailwind, for example in the later `packages/native`.
- Not verified: Tailwind versions 4.0, 4.1 and 4.2. Only 4.3.3 and 4.3.5 were run.
- Decision: "style on top" uses `tailwind-merge` `^3.7.0`, a dependency of `@toraline.tech/ui`, inside the helper `classNames`. When two Tailwind classes set the same CSS property with the same Tailwind variant (the part of a class before the `:`, for example `hover:`), only the last one stays, and the app's `className` is last. It is used with no configuration.
- Why: with classes, the order in the attribute `class` does not decide which style wins. The order in the built CSS does, and the app cannot control it. The README of `tailwind-merge` says it supports Tailwind 4.0 to 4.3. It reads any name after the prefix of a color class as a color, and the other token classes have Tailwind's own names, so it needs no list of the tokens. The tests of `class-names.test.ts` check a token class against a token class, against a standard Tailwind class and against a color an app added.
- What changes for an app: a class replaces only a class with the same Tailwind variant. Before, every class of the app won over every style of the library, in every state. Now `bg-red-500` replaces `bg-primary`, and the library's `hover:bg-primary-hover` and `disabled:bg-surface` stay until the app gives `hover:` and `disabled:` classes. CSS of the app that is in no cascade layer still wins. A class of the app inside `@layer components` no longer wins.
- Decision: the class of a state has the Tailwind variant of the attribute a screen reader reads (`disabled:`, `aria-busy:`, `aria-invalid:`, `aria-selected:`, `aria-expanded:`, `peer-checked:`). Which state wins comes from the order in which Tailwind writes its variants, and a test checks that order. One exception: a loading Button leaves out its `hover:` class in the code.
- Why the exception: a class `aria-busy:bg-primary`, which would keep the color while the pointer is over a loading button, would also win over a background the app gave, so a red button of an app would turn purple while it loads.
- Decision: an inner element has the attribute `data-slot` with the name of the part (`data-slot="field"`). It replaces the inner class names `tui-<component>__<part>`, which an app could use in its own CSS.
- Decision: the catalog loads Tailwind CSS 4 with its base styles, as an app does (`apps/catalog/.storybook/preview.css`), and Tailwind reads the source of the components there. The aliases of `apps/catalog/.storybook/main.ts` now name `@toraline.tech/...`; they still named `@toraline/...`, so the catalog read the built files.
- Checked on 2026-11-15, with a temporary Playwright script: the computed style of every element of the 42 stories and of the 2 pages of the playground, in both themes, at rest, with the pointer over each control and with the keyboard focus on each control, before and after. The screenshots are the same, byte for byte, when both sides have Tailwind's base styles. The values that differ draw the same pixels: `translate` and `rotate` in place of `transform` (the thumb of Toggle, the arrow of SplitButton); the animation name `spin` in place of `tui-button-spin`; `border-style: solid` in place of `none` on sides with a border `0px` wide; an outline width of `3px` in place of `0px` on an action of the menu while its `outline-style` is `none`; 4 more shadows with no size and no color in the `box-shadow` of the menu.
- What changes in the catalog only, because it did not load Tailwind's base styles before (an app with Tailwind always had them, and the playground did not change): the spinner of a loading Button is `16px` wide, it was `20px`; the field of Input is as wide as its container, it was `26px` wider; a `<p>` inside a story has no margin.
- Known difference: Tailwind applies a `hover:` class only on a device that has a pointer that can hover (`@media (hover: hover)`). On a touch screen the old CSS kept the hover look after a tap; the classes do not.
- Alternatives: keeping one class for each component, written with `@apply`; a CSS file built in advance with the classes, shipped by the package (no line about sources in the app, and no way for a class of the app to replace one of the library); an `@source` line written by the app with a path into `node_modules`; `clsx` alone, as Intraweb uses for its own components (no class is removed, so the app's class wins only by chance); `class-variance-authority`; a prop for the classes of each inner part (`fieldClassName`).
- Decided by: Juliana, 2026-11-15 (Tailwind classes as Intraweb writes them, no renamed token, no change of look). Every other choice of this entry: agent, to be confirmed in review.

## 2026-11-15 - The first version is `0.1.0`, not `2.0.0-beta.0` (TOR-1193)
- Decision: "V2" is only the internal name of the rebuilt library. Its versions are `0.x`. The first one is `0.1.0`. `1.0.0` is released after the full rebrand, which is based on the feedback of the apps that use the library. The earlier entry that names `2.0.0-beta.0` is replaced by this one.
- Why: the library is a pre-release: it is tested in Toraline's internal apps and not used for real. A version that starts with `0` says that anything may still change.
- Consequence: `0.1.0` has no dash, so the release workflow and the publish guard give it the npm tag `latest`, and `npm install @toraline.tech/ui` with no version installs it. The docs no longer tell an app to use `@next`. A version with a dash still gets the tag `next`.
- Consequence: while the version is `0.x`, a change that breaks an app raises the middle number (`0.1.1` becomes `0.2.0`).
- The release workflow is now named "Release".
- Decided by: Juliana, 2026-11-15.

## 2026-11-15 - The branch `v2` is renamed `main`, and the old `main` is renamed `old-package` (TOR-1191)
- Decision: on GitHub, the branch with the 2023 code (`main` until today) is now `old-package`. The branch with version 2 (`v2` until today) is now `main` and is the default branch. Earlier entries of this file say `v2` and `main` with their old meaning.
- Why: GitHub starts a workflow by hand only when its file is on the default branch. The release workflow was only on `v2`, so the first release could not start.
- What changed with it: the profile's `base_branch`, the branches in `check.yml`, the branch that `release.yml` and `scripts/check-packages.mjs` accept, and the `homepage` of both packages are now `main`.
- Known and not changed: the branch protection rule of the old `main` moved with it to `old-package`. The new `main` has no protection rule.
- Alternatives: make `v2` the default branch and keep the names; merge `v2` into `main`.
- Decided by: Juliana, 2026-11-15.

## 2026-11-15 - The packages are published in the npm scope `@toraline.tech` (TOR-1180)
- Decision: the packages are named `@toraline.tech/ui` and `@toraline.tech/tokens`. Every earlier entry of this file now shows the new names; when those entries were written the names were `@toraline/ui` and `@toraline/tokens`.
- Why: the scope `@toraline` belongs to an npm organization whose only member is the account `toralineproject`. Juliana cannot sign in to that account (password and two-factor code lost). She created the npm organization `toraline.tech`. Nothing was published under the old names, so no app has to change.
- Checked on 2026-11-15: `npm pack` accepts a scope with a dot. Not verified: a publish to the registry under this scope; the first run of the release workflow shows it.
- What does not change: the old package `@toraline/toraline-ui` and the folder `legacy/`.
- Alternatives: recover the old account through npm support and keep `@toraline/ui`.
- Decided by: Juliana, 2026-11-15.

## 2026-11-15 - Publishing: two packages with one version, a guarded publish, a release started by hand (TOR-1019)
- Decision: `@toraline.tech/tokens` is published as its own package. It is not copied inside `@toraline.tech/ui`. `@toraline.tech/ui` lists it in `dependencies`.
- Why: an app can use the tokens or the Tailwind CSS preset with no React. The later `packages/native` will need the tokens and must not install the web components. The guide already tells an app to import from both names, so nothing changes for an app.
- Decision: the two packages always have the same version, and `@toraline.tech/ui` asks for exactly that version of `@toraline.tech/tokens` (`"2.0.0-beta.0"`, with no `^`). `make version VERSION=<version>` writes the 3 places at once. `make check` fails when they differ (`scripts/check-packages.mjs`).
- Why: the styles of a component use the token names of the same commit. One number for both is the simplest rule a person can check, and an exact version means an app never gets components and tokens of two different releases. npm still links the workspace package inside this repository, because its version is the version asked for. The workspace value `"*"` would let a published `@toraline.tech/ui` install any version of the tokens.
- Decision: `"private": true` is removed from both packages. The guard against a publish by accident is the script `prepublishOnly` of each package, which runs `scripts/check-packages.mjs --publish`. `npm publish` stops unless all of these are true: the variable `TORALINE_RELEASE` is the version of the packages; a pre-release has an npm tag that is not `latest`, and a full release has `latest`; the branch is `v2`; nothing is uncommitted.
- Why: `npm pack` then makes the same `package.json` that a release publishes, so the test of the tarball tests the real thing. With `private` kept, the guard would end at the first release. The script guards every later release too. Checked on 2026-11-15 with `npm publish --dry-run` (it sends nothing): it stopped with the 4 messages.
- Limit: `npm publish --ignore-scripts` skips the guard. A person must type that flag on purpose.
- Decision: the first version to publish is `2.0.0-beta.0`. A pre-release (a version with a dash) is published with the npm tag `next`. Only a full release (`2.0.0`) gets the tag `latest`. An npm tag, also called dist-tag, is a name that points to one version; `npm install <name>` with no version installs what `latest` points to.
- Why: every component of phases 2 to 4 exists and is tested, so it is past "alpha". No Toraline app has used it yet, so the props may still change, and `2.0.0` would promise that they do not.
- Not verified: what the npm registry does with `latest` when the first version of a new package is published with `--tag next`. The release steps check it with `npm view <name> dist-tags`.
- Decision: the change list is one file written by hand, `CHANGELOG.md` at the repository root, for both packages. `make check` fails when it has no section for the current version. Changesets is not used.
- Why: Changesets (`@changesets/cli` 3.0.3 on 2026-11-15, 21 direct dependencies) keeps one file for each change and computes a version for each package. Here 2 packages share one version, so there is nothing to compute. Its documentation pages on GitHub could not be opened on 2026-11-15 (error 404); the facts above are from the npm registry.
- Decision: the packages are ES modules only (no CommonJS build). `exports` gives `types` and `default` for each code entry, each CSS file by name, and `./package.json`. `files` is `dist` and `css`. No source map is shipped. The type files of `src/template/` and of the tests are not built (`tsconfig.build.json`).
- Why: Next.js 16, Vite and Node 24 all read ES modules. A source map (a file that links built code back to its source) is not needed to run the code, and the source is public on GitHub. The tarballs: `@toraline.tech/tokens` 14 files, 13.2 kB; `@toraline.tech/ui` 42 files, 18.7 kB.
- Decision: a relative import in the source of a package names the file with `.js` (`./Button.js`, `./button/index.js`). `scripts/check-packages.mjs` fails when a built type file has a relative import without it.
- Why: found on 2026-11-15 with `@arethetypeswrong/cli` 0.18.5: without the extension, the type files did not resolve in an app whose TypeScript uses the Node module rules (`"moduleResolution": "node16"`). They resolved only with `"bundler"`, which is what Next.js sets. After the change both resolve.
- Decision: `publint` and `@arethetypeswrong/cli` are not dependencies and are not in `make check`. They were run once with `npx` on the tarballs: `publint` 0.3.25 reported no problem for both; `@arethetypeswrong/cli` (profile `esm-only`, CSS entries excluded) reported no problem for `node16` from ES modules and for `bundler`.
- Why: `scripts/check-packages.mjs` checks what broke or could break here (files of `exports`, `"use client"` kept, import extensions, extra files) with no new dependency.
- Decision: `"use client"` stays as phase 3 built it: one built file for each source file. The Vite option is now `build.rolldownOptions`, because Vite 8 names `build.rollupOptions` as deprecated. `make check` fails when a source file starts with `"use client"` and its built file does not.
- Why: the documentation of Rolldown (the tool inside Vite 8 that joins files) says that with `preserveModules` an export can go missing. The check makes that visible.
- Decision: `peerDependencies` of `@toraline.tech/ui` stay `react` and `react-dom` `^19.0.0`. `tailwindcss` `^4.0.0` stays an optional peer dependency of `@toraline.tech/tokens`.
- Decision: there is no `license` field. The repository has no LICENSE file, and neither `legacy/package.json` nor GitHub names a license. The owner must choose one; until then npm shows the packages with no license.
- Decision: `homepage` points to the folder of each package on the branch `v2`. It must change when `v2` becomes the main branch.
- Decision: the release is the workflow `.github/workflows/release.yml`. It runs only when a person starts it by hand (`workflow_dispatch`), only on the branch `v2`. It runs `make check` and `make pack`, then publishes with the repository secret `NPM_PUBLISH_TOKEN` and with npm provenance (a signed note on npm that says which commit and which workflow built the package). With the box "publish" off it only tests and sends nothing. It stops at its first step when the secret is missing. No git tag starts it.
- Why: a run started by hand cannot happen because of a push. A new secret name leaves the secret of the old workflow (`npm_token`) as it is. Provenance needs a public repository, and this one is public (checked with `gh repo view`).
- Not verified: the workflow has never run. Its YAML was parsed, and its publish commands were run on this machine with `--dry-run`.
- Decision: `make pack` writes the tarballs into `.pack/tarballs/` (ignored by git) and lists the files of each.
- Alternatives: the tokens copied inside `@toraline.tech/ui` (one package to install, but no tokens without React); `@toraline.tech/tokens` as a peer dependency of `@toraline.tech/ui`; a range `^2.0.0-beta.0`; `private` kept until the release; first version `2.0.0-alpha.0` or `2.0.0`; Changesets; a workflow started by a git tag `v2.*`; npm trusted publishing (publishing from GitHub Actions with no token), which the npm documentation sets up on the settings page of a package, so it can replace the token after the first release; shipping source maps.
- Decided by: agent, to be confirmed in review.

## 2026-11-15 - The guide: one Markdown file, shown in the catalog and linked from the README (TOR-1018)
- Decision: the text of the guide is one Markdown file, `docs/guide.md`. The catalog page `apps/catalog/stories/Guide.mdx` imports that file as text and shows it, and adds two live examples under it. The root `README.md` links to `docs/guide.md`.
- Why: the ticket asks for a page in the catalog that the root README also links to. The catalog is not deployed, so a link to a catalog page works only on a machine that runs it. GitHub shows a Markdown file as a page, and does not do that for an MDX file. One file for both places cannot go out of date in one of them.
- Decision: the live examples are stories (`Guide/Live examples`), built with the same colors and class names as the guide. The example of guide 2 builds its two themes with `createTheme` and puts the CSS in a `<style>` element, with theme names that start with `guide-`.
- Why: as stories, the accessibility tests check them in both themes. The names with `guide-` keep the themes `light` and `dark` of the catalog unchanged for the other stories.
- Decision: the guide tells an app to add `"type": "module"` to `package.json` and `"allowImportingTsExtensions": true` to `tsconfig.json`.
- Why: found on 2026-11-15 in an app made by hand with the files of `create-next-app`: without the first, Node 24 prints a warning each time it runs `scripts/write-theme-css.ts`; without the second, `next build` (Next.js 16.4.6) fails with the error TS5097 on the import of `../theme.config.ts`. `apps/playground` has both.
- Decision: for an app with no Next.js, the guide shows a Vite app that puts the script of `createThemeScript` in `<head>` with a small plugin in `vite.config.ts` (`transformIndexHtml`), and gives no `initialTheme` to `ThemeProvider`.
- Why: `ThemeProvider` does not read the cookie by itself. It takes the theme that is already on `<html>`. The script must run before the page paints, so it cannot be in the React code.
- Decision: the guide page is the first page of the catalog (`storySort` in `.storybook/preview.tsx`).
- Alternatives: the guide written only as an MDX page; a second copy of the text in the README; live examples as plain components of the page, not covered by the tests; `next/font/local` in the guide, as the playground does.
- Decided by: agent, to be confirmed in review.

## 2026-11-15 - Stories, the tokens page and the accessibility tests (TOR-1017)
- Decision: a story that shows variants or sizes renders every value of the list that the library exports (`buttonVariants`, `buttonSizes`, `splitButtonMenuPlacements`). So Button has one story `Variants`, and not one story for each variant. Each state (disabled, loading, error, on, open) has its own story.
- Why: the ticket asks for one story for each variant, and also that a new variant appears without editing the story. Both are not possible together: a story is a named export of a file, and Storybook reads the names without running the file, so a file cannot make its stories from a list. The second request was kept, because a catalog that misses a variant is the larger problem.
- Decision: the accessibility check is `@storybook/addon-a11y` 10.6.7 (it runs axe-core), with `parameters.a11y.test: "error"` for every story. The stories also run as tests with `@storybook/addon-vitest` 10.6.7, in Vitest browser mode (`@vitest/browser` 5.1.0, `@vitest/browser-playwright` 5.1.0, `playwright` 1.65.1, Chromium with no window).
- Why: Storybook 10.6 supports this with Vitest 5, which the repository already uses. With `"error"`, a problem that axe-core finds fails the test of the story, in `make check` and in the CI.
- Decision: there is one Vitest project for each theme of the catalog (`stories-light`, `stories-dark`), built from the same list as the toolbar control, with the option `initialGlobals: { theme }` of the Vitest plugin of Storybook. The projects are in `apps/catalog/vitest.projects.ts`, and the root `vitest.config.ts` adds them to the unit tests, which are now the project `unit`.
- Why: the ticket asks for no failure in either theme, and the contrast of a color differs between themes. Checked with a temporary story that had dark grey text: its test failed only in `stories-dark`, with a contrast of 1.88.
- Decision: `make check` runs the story tests and builds the static catalog. `make check` takes about 20 seconds (it took 12 seconds before the stories). `make test` and `make catalog-test` first run `make catalog-browser` (`playwright install --only-shell chromium`), which downloads the browser once for each machine and does nothing when it is there. The CI installs the browser with its system libraries in its own step, before `make check`.
- Why: 20 seconds is far below the limit of about 3 minutes that the ticket gives for keeping the story tests inside `make check`. Without the browser step, `make check` would fail on a machine that never ran the story tests.
- Decision: the tokens page is `stories/Tokens.mdx`, made of stories (one for each group of tokens). The tables read `themeTokenNames`, `lightTheme`, `darkTheme` and `primitives` of `@toraline.tech/tokens`. A level 2 token that fits no group is shown in the table "Other tokens".
- Why: tables made from the library's own lists cannot go out of date, and stories are covered by the accessibility tests. A page of plain documentation is not.
- Decision: the table of props uses `react-docgen`, the default of Storybook for React. A prop whose type is one of a list gets its values from the helper `optionList` (`stories/shared/option-list.ts`).
- Why: `react-docgen-typescript` was tried on 2026-11-15: with the source of the components outside `apps/catalog`, it gave a table with no description and no type. `react-docgen` reads the comment of each prop, but shows the type of a variant as `unknown[number]`, so the story names the values.
- Decision: every component gets a documentation page by itself (the tag `autodocs` in `.storybook/preview.tsx`).
- Alternatives: one story for each variant, written by hand; the accessibility check only in the panel of the open catalog; one test run in the light theme only; the story tests as a separate make target outside `make check`; a tokens page written by hand in Markdown.
- Decided by: agent, to be confirmed in review.

## 2026-11-15 - The catalog: Storybook with a theme control in the toolbar (TOR-1016)
- Decision: the catalog is Storybook 10.6.7 with the framework `@storybook/react-vite` 10.6.7, in the workspace `apps/catalog`. A framework is the Storybook package that knows the component library (React) and the build tool (Vite). The versions are exact, with no `^`. The configuration is in `apps/catalog/.storybook/`, and the stories are in `apps/catalog/stories/`.
- Why: Storybook 10.6.7 was the current version on 2026-11-15, and it accepts Vite 8 and React 19, which the repository already uses. Stories in `apps/catalog` keep `packages/ui` free of any Storybook dependency and of files that its build and its type files would have to skip.
- Decision: the catalog reads the source of `@toraline.tech/tokens` and `@toraline.tech/ui` (`packages/*/src`), through Vite aliases in `.storybook/main.ts` and `paths` in `apps/catalog/tsconfig.json`. An alias is a rule that sends an import to another file.
- Why: `make catalog` then needs no build before it, a change in a component shows in the open catalog at once, and the table of props can read the comments of the source. The built files have no comments.
- Decision: the theme control is a Storybook global named `theme`, shown in the toolbar. A global is a value that every story shares. Its items are `DEFAULT_THEMES` of `@toraline.tech/tokens`. A decorator (a function that wraps every story) writes the value on `<html data-theme="...">` and puts `ThemeProvider` around the story. When a press on `ThemeToggle` inside a story changes the theme, the decorator updates the global, so the toolbar names the same theme.
- Why: `data-theme` on `<html>` with `ThemeProvider` is what an app does, so a story looks and behaves as in an app. The list comes from the library, so a theme that the library adds appears in the toolbar with no change in the catalog. The addon `@storybook/addon-themes` was not used: it does the same with one more dependency, and it cannot follow `ThemeToggle`.
- Decision: Storybook's own background control is off (`features.backgrounds: false`). The page behind a story gets `--color-surface` and `--color-text` from `apps/catalog/.storybook/preview.css`.
- Why: the background control changes only the color behind a story. With it, a person could put a light background behind dark theme components.
- Decision: Storybook sends no usage data (`core.disableTelemetry: true`) and does not ask the network for its news (`core.disableWhatsNewNotifications: true`).
- Decision: the script that builds the static catalog is named `build`, so the root `npm run build`, and with it `make check`, builds the catalog. The build takes about 3 seconds. `make catalog` opens the catalog on port 6006, and `make catalog-build` builds only the catalog, into `apps/catalog/storybook-static` (ignored by git).
- Decision: ESLint reads the folder `.storybook` (it skips a folder whose name starts with a dot unless told), and uses the recommended rules of `eslint-plugin-storybook` 10.6.7 for the story files.
- Alternatives: stories next to each component in `packages/ui/src`; reading the built packages, as `apps/playground` does; `@storybook/addon-themes`; a theme control with fixed items `light` and `dark`.
- Decided by: agent, to be confirmed in review.

## 2026-11-15 - Choices made in the 6 components (TOR-1010 to TOR-1015)
- Decision (Button): the variants are `primary`, `secondary` and `danger`; the sizes are `sm`, `md` and `lg`. `type` is `"button"` when missing.
- Why: the old Button had no variant and no size (it showed the fixed text "oi" on the primary color), so there was nothing to keep but the primary look. `danger` comes from the prop `isWarning` of the button on the old branch `v1`. A default of `"button"` stops a button inside a form from sending the form by accident.
- Decision (Button): a loading button has `aria-busy` and `aria-disabled`, and its click handler stops the press. It does not get the HTML attribute `disabled`. A disabled button has the same quiet look in every variant: `--color-text-muted` on `--color-surface`.
- Why: an element that gets `disabled` loses the keyboard focus, and a person who pressed the button with the keyboard would lose their place. The quiet look has a contrast of 4.64 (light) and 6.96 (dark); less opacity on the variant's colors would go below 4.5.
- Decision (Input): the label is always above the field. The old label that sat inside the empty field and moved up on focus is not kept.
- Why: the moving label hid the placeholder, had the muted color at rest, and needed a background equal to the surface behind the field.
- Decision (Toggle): an `<input type="checkbox" role="switch">` inside a `<label>`. On is the success color, as in the old Toggle (green). The Enter key does not change it.
- Why: the browser gives the Space key, the form value and the state for a screen reader. The WAI-ARIA switch pattern makes Enter optional, and Enter in a form field sends the form.
- Decision (Tabs): a tab is selected as soon as it gets the focus with an arrow key (automatic activation). Only the content of the selected tab is on the page. The component is exported as `Tabs`.
- Why: the WAI-ARIA tabs pattern recommends automatic activation when the content shows with no delay, and the content is already in memory. The old component also rendered only the selected content.
- Decision (BreadCrumbs): the links are `<a>` elements unless the app gives `linkComponent`.
- Why: the apps use Next.js, where a plain `<a>` loads the whole page again. The library must not import `next/link` itself, because it is not only for Next.js.
- Decision (SplitButton): the option to open the menu upwards is the prop `menuPlacement` (`"bottom"` or `"top"`). The menu is placed with CSS (`position: absolute`) inside the component, sits above the page content, and does not move by itself when there is no room.
- Why: the old remote branch `TR-82-Adicionar-opcao-de-abrir-o-botao-multiplo-pra-cima` was read on 2026-11-15: its SplitButton is the same file as on `main`, with no option to open upwards, so there was no old prop name or behaviour to keep. Placing the menu with CSS needs no dependency. Moving it by itself to stay on screen is the hard behaviour for which the conventions name Base UI.
- Decision (SplitButton): the menu follows the WAI-ARIA menu button pattern. It always moves the focus into the menu when it opens, also after a mouse click.
- Decision (all): a prop has the HTML or React name. So the old `url` is `href`, the old `mainButtonText` is `children`, the old `onClickMainButton` is `onClick`, the old `dropdownButtons` with `text`, `onClick`, `Icon` is `items` with `label`, `onSelect`, `icon`, and the old `component` and `isActive` of a tab are `content` and `defaultSelectedId`.
- Alternatives: `ghost` and `link` button variants; `disabled` for a loading button; a floating label; a `<button role="switch">`; manual activation of tabs; a `renderLink` function; Base UI's menu for the split button.
- Decided by: agent, to be confirmed in review.

## 2026-11-15 - Component conventions (TOR-1009)
- Decision: the package uses no library of primitives. A library of primitives is a set of components with behaviour and no styles. A component uses the native HTML element that has the behaviour (`<button>`, `<input type="checkbox" role="switch">`, `<label>`, `<a>`, `<nav>`). Behaviour that HTML does not have (arrow keys between tabs, the menu of the split button) is written by hand, following the WAI-ARIA Authoring Practices Guide. When a later component needs behaviour that is hard to write correctly (a dialog that keeps the focus inside, a select, a combobox, a popup that must move to stay on screen), the library to use is Base UI (`@base-ui/react`).
- Why: of the 6 components of phase 3, 4 need only native elements. The other 2 (tabs, menu button) are short patterns: a few key handlers each. A library would add a dependency to every app for that. Checked on 2026-11-15: `@base-ui/react` 1.9.0, `radix-ui` 1.8.1 and `react-aria-components` 1.22.1 all accept React 19. Base UI is the fallback because it is stable (1.x), has no styles, and its documentation covers every hard component named above. Its menu renders in another part of the page (a portal) and its documentation asks the app to add `isolation: isolate` to its root element; a hand-written menu needs no setup in the app.
- Decision: a variant and a size are declared as an exported list (`buttonVariants`), the type comes from the list, and the component writes them as `data-variant` and `data-size`. A state is written once, as the HTML or ARIA attribute a screen reader reads (`disabled`, `aria-busy`, `aria-invalid`, `aria-selected`, `checked`, `aria-expanded`), and the CSS selects that attribute.
- Why: one class for each element, and no code that builds class names. The look and what a screen reader says cannot differ, because both come from one attribute.
- Decision: when a component's file has `"use client"`, its lists of variants and sizes are in a second file with no `"use client"` (`src/button/button-options.ts`).
- Why: found on 2026-11-15 with Next.js 16.4.6: a Server Component that read `buttonVariants` from the `"use client"` file failed with `buttonVariants.map is not a function`. Next.js lets a Server Component render a component of such a file, but not read its other values.
- Decision: the app's `className` is joined after the library's class with the helper `classNames` (`packages/ui/src/shared/class-names.ts`), on the outermost element. The package does not use `clsx`, `tailwind-merge` or `class-variance-authority`.
- Why: the app's classes win because of the cascade layer `components` (decision of TOR-1006), not because of the order in the attribute. The library's own styles are not Tailwind classes, so there is nothing for `tailwind-merge` to merge.
- Decision: every other prop goes to the main native element, and `ref` is a normal prop that points to it (React 19). No `forwardRef`.
- Decision: `"use client"` is on a file only when the component uses state, an effect or an event handler of its own. The build writes one file for each source file (`preserveModules` in `packages/ui/vite.config.ts`), so each built file keeps or does not keep that line. The entry `@toraline.tech/ui/theme` is now `dist/theme/index.js`.
- Why: with one built file for the whole entry, the line could only be on all components or on none. Checked with Vite 8.3.8: the built `theme/ThemeToggle.js` starts with `"use client"` and the built `shared/class-names.js` does not.
- Decision: each component has its own CSS file in `packages/ui/css/`, and `css/styles.css` imports them. An app still imports only `@toraline.tech/ui/styles.css`. A test (`packages/ui/src/styles.test.ts`) checks every file: layer `components`, class names that start with `tui-`, only level 2 tokens, no raw color, no length in `rem`.
- Decision (the open point of phase 2): spacing and font sizes get level 2 tokens. There are 4: `--text-sm`, `--text-base`, `--text-lg` (font sizes) and `--spacing` (the spacing unit, `0.25rem`). A component writes a padding or a gap as `calc(var(--spacing) * 4)`. The values are the same in both themes. `createTheme` accepts `textSizes` and `spacing`.
- Why: the names are the names Tailwind 4 uses for the same things, which is the rule of TOR-1008. So `text-sm` and `p-4` in an app, and the sizes inside a component, read the same variables, and an app that changes `--spacing` makes its own layout and the components more compact together. One unit, and not one token for each step, keeps the list short. Checked with Tailwind 4.3.5: `p-4` builds to `calc(var(--spacing) * 4)`.
- Decision: these stay plain values in a component's CSS: border and outline widths in `px`, line height, font weight, sizes in `em` or `%`, durations, `z-index`.
- Why: they do not change with the theme, and a token for each would make the list long with no use.
- Decision: one more color token, `--color-danger-hover` (light: `--red-700`, new, `#b42020`; dark: `--red-200`, new, `#f8a3a3`), for a danger button while the pointer is over it. There are now 26 level 2 tokens.
- Why: `--color-primary` already has `--color-primary-hover`. Without a token, the hover color would be computed in CSS and the contrast test could not check it. Contrast of the text on it: 6.63 (light), 9.04 (dark).
- Decision: the template of a component is `packages/ui/src/template/`: a small working component (`Example`) that is type checked, linted and tested with the package, and not exported.
- Why: a template inside `src/` cannot go out of date without a failing check, and its imports work unchanged after the folder is copied.
- Decision: tests press keys with `@testing-library/user-event` 14.6.10 (a development dependency).
- Why: `jsdom` does not run what a key does by default (Space on a checkbox, Enter on a button). `user-event` does.
- Alternatives: Base UI, Radix or React Aria for every component; variant classes (`tui-button--primary`) or `class-variance-authority`; one CSS file for all components; no tokens for sizes, with lengths in `em`; one level 2 token for each spacing step; a template folder outside `src/`.
- Decided by: agent, to be confirmed in review.

## 2026-11-15 - Tailwind 4 preset (TOR-1008)
- Decision: the preset is the CSS file `packages/tokens/css/tailwind.css` (`@toraline.tech/tokens/css/tailwind.css`). An app imports it after `tailwindcss`. It imports the tokens and the two themes, declares every level 2 token inside `@theme`, sets `--font-body` as the font of the page, and makes the variant `dark:` follow `data-theme="dark"` with `@custom-variant`.
- Why: Tailwind 4 is configured in CSS. The level 2 names (`--color-*`, `--font-*`, `--radius`, `--shadow`) are the names Tailwind's `@theme` already uses, so each token becomes a class with no mapping: `--color-primary` gives `bg-primary`, `--radius` gives `rounded`. Each class reads the CSS variable in the browser, so `data-theme` changes it.
- Decision: the values in `@theme` are the values of the light theme. A test compares them with `lightTheme`. The shadow alone uses `@theme inline { --shadow: var(--shadow); }`.
- Why: Tailwind copies a shadow's value into the class `shadow` at build time. Checked with Tailwind 4.3.5: with a plain `@theme` the class had the light theme's shadow in both themes. With `inline` the class has `var(--shadow)` and follows the theme.
- Decision: the preset keeps Tailwind's own colors and sizes (`bg-red-500`, `rounded-lg`, `p-4`).
- Why: an app may style on top of a component with any class. Removing Tailwind's defaults would take classes away from the app.
- Decision: a color an app added becomes a class through `createTailwindTheme(themeInputs)`, which returns an `@theme` block with the added colors. The app writes it to a CSS file before the build, together with the output of `createTheme`.
- Why: Tailwind builds classes only from CSS files it reads at build time. A `<style>` element made at request time is too late.
- Decision: `tailwindcss` is an optional peer dependency of `@toraline.tech/tokens` (`^4.0.0`). The tests run Tailwind 4.3.5 through `@tailwindcss/postcss` on the preset and check the classes it builds.
- Known limit: the color classes have the token's name after the Tailwind prefix, so the text colors are `text-text` and `text-text-muted`, and the border color is `border-border`.
- Alternatives: `@theme inline` with a different name on each side (for example `--color-primary: var(--tui-primary)`), which needs a prefix on every level 2 token; a JavaScript Tailwind plugin; one extra `@theme` line written by hand in the app for each added color; `@theme reference`, which is not in Tailwind's documentation.
- Decided by: agent, to be confirmed in review.

## 2026-11-15 - Fonts: default stack, and how an app sets its own (TOR-1007)
- Decision: the default fonts are system font stacks, held in the level 1 tokens `--font-stack-sans` and `--font-stack-mono`. The library ships no font file and does not use Montserrat, the font of the old library.
- Why: a system font stack works with no setup and loads nothing. An app that wants Montserrat, or any font, sets it through the theme function.
- Decision: an app sets a font by giving `createTheme` a CSS `font-family` value in `fonts.body`, `fonts.heading` or `fonts.mono`. For a font the app loads with `next/font`, the value is the CSS variable of that font, for example `var(--font-fraunces), Georgia, serif`. The library has no font loading code.
- Why: `next/font` already loads, hosts and preloads the file. The library only needs the name.
- Decision: a test (`packages/ui/src/fonts.test.ts`) reads every CSS and code file of the two packages and fails when a `font-family` is not `--font-body`, `--font-heading` or `--font-mono`, or when a font name appears outside the level 1 files.
- Decision: the playground loads Fraunces with `next/font/local` from a file committed in `apps/playground/app/fonts/` (36,620 bytes, SIL Open Font License 1.1, copied from the npm package `@fontsource-variable/fraunces` 5.3.0).
- Why: `next/font/google` downloads the font from Google at build time. `make check` and the CI would then fail with no network. A local file always builds.
- Decision: an app's themes are built before the build, not at request time. In the playground, `theme.config.ts` holds the inputs and `scripts/write-theme-css.ts` writes `app/theme.generated.css` (ignored by git) before `dev` and `build`. Node 24 runs the TypeScript script directly.
- Why: Tailwind (TOR-1008) reads CSS files when it builds. A color that an app adds can become a Tailwind class only when it is in a CSS file at build time. One generated file keeps the theme values and the Tailwind classes in one place.
- Alternatives: a `<style>` element in the layout, filled by `createTheme` on each request; shipping a default web font with the library; `next/font/google` in the playground.
- Decided by: agent, to be confirmed in review.

## 2026-11-15 - Where the theme code lives and how the choice is saved (TOR-1006)
- Decision: the React provider (`ThemeProvider`), the hook (`useTheme`) and the toggle (`ThemeToggle`) are in `packages/ui/src/theme/`, published as the entry `@toraline.tech/ui/theme`. The code with no React (cookie name, `resolveTheme`, `readThemeCookie`, `serializeThemeCookie`, `createThemeScript`) is in `packages/tokens/src/theme-storage.ts`.
- Why: `packages/tokens` stays free of React. The entry `@toraline.tech/ui/theme` starts with `"use client"`, which Next.js needs for code that runs in the browser. A server file (the root layout) cannot call a function from a `"use client"` file, so the functions the server calls are in `@toraline.tech/tokens`.
- Decision: the choice is saved in a cookie, `toraline-theme`, for 1 year, with `Path=/` and `SameSite=Lax`. A Next.js app reads it in the root layout with `cookies()` and writes `data-theme` on `<html>`.
- Why: the server receives a cookie with the request, so the HTML it sends already has the right theme. The browser's `localStorage` is not sent to the server; with it, the server cannot know the theme.
- Cost: reading a cookie in the root layout makes Next.js render every page at request time. For an app that needs pages built once, `createThemeScript` returns a script for `<head>` that reads the same cookie before the page paints.
- Decision: a person who has not chosen gets the app's default theme. The library does not read the dark mode setting of the operating system.
- Why: the tickets do not ask for it, and the server cannot read that setting on the first request.
- Decision: `ThemeToggle` is a `<button>` that goes to the next theme of the app's list on each press. Its accessible name (the text a screen reader says) tells the state: `Theme: dark. Switch to light.`
- Why: an app can have more than 2 themes. The attribute `aria-pressed` can only say "on" or "off", which fits 2 themes only.
- Decision: the library's component styles are a plain CSS file, `packages/ui/css/styles.css` (`@toraline.tech/ui/styles.css`), with every rule in the cascade layer `components` and class names that start with `tui-`.
- Why: a Tailwind class and an app's own CSS both win over a rule in that layer, so an app can style on top with `className`. Phase 3 may change how components are styled; today this covers only the toggle.
- Decision: the test app is `apps/playground` (Next.js 16.4.6, React 19.3.1), private. `make check` builds it, because the root `build` script runs every workspace. The build takes about 4 seconds.
- Decision: Vitest runs browser tests with `jsdom` 31.0.1 and `@testing-library/react` 16.3.3. A test file that needs a page starts with `// @vitest-environment jsdom`.
- Alternatives: `localStorage` with a script (what the library `next-themes` does); a `ThemeScript` React component; a switch with `aria-checked` for exactly 2 themes; Tailwind classes inside the component; `happy-dom` in place of `jsdom`.
- Decided by: agent, to be confirmed in review.

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
- The library is one repository, installed by each app. Package name `@toraline.tech/ui`, on the public npm registry.
- Components come styled. An app can style on top of a component, or change and add theme colors. Themes and fonts are configurable, with a toggle between themes.
- Version 2 is built on a branch `v2` on top of the old code, and released fully before the old code is removed. `v2` becomes the main branch later.
- Monorepo layout: `packages/tokens`, `packages/ui`, later `packages/native`, `apps/catalog` (Storybook).
