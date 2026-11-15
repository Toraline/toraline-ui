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
| Foundations | Tokens | One page with every token: colors, fonts, text sizes, spacing, radius and shadow, with the value in each theme, and the level 1 tokens. The tables read `@toraline/tokens`, so they always show the current values |
| Foundations | Theme sample | A card that uses only level 2 tokens, with the button that changes the theme |
| Components | Button, Input, Toggle, Tabs, BreadCrumbs, SplitButton, ThemeToggle | For each component: a page **Docs** with the table of props, and one story for each state |

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
| `.storybook/preview.tsx` | What every story gets: the CSS of the tokens and of the components, the control **Theme**, the decorator that applies the theme, and the rule that an accessibility problem fails the test. A decorator is a function that wraps every story |
| `.storybook/themes.ts` | The list of themes of the control. It is `DEFAULT_THEMES` of `@toraline/tokens` |
| `.storybook/preview.css` | The CSS of the catalog itself: the page behind a story gets the colors of the current theme |
| `stories/*.stories.tsx` | The stories of one component |
| `stories/Tokens.mdx`, `stories/Tokens.stories.tsx`, `stories/tokens/` | The tokens page, its stories, and the tables they draw |
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

Checked on 2026-11-15 with Storybook 10.6.7, Vitest 5.1.0, Playwright 1.65.1 (Chromium 159 with no window) and axe-core 4.14.

```bash
make catalog-test    # 80 tests passed: 40 stories in the project stories-light, 40 in stories-dark. About 9 seconds
make check           # 277 tests passed: 197 unit tests and the 80 story tests. About 20 seconds
```

| Check | Result |
|---|---|
| A problem really fails a test | The first run failed for the story **ThemeToggle / With Another Accessible Name**, in both themes, with the rule `label-content-name-mismatch`. The story gave the button a name for a screen reader that did not contain the text the button shows. The story was changed. No component had a problem |
| The project `stories-dark` really shows the dark theme | A temporary story read `data-theme` on `<html>` and the page background inside the test: `light` and `rgb(255, 255, 255)` in `stories-light`, `dark` and `rgb(15, 25, 40)` in `stories-dark` |
| A contrast problem of one theme is found | A temporary story with the text color `#3f4753` passed in `stories-light` and failed in `stories-dark`: "insufficient color contrast of 1.88". The story was deleted |
| The panel **Accessibility** of the static catalog | The static catalog was served on port 6117 and every story was opened in a browser, in each theme. 40 stories, 2 themes: 0 violations. 37 stories had no other result. 3 stories had 1 inconclusive result each, described below |
| The tokens page | Opened in a browser: 12 tables with 79 rows. A cell of the column `dark` has the background `rgb(15, 25, 40)` while the page is in the light theme |

The inconclusive result is in the 3 stories of SplitButton that open the menu (**Menu Open**, **Menu Placements**, **With Icons**). axe-core says: "Unable to determine if aria-controls referenced ID exists on the page while using aria-haspopup". axe-core gives this result for every element that has both `aria-controls` and `aria-haspopup`; it does not look for the id. The id was looked for by hand in the browser: the button has `aria-controls="_r_0_-menu"`, and the open menu has the id `_r_0_-menu`. So it is not a problem of the component.

Not checked: a real screen reader (VoiceOver or NVDA), browsers other than Chromium, and the step of `.github/workflows/check.yml` that installs the browser (the workflow was not run).
