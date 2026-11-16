# @toraline.tech/tokens

**English** | [Português](https://github.com/Toraline/toraline-ui/blob/main/packages/tokens/README.pt-BR.md)

The design tokens and the themes of the Toraline component library. A design token is a named value of the design, for example a color or a font, stored as a CSS variable. This package has no React code.

The catalog is online: https://toraline-ui.vercel.app/ Its page **Foundations > Tokens** shows every token of this package, with its value in each theme.

## Installation

The package is on npm. The current version is `0.3.0`, published on 2026-11-16. The first version, `0.1.0`, was published on 2026-11-15.

```bash
npm install @toraline.tech/tokens
```

- The library is at version `0.x`: tokens may still change between versions.
- An app that also uses `@toraline.tech/ui` installs both packages in the same version.
- The package needs no React. Tailwind CSS 4 is optional.
- The package has ES modules only (files read with `import`), with type files for TypeScript.

To try a change of the library that is not released yet, an app can install the package file that `make pack` writes. The steps are at the start of guide 1 in [`docs/guide.md`](../../docs/guide.md).

## The two levels

- **Level 1: raw values.** The name says what the value is. Example: `--color-brand-700` is `#42637c`. File: [`css/primitives.css`](css/primitives.css).
- **Level 2: meanings.** The name says what the value is for. Example: `--bg-primary` is the background of the main action. Components use only level 2 tokens.

The color tokens of level 2 have the names and the values of the design system of the app Intraweb, an app of Toraline. So the default look of the library is the look of Intraweb. A test compares the two themes with a copy of Intraweb's theme files.

A **theme** is one block of level 2 values. The page selects a theme with the attribute `data-theme` on its root element (`<html>`). The library has two themes:

| Theme | File | Applies when |
|---|---|---|
| `light` | [`css/themes/light.css`](css/themes/light.css) | `<html data-theme="light">`, and also when `<html>` has no `data-theme` |
| `dark` | [`css/themes/dark.css`](css/themes/dark.css) | `<html data-theme="dark">` |

## How to use it

1. Import the CSS once, in the global CSS file of the app:

   ```css
   @import "@toraline.tech/tokens/css";
   ```

   This one line loads the level 1 tokens, the light theme and the dark theme. The three files can also be imported one by one: `@toraline.tech/tokens/css/primitives.css`, `@toraline.tech/tokens/css/themes/light.css`, `@toraline.tech/tokens/css/themes/dark.css`.

2. Select the theme on the root element:

   ```html
   <html data-theme="dark">
   ```

3. Use the level 2 tokens in CSS:

   ```css
   .card {
     background: var(--bg-surface);
     color: var(--text-primary);
     border: 1px solid var(--border-default);
     border-radius: var(--radius-xl);
     box-shadow: var(--shadow-card);
     font-family: var(--font-body);
   }
   ```

The same values are available in TypeScript:

```ts
import { colorTokenNames, darkTheme, lightTheme, primitives, themeTokenNames } from "@toraline.tech/tokens";

lightTheme.tokens["bg-primary"]; // "var(--color-brand-700)"
darkTheme.tokens["bg-primary"]; // "#8eaec5"
primitives["color-brand-700"]; // "#42637c"
themeTokenNames; // the names of every level 2 token
colorTokenNames; // the names of the level 2 color tokens only
```

## Build a theme for an app: `createTheme`

`createTheme` is a function that receives an app's values and returns the CSS of one theme, as text. The app can change a color of the library, add a new color, change the fonts, the text sizes, the spacing unit, the radius sizes and the shadows. A value the app does not give comes from the default theme.

```ts
import { createTheme } from "@toraline.tech/tokens";

const css = createTheme({
  name: "ocean",
  colors: {
    "bg-primary": "#0055aa", // changes --bg-primary
    "bg-promo": "#ff6600", // adds the new token --bg-promo
  },
  fonts: { heading: "Georgia, serif" }, // changes --font-heading
});
```

`css` is this text. The lines that are not shown have the values of the light theme:

```css
[data-theme="ocean"] {
  color-scheme: light;
  --bg-page: var(--color-slate-100);
  /* ... */
  --bg-primary: #0055aa;
  /* ... */
  --font-heading: Georgia, serif;
  /* ... */
  --bg-promo: #ff6600;
}
```

Put the text in the page after the CSS of this package, for example in a `<style>` element or in a CSS file. Then select the theme with `<html data-theme="ocean">`.

The input, type `ThemeInput`:

| Field | Required | Meaning |
|---|---|---|
| `name` | Yes | The name of the theme, used in `data-theme="<name>"`. Lowercase letters, digits and dashes |
| `base` | No | `"light"` or `"dark"`: the default theme that gives the values the app does not give. When missing: `"light"` |
| `isDefault` | No | `true`: the theme also applies when `<html>` has no `data-theme` |
| `colors` | No | The value is any CSS color. The key decides what the color is. See "The keys of `colors`" below |
| `fonts` | No | `body`, `heading`, `mono`. The value is any CSS `font-family` value |
| `textSizes` | No | `xs`, `sm`, `base`, `lg`, `2xl`, `3xl`. The value is any CSS length. Changes `--text-xs`, `--text-sm`, `--text-base`, `--text-lg`, `--text-2xl`, `--text-3xl` |
| `spacing` | No | Any CSS length. Changes `--spacing`, the unit of every padding and gap of a component |
| `radius` | No | Any CSS length, or an object. One value changes `--radius-md`, the corner of a button and a field. An object changes each size it names: `{ md: "0.625rem", lg: "1rem", xl: "1.25rem", "2xl": "1.5rem" }` |
| `shadows` | No | An object with `sm`, `card`, `lg`, `xl`, `2xl`. The value is any CSS `box-shadow` value |

The keys of `colors`:

| Key | Example | What it does | Tailwind class |
|---|---|---|---|
| The name of a color token of the library | `bg-primary`, `text-brand`, `border-default`, `icon-default`, `data-1` | Changes that token | The class of the token, unchanged |
| Another name that starts with `bg-` | `bg-promo` | Adds the token `--bg-promo`, a background | `bg-promo` |
| Another name that starts with `text-` | `text-on-promo` | Adds the token `--text-on-promo`, a text color | `text-on-promo` |
| Another name that starts with `border-` | `border-promo` | Adds the token `--border-promo`, a border color | `border-promo` |
| Another name that starts with `icon-` | `icon-promo` | Adds the token `--icon-promo`, an icon color | `text-icon-promo` |
| Another name that starts with `data-` | `data-4` | Adds the token `--data-4`, a color of a chart | `bg-data-4`, `text-data-4`, `fill-data-4` and the classes of the other properties |
| Any other name | `promo` | Adds the token `--color-promo`, a color for every CSS property | `bg-promo`, `text-promo`, `border-promo`, `fill-promo` and the others |

Each use of a color has its own token. An app that changes its main color gives the same value to each token that has it. In the light theme of the library these tokens have the main color: `bg-primary`, `bg-inverse`, `text-brand`, `text-info`, `border-brand`, `border-inverse`, `icon-brand`. `bg-primary-hover` and `bg-inverse-hover` are one step darker.

`createTheme` refuses 2 kinds of key, with an error that says what to write:

- A name with no group that is the end of a class of the library, for example `primary`, `surface`, `brand` or `danger`. `primary` would add a new color for every CSS property, and the classes `bg-primary` and `text-primary` would still read the tokens of the library, so the app would see no change. Write the full token name: `bg-primary`.
- `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl` to `text-9xl`, and a name that starts with `text-shadow`. Tailwind CSS uses the variables with these names for font sizes and text shadows.

To change the light or the dark theme of the library, use its name: `createTheme({ name: "dark", base: "dark", colors: { "bg-primary": "#88ccff" } })`. The block comes later in the page than the library's block, so its values win.

`createTheme` throws an error when a name has other characters, or when a value has one of `;`, `{`, `}`, `<`, `>`, `\` or `/*`. This stops a value from closing the CSS block.

### A theme of an app can change every token

The app Intraweb has 3 themes of its own next to `light` and `dark`: `cozy` (cream and pink, softer corners, warm shadows), `old` (dark, almost square corners, its own heading font) and `glass` (translucent cards). They stay in Intraweb: the library has only `light` and `dark`. The test `src/intraweb-app-themes.test.ts` builds the 3 with `createTheme`, from copies of Intraweb's files: every color, the radius sizes, the shadows and the heading font. A transparent color (`rgb(255 255 255 / 0.68)`) is a value like any other.

What `createTheme` cannot express is a CSS rule: it gives values to tokens. The theme `glass` has 4 such rules (a gradient behind the page, a blur behind each card, a less transparent background for a menu or a dialog, and a fallback for a browser with no blur). An app keeps such rules in its own CSS file, next to the output of `createTheme`. The same test checks that they work together.

`getAddedColorNames(input)` returns the colors of an input that the library does not have. For the example above: `["bg-promo"]`.

## Fonts

Three level 2 tokens decide every font of the library:

| Token | Used for | Default | Tailwind class |
|---|---|---|---|
| `--font-body` | Normal text | `--font-stack-sans`: Inter | `font-body`, and `font-sans`, the name Intraweb uses |
| `--font-heading` | Headings, buttons and the text styles | `--font-stack-display`: Poppins, in the weights 400, 500 and 600 | `font-heading` |
| `--font-mono` | Code | `--font-stack-mono`: the fixed-width font of the device | `font-mono` |

Inter and Poppins are the fonts of the app Intraweb. **The library downloads no font and ships no font file.** It only names the fonts. The app loads them. The values of the two level 1 tokens are:

```css
--font-stack-sans: var(--font-inter, "Inter"), ui-sans-serif, system-ui, sans-serif;
--font-stack-display: var(--font-poppins, "Poppins"), ui-sans-serif, system-ui, sans-serif;
```

How to read `var(--font-inter, "Inter")`: the font in the CSS variable `--font-inter` when the app defines that variable on `<html>`, and the font with the family name `Inter` when it does not. So there are two ways to load the fonts:

1. **A Next.js app, with `next/font`.** `next/font` is the part of Next.js that downloads a font when the app is built and serves it with the app. Give the fonts the variables `--font-inter` and `--font-poppins`, and put the two classes on `<html>`:

   ```ts
   // app/fonts.ts
   import { Inter, Poppins } from "next/font/google";

   export const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

   export const poppins = Poppins({
     subsets: ["latin"],
     weight: ["400", "500", "600"],
     variable: "--font-poppins",
     display: "swap",
   });
   ```

   ```tsx
   // app/layout.tsx
   <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
   ```

   The classes must be on `<html>`, not on `<body>`: the tokens are defined on `<html>` and read the variables there.

2. **Any other app, the plain way.** Load font files whose family names are `Inter` and `Poppins`, in any way: the npm packages `@fontsource/inter` and `@fontsource/poppins`, a `<link>` to a font service, or your own `@font-face` rules. Example with the npm packages, in the first file of the app:

   ```ts
   import "@fontsource/inter/400.css";
   import "@fontsource/inter/500.css";
   import "@fontsource/inter/600.css";
   import "@fontsource/inter/700.css";
   import "@fontsource/poppins/400.css";
   import "@fontsource/poppins/500.css";
   import "@fontsource/poppins/600.css";
   ```

An app that loads no font still works: the browser uses a font of the device (`ui-sans-serif, system-ui, sans-serif`).

No file of the library names a font outside `css/primitives.css` and `src/primitives.ts`, and no file of the library loads one. A test (`packages/ui/src/fonts.test.ts`) checks this.

### Set other fonts

An app sets its own fonts through `createTheme`, with a CSS `font-family` value in `fonts.body`, `fonts.heading` or `fonts.mono`. A font the app does not give stays the default. Example with `next/font` in a Next.js app:

1. Load the font and give it a CSS variable name (`app/fonts.ts`):

   ```ts
   import localFont from "next/font/local";

   export const fraunces = localFont({
     src: "./fonts/fraunces-latin-wght-normal.woff2",
     weight: "100 900",
     variable: "--font-fraunces",
   });
   ```

2. Put the class that defines the variable on `<html>` (`app/layout.tsx`):

   ```tsx
   <html lang="en" data-theme={theme} className={fraunces.variable}>
   ```

3. Give the variable to the theme function, in every theme that has the font:

   ```ts
   createTheme({
     name: "paper",
     fonts: { heading: "var(--font-fraunces), Georgia, serif" },
   });
   ```

The fonts after the variable (`Georgia, serif`) are used while the font file loads. `next/font/google` works the same way: it also has the option `variable`. The working example is [`apps/playground`](../../apps/playground/README.md): its themes `light` and `dark` have Inter and Poppins, loaded from font files with `next/font/local`, and its theme `paper` has Fraunces for the headings.

## Tailwind CSS 4

`css/tailwind.css` is a preset: one CSS file that makes every level 2 token a Tailwind CSS 4 class. Import it after Tailwind, in the global CSS file of the app. It also loads the tokens and the two themes, so the import of `@toraline.tech/tokens/css` is not needed:

```css
@import "tailwindcss";
@import "@toraline.tech/tokens/css/tailwind.css";
```

An app that uses `@toraline.tech/ui` must import the preset: the components are styled with the classes it makes. Such an app adds a third line, `@import "@toraline.tech/ui/tailwind.css";`, described in [`packages/ui/README.md`](../ui/README.md).

```html
<div class="rounded-xl border border-default bg-surface p-4 text-primary shadow-card">
  <h2 class="font-heading text-brand">Title</h2>
</div>
```

Each class reads the CSS variable when the page is shown. Changing `data-theme` changes the colors of the page, with no other class.

| Token | Classes |
|---|---|
| Each `--bg-<name>` | `bg-<name>`: the background color only. Examples: `bg-page`, `bg-surface`, `bg-primary` |
| Each `--text-<name>` that is a color | `text-<name>`: the text color only. Examples: `text-primary`, `text-tertiary`, `text-inverse` |
| Each `--border-<name>` | `border-<name>`, and the classes for one side, for example `border-b-<name>`: the border color only. Examples: `border-default`, `border-b-brand` |
| `--border-focus` | Also `outline-focus`: the color of an outline |
| `--border-info` | Also `ring-info`: the color of a ring |
| `--icon-default`, `--icon-strong`, `--icon-brand` | `text-icon`, `text-icon-strong`, `text-icon-brand`: an icon takes the text color |
| Each `--data-<name>` | Every Tailwind color class with `data-<name>`: `bg-data-1`, `text-data-1`, `fill-data-1`, `stroke-data-1` and the others |
| Each level 1 color `--color-<scale>-<step>` | Every Tailwind color class: `bg-brand-700`, `text-slate-500`, `border-red-600` and the others |
| `--font-body`, `--font-heading`, `--font-mono` | `font-body`, `font-heading`, `font-mono`. `--font-body` is also the font of the page, and the class `font-sans`, the name Intraweb uses for it |
| `--text-xs`, `--text-sm`, `--text-base`, `--text-lg`, `--text-2xl`, `--text-3xl` | `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-2xl`, `text-3xl`. Tailwind already has these classes. With the preset they read the token. The sizes are the same, except `text-3xl`: 32 pixels (`2rem`), the size of Intraweb's large number, where Tailwind alone has 30 pixels (`1.875rem`) |
| `--spacing` | It is the unit of every Tailwind spacing class: `p-4` is `calc(var(--spacing) * 4)`. Tailwind already uses this variable, with the same value |
| `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl` | `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, and the classes for one side or one corner, for example `rounded-t-md` |
| `--shadow-sm`, `--shadow-card`, `--shadow-lg`, `--shadow-xl`, `--shadow-2xl` | `shadow-sm`, `shadow-card`, `shadow-lg`, `shadow-xl`, `shadow-2xl` |

The class names are the class names of the app Intraweb. A token is a class of its group only: `bg-primary` is the background of the main action and `text-primary` is the main text color. They are two tokens, and there is no class `text-page` or `bg-strong`. How it works: the preset has one line for each color token in a block `@theme inline`, for example `--background-color-primary: var(--bg-primary);`. Tailwind CSS 4 makes the class `bg-<name>` from a variable named `--background-color-<name>`, `text-<name>` from `--text-color-<name>`, and `border-<name>` from `--border-color-<name>`. These 3 names are not in the table "Theme variable namespaces" of the documentation of Tailwind (read on 2026-11-15). They are in the code of Tailwind 4.3.5, Intraweb uses them, and a test of this package builds every class with Tailwind.

The preset also makes the Tailwind variant `dark:` follow `data-theme="dark"`. Example: `dark:hidden` hides an element in the dark theme. The other Tailwind classes, for example `p-4`, `bg-red-500`, `rounded-full` and `shadow-md`, stay as Tailwind defines them.

### Text styles

A text style is one class that sets the font, the size, the line height and the weight of a text together. The 9 text styles are the text style utilities of Intraweb, with the same names and values:

| Class | Used for | Font size | Line height | Font weight |
|---|---|---|---|---|
| `heading-page` | The title of a page | `1.5rem` | `2rem` | 600 |
| `heading-section` | The title of a section, a dialog or a drawer | `1.125rem` | `1.75rem` | 500 |
| `heading-card` | The title of a card | `1rem` | `1.5rem` | 500 |
| `display-number` | A large number, for example a total. The digits all have the same width | `2rem` | `2.5rem` | 600 |
| `display-number-sm` | A large number, one size smaller | `1.5rem` | `2rem` | 600 |
| `label` | The name of a field, the text of a tab or a badge | `0.875rem` | `1.25rem` | 500 |
| `label-lg` | A larger label | `1rem` | `1.5rem` | 500 |
| `label-sm` | A smaller label | `0.75rem` | `1rem` | 500 |
| `caption-overline` | A small text in capital letters above a title, with wider letter spacing | `0.75rem` | `1rem` | 500 |

Every text style has the font `--font-heading`. The same values are in TypeScript: `textStyles` and `textStyleNames`.

```html
<h1 class="heading-page text-primary">Clients</h1>
```

### A color the app added

Tailwind builds its classes from CSS files, before the page exists. A color that an app adds through `createTheme` becomes a class when Tailwind finds it in a CSS file. `createTailwindTheme` returns that CSS:

```ts
import { createTailwindTheme, createTheme } from "@toraline.tech/tokens";

const themeInputs = [
  { name: "light", isDefault: true, colors: { "bg-promo": "#b34700" } },
  { name: "dark", base: "dark" as const, colors: { "bg-promo": "#ffb37a" } },
];

const css = [createTailwindTheme(themeInputs), ...themeInputs.map(createTheme)].join("\n");
```

The first part of `css` is:

```css
@theme inline {
  --background-color-promo: var(--bg-promo, #b34700);
}
```

Write `css` to a file before the build, and import the file after the preset:

```css
@import "tailwindcss";
@import "@toraline.tech/tokens/css/tailwind.css";
@import "./theme.generated.css";
```

The class `bg-promo` now exists, and each theme gives it its own value. The value after the comma is used only on a page where no theme with that color is selected. The working example is [`apps/playground`](../../apps/playground/README.md): `theme.config.ts` has the inputs and `scripts/write-theme-css.ts` writes the file.

## Save the theme a person chose

The choice is saved in a cookie named `toraline-theme`. A cookie is a small named value that the browser keeps and sends to the server with every request. The React provider in `@toraline.tech/ui/theme` writes the cookie. This package has the functions that read it, with no React:

| Function or value | What it does |
|---|---|
| `THEME_COOKIE_NAME` | The cookie name: `"toraline-theme"` |
| `THEME_ATTRIBUTE` | The attribute name: `"data-theme"` |
| `resolveTheme(savedTheme, themes, defaultTheme)` | Returns `savedTheme` when it is one of `themes`. Otherwise returns `defaultTheme`, or the first of `themes` |
| `readThemeCookie(cookieHeader)` | Finds the saved theme in the text of a `Cookie` header. Returns `undefined` when there is none |
| `serializeThemeCookie(theme)` | Builds the text that saves the theme when it is assigned to `document.cookie` |
| `createThemeScript({ themes, defaultTheme, cookieName })` | Builds a small script, as text, that reads the cookie and writes `data-theme` on `<html>` |

An app that renders on a server (Next.js) reads the cookie on the server and writes `data-theme` on `<html>`. The page then arrives in the right theme. The working example is in [`packages/ui/README.md`](../ui/README.md).

An app with no server rendering puts the script of `createThemeScript` inside `<head>`. The browser runs it before it paints the page:

```ts
import { createThemeScript } from "@toraline.tech/tokens";

const html = `<head><script>${createThemeScript()}</script></head>`;
```

## Level 2 tokens: the full list

The color tokens have the names of the design system of the app Intraweb. The first part of a name is the group, and says where the color is used: `--bg-*` a background, `--text-*` a text, `--border-*` a border, `--icon-*` an icon, `--data-*` a chart or a progress bar. With the Tailwind preset, a token is a class of its group only: `--bg-primary` is the class `bg-primary`, and there is no class `text-page`.

Every theme gives a value to each of these 78 tokens.

| Token | Tailwind class | What it is for | Light | Dark |
|---|---|---|---|---|
| `--bg-page` | `bg-page` | Background of the page | `--color-slate-100` | `#0c111d` |
| `--bg-surface` | `bg-surface` | Background of a part that sits on the page: card, field, menu, dialog, secondary button | `#ffffff` | `#161b26` |
| `--bg-subtle` | `bg-subtle` | Quiet background: a row or a secondary button under the pointer, a disabled field | `--color-slate-50` | `#1f242f` |
| `--bg-muted` | `bg-muted` | Quiet background, one step stronger: the track behind a group of tabs | `--color-slate-100` | `#252b37` |
| `--bg-inverse` | `bg-inverse` | Strong background in the brand color | `--color-brand-700` | `#8eaec5` |
| `--bg-inverse-hover` | `bg-inverse-hover` | `--bg-inverse` while the pointer is over it | `--color-brand-800` | `#a9c2d4` |
| `--bg-selected` | `bg-selected` | Background of the selected row or item | `--color-brand-50` | `#1c2733` |
| `--bg-danger-subtle` | `bg-danger-subtle` | Background of a danger button while the pointer is over it | `--color-red-50` | `#2a1614` |
| `--bg-error` | `bg-error` | Background of an error message or badge | `--color-red-50` | `#2a1614` |
| `--bg-success` | `bg-success` | Background of a success message or badge | `--color-green-50` | `#0f261b` |
| `--bg-warning` | `bg-warning` | Background of a warning message or badge | `--color-orange-50` | `#2b2112` |
| `--bg-overlay` | `bg-overlay` | Layer that covers the page behind a dialog | `rgb(16 24 40 / 0.5)` | `rgb(0 0 0 / 0.6)` |
| `--bg-primary` | `bg-primary` | Background of the main action: primary button, checked control | `--color-brand-700` | `#8eaec5` |
| `--bg-primary-hover` | `bg-primary-hover` | The main action while the pointer is over it | `--color-brand-800` | `#a9c2d4` |
| `--bg-primary-subtle` | `bg-primary-subtle` | Quiet background in the brand color | `--color-brand-50` | `#1c2733` |
| `--bg-primary-muted` | `bg-primary-muted` | `--bg-primary-subtle` while the pointer is over it | `--color-brand-100` | `#263545` |
| `--bg-accent-subtle` | `bg-accent-subtle` | Quiet background in the accent color | `--color-pink-50` | `#2b1f1c` |
| `--bg-highlight` | `bg-highlight` | Background that highlights a part of the page | `--color-cream-100` | `#2a2418` |
| `--bg-info` | `bg-info` | Background of an information message or badge | `--color-brand-50` | `#1c2733` |
| `--bg-tooltip` | `bg-tooltip` | Background of a tooltip | `--color-slate-900` | `#f1f3f6` |
| `--text-primary` | `text-primary` | Main text and headings | `--color-slate-900` | `#f5f5f6` |
| `--text-strong` | `text-strong` | Strong text: the label of a field, the text of a secondary button | `--color-slate-800` | `#e4e7ec` |
| `--text-body` | `text-body` | Normal text: a paragraph, an action of a menu | `--color-slate-700` | `#cecfd2` |
| `--text-secondary` | `text-secondary` | Less important text: a tab that is not selected | `--color-slate-600` | `#a4a7ae` |
| `--text-tertiary` | `text-tertiary` | Hint, placeholder, text of a disabled control | `--color-slate-500` | `#8a8d94` |
| `--text-muted` | `text-muted` | Decoration only. Its contrast is below 4.5, so it is not for text a person must read | `--color-slate-400` | `#61646c` |
| `--text-inverse` | `text-inverse` | Text and icons on top of `--bg-primary` and `--bg-inverse` | `#ffffff` | `#0c111d` |
| `--text-danger` | `text-danger` | Text of a danger button and of an error message under a field | `--color-red-700` | `#f97066` |
| `--text-error` | `text-error` | Text on top of `--bg-error` | `--color-red-700` | `#f97066` |
| `--text-success` | `text-success` | Text on top of `--bg-success` | `--color-green-700` | `#47cd89` |
| `--text-warning` | `text-warning` | Text on top of `--bg-warning` | `--color-orange-700` | `#fdb022` |
| `--text-caution` | `text-caution` | Text that asks for attention | `--color-orange-700` | `#fdb022` |
| `--text-brand` | `text-brand` | Text in the brand color: a link, the selected tab | `--color-brand-700` | `#a9c2d4` |
| `--text-info` | `text-info` | Text on top of `--bg-info` | `--color-brand-700` | `#a9c2d4` |
| `--text-accent` | `text-accent` | Text in the accent color | `--color-pink-700` | `#e3c2b8` |
| `--border-default` | `border-default` | Line between parts, and border of a field, a card and a secondary button | `--color-slate-200` | `#333741` |
| `--border-strong` | `border-strong` | Stronger border: a checkbox, a switch | `--color-slate-300` | `#414651` |
| `--border-subtle` | `border-subtle` | Quiet line: the border of a menu | `--color-slate-100` | `#1f242f` |
| `--border-hover` | `border-hover` | Border of a control while the pointer is over it | `--color-slate-400` | `#61646c` |
| `--border-focus` | `border-focus` | Outline of the element that has the keyboard focus, and border of a field that has the focus | `--color-brand-600` | `#8eaec5` |
| `--border-inverse` | `border-inverse` | Border on top of `--bg-inverse` | `--color-brand-700` | `#8eaec5` |
| `--border-brand` | `border-brand` | Border in the brand color: the line under the selected tab, a checked control | `--color-brand-700` | `#8eaec5` |
| `--border-danger` | `border-danger` | Border of a danger button | `--color-red-200` | `#7a271a` |
| `--border-error` | `border-error` | Border of an error message or badge | `--color-red-200` | `#7a271a` |
| `--border-invalid` | `border-invalid` | Border of a field with an error | `--color-red-600` | `#f97066` |
| `--border-changed` | `border-changed` | Border of a value that was changed and is not saved yet | `--color-orange-400` | `#fdb022` |
| `--border-success` | `border-success` | Border of a success message or badge | `--color-green-200` | `#085d3a` |
| `--border-info` | `border-info` | Border of an information message or badge, and the ring around a field that has the focus | `--color-brand-200` | `#344f63` |
| `--border-warning` | `border-warning` | Border of a warning message or badge | `--color-orange-200` | `#93370d` |
| `--icon-default` | `text-icon` | Icon | `--color-slate-500` | `#8a8d94` |
| `--icon-strong` | `text-icon-strong` | Icon that must stand out | `--color-slate-700` | `#cecfd2` |
| `--icon-brand` | `text-icon-brand` | Icon in the brand color | `--color-brand-700` | `#a9c2d4` |
| `--data-1` | `bg-data-1`, `text-data-1`, ... | First series of a chart | `--color-brand-600` | `#8eaec5` |
| `--data-2` | `bg-data-2`, `text-data-2`, ... | Second series of a chart | `--color-brand-300` | `#42637c` |
| `--data-3` | `bg-data-3`, `text-data-3`, ... | Third series of a chart | `--color-pink-400` | `#d7ada1` |
| `--data-success` | `bg-data-success`, `text-data-success`, ... | Good value in a chart or a progress bar | `--color-green-500` | `#47cd89` |
| `--data-warning` | `bg-data-warning`, `text-data-warning`, ... | Value that asks for attention in a chart or a progress bar | `--color-orange-400` | `#fdb022` |
| `--data-danger` | `bg-data-danger`, `text-data-danger`, ... | Bad value in a chart or a progress bar | `--color-red-600` | `#f97066` |
| `--data-track` | `bg-data-track`, `text-data-track`, ... | The empty part of a progress bar | `--color-slate-200` | `#333741` |
| `--font-body` | `font-body`, `font-sans` | Font of normal text | `--font-stack-sans` | `--font-stack-sans` |
| `--font-heading` | `font-heading` | Font of headings and buttons | `--font-stack-display` | `--font-stack-display` |
| `--font-mono` | `font-mono` | Font of code | `--font-stack-mono` | `--font-stack-mono` |
| `--text-xs` | `text-xs` | Font size of the smallest text: the hint under a field | `--font-size-xs` | `--font-size-xs` |
| `--text-sm` | `text-sm` | Font size of small text: a button, a label, an error message | `--font-size-sm` | `--font-size-sm` |
| `--text-base` | `text-base` | Font size of normal text in a component | `--font-size-md` | `--font-size-md` |
| `--text-lg` | `text-lg` | Font size of large text: a large button | `--font-size-lg` | `--font-size-lg` |
| `--text-2xl` | `text-2xl` | Font size of a large number on a small screen: the value of a card with one number | `--font-size-2xl` | `--font-size-2xl` |
| `--text-3xl` | `text-3xl` | Font size of a large number: the value of a card with one number | `--font-size-3xl` | `--font-size-3xl` |
| `--spacing` | `p-4`, `gap-2`, ... | The spacing unit. Every padding and gap of a component is a multiple of it: the Tailwind class `px-4` is `calc(var(--spacing) * 4)` | `--space-1` | `--space-1` |
| `--radius-md` | `rounded-md` | Corner of a button and a field | `0.5rem` | `0.5rem` |
| `--radius-lg` | `rounded-lg` | Corner of a menu and a popover | `0.75rem` | `0.75rem` |
| `--radius-xl` | `rounded-xl` | Corner of a card, a table and a dialog | `1rem` | `1rem` |
| `--radius-2xl` | `rounded-2xl` | Corner of a drawer | `1.25rem` | `1.25rem` |
| `--shadow-sm` | `shadow-sm` | Small shadow: the selected item of a group of tabs | `0 1px 2px rgb(16 24 40 / 0.05)` | `0 1px 2px rgb(16 24 40 / 0.05)` |
| `--shadow-card` | `shadow-card` | Shadow of a card and a table | `0 1px 2px rgb(16 24 40 / 0.04), 0 4px 16px rgb(16 24 40 / 0.04)` | `0 1px 2px rgb(16 24 40 / 0.04), 0 4px 16px rgb(16 24 40 / 0.04)` |
| `--shadow-lg` | `shadow-lg` | Shadow of a menu and a popover | `0 4px 6px -2px rgb(16 24 40 / 0.03), 0 12px 16px -4px rgb(16 24 40 / 0.08)` | `0 4px 6px -2px rgb(16 24 40 / 0.03), 0 12px 16px -4px rgb(16 24 40 / 0.08)` |
| `--shadow-xl` | `shadow-xl` | Larger shadow | `0 8px 8px -4px rgb(16 24 40 / 0.03), 0 20px 24px -4px rgb(16 24 40 / 0.08)` | `0 8px 8px -4px rgb(16 24 40 / 0.03), 0 20px 24px -4px rgb(16 24 40 / 0.08)` |
| `--shadow-2xl` | `shadow-2xl` | Shadow of a dialog and a drawer | `0 24px 48px -12px rgb(16 24 40 / 0.18)` | `0 24px 48px -12px rgb(16 24 40 / 0.18)` |

Each theme also sets the CSS property `color-scheme` (`light` or `dark`). It tells the browser which look to give to its own parts, for example scroll bars.

A test checks the contrast of the colors that the components use, in both themes. Contrast is how different two colors are, from 1 (the same) to 21 (black on white). The test requires 4.5 or more for text on its background, and 3 or more for the focus outline and for the colors that mark a state.

The values are Intraweb's, and some pairs are below these limits. The library does not change them. They are listed here, and a test records each number:

| Pair | Light | Dark | Limit | Where it matters |
|---|---|---|---|---|
| `--text-tertiary` on `--bg-page` | 4.48 | 5.67 | 4.5 | A hint written on the page and not on a card. The components do this only for the label of a disabled switch, and the accessibility rule does not cover a disabled control |
| `--text-tertiary` on `--bg-muted` | 4.48 | 4.27 | 4.5 | A hint on a muted background. The components do not do this |
| `--text-muted` on `--bg-surface` | 2.58 | 2.91 | 4.5 | Intraweb uses this color for decoration only. The components use it only for the thumb of a disabled switch |
| `--border-default` on `--bg-surface` | 1.24 | 1.45 | 3 | The border of a field and of a secondary button |
| `--border-strong` on `--bg-surface` | 1.47 | 1.82 | 3 | The border of a switch that is off |
| `--border-hover` on `--bg-surface` | 2.58 | 2.91 | 3 | The border of a field under the pointer |
| `--border-danger` on `--bg-surface` | 1.42 | 1.75 | 3 | The border of a danger button |

The limit of 3 for a border comes from the accessibility rule for the parts of a control that are not text (WCAG 1.4.11).

## Level 1 tokens

| Group | Tokens |
|---|---|
| Slate (the neutral scale) | `--color-slate-50`, then `--color-slate-100` to `--color-slate-900` in steps of 100 |
| Brand (the blue of the brand) | `--color-brand-50`, then `--color-brand-100` to `--color-brand-900` in steps of 100 |
| Pink (the accent color) | `--color-pink-50`, `--color-pink-100`, `--color-pink-400`, `--color-pink-700` |
| Cream (the highlight background) | `--color-cream-100` |
| Green (success) | `--color-green-50`, `--color-green-200`, `--color-green-500`, `--color-green-700` |
| Orange (warning) | `--color-orange-50`, `--color-orange-200`, `--color-orange-400`, `--color-orange-700` |
| Red (error and danger) | `--color-red-50`, `--color-red-200`, `--color-red-600`, `--color-red-700` |
| Spacing | `--space-1`, `--space-2`, `--space-3`, `--space-4`, `--space-6`, `--space-8`, `--space-12`, `--space-16`. The number is a multiple of `0.25rem` |
| Font sizes | `--font-size-xs`, `--font-size-sm`, `--font-size-md`, `--font-size-lg`, `--font-size-xl`, `--font-size-2xl`, `--font-size-3xl` |
| Font stacks | `--font-stack-sans` (Inter), `--font-stack-display` (Poppins), `--font-stack-mono`. A font stack is a list of fonts; the browser uses the first one it has |

The level 2 tokens `--text-xs`, `--text-sm`, `--text-base`, `--text-lg`, `--text-2xl`, `--text-3xl` and `--spacing` point to 7 of the font size and spacing tokens. The other font sizes and spacing values have no level 2 token yet. A level 2 token is added when a component needs one.

### The color scales of Intraweb

The 7 scales whose names start with `--color-` are the color scales of the design system of the app Intraweb, with the same names and the same values (the `@theme` block of Intraweb's `globals.css`). A test (`src/intraweb.test.ts`) compares them with a copy of that block, `src/intraweb-fixtures/globals-theme.css`.

With the Tailwind preset each one is also a Tailwind color: `--color-brand-700` gives the classes `bg-brand-700`, `text-brand-700`, `border-brand-700` and the others. Where Tailwind has a color with the same name (`red-600`, `green-500`), the value of Intraweb replaces the value of Tailwind. The other colors of Tailwind (`red-500`, `blue-600`) stay as Tailwind defines them.

## Rule for changes

The CSS files and the TypeScript files hold the same values. `src/tokens.test.ts` fails when they differ, or when this README does not name a level 2 token.

The colors are Intraweb's. `src/intraweb.test.ts` fails when a level 1 color, a color token of the light or the dark theme, or the Tailwind class of a color token differs from the copies of Intraweb's files in `src/intraweb-fixtures/`. To take a new value of Intraweb: copy the file again, change the date in its first comment, and change the token in the CSS file and in the TypeScript file.
