# playground

A Next.js 16 app, with React 19 and Tailwind CSS 4, that tests the tokens, the themes, the theme toggle and the components of the library in real pages. It is private: it is never published. `make check` builds it.

## How to run it

From the repository root:

```bash
npm run build                               # builds the packages and this app
npm run dev -w @toraline/playground         # development server on http://localhost:3000
```

## What the page tests

| Ticket | What to look at |
|---|---|
| TOR-1006 | The button `Theme: light` changes the theme: `light`, then `dark`, then `paper`, a theme of this app. After a reload the page opens in the theme that was chosen, and never shows another theme first |
| TOR-1007, TOR-1135 | In the themes `light` and `dark` the headings use the font Poppins and the rest of the text uses the font Inter: the default fonts of the library. In the theme `paper`, a theme of this app, the headings use the font Fraunces, which the app set through the theme function |
| TOR-997 | The page `/components` shows every component of `@toraline.tech/ui` with every variant and state. The theme button on that page changes the theme |
| TOR-1123 | The components have the variants, sizes and states of the same components of the app Intraweb. The routes `/tab-nav`, `/tab-nav/orders` and `/tab-nav/clients` are joined by a TabNav: a press on a tab changes the route, and the tab of the new route is the current one. Buttons, a ButtonLink and a TextInput get an icon of `lucide-react` from a Server Component |
| TOR-1008, TOR-1122 | Every color, font, radius and shadow on the page comes from a token class, for example `bg-primary`. `bg-promo` is a color this app added. Changing the theme changes all of them. The classes have the names of the app Intraweb, and the values of the themes `light` and `dark` are Intraweb's |

## The files

| File | What it is |
|---|---|
| `theme.config.ts` | The 3 themes of this app: a list of inputs for the theme function `createTheme` of `@toraline.tech/tokens`. `light` and `dark` are the themes of the library with one added color. `paper` is this app's own: a cream page and the heading font Fraunces |
| `scripts/write-theme-css.ts` | Runs `createTailwindTheme` and `createTheme` on the inputs and writes `app/theme.generated.css`. It runs by itself before `npm run dev` and `npm run build`. Git ignores the file it writes |
| `postcss.config.mjs` | Tells Next.js to run Tailwind CSS 4 |
| `app/fonts.ts` | Loads 3 fonts with `next/font/local`: Inter into the CSS variable `--font-inter`, Poppins (weights 400, 500 and 600) into `--font-poppins`, and Fraunces into `--font-fraunces`. The library reads the first two variables. `theme.config.ts` gives the third to the theme function |
| `app/fonts/` | The 5 font files and the 3 licenses (SIL Open Font License 1.1). The files are committed, so `make check` builds this app with no network. The catalog (`apps/catalog/.storybook/preview.css`) uses the Inter and Poppins files too |
| `app/layout.tsx` | Reads the theme cookie on the server and writes `data-theme` on `<html>` |
| `app/globals.css` | Imports Tailwind CSS, the Tailwind preset of the library, the generated theme file, and `@toraline.tech/ui/tailwind.css`, the line that makes Tailwind build the classes of the components. It has no other CSS |
| `app/page.tsx` | The test page. It has no CSS of its own: only classes |
| `app/components/page.tsx` | The page of the components, at `/components` |
| `app/components/SplitButtonExamples.tsx` | The examples of SplitButton. It is a Client Component, because the actions of a menu are functions |
| `app/components/ControlledTabsExample.tsx` | Tabs with the state held by the app (`value` and `onChange`). It is a Client Component, because it holds state |
| `app/tab-nav/layout.tsx`, `app/tab-nav/page.tsx`, `app/tab-nav/orders/page.tsx`, `app/tab-nav/clients/page.tsx` | The 3 routes of TabNav and the layout they share |
| `app/tab-nav/SalesTabNav.tsx` | The TabNav of those routes. It is a Client Component, because it reads the current path with `usePathname` of Next.js, and it gives TabNav the `Link` of `next/link` |

## How "no flash of the wrong theme" was checked

A flash is when the page shows one theme for a moment and then changes to another. It does not happen here because the server writes `data-theme` in the HTML it sends. The check asks the built app for the page twice: once with the cookie that holds the choice, once with no cookie.

Commands, run from the repository root on 2026-11-15 (Next.js 16.4.6):

```bash
npm run build
(cd apps/playground && npx next start -p 3987) &
curl -s -H 'Cookie: toraline-theme=dark' http://localhost:3987/ | grep -o '<html[^>]*>'
curl -s http://localhost:3987/ | grep -o '<html[^>]*>'
pkill -f "next start -p 3987"
```

Results:

| Request | The `<html>` tag in the server's answer |
|---|---|
| With `Cookie: toraline-theme=dark` | `<html lang="en" data-theme="dark" class="...">` |
| With `Cookie: toraline-theme=paper` | `<html lang="en" data-theme="paper" class="...">` |
| With no cookie | `<html lang="en" data-theme="light" class="...">` |
| With a cookie value that is not a theme | `<html lang="en" data-theme="light" class="...">` |

`class="..."` stands for the 3 classes of `next/font` that define the font variables. These 4 requests were run again on 2026-11-15, after phase 6 (TOR-1122).

Before phase 6 the same server was also opened in a browser. With the keyboard: Tab moved the focus to the button, Enter changed `data-theme` to `dark` and the page background to the dark value, and the cookie `toraline-theme=dark` was saved. After a reload the page had `data-theme="dark"` and the dark background. The browser console had no error. After phase 6 the same was checked with a click in place of the keyboard, in a new app that followed the guide (see `apps/catalog/README.md`).

## How the fonts were checked

The library names its default fonts and downloads none. `app/fonts.ts` loads Inter and Poppins from font files and puts them in the CSS variables `--font-inter` and `--font-poppins`, which the font tokens of the library read. `theme.config.ts` gives `fonts: { heading: "var(--font-fraunces), Georgia, serif" }` to the theme function in the theme `paper` only.

Checked on the built app on 2026-11-15 (Next.js 16.4.6), in a browser with no window (Chromium, through Playwright), with `getComputedStyle`. The theme was chosen with the cookie `toraline-theme`:

| Element | Its font (`font-family`) in the theme `light` | In the theme `paper` |
|---|---|---|
| `<body>` | `inter, "inter Fallback", ui-sans-serif, system-ui, sans-serif` | The same |
| `<h1>` and `<h2>` | `poppins, "poppins Fallback", ui-sans-serif, system-ui, sans-serif` | `fraunces, "fraunces Fallback", Georgia, serif` |
| `<code>` | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace` | The same |

The browser reported these fonts as loaded (`document.fonts`): in the theme `light`, `inter` and `poppins` (weight 600, the weight of the headings); in the theme `paper`, `inter` and `fraunces`. The browser console had no error.

## How the token classes were checked

The classes of the page (`app/layout.tsx` and `app/page.tsx`):

- Token classes: `bg-page`, `bg-surface`, `bg-primary`, `bg-error`, `bg-success`, `bg-promo`, `text-primary`, `text-brand`, `text-tertiary`, `text-inverse`, `text-error`, `text-success`, `text-on-promo`, `border-default`, `font-heading`, `font-mono`, `rounded-md`, `rounded-xl`, `shadow-card`.
- Standard Tailwind classes for spacing, size and layout, which have no token: `mx-auto`, `max-w-2xl`, `p-4`, `p-8`, `px-3`, `py-1`, `mt-2`, `mt-4`, `mt-6`, `flex`, `flex-wrap`, `gap-3`, `border`, `font-bold`, `text-xl`, `text-3xl`, `underline`.

Checked on the built app on 2026-11-15 (Next.js 16.4.6, Tailwind CSS 4.3.5), in a browser with no window (Chromium, through Playwright), with `getComputedStyle`. The theme was chosen with the cookie `toraline-theme`. Transitions were turned off while reading, because a color that is still changing gives a value between two colors. Every value of the columns "Light theme" and "Dark theme" is the value of Intraweb for that token.

| What | Class | Light theme | Dark theme |
|---|---|---|---|
| Page background | `bg-page` | `rgb(241, 243, 246)` | `rgb(12, 17, 29)` |
| Page text | `text-primary` | `rgb(16, 24, 40)` | `rgb(245, 245, 246)` |
| Heading color | `text-brand` | `rgb(66, 99, 124)` | `rgb(169, 194, 212)` |
| Card background | `bg-surface` | `rgb(255, 255, 255)` | `rgb(22, 27, 38)` |
| Card border | `border-default` | `rgb(228, 231, 236)` | `rgb(51, 55, 65)` |
| Card corner | `rounded-xl` | `16px` | `16px` |
| Card shadow | `shadow-card` | `rgba(16, 24, 40, 0.04) 0px 1px 2px, rgba(16, 24, 40, 0.04) 0px 4px 16px` | The same |
| Hint text | `text-tertiary` | `rgb(102, 112, 133)` | `rgb(138, 141, 148)` |
| Added color | `bg-promo` | `rgb(179, 71, 0)` | `rgb(255, 179, 122)` |
| Text on the added color | `text-on-promo` | `rgb(255, 255, 255)` | `rgb(12, 17, 29)` |

The class `mt-4` on the toggle (`<ThemeToggle className="mt-4" />`) gave it a top margin of `16px`. This shows that a class of the app is applied on a component of the library. The browser console had no error.

## How the components were checked

The page `/components` is a Server Component. It imports the components from `@toraline.tech/ui`. The build of this app fails when a component that needs the browser has no `"use client"`.

Commands, run from the repository root on 2026-11-15 (Next.js 16.4.6, Tailwind CSS 4.3.5):

```bash
npm run build
(cd apps/playground && npx next start -p 3987) &
curl -s -o /dev/null -w "%{http_code}" http://localhost:3987/components   # 200
pkill -f "next start -p 3987"
```

The values below were read on 2026-11-15, after phase 7 (TOR-1123), with a temporary Playwright script: Chromium with no window, `getComputedStyle`, the theme chosen with the cookie, transitions turned off, a window 1280 pixels wide. In each cell: background, then text, unless the row says something else. Every color is the value of Intraweb for the token of that part.

### Button, ButtonLink and IconButton (TOR-1138, TOR-1139, TOR-1140)

| Button | Light theme | Dark theme |
|---|---|---|
| `primary` | `rgb(66, 99, 124)`, `rgb(255, 255, 255)` | `rgb(142, 174, 197)`, `rgb(12, 17, 29)` |
| `secondary` | `rgb(255, 255, 255)`, `rgb(29, 41, 57)`, border `rgb(228, 231, 236)` | `rgb(22, 27, 38)`, `rgb(228, 231, 236)`, border `rgb(51, 55, 65)` |
| `soft` | `rgb(242, 246, 249)`, `rgb(66, 99, 124)` | `rgb(28, 39, 51)`, `rgb(169, 194, 212)` |
| `danger` | `rgb(255, 255, 255)`, `rgb(180, 35, 24)`, border `rgb(254, 205, 202)` | `rgb(22, 27, 38)`, `rgb(249, 112, 102)`, border `rgb(122, 39, 26)` |
| `ghost` | No background, `rgb(52, 64, 84)` | No background, `rgb(206, 207, 210)` |
| Disabled (every variant) | The colors of the variant, opacity `0.5`, cursor `not-allowed` | The same |

| Size | Height | Font size, line height | Padding | Space between icon and text | Icon |
|---|---|---|---|---|---|
| `sm` | `32px` | `14px`, `20px` | `4px 12px` | `6px` | `16px` |
| `md` | `40px` | `14px`, `20px` | `8px 16px` | `8px` | `16px` |
| `lg` | `48px` | `16px`, `24px` | `10px 20px` | `8px` | `20px` |

The font of every button is `poppins, "poppins Fallback", ui-sans-serif, system-ui, sans-serif`, with a weight of `500`. The corner is `8px` (`rounded-md`). The cursor over a button is `default`. The button with `className="rounded-full"` has a fully round corner: the class of the app replaces `rounded-md`. The buttons with `icon={Plus}` get the icon of `lucide-react` from the page, which is a Server Component.

The ButtonLink with `linkComponent={Link}` (the `Link` of `next/link`) is an `<a href="/">`, `40px` high in the size `md`, with the colors of the secondary Button and no underline.

An IconButton is a square of `32px`, `40px` and `48px`, with an icon of `16px`, `20px` and `24px`. Its colors: `ghost` no background and `rgb(102, 112, 133)` (light), `rgb(138, 141, 148)` (dark); `secondary` as the secondary Button with the icon `rgb(52, 64, 84)` (light), `rgb(206, 207, 210)` (dark); `soft` and `primary` as the same Button variants.

### Field and TextInput (TOR-1141, TOR-1142)

| Part | Light theme | Dark theme |
|---|---|---|
| Field: background, text, border | `rgb(255, 255, 255)`, `rgb(16, 24, 40)`, `rgb(228, 231, 236)` | `rgb(22, 27, 38)`, `rgb(245, 245, 246)`, `rgb(51, 55, 65)` |
| Label (`14px`, weight `500`) | `rgb(29, 41, 57)` | `rgb(228, 231, 236)` |
| Mark "(optional)" (weight `400`), hint (`12px`, line `16px`), placeholder | `rgb(102, 112, 133)` | `rgb(138, 141, 148)` |
| Field with the focus: border, ring of `3px` | `rgb(85, 122, 150)`, `rgb(200, 216, 228)` | `rgb(142, 174, 197)`, `rgb(52, 79, 99)` |
| Field with an error: border | `rgb(217, 45, 32)` | `rgb(249, 112, 102)` |
| Error message (`14px`) | `rgb(180, 35, 24)` | `rgb(249, 112, 102)` |
| Disabled field: background, text | `rgb(247, 248, 250)`, `rgb(102, 112, 133)` | `rgb(31, 36, 47)`, `rgb(138, 141, 148)` |

The size `md` is `40px` high with text of `14px` in a window 1280 pixels wide, and `48px` high with text of `16px` in a window 800 pixels wide. The size `sm` is `32px` high. The field with the focus has no outline (`outline-style: none`). The field with an icon has a left padding of `36px`, and its icon is `16px` wide, `12px` from the left edge.

Each of the 10 `<label>` elements on the page has a `for` equal to the `id` of its control. The field with a hint has `aria-describedby` equal to the id of the hint. The field with an error has `aria-invalid="true"` and `aria-describedby` equal to the id of the error message; its hint is not on the page. The field with `className="max-w-40"` is `160px` wide: the class of the app is on the `<input>`.

### Toggle (TOR-1145)

The track is the long rounded part of the switch. The thumb is the circle that moves inside it.

| State | Light theme | Dark theme |
|---|---|---|
| Off: track, border, thumb | `rgb(255, 255, 255)`, `rgb(208, 213, 221)`, `rgb(102, 112, 133)` | `rgb(22, 27, 38)`, `rgb(65, 70, 81)`, `rgb(138, 141, 148)` |
| On: track, border, thumb | `rgb(66, 99, 124)`, `rgb(66, 99, 124)`, `rgb(255, 255, 255)` | `rgb(142, 174, 197)`, `rgb(142, 174, 197)`, `rgb(22, 27, 38)` |
| Disabled: track | Opacity `0.5` | Opacity `0.5` |

The track is `36px` wide and `20px` high, and the thumb is `14px`. The label has `14px` and is `rgb(52, 64, 84)` (light) and `rgb(206, 207, 210)` (dark). Off, the thumb is not moved (`translate` is `none`). On, the thumb is moved `16px` to the right. The border of the track is `1.5px` in the classes; on a screen with 1 device pixel for each CSS pixel the browser draws `1px`.

### TabNav (TOR-1143)

The 3 routes `/tab-nav`, `/tab-nav/orders` and `/tab-nav/clients` share a layout with a TabNav in each look. The links are the `Link` of `next/link`.

| Part | Light theme | Dark theme |
|---|---|---|
| `primary`, current tab: text, line under it (`2px`) | `rgb(66, 99, 124)`, `rgb(66, 99, 124)` | `rgb(169, 194, 212)`, `rgb(142, 174, 197)` |
| `primary`, other tab: text | `rgb(71, 84, 103)` | `rgb(164, 167, 174)` |
| `primary`, line under the row (`1px`) | `rgb(228, 231, 236)` | `rgb(51, 55, 65)` |
| `secondary`, track: background, corner | `rgb(241, 243, 246)`, `10px` | `rgb(37, 43, 55)`, `10px` |
| `secondary`, current tab: background, text, shadow | `rgb(255, 255, 255)`, `rgb(16, 24, 40)`, `rgba(16, 24, 40, 0.05) 0px 1px 2px` | `rgb(22, 27, 38)`, `rgb(245, 245, 246)`, the same shadow |

A tab of `primary` is `44px` high. In both themes:

1. On `/tab-nav`, the tab "Overview" of each TabNav has `aria-current="page"`, and no other tab has it.
2. A press on "Orders": the address is `/tab-nav/orders`, the content is the content of that route, and "Orders" has `aria-current="page"` in both TabNavs. The browser did not load the whole page again.
3. Focus on "Clients", then Enter: the address is `/tab-nav/clients`, and "Clients" has `aria-current="page"`.

### Tabs (TOR-1144)

| Part | Light theme | Dark theme |
|---|---|---|
| Track: background, corner, padding | `rgb(241, 243, 246)`, `10px`, `4px` | `rgb(37, 43, 55)`, `10px`, `4px` |
| Selected tab: background, text, shadow | `rgb(255, 255, 255)`, `rgb(16, 24, 40)`, `rgba(16, 24, 40, 0.05) 0px 1px 2px` | `rgb(22, 27, 38)`, `rgb(245, 245, 246)`, the same shadow |
| Other tab: text | `rgb(71, 84, 103)` | `rgb(164, 167, 174)` |

The font of a tab is Poppins, `14px`, with a weight of `500`. With the keyboard, starting with the focus on the tab "All": Right arrow selected "Orders" and showed its content, and End selected "Support", the last tab. In the controlled example, a press on "Preview" changed the text that the app shows to "The mode the app holds: preview".

### BreadCrumbs (TOR-1145)

| Part | Light theme | Dark theme |
|---|---|---|
| Link (`14px`, weight `500`) | `rgb(71, 84, 103)` | `rgb(164, 167, 174)` |
| Current page (`14px`) | `rgb(16, 24, 40)` | `rgb(245, 245, 246)` |

### SplitButton and ThemeToggle (TOR-1145)

| Part | Light theme | Dark theme |
|---|---|---|
| Main button (`40px` high, text `14px`): background, text | `rgb(66, 99, 124)`, `rgb(255, 255, 255)` | `rgb(142, 174, 197)`, `rgb(12, 17, 29)` |
| Button that opens the menu | `40px` wide, `40px` high | The same |
| Menu: background, border, corner, padding | `rgb(255, 255, 255)`, `rgb(241, 243, 246)`, `12px`, `4px 0` | `rgb(22, 27, 38)`, `rgb(31, 36, 47)`, `12px`, `4px 0` |
| Action (`14px`, weight `400`, left padding `12px`): text | `rgb(52, 64, 84)` | `rgb(206, 207, 210)` |
| Action with the focus: background | `rgb(247, 248, 250)` | `rgb(31, 36, 47)` |
| Disabled buttons | Opacity `0.5` | Opacity `0.5` |

The theme button is `40px` high, with text of `14px` and the background of the secondary Button.

Not checked again in phase 7: the menu that opens upwards (`menuPlacement="top"`), choosing an action with Enter, and the keys inside the menu. The unit tests cover them.

### The same components next to Intraweb's (phase 7)

A temporary page, outside both repositories, rendered Intraweb's own component files (`button.tsx`, `icon-button.tsx`, `form-controls.tsx`, `tab-nav.tsx`, with Intraweb's `globals.css` and theme files, commit `f8ad4c2` of `prontera-e-juno`) next to a second page with the components of the two package files of `make pack`. Both pages were built with Tailwind CSS 4.3.5 and had the same fonts. A Playwright script read 69 computed CSS properties, the rendered width and height, and the color of the placeholder, for every element of 54 samples: Button (5 variants in 3 sizes, each variant disabled, one with no icon), ButtonLink (5 variants), IconButton (4 variants in 3 sizes, each variant disabled), Field with TextInput (plain, hint, error, optional, `sm`, icon, icon in `sm`, disabled), TextInput alone, TabNav (`primary`, `secondary`) and Intraweb's SegmentedTabs against Tabs. It read them at rest, with the pointer over the first control of the sample, and with the keyboard focus on it, in the light and the dark theme, in windows 1280, 800 and 390 pixels wide: 244,248 values.

3 kinds of value differ:

| Where | Intraweb | Library | Why |
|---|---|---|---|
| The icon of Button and ButtonLink: `flex-shrink` | `1` | `0` | The library adds `shrink-0`, so a long text in a narrow button cannot squash the icon. With room for the text the two look the same |
| The mark of an optional Field: width of the `<span>` | `70.28px` | `66.34px` | In Intraweb the space before "(opcional)" is inside the `<span>`; in the library it is before the `<span>`. The label as a whole has the same width |
| TabNav `primary`: `mask-image` of the row | `linear-gradient(90deg, ...)` | `linear-gradient(to right, ...)` | The same gradient, written by the build in two ways. The library writes the 32 pixels as a multiple of `--spacing`, Intraweb as `2rem` |

What the script cannot see, and differs on purpose: with "reduce motion" on in the device the library has no color transition (`motion-safe:`) and Intraweb has one; the library's Button has the state `loading`; the library's Field writes `aria-describedby` and `aria-invalid` on the control; the library's elements have `data-variant`, `data-size` and `data-slot`.

### The whole page

- The browser console had no message on `/components` and on the 3 routes under `/tab-nav`, in both themes.
- The server was stopped after the checks.

Not checked: a real screen reader (VoiceOver or NVDA), browsers other than Chromium, and the theme `paper` on the page `/components`.

## The data components (phase 10, the route `/data`)

The route `/data` shows DataTable (with an actions column, with no rows, in a narrow container, and as blocks on a narrow screen), DataGrid, ListItem and DetailPanel. The page `app/data/page.tsx` is a Server Component. DataGrid holds state and its columns are functions, so it is used through the Client Component `app/data/ProductsGrid.tsx`.

Checked on 2026-11-15 in the built app (`next start`), with Chromium driven by Playwright, at 1280 and 375 pixels wide, in the light and the dark theme:

- The browser console had no message.
- The page is not wider than the window (375 pixels at 375). Only the box of a table wider than its box scrolls sideways, and only that box can get the keyboard focus.
- In the DataGrid, a press on the header "Price" sorts ascending (`aria-sort="ascending"`), the button of the next page shows "2 of 3", and the checkbox of the header selects the 23 rows.
- The values of the first table, light and dark: the card `rgb(255, 255, 255)` and `rgb(22, 27, 38)` with a corner of `16px`; a header cell `rgb(247, 248, 250)` and `rgb(31, 36, 47)`, text of `12px` in `rgb(102, 112, 133)` and `rgb(138, 141, 148)`, padding `10px 12px`; a cell with text in `rgb(52, 64, 84)` and `rgb(206, 207, 210)`; the row of the open record `rgb(242, 246, 249)` and `rgb(28, 39, 51)`.

The comparison of each component with Intraweb's own file, value by value, is in the 4 entries of phase 10 in [`docs/decisions.md`](../../docs/decisions.md) (TOR-1164 to TOR-1167).

Not checked: a real screen reader (VoiceOver or NVDA), and browsers other than Chromium.
