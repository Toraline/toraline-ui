# @toraline/tokens

The design tokens and the themes of the Toraline component library. A design token is a named value of the design, for example a color or a font, stored as a CSS variable. This package has no React code.

## The two levels

- **Level 1: raw values.** The name says what the value is. Example: `--purple-500` is `#5e00a1`. File: [`css/primitives.css`](css/primitives.css).
- **Level 2: meanings.** The name says what the value is for. Example: `--color-primary` is the color of the main action. Components use only level 2 tokens.

A **theme** is one block of level 2 values. The page selects a theme with the attribute `data-theme` on its root element (`<html>`). The library has two themes:

| Theme | File | Applies when |
|---|---|---|
| `light` | [`css/themes/light.css`](css/themes/light.css) | `<html data-theme="light">`, and also when `<html>` has no `data-theme` |
| `dark` | [`css/themes/dark.css`](css/themes/dark.css) | `<html data-theme="dark">` |

## How to use it

1. Import the CSS once, in the global CSS file of the app:

   ```css
   @import "@toraline/tokens/css";
   ```

   This one line loads the level 1 tokens, the light theme and the dark theme. The three files can also be imported one by one: `@toraline/tokens/css/primitives.css`, `@toraline/tokens/css/themes/light.css`, `@toraline/tokens/css/themes/dark.css`.

2. Select the theme on the root element:

   ```html
   <html data-theme="dark">
   ```

3. Use the level 2 tokens in CSS:

   ```css
   .card {
     background: var(--color-surface-raised);
     color: var(--color-text);
     border: 1px solid var(--color-border);
     border-radius: var(--radius);
     font-family: var(--font-body);
   }
   ```

The same values are available in TypeScript:

```ts
import { lightTheme, darkTheme, primitives, themeTokenNames } from "@toraline/tokens";

lightTheme.tokens["color-primary"]; // "var(--purple-500)"
primitives["purple-500"]; // "#5e00a1"
```

## Build a theme for an app: `createTheme`

`createTheme` is a function that receives an app's values and returns the CSS of one theme, as text. The app can change a color of the library, add a new color, change the fonts and change the radius. A value the app does not give comes from the default theme.

```ts
import { createTheme } from "@toraline/tokens";

const css = createTheme({
  name: "ocean",
  colors: {
    primary: "#0055aa", // changes --color-primary
    brand: "#ff6600", // adds the new token --color-brand
  },
  fonts: { heading: "Georgia, serif" }, // changes --font-heading
});
```

`css` is this text. The 18 lines that are not shown have the values of the light theme:

```css
[data-theme="ocean"] {
  color-scheme: light;
  --color-surface: var(--grey-100);
  /* ... */
  --color-primary: #0055aa;
  /* ... */
  --font-heading: Georgia, serif;
  /* ... */
  --color-brand: #ff6600;
}
```

Put the text in the page after the CSS of this package, for example in a `<style>` element or in a CSS file. Then select the theme with `<html data-theme="ocean">`.

The input, type `ThemeInput`:

| Field | Required | Meaning |
|---|---|---|
| `name` | Yes | The name of the theme, used in `data-theme="<name>"`. Lowercase letters, digits and dashes |
| `base` | No | `"light"` or `"dark"`: the default theme that gives the values the app does not give. When missing: `"light"` |
| `isDefault` | No | `true`: the theme also applies when `<html>` has no `data-theme` |
| `colors` | No | The key is a color name without `color-`. A key the library has (`primary`, `text-muted`, ...) changes that color. Any other key (`brand`) adds the token `--color-<key>`. The value is any CSS color |
| `fonts` | No | `body`, `heading`, `mono`. The value is any CSS `font-family` value |
| `radius` | No | Any CSS length |

To change the light or the dark theme of the library, use its name: `createTheme({ name: "dark", base: "dark", colors: { primary: "#88ccff" } })`. The block comes later in the page than the library's block, so its values win.

`createTheme` throws an error when a name has other characters, or when a value has one of `;`, `{`, `}`, `<`, `>`, `\` or `/*`. This stops a value from closing the CSS block.

`getAddedColorNames(input)` returns the colors of an input that the library does not have. For the example above: `["brand"]`.

## Fonts

Three level 2 tokens decide every font of the library:

| Token | Used for | Default |
|---|---|---|
| `--font-body` | Normal text | `--font-stack-sans`: the font of the device's operating system |
| `--font-heading` | Headings | `--font-stack-sans` |
| `--font-mono` | Code | `--font-stack-mono`: the fixed-width font of the device |

The defaults need no setup: they load no font file. No file of the library names a font outside `css/primitives.css` and `src/primitives.ts`. A test (`packages/ui/src/fonts.test.ts`) checks this.

An app sets its own fonts through `createTheme`. The app loads the font itself, and gives the theme function a CSS `font-family` value. Example with `next/font` in a Next.js app:

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

3. Give the variable to the theme function, in every theme of the app:

   ```ts
   createTheme({
     name: "light",
     isDefault: true,
     fonts: { heading: "var(--font-fraunces), Georgia, serif" },
   });
   ```

The fonts after the variable (`Georgia, serif`) are used while the font file loads. `next/font/google` works the same way: it also has the option `variable`. The working example is [`apps/playground`](../../apps/playground/README.md).

## Tailwind CSS 4

`css/tailwind.css` is a preset: one CSS file that makes every level 2 token a Tailwind CSS 4 class. Import it after Tailwind, in the global CSS file of the app. It also loads the tokens and the two themes, so the import of `@toraline/tokens/css` is not needed:

```css
@import "tailwindcss";
@import "@toraline/tokens/css/tailwind.css";
```

```html
<div class="rounded border border-border bg-surface-raised p-4 text-text shadow">
  <h2 class="font-heading text-primary">Title</h2>
</div>
```

Each class reads the CSS variable when the page is shown. Changing `data-theme` changes the colors of the page, with no other class.

| Token | Classes |
|---|---|
| Each `--color-<name>` | Every Tailwind color class with `<name>`: `bg-<name>`, `text-<name>`, `border-<name>`, `outline-<name>`, `ring-<name>`, `fill-<name>` and the others. Examples: `bg-primary`, `text-surface`, `text-text-muted`, `border-border`, `outline-focus-ring` |
| `--font-body`, `--font-heading`, `--font-mono` | `font-body`, `font-heading`, `font-mono`. `--font-body` is also the font of the page |
| `--radius` | `rounded`, and the classes for one side or one corner, for example `rounded-t` |
| `--shadow` | `shadow` |

The preset also makes the Tailwind variant `dark:` follow `data-theme="dark"`. Example: `dark:hidden` hides an element in the dark theme. The other Tailwind classes, for example `p-4`, `bg-red-500` and `rounded-lg`, stay as Tailwind defines them.

### A color the app added

Tailwind builds its classes from CSS files, before the page exists. A color that an app adds through `createTheme` becomes a class when Tailwind finds it in a CSS file. `createTailwindTheme` returns that CSS:

```ts
import { createTailwindTheme, createTheme } from "@toraline/tokens";

const themeInputs = [
  { name: "light", isDefault: true, colors: { brand: "#b34700" } },
  { name: "dark", base: "dark" as const, colors: { brand: "#ffb37a" } },
];

const css = [createTailwindTheme(themeInputs), ...themeInputs.map(createTheme)].join("\n");
```

The first part of `css` is:

```css
@theme {
  --color-brand: #b34700;
}
```

Write `css` to a file before the build, and import the file after the preset:

```css
@import "tailwindcss";
@import "@toraline/tokens/css/tailwind.css";
@import "./theme.generated.css";
```

The classes `bg-brand`, `text-brand` and the others now exist, and each theme gives them its own value. The working example is [`apps/playground`](../../apps/playground/README.md): `theme.config.ts` has the inputs and `scripts/write-theme-css.ts` writes the file.

## Save the theme a person chose

The choice is saved in a cookie named `toraline-theme`. A cookie is a small named value that the browser keeps and sends to the server with every request. The React provider in `@toraline/ui/theme` writes the cookie. This package has the functions that read it, with no React:

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
import { createThemeScript } from "@toraline/tokens";

const html = `<head><script>${createThemeScript()}</script></head>`;
```

## Level 2 tokens: the full list

Every theme gives a value to each of these 21 tokens.

| Token | What it is for | Light | Dark |
|---|---|---|---|
| `--color-surface` | Background of the page | `--grey-100` | `--grey-900` |
| `--color-surface-raised` | Background of a part that sits above the page: card, menu, dialog | `--grey-100` | `--grey-800` |
| `--color-surface-muted` | Quiet background: hovered row, disabled field | `--grey-200` | `--grey-800` |
| `--color-text` | Main text | `--grey-900` | `--grey-200` |
| `--color-text-muted` | Less important text: hint, placeholder | `--grey-600` | `--grey-500` |
| `--color-border` | Line between parts | `--grey-400` | `--grey-700` |
| `--color-border-strong` | Outline of a control the user must see: input, checkbox | `--grey-600` | `--grey-600` |
| `--color-primary` | Main action and brand color | `--purple-500` | `--purple-200` |
| `--color-primary-hover` | Main action while the pointer is over it | `--purple-700` | `--purple-100` |
| `--color-primary-foreground` | Text and icons on top of `--color-primary` | `--white` | `--grey-900` |
| `--color-danger` | Error, or an action that deletes | `--red-600` | `--red-300` |
| `--color-danger-foreground` | Text and icons on top of `--color-danger` | `--white` | `--grey-900` |
| `--color-success` | Success | `--green-700` | `--green-400` |
| `--color-success-foreground` | Text and icons on top of `--color-success` | `--white` | `--grey-900` |
| `--color-focus-ring` | Outline of the element that has keyboard focus | `--purple-300` | `--purple-100` |
| `--color-overlay` | Layer that covers the page behind a dialog | `rgb(15 25 40 / 0.6)` | `rgb(0 0 0 / 0.7)` |
| `--font-body` | Font of normal text | `--font-stack-sans` | `--font-stack-sans` |
| `--font-heading` | Font of headings | `--font-stack-sans` | `--font-stack-sans` |
| `--font-mono` | Font of code | `--font-stack-mono` | `--font-stack-mono` |
| `--radius` | How round the corners of a component are | `--radius-size-md` | `--radius-size-md` |
| `--shadow` | Shadow of a raised part | `--shadow-size-sm` | `--shadow-size-md` |

Each theme also sets the CSS property `color-scheme` (`light` or `dark`). It tells the browser which look to give to its own parts, for example scroll bars.

A test checks the contrast of the text colors on their backgrounds in both themes. Contrast is how different two colors are, from 1 (the same) to 21 (black on white). The test requires 4.5 or more for text and 3 or more for the focus ring and the strong border.

## Level 1 tokens

| Group | Tokens |
|---|---|
| Purple | `--purple-50`, `--purple-100`, `--purple-200`, `--purple-300`, `--purple-400`, `--purple-500`, `--purple-600`, `--purple-700` |
| Grey | `--grey-100` (white) to `--grey-900` (darkest), in steps of 100 |
| Red | `--red-300`, `--red-500`, `--red-600` |
| Green | `--green-300`, `--green-400`, `--green-500`, `--green-700` |
| Black and white | `--black`, `--white` |
| Spacing | `--space-1`, `--space-2`, `--space-3`, `--space-4`, `--space-6`, `--space-8`, `--space-12`, `--space-16`. The number is a multiple of `0.25rem` |
| Font sizes | `--font-size-xs`, `--font-size-sm`, `--font-size-md`, `--font-size-lg`, `--font-size-xl`, `--font-size-2xl`, `--font-size-3xl` |
| Font stacks | `--font-stack-sans`, `--font-stack-mono`. A font stack is a list of fonts; the browser uses the first one the device has |
| Radius sizes | `--radius-size-none`, `--radius-size-sm`, `--radius-size-md`, `--radius-size-lg`, `--radius-size-full` |
| Shadow sizes | `--shadow-size-sm`, `--shadow-size-md`, `--shadow-size-lg` |

Spacing and font sizes exist only at level 1 today. No level 2 token uses them yet.

### Where the colors come from

The colors of the old library (`legacy/src/lib/config/theme.ts`) are the starting point. The grey scale keeps the old numbers. The other scales have new numbers:

| Old name | New token |
|---|---|
| `primary` (`#5e00a1`) | `--purple-500` |
| `purple500` (`#3d0069`) | `--purple-700` |
| `purple400` (`#51009b`) | `--purple-600` |
| `purple300` (`#833cda`) | `--purple-300` |
| `purple200` (`#b593ea`) | `--purple-200` |
| `purple100` (`#d0b1ff`) | `--purple-100` |
| `grey100` to `grey900` | `--grey-100` to `--grey-900` |
| `red` (`#f04848`) | `--red-500` |
| `green` (`#84D235`) | `--green-300` |
| `green100` (`#7EC36D`) | `--green-400` |
| `greenSlider` (`#68A15F`) | `--green-500` |

These 5 colors are new: `--purple-50`, `--purple-400`, `--red-300`, `--red-600`, `--green-700`. The old colors `purpleSlider`, `greyTransparent` and `blackTransparent` have no token.

## Rule for changes

The CSS files and the TypeScript files hold the same values. `src/tokens.test.ts` fails when they differ, or when this README does not name a level 2 token.
