# @toraline/ui

The styled React components of the Toraline component library. Today it has the parts that control the theme: a provider, a hook and a toggle button. The other components (buttons, inputs and the rest) arrive in phase 3.

A theme is a set of colors, fonts and corner sizes. The page selects a theme with the attribute `data-theme` on `<html>`. The themes and their values are in [`@toraline/tokens`](../tokens/README.md).

## How to use the theme in a Next.js app

1. Import the CSS once, in the global CSS file (`app/globals.css`):

   ```css
   @import "tailwindcss";
   @import "@toraline/tokens/css/tailwind.css";
   @import "@toraline/ui/styles.css";
   ```

   An app with no Tailwind CSS imports `@toraline/tokens/css` in place of the first two lines.

2. In the root layout (`app/layout.tsx`), read the saved theme on the server, write it on `<html>`, and give it to the provider:

   ```tsx
   import { cookies } from "next/headers";
   import type { ReactNode } from "react";
   import { THEME_COOKIE_NAME, resolveTheme } from "@toraline/tokens";
   import { ThemeProvider } from "@toraline/ui/theme";
   import "./globals.css";

   const themes = ["light", "dark"];

   export default async function RootLayout({ children }: { children: ReactNode }) {
     const cookieStore = await cookies();
     const theme = resolveTheme(cookieStore.get(THEME_COOKIE_NAME)?.value, themes);

     return (
       <html lang="en" data-theme={theme}>
         <body>
           <ThemeProvider themes={themes} initialTheme={theme}>
             {children}
           </ThemeProvider>
         </body>
       </html>
     );
   }
   ```

3. Put the toggle anywhere inside the provider:

   ```tsx
   import { ThemeToggle } from "@toraline/ui/theme";

   export default function Page() {
     return <ThemeToggle />;
   }
   ```

The server writes `data-theme` in the HTML it sends, so the page never shows the wrong theme first. This working example is the app [`apps/playground`](../../apps/playground/README.md).

Reading a cookie in the root layout makes Next.js render every page at request time (dynamic rendering). An app that needs pages built once (static rendering) does not read the cookie on the server. It puts the script of `createThemeScript` from `@toraline/tokens` inside `<head>`, and gives no `initialTheme` to the provider.

## The parts

All three come from `@toraline/ui/theme`. They are Client Components: they run in the browser.

### `ThemeProvider`

Holds the current theme, writes it on `<html data-theme="...">`, and saves the person's choice in the cookie `toraline-theme` for 1 year.

| Prop | Required | Meaning |
|---|---|---|
| `children` | Yes | The app |
| `themes` | No | The theme names of the app, in the order the toggle goes through them. When missing: `["light", "dark"]` |
| `defaultTheme` | No | The theme of a person who has not chosen yet. When missing: the first of `themes` |
| `initialTheme` | No | The theme the server already wrote on `<html>` |
| `cookieName` | No | The name of the cookie. When missing: `"toraline-theme"` |

### `useTheme()`

Returns `{ theme, themes, setTheme }`. `theme` is the current theme name. `setTheme("dark")` shows that theme and saves the choice. It throws an error for a name that is not in `themes`. `useTheme` works only inside `ThemeProvider`.

### `ThemeToggle`

A button. Each press shows the next theme of `themes`. After the last theme it goes back to the first.

- It is a real `<button type="button">`, so it works with the Tab, Enter and Space keys.
- It shows the current theme as text: `Theme: dark`.
- A screen reader says the current theme and what a press does: `Theme: dark. Switch to light.` The prop `formatLabel={(theme, nextTheme) => "..."}` changes this text.
- `children` replaces the text that is shown, for example with an icon.
- `className` adds classes. The button also accepts every other prop of `<button>`.

## Styling on top

The styles of the library are in the cascade layer `components`. A cascade layer is a named group of CSS rules with a fixed priority. A Tailwind CSS class (layer `utilities`) and the CSS of an app that is in no layer both win over the library's styles. Example: `<ThemeToggle className="rounded-full" />`.
