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
- Decision: `"use client"` is on a file only when the component uses state, an effect or an event handler of its own. The build writes one file for each source file (`preserveModules` in `packages/ui/vite.config.ts`), so each built file keeps or does not keep that line. The entry `@toraline/ui/theme` is now `dist/theme/index.js`.
- Why: with one built file for the whole entry, the line could only be on all components or on none. Checked with Vite 8.3.8: the built `theme/ThemeToggle.js` starts with `"use client"` and the built `shared/class-names.js` does not.
- Decision: each component has its own CSS file in `packages/ui/css/`, and `css/styles.css` imports them. An app still imports only `@toraline/ui/styles.css`. A test (`packages/ui/src/styles.test.ts`) checks every file: layer `components`, class names that start with `tui-`, only level 2 tokens, no raw color, no length in `rem`.
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
- Decision: the preset is the CSS file `packages/tokens/css/tailwind.css` (`@toraline/tokens/css/tailwind.css`). An app imports it after `tailwindcss`. It imports the tokens and the two themes, declares every level 2 token inside `@theme`, sets `--font-body` as the font of the page, and makes the variant `dark:` follow `data-theme="dark"` with `@custom-variant`.
- Why: Tailwind 4 is configured in CSS. The level 2 names (`--color-*`, `--font-*`, `--radius`, `--shadow`) are the names Tailwind's `@theme` already uses, so each token becomes a class with no mapping: `--color-primary` gives `bg-primary`, `--radius` gives `rounded`. Each class reads the CSS variable in the browser, so `data-theme` changes it.
- Decision: the values in `@theme` are the values of the light theme. A test compares them with `lightTheme`. The shadow alone uses `@theme inline { --shadow: var(--shadow); }`.
- Why: Tailwind copies a shadow's value into the class `shadow` at build time. Checked with Tailwind 4.3.5: with a plain `@theme` the class had the light theme's shadow in both themes. With `inline` the class has `var(--shadow)` and follows the theme.
- Decision: the preset keeps Tailwind's own colors and sizes (`bg-red-500`, `rounded-lg`, `p-4`).
- Why: an app may style on top of a component with any class. Removing Tailwind's defaults would take classes away from the app.
- Decision: a color an app added becomes a class through `createTailwindTheme(themeInputs)`, which returns an `@theme` block with the added colors. The app writes it to a CSS file before the build, together with the output of `createTheme`.
- Why: Tailwind builds classes only from CSS files it reads at build time. A `<style>` element made at request time is too late.
- Decision: `tailwindcss` is an optional peer dependency of `@toraline/tokens` (`^4.0.0`). The tests run Tailwind 4.3.5 through `@tailwindcss/postcss` on the preset and check the classes it builds.
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
- Decision: the React provider (`ThemeProvider`), the hook (`useTheme`) and the toggle (`ThemeToggle`) are in `packages/ui/src/theme/`, published as the entry `@toraline/ui/theme`. The code with no React (cookie name, `resolveTheme`, `readThemeCookie`, `serializeThemeCookie`, `createThemeScript`) is in `packages/tokens/src/theme-storage.ts`.
- Why: `packages/tokens` stays free of React. The entry `@toraline/ui/theme` starts with `"use client"`, which Next.js needs for code that runs in the browser. A server file (the root layout) cannot call a function from a `"use client"` file, so the functions the server calls are in `@toraline/tokens`.
- Decision: the choice is saved in a cookie, `toraline-theme`, for 1 year, with `Path=/` and `SameSite=Lax`. A Next.js app reads it in the root layout with `cookies()` and writes `data-theme` on `<html>`.
- Why: the server receives a cookie with the request, so the HTML it sends already has the right theme. The browser's `localStorage` is not sent to the server; with it, the server cannot know the theme.
- Cost: reading a cookie in the root layout makes Next.js render every page at request time. For an app that needs pages built once, `createThemeScript` returns a script for `<head>` that reads the same cookie before the page paints.
- Decision: a person who has not chosen gets the app's default theme. The library does not read the dark mode setting of the operating system.
- Why: the tickets do not ask for it, and the server cannot read that setting on the first request.
- Decision: `ThemeToggle` is a `<button>` that goes to the next theme of the app's list on each press. Its accessible name (the text a screen reader says) tells the state: `Theme: dark. Switch to light.`
- Why: an app can have more than 2 themes. The attribute `aria-pressed` can only say "on" or "off", which fits 2 themes only.
- Decision: the library's component styles are a plain CSS file, `packages/ui/css/styles.css` (`@toraline/ui/styles.css`), with every rule in the cascade layer `components` and class names that start with `tui-`.
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
- The library is one repository, installed by each app. Package name `@toraline/ui`, on the public npm registry.
- Components come styled. An app can style on top of a component, or change and add theme colors. Themes and fonts are configurable, with a toggle between themes.
- Version 2 is built on a branch `v2` on top of the old code, and released fully before the old code is removed. `v2` becomes the main branch later.
- Monorepo layout: `packages/tokens`, `packages/ui`, later `packages/native`, `apps/catalog` (Storybook).
