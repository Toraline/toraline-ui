# Guide: use the library in an app

**English** | [Português](guide.pt-BR.md)

After the 3 guides of this page, a new Next.js app shows a Button of the library, first in the default look of the library and then in the app's own theme, with a button that changes between a light theme and a dark theme.

| Guide | Result |
|---|---|
| [1. Install the library in an app](#guide-1-install-the-library-in-an-app) | A page of the app shows a styled Button, in the default look of the library |
| [2. Build the theme of the app](#guide-2-build-the-theme-of-the-app) | The app has its own colors and fonts, and a button that changes the theme |
| [3. Style on top of a component](#guide-3-style-on-top-of-a-component) | One Button looks different, with no change in the library |

Do guide 1 first. Guides 2 and 3 both need it.

## Words this guide uses

- **Token**: a named value of the design, for example a color or a font. It is stored as a CSS variable, for example `--bg-primary`, the background of the main action.
- **Theme**: one set of values for the tokens. The library has the themes `light` and `dark`.
- **Intraweb**: an app of Toraline. The default look of the library is the look of Intraweb: the same colors, with the same token names and the same class names.
- **`data-theme`**: the attribute on `<html>` that selects the theme, for example `<html data-theme="dark">`.
- **Tailwind CSS**: a tool that gives one CSS class for each style, for example `p-4` for a padding. The components of the library are styled with Tailwind CSS 4 classes, so the app must use Tailwind CSS 4.
- **Cookie**: a small named value that the browser keeps and sends to the server with every request.
- **Cascade layer**: a named group of CSS rules with a fixed priority. Tailwind CSS puts its classes in the cascade layer `utilities`.
- **Tailwind variant**: the part of a Tailwind class before the `:`, which says when the class applies. Example: `hover:bg-primary-hover` applies while the pointer is over the element.

## Guide 1: install the library in an app

**Result:** a page of the app shows a styled Button.

The packages are on npm. The current version is `0.3.0`, published on 2026-11-15. The first version, `0.1.0`, was published on 2026-11-15.

To try a change of the library that is not released yet, build the two package files in this repository and install them in the app:

```bash
make pack     # in this repository; writes 2 files into .pack/tarballs/
npm install <path>/.pack/tarballs/toraline.tech-tokens-0.3.0.tgz <path>/.pack/tarballs/toraline.tech-ui-0.3.0.tgz     # in the app, in place of step 2
```

Replace `<path>` with the folder of this repository. The 3 guides were run that way on 2026-11-15, in an app made with `create-next-app` 16.4.6 (Tailwind CSS 4.3.3), and the section "Without Next.js" in an app made with `npm create vite@latest` (Vite 8.3). The results are in `apps/catalog/README.md`.

What you need: Node 24, React 19 and Tailwind CSS 4.

1. Create a Next.js app. Skip this step when you already have one.

   ```bash
   npx create-next-app@latest my-app
   cd my-app
   ```

   Answer **Yes** to TypeScript, to Tailwind CSS and to App Router.

2. Install the two packages.

   ```bash
   npm install @toraline.tech/ui @toraline.tech/tokens
   ```

   `@toraline.tech/ui` has the components. `@toraline.tech/tokens` has the tokens, the themes and the function that builds a theme. Install both, always in the same version.

   The library is at version `0.x`: it is tested in Toraline's own apps, and props and tokens may still change between versions.

3. Open `app/globals.css`. Delete everything in it, and write these 3 lines:

   ```css
   @import "tailwindcss";
   @import "@toraline.tech/tokens/css/tailwind.css";
   @import "@toraline.tech/ui/tailwind.css";
   ```

   The second line loads the tokens and the two themes, and makes each token a Tailwind class, for example `bg-surface`. The third line tells Tailwind to read the files of `@toraline.tech/ui`, so it builds the CSS of the classes that the components use.

   All 3 lines are needed. Without the third line the Button has no style: Tailwind builds the CSS of a class only when it finds the class in a file it reads, and it does not read the folder `node_modules` by itself.

   The rest of the file that `create-next-app` wrote must go: it sets its own colors on `<body>`, and they would win over the colors of the theme.

4. Create the file `app/fonts.ts`. It loads the two default fonts of the library: Inter for normal text, and Poppins for headings and buttons. The library names these fonts and does not download them, so the app loads them. `next/font` is the part of Next.js that downloads a font when the app is built and serves it with the app.

   ```ts
   import { Inter, Poppins } from "next/font/google";

   export const inter = Inter({
     subsets: ["latin"],
     variable: "--font-inter",
     display: "swap",
   });

   export const poppins = Poppins({
     subsets: ["latin"],
     weight: ["400", "500", "600"],
     variable: "--font-poppins",
     display: "swap",
   });
   ```

   The two names `--font-inter` and `--font-poppins` must be exactly these: they are the CSS variables that the font tokens of the library read. Poppins needs the 3 weights `400`, `500` and `600`.

5. Replace the content of `app/layout.tsx`. It puts the two fonts on `<html>`, and gives the page the background and the text color of the theme.

   ```tsx
   import type { ReactNode } from "react";
   import { inter, poppins } from "./fonts";
   import "./globals.css";

   export default function RootLayout({ children }: { children: ReactNode }) {
     return (
       <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
         <body className="bg-page text-primary">{children}</body>
       </html>
     );
   }
   ```

   `inter.variable` is a class that defines the CSS variable `--font-inter`. The two classes must be on `<html>`, not on `<body>`: the tokens are defined on `<html>` and read the variables there.

   An app that skips steps 4 and 5 still works. The text then has a font of the device, because the font tokens end with `ui-sans-serif, system-ui, sans-serif`.

6. Replace the content of `app/page.tsx`:

   ```tsx
   import { Button } from "@toraline.tech/ui";

   export default function Page() {
     return (
       <main className="p-8">
         <Button>Save</Button>
       </main>
     );
   }
   ```

7. Start the app and open http://localhost:3000.

   ```bash
   npm run dev
   ```

   The page shows a blue-grey button (`#42637c`) with the white text "Save", on a light grey page. The text of the button has the font Poppins.

## Guide 2: build the theme of the app

**Result:** the app has its own main color, one color that the library does not have, and its own heading font. A button changes between the light theme and the dark theme, and the app remembers the choice.

The steps are for a Next.js app. The section [Without Next.js](#without-nextjs) has the differences for another kind of app.

1. Create the file `theme.config.ts` in the folder of the app. It holds the themes of the app.

   ```ts
   import type { ThemeInput } from "@toraline.tech/tokens";

   // The heading font of this app: a font that app/fonts.ts loads (step 7), then fonts every device has.
   const headingFont = "var(--font-fraunces), Georgia, serif";

   export const themeInputs: ThemeInput[] = [
     {
       name: "light",
       base: "light",
       isDefault: true,
       colors: {
         "bg-primary": "#0b5cad", // changes --bg-primary
         "bg-primary-hover": "#084a8c", // changes --bg-primary-hover
         "text-brand": "#0b5cad", // changes --text-brand
         "bg-promo": "#b34700", // adds --bg-promo
         "text-on-promo": "#ffffff", // adds --text-on-promo
       },
       fonts: { heading: headingFont },
     },
     {
       name: "dark",
       base: "dark",
       colors: {
         "bg-primary": "#8cc8ff",
         "bg-primary-hover": "#b9dcff",
         "text-brand": "#8cc8ff",
         "bg-promo": "#ffb37a",
         "text-on-promo": "#0c111d",
       },
       fonts: { heading: headingFont },
     },
   ];

   // The theme names, in the order the theme button goes through them.
   export const themes = themeInputs.map((themeInput) => themeInput.name);
   ```

   What each part does:

   - **Change a color.** A key that is the name of a color token of the library, for example `bg-primary`, changes that token. The key is the token name without the two dashes. `--bg-primary` is the background of the main action, and `--text-brand` is the text in the brand color. Each use of a color has its own token, so an app that changes its main color changes each token that has it. The full list is in `packages/tokens/README.md`.
   - **Add a color.** A key the library does not have adds a token. The first part of the key says where the color is used, as in the library: `bg-` a background, `text-` a text, `border-` a border, `icon-` an icon. `bg-promo` adds the token `--bg-promo` and the Tailwind class `bg-promo`. `text-on-promo` adds `--text-on-promo` and the class `text-on-promo`.
   - **Change the fonts.** `fonts` accepts `body`, `heading` and `mono`. The value is any CSS `font-family` value. A font you do not give stays the default of the library: Inter for `body`, Poppins for `heading`. Here the headings and the buttons get the font Fraunces, and the normal text stays Inter.
   - `base` names the theme of the library that gives every value you do not give.
   - `isDefault: true` makes the theme apply also when `<html>` has no `data-theme`.

   Give each color a value in each theme. Text on its background needs a contrast of 4.5 or more to be readable.

2. Create the file `scripts/write-theme-css.ts`. It turns the themes into a CSS file.

   ```ts
   import { writeFileSync } from "node:fs";
   import { createTailwindTheme, createTheme } from "@toraline.tech/tokens";
   import { themeInputs } from "../theme.config.ts";

   const css = [createTailwindTheme(themeInputs), ...themeInputs.map(createTheme)].join("\n");

   writeFileSync(new URL("../app/theme.generated.css", import.meta.url), css);
   console.log(`Wrote app/theme.generated.css with ${themeInputs.length} themes.`);
   ```

   `createTheme` returns the CSS of one theme. `createTailwindTheme` returns the CSS that makes each added color a Tailwind class, for example `bg-promo`.

3. Open `package.json`. Add the line `"type": "module"`, and add 3 scripts, so the CSS file is written before the app starts and before it is built:

   ```json
   {
     "type": "module",
     "scripts": {
       "theme": "node scripts/write-theme-css.ts",
       "predev": "npm run theme",
       "dev": "next dev",
       "prebuild": "npm run theme",
       "build": "next build",
       "start": "next start"
     }
   }
   ```

   Keep the other lines of the file. Node 24 runs the TypeScript file directly.

4. Open `tsconfig.json`. Add this line inside `compilerOptions`:

   ```json
   "allowImportingTsExtensions": true,
   ```

   Without it, `npm run build` stops with the error `An import path can only end with a '.ts' extension`, because of the import in the script of step 2.

5. Open `.gitignore`. Add this line, because the file is written again on each start:

   ```
   app/theme.generated.css
   ```

6. Open `app/globals.css`. Add the line that imports the generated file, after the line of the tokens:

   ```css
   @import "tailwindcss";
   @import "@toraline.tech/tokens/css/tailwind.css";
   @import "./theme.generated.css";
   @import "@toraline.tech/ui/tailwind.css";
   ```

7. Open `app/fonts.ts`, the file of guide 1. Add the heading font of the app. `next/font` puts it in the CSS variable `--font-fraunces`, the variable that `theme.config.ts` names.

   ```ts
   import { Fraunces, Inter } from "next/font/google";

   export const inter = Inter({
     subsets: ["latin"],
     variable: "--font-inter",
     display: "swap",
   });

   export const fraunces = Fraunces({
     subsets: ["latin"],
     variable: "--font-fraunces",
     display: "swap",
   });
   ```

   Poppins is no longer in the file: this app replaced it as the heading font, so nothing uses it. Any font of `next/font/google` or of `next/font/local` works the same way: give it a `variable`, and use that variable in `theme.config.ts`.

8. Replace the content of `app/layout.tsx`. The layout reads the saved theme from the cookie on the server, writes it on `<html>`, and puts the provider around the app. The provider is the component that holds the current theme.

   ```tsx
   import { cookies } from "next/headers";
   import type { ReactNode } from "react";
   import { THEME_COOKIE_NAME, resolveTheme } from "@toraline.tech/tokens";
   import { ThemeProvider } from "@toraline.tech/ui/theme";
   import { themes } from "../theme.config";
   import { fraunces, inter } from "./fonts";
   import "./globals.css";

   export default async function RootLayout({ children }: { children: ReactNode }) {
     const cookieStore = await cookies();
     const theme = resolveTheme(cookieStore.get(THEME_COOKIE_NAME)?.value, themes);

     return (
       <html lang="en" data-theme={theme} className={`${inter.variable} ${fraunces.variable}`}>
         <body className="bg-page text-primary">
           <ThemeProvider themes={themes} initialTheme={theme}>
             {children}
           </ThemeProvider>
         </body>
       </html>
     );
   }
   ```

   The server writes `data-theme` in the HTML it sends, so the page never shows the wrong theme first.

   Open `next.config.ts`. When it has the line `cacheComponents: true` (`create-next-app` 16.4.6 writes it), add this line to `app/layout.tsx`, under the imports:

   ```tsx
   export const instant = false;
   ```

   Without it, `npm run build` stops with the error `Next.js encountered uncached or runtime data during prerendering`. With `cacheComponents`, Next.js wants a part of every page built before any request, and this layout reads a cookie, which exists only during a request. The line tells Next.js that this layout may wait for the request. When `next.config.ts` does not have `cacheComponents: true`, the line is not needed.

9. Add the theme button to `app/page.tsx`:

   ```tsx
   import { Button } from "@toraline.tech/ui";
   import { ThemeToggle } from "@toraline.tech/ui/theme";

   export default function Page() {
     return (
       <main className="p-8">
         <h1 className="font-heading text-3xl text-brand">My app</h1>
         <p className="mt-4 inline-block rounded-md bg-promo px-3 py-1 text-on-promo">
           The color the app added
         </p>
         <div className="mt-4 flex gap-4">
           <Button>Save</Button>
           <ThemeToggle />
         </div>
       </main>
     );
   }
   ```

10. Stop the app with Ctrl+C, start it again with `npm run dev`, and open http://localhost:3000.

    - The button "Save" is blue (`#0b5cad`), not blue-grey.
    - The heading and the text of the button use the font Fraunces. The heading is blue.
    - The other text uses the font Inter.
    - The note has the orange color the app added.
    - Press the button `Theme: light`. The page becomes dark, and the button "Save" becomes light blue (`#8cc8ff`).
    - Reload the page. It opens in the dark theme.

### Without Next.js

The theme function and the components do not need Next.js. They need Tailwind CSS 4. These steps are for an app made with Vite and React (`npm create vite@latest my-app -- --template react-ts`). They replace steps 4 and 5 of guide 1, and steps 2 and 6 to 9 of guide 2.

1. Install Tailwind CSS 4 and its plugin for Vite:

   ```bash
   npm install tailwindcss @tailwindcss/vite
   ```

2. Load the default fonts of the library, Inter and Poppins. With no `next/font`, the plain way is a font file whose family name is the name the token has: `Inter` and `Poppins`. The npm packages of Fontsource have such files. Install them:

   ```bash
   npm install @fontsource/inter @fontsource/poppins
   ```

   Then import one CSS file for each weight, at the top of `src/main.tsx`:

   ```ts
   import "@fontsource/inter/400.css";
   import "@fontsource/inter/500.css";
   import "@fontsource/inter/600.css";
   import "@fontsource/inter/700.css";
   import "@fontsource/poppins/400.css";
   import "@fontsource/poppins/500.css";
   import "@fontsource/poppins/600.css";
   ```

   Any other way to load a font works too (a `<link>` to a font service, your own `@font-face` rule), when the family names are `Inter` and `Poppins`. The catalog of this repository uses `@font-face` rules: `apps/catalog/.storybook/preview.css`.

3. In `theme.config.ts`, the heading font is a font the app loads by itself, or fonts every device has:

   ```ts
   const headingFont = "Georgia, serif";
   ```

   With this value the app does not use Poppins, so the 3 Poppins imports of step 2 can go. To keep Poppins for the headings, remove the two lines `fonts: { heading: headingFont },` from `theme.config.ts` and keep the imports.

4. `scripts/write-theme-css.ts` writes the file into `src/`:

   ```ts
   import { writeFileSync } from "node:fs";
   import { createTailwindTheme, createTheme } from "@toraline.tech/tokens";
   import { themeInputs } from "../theme.config.ts";

   const css = [createTailwindTheme(themeInputs), ...themeInputs.map(createTheme)].join("\n");

   writeFileSync(new URL("../src/theme.generated.css", import.meta.url), css);
   console.log(`Wrote src/theme.generated.css with ${themeInputs.length} themes.`);
   ```

   The scripts of `package.json` are `"theme"`, `"predev"` and `"prebuild"`, as in step 3 of guide 2.

5. Replace the content of the CSS file of the app (`src/index.css`). The 4 imports are the same as in a Next.js app. The rule under them gives the page the colors of the theme:

   ```css
   @import "tailwindcss";
   @import "@toraline.tech/tokens/css/tailwind.css";
   @import "./theme.generated.css";
   @import "@toraline.tech/ui/tailwind.css";

   body {
     background-color: var(--bg-page);
     color: var(--text-primary);
   }
   ```

6. There is no server to read the cookie. A small script in `<head>` reads it before the browser paints the page. `createThemeScript` returns that script as text. Add it, and the plugin of Tailwind, in `vite.config.ts`:

   ```ts
   import { defineConfig } from "vite";
   import react from "@vitejs/plugin-react";
   import tailwindcss from "@tailwindcss/vite";
   import { createThemeScript } from "@toraline.tech/tokens";
   import { themes } from "./theme.config.ts";

   export default defineConfig({
     plugins: [
       react(),
       tailwindcss(),
       {
         name: "theme-script",
         // Puts the script in <head>. The browser runs it before it paints the page.
         transformIndexHtml: () => [
           { tag: "script", children: createThemeScript({ themes }), injectTo: "head" },
         ],
       },
     ],
   });
   ```

7. In `src/main.tsx`, put the provider around the app, with no `initialTheme`. The provider takes the theme that the script wrote on `<html>`.

   ```tsx
   import "@fontsource/inter/400.css";
   import "@fontsource/inter/500.css";
   import "@fontsource/inter/600.css";
   import "@fontsource/inter/700.css";
   import "@fontsource/poppins/400.css";
   import "@fontsource/poppins/500.css";
   import "@fontsource/poppins/600.css";
   import { StrictMode } from "react";
   import { createRoot } from "react-dom/client";
   import { Button } from "@toraline.tech/ui";
   import { ThemeProvider, ThemeToggle } from "@toraline.tech/ui/theme";
   import { themes } from "../theme.config";
   import "./index.css";

   createRoot(document.getElementById("root")!).render(
     <StrictMode>
       <ThemeProvider themes={themes}>
         <Button>Save</Button>
         <ThemeToggle />
       </ThemeProvider>
     </StrictMode>,
   );
   ```

`npm run build` of a Vite app can print one warning for each component: `The semantics of the module level directive "use client" ... may not be preserved`. The line `"use client"` is for Next.js. A Vite app does not need it, so the warning changes nothing.

## Guide 3: style on top of a component

**Result:** one Button has fully round corners and the color the app added, and the label of one field is in capital letters. Nothing in the library changes.

Every component accepts `className`. The classes go on the outermost element of the component.

1. **With a Tailwind class:** give the component the class. It replaces the class of the library that sets the same CSS property. Here `rounded-full` replaces the library's `rounded-md`, and the other styles of the Button stay.

   ```tsx
   <Button className="rounded-full">Save</Button>
   ```

2. **A color:** a token class and a standard Tailwind class both work. A color the app added in guide 2 is a token class too.

   ```tsx
   <Button className="bg-promo text-on-promo hover:bg-primary-hover">Save</Button>
   ```

   A class replaces only a class for the same CSS property, with the same Tailwind variant. `bg-promo` replaces the library's `bg-primary`, and `text-on-promo` replaces the library's `text-inverse`. They do not replace `hover:bg-primary-hover` or `disabled:opacity-50`. So give one class for each state you want to change: `hover:` for the pointer over the element, `disabled:` for a disabled element, `focus-visible:` for the keyboard focus. A state you give no class for keeps the look of the library.

3. **With your own CSS:** write a class in the CSS file of the app, in no cascade layer, and give it to the component.

   ```css
   .round {
     border-radius: 9999px;
   }
   ```

   ```tsx
   <Button className="round">Save</Button>
   ```

4. **An inner part of a component:** a component with more than one element gives each inner element the attribute `data-slot`, with the name of the part. Use it after your own class. This rule writes the label of one Field in capital letters:

   ```css
   .search [data-slot="label"] {
     text-transform: uppercase;
   }
   ```

   ```tsx
   <Field className="search" label="Search">
     <TextInput name="search" />
   </Field>
   ```

5. **With the colors of the theme in your own CSS:** use the tokens, so the style follows the theme.

   ```css
   .promo-note {
     background-color: var(--bg-promo);
     color: var(--text-on-promo);
   }
   ```

Why your class wins:

- **A Tailwind class.** Every component joins its own classes and your `className` with the library `tailwind-merge`. When two Tailwind classes set the same CSS property, with the same Tailwind variant, only the last one stays. Yours is last.
- **Your own CSS.** The Tailwind classes of the library are in the cascade layer `utilities`. CSS of the app that is in no layer has a higher priority than every layer.

So you never need `!important`.

Limit: a class of your own CSS that is inside `@layer components` or `@layer base` does not win, because those layers have a lower priority than `utilities`. Write the class in no layer.

The `data-slot` names of the inner parts of each component are listed in `packages/ui/README.md`.

## Where to look next

- The catalog shows every component, in every theme: run `make catalog` from the root of this repository.
- Every prop of every component: `packages/ui/README.md`.
- Every token, and every field of the theme function: `packages/tokens/README.md`.
