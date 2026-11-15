# catalog

The catalog of the library: a site that shows each component alone, in every theme. It is built with Storybook 10. Storybook is a tool that shows one component at a time, outside of an app. Each example of a component is called a story.

The catalog is private. It is never published and never deployed.

## Commands

Run them from the repository root.

```bash
make catalog          # opens the catalog on http://localhost:6006, for development
make catalog-build    # builds the static catalog into apps/catalog/storybook-static
make catalog-test     # runs every story as a test, in each theme, with the accessibility check
make catalog-browser  # downloads the browser that runs the story tests
```

`make catalog` needs no build before it: the catalog reads the source of `packages/tokens` and `packages/ui`. A change in a component shows in the open catalog at once. Stop it with Ctrl+C.

`make check` also builds the static catalog and runs the story tests. `make test` and `make catalog-test` run `make catalog-browser` first. It downloads the browser once for each machine (about 220 MB, into the folder of Playwright in the user's cache folder), and does nothing when the browser is already there.

## How to change the theme

The toolbar above a story has the control **Theme**. It lists every theme of the library (`light`, `dark`). Choose one: every story is shown in that theme.

The control does what an app does: it writes the attribute `data-theme` on `<html>`, and each story is inside `ThemeProvider`. A press on the library's `ThemeToggle` inside a story also changes the control.

## What the catalog shows

| Group in the sidebar | Entry | What it is |
|---|---|---|
| Guide | How to use the library | The guide: install the library, build the theme of an app, style on top of a component. Its text is the file `docs/guide.md` of the repository, which the root `README.md` also links to. Under the text are two live examples |
| Guide | Live examples | The two examples of the guide as stories, so the accessibility check covers them |
| Foundations | Tokens | One page with every token: the colors in their 5 groups (backgrounds, text, borders, icons, charts), fonts, text sizes, spacing, the 4 radius sizes and the 5 shadows, with the value in each theme, then the 9 text styles and the level 1 tokens. The tables read `@toraline.tech/tokens`, so they always show the current values |
| Foundations | Theme sample | A card that uses only level 2 tokens, with the button that changes the theme |
| Components | Button, ButtonLink, IconButton, Field, TextInput, Toggle, Tabs, BreadCrumbs, SplitButton, ThemeToggle | For each component: a page **Docs** with the table of props, and one story for each state |

A story that shows variants or sizes reads the list that the library exports (`buttonVariants`, `buttonSizes`, `splitButtonMenuPlacements`). A new variant appears in the catalog with no change in the story file. So there is one story named **Variants** that shows every variant, and not one story for each variant: a story is a named export of a file, and a file cannot make its exports from a list.

## The story tests and the accessibility check

Accessibility means that a person can use the component with a keyboard, with a screen reader, or with low vision. The check is done by axe-core, a tool that reads the page and reports the problems a program can find, for example text with too little contrast, or a field with no name.

The check runs in two places:

1. **In the open catalog.** The panel **Accessibility** under a story lists what the check found for that story, in the theme that the toolbar shows.
2. **As tests.** `make catalog-test` runs every story as a test, in a real browser with no window (Chromium), once for each theme. A test fails when the story cannot render, when its `play` function fails, or when the check finds a problem. A `play` function is code of a story that presses keys or buttons after the story renders. There is one Vitest project for each theme: `stories-light` and `stories-dark`. A Vitest project is a group of tests with its own settings.

What the check does not cover: axe-core finds only the problems a program can find. It does not replace a test with a real screen reader. A result that axe-core marks as "inconclusive" (it could not decide) does not fail a test.

## The files

| File | What it is |
|---|---|
| `.storybook/main.ts` | Which files are stories, which addons are on, and how Vite builds the catalog. An addon is a plugin of Storybook |
| `.storybook/preview.tsx` | What every story gets: the CSS of the catalog (which loads Tailwind CSS 4 and the tokens), the control **Theme**, the decorator that applies the theme, and the rule that an accessibility problem fails the test. A decorator is a function that wraps every story |
| `.storybook/themes.ts` | The list of themes of the control. It is `DEFAULT_THEMES` of `@toraline.tech/tokens` |
| `.storybook/preview.css` | The CSS of the catalog itself. It imports Tailwind CSS 4 and the Tailwind preset of `@toraline.tech/tokens`, and tells Tailwind to read the source of the components (`packages/ui/src`), so Tailwind builds the classes they use. It also gives the page behind a story the colors of the current theme |
| `stories/*.stories.tsx` | The stories of one component |
| `stories/Tokens.mdx`, `stories/Tokens.stories.tsx`, `stories/tokens/` | The tokens page, its stories, and the tables they draw |
| `stories/Guide.mdx`, `stories/Guide.stories.tsx`, `stories/guide/` | The guide page, its live examples as stories, and the components and CSS of the examples |
| `stories/shared/` | Small helpers of the story files |
| `vitest.projects.ts` | The story tests: one Vitest project for each theme. The root `vitest.config.ts` adds them to the unit tests |

## How the theme control was checked

Checked on 2026-11-15 with Storybook 10.6.7, Vite 8.3.8 and React 19.3.1.

```bash
make catalog-build                                   # "Storybook build completed successfully", about 3 seconds
(cd apps/catalog && npx storybook dev --port 6116 --ci --no-open --exact-port)
```

The story **Foundations / Theme sample / Sample** was opened in a browser on port 6116. The values below were read with `getComputedStyle` inside the story.

| Step | `data-theme` on `<html>` | Page background | Card background | Heading color |
|---|---|---|---|---|
| The catalog opens | `light` | `rgb(255, 255, 255)` | `rgb(255, 255, 255)` | `rgb(94, 0, 161)` |
| **Theme** in the toolbar, then **Theme: dark** | `dark` | `rgb(15, 25, 40)` | `rgb(39, 48, 62)` | `rgb(181, 147, 234)` |
| A press on the button `Theme: dark` inside the story | `light` | `rgb(255, 255, 255)` | Not read | Not read |

After the last step the toolbar control showed `Theme: light`. The browser console had no error at any step.

## How the stories and the accessibility check were checked

Checked on 2026-11-15 with Storybook 10.6.7, Vitest 5.1.0, Playwright 1.65.1 (Chromium 159 with no window) and axe-core 4.14. The two commands and the row "The tokens page" were run again on the same day after phase 6 (TOR-1122), with the colors and the fonts of Intraweb. The other 4 rows of the table were checked before phase 6, with the first colors of the library, and not again.

```bash
make catalog-test    # 94 tests passed: 47 stories in the project stories-light, 47 in stories-dark
make check           # 408 tests passed: 314 unit tests and the 94 story tests. About 25 seconds
```

| Check | Result |
|---|---|
| A problem really fails a test | The first run failed for the story **ThemeToggle / With Another Accessible Name**, in both themes, with the rule `label-content-name-mismatch`. The story gave the button a name for a screen reader that did not contain the text the button shows. The story was changed. No component had a problem |
| The project `stories-dark` really shows the dark theme | A temporary story read `data-theme` on `<html>` and the page background inside the test: `light` and `rgb(255, 255, 255)` in `stories-light`, `dark` and `rgb(15, 25, 40)` in `stories-dark` |
| A contrast problem of one theme is found | A temporary story with the text color `#3f4753` passed in `stories-light` and failed in `stories-dark`: "insufficient color contrast of 1.88". The story was deleted |
| The panel **Accessibility** of the static catalog | The static catalog was served on port 6117 and every story was opened in a browser, in each theme. 40 stories, 2 themes: 0 violations. 37 stories had no other result. 3 stories had 1 inconclusive result each, described below |
| The tokens page | Opened in a browser: 15 tables with 139 rows. A cell of the column `dark` has the background `rgb(22, 27, 38)`, the value of `--bg-surface` in the dark theme, while the page is in the light theme |

The inconclusive result is in the 3 stories of SplitButton that open the menu (**Menu Open**, **Menu Placements**, **With Icons**). axe-core says: "Unable to determine if aria-controls referenced ID exists on the page while using aria-haspopup". axe-core gives this result for every element that has both `aria-controls` and `aria-haspopup`; it does not look for the id. The id was looked for by hand in the browser: the button has `aria-controls="_r_0_-menu"`, and the open menu has the id `_r_0_-menu`. So it is not a problem of the component.

Not checked: a real screen reader (VoiceOver or NVDA), browsers other than Chromium, and the step of `.github/workflows/check.yml` that installs the browser (the workflow was not run).

## How the guide was checked

The guide is `docs/guide.md`. It was checked on 2026-11-15, after phase 6 (TOR-1122), in 2 new apps made in a folder outside the repository. The apps installed the 2 package files that `make pack` writes. Each step was done as the guide writes it. The pages were read in a browser with no window (Chromium, through Playwright), with `getComputedStyle`.

| App | What was run | Result |
|---|---|---|
| Next.js 16.4.6 made by `create-next-app` (Tailwind CSS 4.3.3, React 19.3.0), after guide 1 | `npm run build`, `next start -p 3991`, the page in a browser | The button "Save" has the background `rgb(66, 99, 124)`, which is `#42637c`, the value of `--bg-primary` in Intraweb's light theme. Its text is `rgb(255, 255, 255)`, its font `Poppins, "Poppins Fallback", ui-sans-serif, system-ui, sans-serif` with a weight of `500`, its padding `8px 16px` and its corner `8px`. The page background is `rgb(241, 243, 246)` and the font of the page is `Inter, "Inter Fallback", ui-sans-serif, system-ui, sans-serif`. The browser loaded the fonts Inter and Poppins. The browser console had no error |
| The same app, after guide 2 | `npm run build`, `next start -p 3991`, `curl` with and without the cookie, the page in a browser, one click on the theme button, one reload | The server answers `data-theme="light"` with no cookie and `data-theme="dark"` with `Cookie: toraline-theme=dark`. Light theme: the button is `rgb(11, 92, 173)`, the heading is `rgb(11, 92, 173)` in the font `Fraunces, "Fraunces Fallback", Georgia, serif`, the text of the button has the same font, and the added color is `rgb(179, 71, 0)` with the text `rgb(255, 255, 255)`. After one click on the theme button: `data-theme` is `dark`, the cookie `toraline-theme=dark` is saved, the page background is `rgb(12, 17, 29)` and the page text `rgb(245, 245, 246)` (the values of Intraweb's dark theme), the button is `rgb(140, 200, 255)`, and the added color is `rgb(255, 179, 122)` with the text `rgb(12, 17, 29)`. After a reload the page opens in the dark theme. The browser console had no error |
| The same app, after guide 3 | `npm run build`, `next start -p 3991`, a page with the 5 examples in a browser | The button with `className="rounded-full"` has no class `rounded-md` and a fully round corner. The button with `className="bg-promo text-on-promo hover:bg-primary-hover"` has no class `bg-primary` and no class `text-inverse`; it is `rgb(179, 71, 0)`, and `rgb(8, 74, 140)` with the pointer over it. The button with the class `round` of the app's CSS has the corner `9999px`. The field of the Input with the class `search` has the corner `9999px`. The note with the tokens of the app in its own CSS is `rgb(179, 71, 0)` |
| A new app of the same kind (Next.js 16.4.6, Tailwind CSS 4.3.3, React 19.3.0, `lucide-react` 1.73.0), after phase 7 (TOR-1123), with guide 1 and step 4 of guide 3 as they are now | `npm run build`, `next start -p 3992`, 2 routes in a browser. The page is a Server Component that renders Button in its 5 variants with `icon={Plus}`, ButtonLink and TabNav with the `Link` of `next/link`, IconButton in its 4 variants, Field with TextInput, Tabs and Toggle | The build passes. Every Button is `40px` high with the font Poppins in the weight `500` and the colors of its variant (`primary`: `rgb(66, 99, 124)`). Every IconButton is `40px` by `40px`. The TextInput is `40px` high with the border `rgb(228, 231, 236)`; the one in the size `sm` with an icon and an error is `32px` high, has a left padding of `36px`, the border `rgb(217, 45, 32)`, `aria-invalid="true"`, and its error message as its description. The label of the Field with the class `search` has `text-transform: uppercase` (step 4 of guide 3, which replaced the round field of Input). A press on a tab of TabNav changed the route with no full page load, and the tab of the new route has `aria-current="page"`. The browser console had no message |
| The same app, with the 3 changed colors removed from `theme.config.ts`. This step is not in the guide: it shows the colors of the library with the theme button | `npm run build`, `next start -p 3991`, the page in a browser, one click on the theme button | Light theme: the button is `rgb(66, 99, 124)` with the text `rgb(255, 255, 255)`. After the click: `rgb(142, 174, 197)`, which is `#8eaec5`, the value of `--bg-primary` in Intraweb's dark theme, with the text `rgb(12, 17, 29)` |
| Vite 8.3.8 made by `npm create vite@latest` (React 19.3.1, Tailwind CSS 4.3.5 with `@tailwindcss/vite`, `@fontsource/inter` and `@fontsource/poppins` 5.3.0), with the steps of the section "Without Next.js" | `npm run build`, `vite preview --port 3993`, the page in a browser, one click on the theme button, one reload | `dist/index.html` has the script of `createThemeScript`. The font of the page is `Inter, ui-sans-serif, system-ui, sans-serif`, and the browser loaded the font Inter. The button "Save" is `rgb(11, 92, 173)`. After the click the page background is `rgb(12, 17, 29)`, the button is `rgb(140, 200, 255)` and the cookie is saved. After a reload the page opens in the dark theme. With the two lines `fonts: { heading: headingFont }` removed, the font of the button is `Poppins, ui-sans-serif, system-ui, sans-serif` and the browser loaded the font Poppins. The build printed no warning about `"use client"`. The browser console had no error |

Not checked in these apps: `npm run dev` (the apps were built and started), a browser other than Chromium, and the keyboard on the theme button.

Two steps of the guide come from errors found in the first apps the guide was checked in, before phase 6: `"type": "module"` in `package.json` (without it Node prints a warning for the script), and `allowImportingTsExtensions` in `tsconfig.json` (without it `next build` fails with the error TS5097).

The same steps were compared with `apps/playground`: the imports of `app/globals.css`, `theme.config.ts`, `scripts/write-theme-css.ts`, the scripts of `package.json` and `app/layout.tsx` are the same, except for the color values and for the font, which the playground loads with `next/font/local`.

Before phase 6, the guide page of the static catalog was opened in a browser on port 6117: the links of its first table go to the 3 guides, the code samples are colored, and the two live examples render. In the first example the button is `rgb(11, 92, 173)` and the heading font is `Georgia, serif`. In the second, the button and the field with a class of the app have the radius `9999px`, and the button without it has `8px`. The browser console had no error. The 2 live examples are stories, so `make catalog-test` checks them in both themes. After phase 6 the 94 story tests passed.

Not checked: `npm install @toraline.tech/ui @toraline.tech/tokens` was not run. When this check was made the packages were not on npm yet (they are since 2026-11-15). The apps installed the 2 package files of `make pack`.
