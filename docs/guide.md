# Guide: use the library in an app

After the 3 guides of this page, a new Next.js app shows a Button of the library in the app's own theme, with a button that changes between a light theme and a dark theme.

| Guide | Result |
|---|---|
| [1. Install the library in an app](#guide-1-install-the-library-in-an-app) | A page of the app shows a styled Button |
| [2. Build the theme of the app](#guide-2-build-the-theme-of-the-app) | The app has its own colors and fonts, and a button that changes the theme |
| [3. Style on top of a component](#guide-3-style-on-top-of-a-component) | One Button looks different, with no change in the library |

Do guide 1 first. Guides 2 and 3 both need it.

## Words this guide uses

- **Token**: a named value of the design, for example a color or a font. It is stored as a CSS variable, for example `--color-primary`.
- **Theme**: one set of values for the tokens. The library has the themes `light` and `dark`.
- **`data-theme`**: the attribute on `<html>` that selects the theme, for example `<html data-theme="dark">`.
- **Tailwind CSS**: a tool that gives one CSS class for each style, for example `p-4` for a padding. The library works with Tailwind CSS 4 and without it.
- **Cookie**: a small named value that the browser keeps and sends to the server with every request.
- **Cascade layer**: a named group of CSS rules with a fixed priority.

## Guide 1: install the library in an app

**Result:** a page of the app shows a styled Button.

**The packages are not published yet.** Today (2026-11-15) the command of step 2 fails, because the names `@toraline.tech/ui` and `@toraline.tech/tokens` are not on the npm registry. The first version will be a test version, `2.0.0-beta.0`, and the command of step 2 is written for it.

To use the library before the release, build the two package files in this repository and install them in the app:

```bash
make pack     # in this repository; writes 2 files into .pack/tarballs/
npm install <path>/.pack/tarballs/toraline-tokens-2.0.0-beta.0.tgz <path>/.pack/tarballs/toraline-ui-2.0.0-beta.0.tgz     # in the app, in place of step 2
```

Replace `<path>` with the folder of this repository. Guide 1 and steps 1 to 10 of guide 2 were run that way on 2026-11-15, in an app made with `create-next-app` 16.4.6.

What you need: Node 24 and React 19.

1. Create a Next.js app. Skip this step when you already have one.

   ```bash
   npx create-next-app@latest my-app
   cd my-app
   ```

   Answer **Yes** to TypeScript, to Tailwind CSS and to App Router.

2. Install the two packages.

   ```bash
   npm install @toraline.tech/ui@next @toraline.tech/tokens@next
   ```

   `@toraline.tech/ui` has the components. `@toraline.tech/tokens` has the tokens, the themes and the function that builds a theme. Install both, always in the same version.

   `@next` selects the newest test version. After the full release `2.0.0`, the command is `npm install @toraline.tech/ui @toraline.tech/tokens`.

3. Open `app/globals.css`. Delete everything in it, and write these 3 lines:

   ```css
   @import "tailwindcss";
   @import "@toraline.tech/tokens/css/tailwind.css";
   @import "@toraline.tech/ui/styles.css";
   ```

   The second line loads the tokens and the two themes, and makes each token a Tailwind class, for example `bg-surface`. The third line loads the styles of the components.

   The rest of the file that `create-next-app` wrote must go: it sets its own colors on `<body>`, and they would win over the colors of the theme.

   An app with no Tailwind CSS writes these 2 lines:

   ```css
   @import "@toraline.tech/tokens/css";
   @import "@toraline.tech/ui/styles.css";
   ```

4. Replace the content of `app/page.tsx`:

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

5. Start the app and open http://localhost:3000.

   ```bash
   npm run dev
   ```

   The page shows a purple button with the white text "Save".

## Guide 2: build the theme of the app

**Result:** the app has its own main color, one color that the library does not have, and its own heading font. A button changes between the light theme and the dark theme, and the app remembers the choice.

The steps are for a Next.js app. The section [Without Next.js](#without-nextjs) has the differences for another kind of app.

1. Create the file `theme.config.ts` in the folder of the app. It holds the themes of the app.

   ```ts
   import type { ThemeInput } from "@toraline.tech/tokens";

   // The heading font: the font that app/fonts.ts loads, then fonts every device has.
   const headingFont = "var(--font-fraunces), Georgia, serif";

   export const themeInputs: ThemeInput[] = [
     {
       name: "light",
       base: "light",
       isDefault: true,
       colors: {
         primary: "#0b5cad", // changes --color-primary
         "primary-hover": "#084a8c", // changes --color-primary-hover
         brand: "#b34700", // adds --color-brand
         "brand-foreground": "#ffffff", // adds --color-brand-foreground
       },
       fonts: { heading: headingFont },
     },
     {
       name: "dark",
       base: "dark",
       colors: {
         primary: "#8cc8ff",
         "primary-hover": "#b9dcff",
         brand: "#ffb37a",
         "brand-foreground": "#0f1928",
       },
       fonts: { heading: headingFont },
     },
   ];

   // The theme names, in the order the theme button goes through them.
   export const themes = themeInputs.map((themeInput) => themeInput.name);
   ```

   What each part does:

   - **Change a color.** A key that the library has, for example `primary`, changes that color. The key is the token name without `--color-`.
   - **Add a color.** Any other key, for example `brand`, adds a token: `--color-brand`.
   - **Change the fonts.** `fonts` accepts `body`, `heading` and `mono`. The value is any CSS `font-family` value.
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

   `createTheme` returns the CSS of one theme. `createTailwindTheme` returns the CSS that makes each added color a Tailwind class, for example `bg-brand`.

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
   @import "@toraline.tech/ui/styles.css";
   ```

7. Create the file `app/fonts.ts`. It loads the heading font with `next/font` and puts it in the CSS variable `--font-fraunces`, the variable that `theme.config.ts` names.

   ```ts
   import { Fraunces } from "next/font/google";

   export const fraunces = Fraunces({
     subsets: ["latin"],
     variable: "--font-fraunces",
   });
   ```

   Any font of `next/font/google` or of `next/font/local` works the same way: give it a `variable`, and use that variable in `theme.config.ts`.

8. Replace the content of `app/layout.tsx`. The layout reads the saved theme from the cookie on the server, writes it on `<html>`, and puts the provider around the app. The provider is the component that holds the current theme.

   ```tsx
   import { cookies } from "next/headers";
   import type { ReactNode } from "react";
   import { THEME_COOKIE_NAME, resolveTheme } from "@toraline.tech/tokens";
   import { ThemeProvider } from "@toraline.tech/ui/theme";
   import { themes } from "../theme.config";
   import { fraunces } from "./fonts";
   import "./globals.css";

   export default async function RootLayout({ children }: { children: ReactNode }) {
     const cookieStore = await cookies();
     const theme = resolveTheme(cookieStore.get(THEME_COOKIE_NAME)?.value, themes);

     return (
       <html lang="en" data-theme={theme} className={fraunces.variable}>
         <body className="bg-surface text-text">
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
         <h1 className="font-heading text-3xl text-primary">My app</h1>
         <p className="mt-4 inline-block rounded bg-brand px-3 py-1 text-brand-foreground">
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

    - The button "Save" is blue (`#0b5cad`), not purple.
    - The heading uses the font Fraunces and the blue color.
    - The note has the orange color the app added.
    - Press the button `Theme: light`. The page becomes dark, and the button "Save" becomes light blue (`#8cc8ff`).
    - Reload the page. It opens in the dark theme.

### Without Next.js

The theme function and the components do not need Next.js. These steps are for an app made with Vite and React (`npm create vite@latest my-app -- --template react-ts`). They replace steps 2 and 6 to 9.

1. In `theme.config.ts`, the heading font is a font the app loads by itself, or fonts every device has:

   ```ts
   const headingFont = "Georgia, serif";
   ```

2. `scripts/write-theme-css.ts` writes the file into `src/`. An app with no Tailwind CSS does not need `createTailwindTheme`:

   ```ts
   import { writeFileSync } from "node:fs";
   import { createTheme } from "@toraline.tech/tokens";
   import { themeInputs } from "../theme.config.ts";

   const css = themeInputs.map(createTheme).join("\n");

   writeFileSync(new URL("../src/theme.generated.css", import.meta.url), css);
   console.log(`Wrote src/theme.generated.css with ${themeInputs.length} themes.`);
   ```

   The scripts of `package.json` are `"theme"`, `"predev"` and `"prebuild"`, as in step 3 above.

3. The CSS file of the app (`src/index.css`) imports the tokens, the generated file and the styles of the components. With no Tailwind CSS there is no class like `bg-surface`, so the app sets the page colors with the tokens:

   ```css
   @import "@toraline.tech/tokens/css";
   @import "./theme.generated.css";
   @import "@toraline.tech/ui/styles.css";

   body {
     background-color: var(--color-surface);
     color: var(--color-text);
     font-family: var(--font-body);
   }
   ```

4. There is no server to read the cookie. A small script in `<head>` reads it before the browser paints the page. `createThemeScript` returns that script as text. Add it in `vite.config.ts`:

   ```ts
   import { defineConfig } from "vite";
   import react from "@vitejs/plugin-react";
   import { createThemeScript } from "@toraline.tech/tokens";
   import { themes } from "./theme.config.ts";

   export default defineConfig({
     plugins: [
       react(),
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

5. In `src/main.tsx`, put the provider around the app, with no `initialTheme`. The provider takes the theme that the script wrote on `<html>`.

   ```tsx
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

`npm run build` of a Vite app prints one warning for each component: `The semantics of the module level directive "use client" ... may not be preserved`. The line `"use client"` is for Next.js. A Vite app does not need it, so the warning changes nothing.

## Guide 3: style on top of a component

**Result:** one Button has fully round corners, and one field too. Nothing in the library changes.

Every component accepts `className`. The classes go on the outermost element of the component.

1. **With Tailwind CSS:** give the component a Tailwind class.

   ```tsx
   <Button className="rounded-full">Save</Button>
   ```

2. **With your own CSS:** write a class in the CSS file of the app, and give it to the component.

   ```css
   .round {
     border-radius: 9999px;
   }
   ```

   ```tsx
   <Button className="round">Save</Button>
   ```

3. **An inner part of a component:** a component with more than one element gives each inner element a class named `tui-<component>__<part>`. Use it after your own class. This rule makes the field of one Input round:

   ```css
   .search .tui-input__field {
     border-radius: 9999px;
   }
   ```

   ```tsx
   <Input className="search" label="Search" name="search" />
   ```

4. **With the colors of the theme:** use the tokens in your own CSS, so the style follows the theme. A color the app added in guide 2 is a token too.

   ```css
   .brand-note {
     background-color: var(--color-brand);
     color: var(--color-brand-foreground);
   }
   ```

Why your class wins: the styles of the library are in the cascade layer `components`. A Tailwind class is in the layer `utilities`, which has a higher priority. CSS of the app that is in no layer has a higher priority than every layer. So you never need `!important`.

The classes of the inner parts of each component are listed in `packages/ui/README.md`.

## Where to look next

- The catalog shows every component, in every theme: run `make catalog` from the root of this repository.
- Every prop of every component: `packages/ui/README.md`.
- Every token, and every field of the theme function: `packages/tokens/README.md`.
