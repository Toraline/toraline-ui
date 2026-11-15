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

The values below were read on 2026-11-15, after phase 6 (TOR-1122), with a temporary Playwright script: Chromium with no window, `getComputedStyle`, the theme chosen with the cookie, transitions turned off. In each cell: background, then text, unless the row says something else. Every color is the value of Intraweb for the token of that part.

### Button (TOR-1010)

| Button | Light theme | Dark theme |
|---|---|---|
| `primary` | `rgb(66, 99, 124)`, `rgb(255, 255, 255)` | `rgb(142, 174, 197)`, `rgb(12, 17, 29)` |
| `secondary` | `rgb(255, 255, 255)`, `rgb(29, 41, 57)`, border `rgb(228, 231, 236)` | `rgb(22, 27, 38)`, `rgb(228, 231, 236)`, border `rgb(51, 55, 65)` |
| `danger` | `rgb(255, 255, 255)`, `rgb(180, 35, 24)`, border `rgb(254, 205, 202)` | `rgb(22, 27, 38)`, `rgb(249, 112, 102)`, border `rgb(122, 39, 26)` |
| Disabled (every variant) | `rgb(247, 248, 250)`, `rgb(102, 112, 133)`, border `rgb(228, 231, 236)` | `rgb(31, 36, 47)`, `rgb(138, 141, 148)`, border `rgb(51, 55, 65)` |
| Loading (every variant) | The same as the variant | The same as the variant |

The font of every button is `poppins, "poppins Fallback", ui-sans-serif, system-ui, sans-serif`, with a weight of `500`. Sizes: `sm` has a font size of `14px` and a padding of `4px 12px`; `md` has `16px` and `8px 16px`; `lg` has `18px` and `12px 24px`. The corner is `8px` (`rounded-md`). The spinner of a loading button has the animation `spin`. The button with `className="rounded-full"` has a fully round corner and no class `rounded-md`: the class of the app replaces it.

### Input (TOR-1011)

| Part | Light theme | Dark theme |
|---|---|---|
| Field: background, text, border | `rgb(255, 255, 255)`, `rgb(16, 24, 40)`, `rgb(228, 231, 236)` | `rgb(22, 27, 38)`, `rgb(245, 245, 246)`, `rgb(51, 55, 65)` |
| Label | `rgb(29, 41, 57)` | `rgb(228, 231, 236)` |
| Placeholder | `rgb(102, 112, 133)` | `rgb(138, 141, 148)` |
| Field with an error: border | `rgb(217, 45, 32)` | `rgb(249, 112, 102)` |
| Error message | `rgb(180, 35, 24)` | `rgb(249, 112, 102)` |
| Disabled field: background, text, border | `rgb(247, 248, 250)`, `rgb(102, 112, 133)`, `rgb(228, 231, 236)` | `rgb(31, 36, 47)`, `rgb(138, 141, 148)`, `rgb(51, 55, 65)` |

Every `<label>` on the page has a `for` equal to the `id` of its field. The field with `className="max-w-40"` is `160px` wide, and the others are `448px` wide: the class of the app is on the outermost element and wins.

### Toggle (TOR-1012)

The track is the long rounded part of the switch. The thumb is the circle that moves inside it.

| State | Light theme | Dark theme |
|---|---|---|
| Off: track, border, thumb | `rgb(255, 255, 255)`, `rgb(208, 213, 221)`, `rgb(102, 112, 133)` | `rgb(22, 27, 38)`, `rgb(65, 70, 81)`, `rgb(138, 141, 148)` |
| On: track, border, thumb, check mark | `rgb(66, 99, 124)`, `rgb(66, 99, 124)`, `rgb(255, 255, 255)`, `rgb(66, 99, 124)` | `rgb(142, 174, 197)`, `rgb(142, 174, 197)`, `rgb(22, 27, 38)`, `rgb(169, 194, 212)` |
| Disabled: track, border, thumb, label | `rgb(247, 248, 250)`, `rgb(228, 231, 236)`, `rgb(152, 162, 179)`, `rgb(102, 112, 133)` | `rgb(31, 36, 47)`, `rgb(51, 55, 65)`, `rgb(97, 100, 108)`, `rgb(138, 141, 148)` |

The label of a switch that is not disabled is `rgb(52, 64, 84)` (light) and `rgb(206, 207, 210)` (dark). Off, the thumb is not moved (`translate` is `none`) and the check mark has an opacity of `0`. On, the thumb is moved `20px` to the right and the check mark has an opacity of `1`. A click on the first switch changed it from off to on. The switch with `className="text-lg"` is `49.5px` wide, and the others are `44px` wide.

### Tabs (TOR-1013)

| Part | Light theme | Dark theme |
|---|---|---|
| Selected tab: text, line under it | `rgb(66, 99, 124)`, `rgb(66, 99, 124)` | `rgb(169, 194, 212)`, `rgb(142, 174, 197)` |
| Other tab: text | `rgb(71, 84, 103)` | `rgb(164, 167, 174)` |
| Line under the row | `rgb(228, 231, 236)` | `rgb(51, 55, 65)` |
| Content | `rgb(16, 24, 40)` | `rgb(245, 245, 246)` |

The font of a tab is Poppins with a weight of `500`. With the keyboard, starting with the focus on the tab "All": Right arrow selected "Orders". Left arrow 2 times selected "All" and then "Support", the last tab. The content changed to the content of "Support". The second example starts on "Premium", and its `className="mt-6"` gives it a top margin of `24px`.

### BreadCrumbs (TOR-1014)

| Part | Light theme | Dark theme |
|---|---|---|
| Link and separator | `rgb(71, 84, 103)` | `rgb(164, 167, 174)` |
| Current page | `rgb(16, 24, 40)`, font size `18px` | `rgb(245, 245, 246)`, font size `18px` |

The third example renders its links with the `Link` of `next/link`, and its `className="font-normal"` gives it a font weight of `400`, where the library's class `font-bold` gives `700`.

### SplitButton (TOR-1015)

Read while the menu of the first split button was open, with the focus on its second action:

| Part | Light theme | Dark theme |
|---|---|---|
| Main button: background, text | `rgb(66, 99, 124)`, `rgb(255, 255, 255)` | `rgb(142, 174, 197)`, `rgb(12, 17, 29)` |
| Button that opens the menu, while the menu is open: background | `rgb(52, 79, 99)` | `rgb(169, 194, 212)` |
| Menu: background, border, corner | `rgb(255, 255, 255)`, `rgb(241, 243, 246)`, `12px` | `rgb(22, 27, 38)`, `rgb(31, 36, 47)`, `12px` |
| Menu: shadow (`shadow-lg`) | `rgba(16, 24, 40, 0.03) 0px 4px 6px -2px, rgba(16, 24, 40, 0.08) 0px 12px 16px -4px` | The same |
| Action: text | `rgb(52, 64, 84)` | `rgb(206, 207, 210)` |
| Action with the focus: background | `rgb(247, 248, 250)` | `rgb(31, 36, 47)` |
| Disabled buttons: background, text | `rgb(247, 248, 250)`, `rgb(102, 112, 133)` | `rgb(31, 36, 47)`, `rgb(138, 141, 148)` |

With the keyboard, in both themes:

1. Focus on the button that opens the first menu, then Enter: the menu opened, and `aria-expanded` was `"true"`.
2. Down arrow: the focus moved to "Download the contract".
3. Escape: the menu closed, and the focus was back on the button that opened it.

Checked before phase 6 and not again: the menu that opens upwards (`menuPlacement="top"`), choosing an action with Enter, and the split button with a class of the app.

### The whole page

- The browser console had no message on `/` and on `/components`, in both themes.
- The page `/components` has 29 buttons inside its sections, 6 fields, 6 switches, 2 rows of tabs, 3 current pages of breadcrumbs and 4 buttons that open a menu.
- The server was stopped after the checks.

Not checked: a real screen reader (VoiceOver or NVDA), browsers other than Chromium, the theme `paper` on the page `/components`, and the look of each control with the pointer over it.
