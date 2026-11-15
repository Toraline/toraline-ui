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
| TOR-1006 | The button `Theme: light` changes the theme. After a reload the page opens in the theme that was chosen, and never shows the other theme first |
| TOR-1007, TOR-1135 | In the themes `light` and `dark` the headings use the font Poppins and the rest of the text uses the font Inter: the default fonts of the library. In the theme `paper`, a theme of this app, the headings use the font Fraunces, which the app set through the theme function |
| TOR-997 | The page `/components` shows every component of `@toraline.tech/ui` with every variant and state. The theme button on that page changes the theme |
| TOR-1008 | Every color, font, radius and shadow on the page comes from a token class, for example `bg-primary`. `bg-brand` is a color this app added. Changing the theme changes all of them |

## The files

| File | What it is |
|---|---|
| `theme.config.ts` | The themes of this app: a list of inputs for the theme function `createTheme` of `@toraline.tech/tokens` |
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
| With `Cookie: toraline-theme=dark` | `<html lang="en" data-theme="dark">` |
| With no cookie | `<html lang="en" data-theme="light">` |
| With a cookie value that is not a theme | `<html lang="en" data-theme="light">` |

The same server was then opened in a browser. With the keyboard: Tab moved the focus to the button, Enter changed `data-theme` to `dark`, the page background changed from `rgb(255, 255, 255)` to `rgb(15, 25, 40)`, and the cookie `toraline-theme=dark` was saved. After a reload the page had `data-theme="dark"` and the dark background. The browser console had no error.

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

- Token classes: `bg-surface`, `bg-surface-raised`, `bg-surface-muted`, `bg-primary`, `bg-danger`, `bg-success`, `bg-brand`, `text-text`, `text-text-muted`, `text-primary`, `text-primary-foreground`, `text-danger-foreground`, `text-success-foreground`, `text-brand-foreground`, `border-border`, `font-heading`, `font-mono`, `rounded`, `shadow`.
- Standard Tailwind classes for spacing, size and layout, which have no token: `mx-auto`, `max-w-2xl`, `p-4`, `p-8`, `px-3`, `py-1`, `mt-2`, `mt-4`, `mt-6`, `flex`, `flex-wrap`, `gap-3`, `border`, `font-bold`, `text-xl`, `text-3xl`.

Checked on the built app on 2026-11-15 (Tailwind CSS 4.3.5), in a browser, with `getComputedStyle`, before and after one press of the toggle:

| What | Class | Light theme | Dark theme |
|---|---|---|---|
| Page background | `bg-surface` | `rgb(255, 255, 255)` | `rgb(15, 25, 40)` |
| Page text | `text-text` | `rgb(15, 25, 40)` | `rgb(243, 243, 244)` |
| Heading color | `text-primary` | `rgb(94, 0, 161)` | `rgb(181, 147, 234)` |
| Card background | `bg-surface-raised` | `rgb(255, 255, 255)` | `rgb(39, 48, 62)` |
| Card border | `border-border` | `rgb(207, 209, 212)` | `rgb(63, 71, 83)` |
| Card corner | `rounded` | `8px` | `8px` |
| Card shadow | `shadow` | `rgba(15, 25, 40, 0.12) 0px 1px 2px` | `rgba(15, 25, 40, 0.16) 0px 4px 12px` |
| Added color | `bg-brand` | `rgb(179, 71, 0)` | `rgb(255, 179, 122)` |
| Text on the added color | `text-brand-foreground` | `rgb(255, 255, 255)` | `rgb(15, 25, 40)` |

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

The values below were read when the components were styled with CSS files (TOR-997). On 2026-11-15 the components changed to Tailwind classes (TOR-1205). The computed style of every element of `/` and `/components` was read before and after that change with a temporary Playwright script, in both themes: at rest, with the pointer over each control, and with the keyboard focus on each control. The screenshots of the 2 pages in the 2 themes are the same, byte for byte. The values that differ change nothing a person sees:

- The thumb of an "on" switch is moved with the CSS property `translate` (`20px`), where it was `transform`. The arrow of a split button is turned with `rotate` (`180deg`), where it was `transform`. The transitions name the new properties.
- The animation of the spinner has a new name, `spin`. It still takes `0.7s`.
- A tab and an action of a menu have `border-style: solid` on the sides whose border is `0px` wide, where it was `none`.

The page was then opened in a browser. The colors below were read with `getComputedStyle`, once with `data-theme="light"` and once with `data-theme="dark"` on `<html>`. Transitions were turned off while reading, because a color that is still changing gives a value between the two themes. In each cell: background, then text.

### Button (TOR-1010)

| Button | Light theme | Dark theme |
|---|---|---|
| `primary` | `rgb(94, 0, 161)`, `rgb(255, 255, 255)` | `rgb(181, 147, 234)`, `rgb(15, 25, 40)` |
| `secondary` | `rgb(255, 255, 255)`, `rgb(94, 0, 161)`, border `rgb(94, 0, 161)` | `rgb(39, 48, 62)`, `rgb(181, 147, 234)`, border `rgb(181, 147, 234)` |
| `danger` | `rgb(217, 45, 45)`, `rgb(255, 255, 255)` | `rgb(244, 120, 120)`, `rgb(15, 25, 40)` |
| Disabled (every variant) | `rgb(255, 255, 255)`, `rgb(111, 117, 126)`, border `rgb(207, 209, 212)` | `rgb(15, 25, 40)`, `rgb(159, 163, 169)`, border `rgb(63, 71, 83)` |
| Loading `primary` | The same as `primary` | The same as `primary` |

Sizes: `sm` has a font size of `14px` and a padding of `4px 12px`; `md` has `16px` and `8px 16px`; `lg` has `18px` and `12px 24px`. The spinner of a loading button has the animation `spin`. The button with `className="rounded-full"` has a fully round corner, where the library's class `rounded` gives `8px`: the class of the app replaces it.

### Input (TOR-1011)

| Part | Light theme | Dark theme |
|---|---|---|
| Field: background, text, border | `rgb(255, 255, 255)`, `rgb(15, 25, 40)`, `rgb(111, 117, 126)` | `rgb(15, 25, 40)`, `rgb(243, 243, 244)`, `rgb(111, 117, 126)` |
| Label | `rgb(15, 25, 40)` | `rgb(243, 243, 244)` |
| Placeholder | `rgb(111, 117, 126)` | `rgb(159, 163, 169)` |
| Field with an error: border | `rgb(217, 45, 45)` | `rgb(244, 120, 120)` |
| Error message | `rgb(217, 45, 45)` | `rgb(244, 120, 120)` |
| Disabled field: background, text, border | `rgb(243, 243, 244)`, `rgb(15, 25, 40)`, `rgb(207, 209, 212)` | `rgb(39, 48, 62)`, `rgb(243, 243, 244)`, `rgb(63, 71, 83)` |

Every `<label>` on the page has a `for` equal to the `id` of its field. The field with `className="max-w-40"` is `160px` wide, and the others are `448px` wide: the class of the app is on the outermost element and wins.

### Toggle (TOR-1012)

The track is the long rounded part of the switch. The thumb is the circle that moves inside it.

| State | Light theme | Dark theme |
|---|---|---|
| Off: track, border, thumb | `rgb(255, 255, 255)`, `rgb(111, 117, 126)`, `rgb(111, 117, 126)` | `rgb(15, 25, 40)`, `rgb(111, 117, 126)`, `rgb(111, 117, 126)` |
| On: track, border, thumb | `rgb(47, 111, 20)`, `rgb(47, 111, 20)`, `rgb(255, 255, 255)` | `rgb(126, 195, 109)`, `rgb(126, 195, 109)`, `rgb(15, 25, 40)` |
| Disabled: track, border, thumb, label | `rgb(243, 243, 244)`, `rgb(207, 209, 212)`, `rgb(111, 117, 126)`, `rgb(111, 117, 126)` | `rgb(39, 48, 62)`, `rgb(63, 71, 83)`, `rgb(159, 163, 169)`, `rgb(159, 163, 169)` |

Off, the thumb is not moved (`translate` is `none`) and the check mark has an opacity of `0`. On, the thumb is moved `20px` to the right and the check mark has an opacity of `1`. A click on the first switch changed it from off to on. The switch with `className="text-lg"` is `49.5px` wide, and the others are `44px` wide.

### Tabs (TOR-1013)

| Part | Light theme | Dark theme |
|---|---|---|
| Selected tab: text, line under it | `rgb(15, 25, 40)`, `rgb(94, 0, 161)` | `rgb(243, 243, 244)`, `rgb(181, 147, 234)` |
| Other tab: text | `rgb(111, 117, 126)` | `rgb(159, 163, 169)` |
| Line under the row | `rgb(207, 209, 212)` | `rgb(63, 71, 83)` |
| Content | `rgb(15, 25, 40)` | `rgb(243, 243, 244)` |

With the keyboard, starting with the focus on the tab "All": Right arrow selected "Orders". Left arrow 2 times selected "All" and then "Support", the last tab. The content changed to the content of "Support". The second example starts on "Premium", and its `className="mt-6"` gives it a top margin of `24px`.

### BreadCrumbs (TOR-1014)

| Part | Light theme | Dark theme |
|---|---|---|
| Link and separator | `rgb(111, 117, 126)` | `rgb(159, 163, 169)` |
| Current page | `rgb(15, 25, 40)`, font size `18px` | `rgb(243, 243, 244)`, font size `18px` |

In the first example the links go to `/` and `/components`, and the element with `aria-current="page"` has the text "BreadCrumbs". The third example renders its links with the `Link` of `next/link`, and its `className="font-normal"` gives it a font weight of `400`, where the library's class `font-bold` gives `700`.

### SplitButton (TOR-1015)

Read while the menu of the first split button was open, with the focus on its second action:

| Part | Light theme | Dark theme |
|---|---|---|
| Main button: background, text | `rgb(94, 0, 161)`, `rgb(255, 255, 255)` | `rgb(181, 147, 234)`, `rgb(15, 25, 40)` |
| Button that opens the menu, while the menu is open: background | `rgb(61, 0, 105)` | `rgb(208, 177, 255)` |
| Menu: background, border | `rgb(255, 255, 255)`, `rgb(207, 209, 212)` | `rgb(39, 48, 62)`, `rgb(63, 71, 83)` |
| Action: text | `rgb(94, 0, 161)` | `rgb(181, 147, 234)` |
| Action with the focus: background, text | `rgb(94, 0, 161)`, `rgb(255, 255, 255)` | `rgb(181, 147, 234)`, `rgb(15, 25, 40)` |
| Disabled buttons: background, text | Not read | `rgb(15, 25, 40)`, `rgb(159, 163, 169)` |

With the keyboard:

1. Focus on the button that opens the first menu, then Enter: the menu opened under the buttons, and `aria-expanded` was `"true"`.
2. Down arrow: the focus moved to "Download the contract".
3. Escape: the menu closed, and the focus was back on the button that opened it.
4. Focus on the button of the second split button (`menuPlacement="top"`), then Up arrow: the menu opened above the buttons (its bottom edge at `603px`, the top edge of the buttons at `611px`), with the focus on the last action, "Send by e-mail".
5. Enter: the page showed "Last action: Send by e-mail", the menu closed, and the focus was back on the button that opened it.

The split button with `className="shadow"` has the shadow of the theme.

### The whole page

- A new browser tab was opened on `/components`. The theme button, the first switch, the tab "Orders" and the first menu were pressed. Then `/` was opened. The browser console had no message on either page.
- `curl -s -H 'Cookie: toraline-theme=dark' http://localhost:3987/components` answered with `<html lang="en" data-theme="dark" ...>`. The HTML of the server already had the 13 buttons, 6 fields, 6 switches, 2 rows of tabs, 3 current pages of breadcrumbs and 4 buttons that open a menu.
- The server was stopped after the checks.

Not checked: a real screen reader (VoiceOver or NVDA), and browsers other than the one built into the Claude desktop app.
