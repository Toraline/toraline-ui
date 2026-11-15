# playground

A Next.js 16 app, with React 19 and Tailwind CSS 4, that tests the tokens, the themes and the theme toggle of the library in a real page. It is private: it is never published. `make check` builds it.

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
| TOR-1007 | The headings use the font Fraunces. The rest of the text uses the default font of the library |
| TOR-997 | The page `/components` shows every component of `@toraline/ui` with every variant and state. The theme button on that page changes the theme |
| TOR-1008 | Every color, font, radius and shadow on the page comes from a token class, for example `bg-primary`. `bg-brand` is a color this app added. Changing the theme changes all of them |

## The files

| File | What it is |
|---|---|
| `theme.config.ts` | The themes of this app: a list of inputs for the theme function `createTheme` of `@toraline/tokens` |
| `scripts/write-theme-css.ts` | Runs `createTailwindTheme` and `createTheme` on the inputs and writes `app/theme.generated.css`. It runs by itself before `npm run dev` and `npm run build`. Git ignores the file it writes |
| `postcss.config.mjs` | Tells Next.js to run Tailwind CSS 4 |
| `app/fonts.ts` | Loads the font Fraunces with `next/font/local` into the CSS variable `--font-fraunces` |
| `app/fonts/` | The font file and its license (SIL Open Font License 1.1) |
| `app/layout.tsx` | Reads the theme cookie on the server and writes `data-theme` on `<html>` |
| `app/globals.css` | Imports Tailwind CSS, the Tailwind preset of the library, the generated theme file and the component styles. It has no other CSS |
| `app/page.tsx` | The test page. It has no CSS of its own: only classes |
| `app/components/page.tsx` | The page of the components, at `/components` |

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

## How the heading font was checked

`theme.config.ts` gives `fonts: { heading: "var(--font-fraunces), Georgia, serif" }` to the theme function, in both themes. Checked on the built app on 2026-11-15, in a browser, with `getComputedStyle`:

| Element | Its font (`font-family`) |
|---|---|
| `<h1>` | `fraunces, "fraunces Fallback", Georgia, serif` |
| `<body>` | `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` (the default of the library) |
| `<code>` | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace` (the default of the library) |

The browser reported the font `fraunces` as loaded (`document.fonts`).

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

The class `mt-4` on the toggle (`<ThemeToggle className="mt-4" />`) gave it a top margin of `16px`. This shows that a class of the app wins over the library's styles. The browser console had no error.

## How the components were checked

The page `/components` is a Server Component. It imports the components from `@toraline/ui`. The build of this app fails when a component that needs the browser has no `"use client"`.

Commands, run from the repository root on 2026-11-15 (Next.js 16.4.6, Tailwind CSS 4.3.5):

```bash
npm run build
(cd apps/playground && npx next start -p 3987) &
curl -s -o /dev/null -w "%{http_code}" http://localhost:3987/components   # 200
pkill -f "next start -p 3987"
```

The page was then opened in a browser. The colors below were read with `getComputedStyle`, once with `data-theme="light"` and once with `data-theme="dark"` on `<html>`. Transitions were turned off while reading, because a color that is still changing gives a value between the two themes. In each cell: background, then text.

### Button (TOR-1010)

| Button | Light theme | Dark theme |
|---|---|---|
| `primary` | `rgb(94, 0, 161)`, `rgb(255, 255, 255)` | `rgb(181, 147, 234)`, `rgb(15, 25, 40)` |
| `secondary` | `rgb(255, 255, 255)`, `rgb(94, 0, 161)`, border `rgb(94, 0, 161)` | `rgb(39, 48, 62)`, `rgb(181, 147, 234)`, border `rgb(181, 147, 234)` |
| `danger` | `rgb(217, 45, 45)`, `rgb(255, 255, 255)` | `rgb(244, 120, 120)`, `rgb(15, 25, 40)` |
| Disabled (every variant) | `rgb(255, 255, 255)`, `rgb(111, 117, 126)`, border `rgb(207, 209, 212)` | `rgb(15, 25, 40)`, `rgb(159, 163, 169)`, border `rgb(63, 71, 83)` |
| Loading `primary` | The same as `primary` | The same as `primary` |

Sizes: `sm` has a font size of `14px` and a padding of `4px 12px`; `md` has `16px` and `8px 16px`; `lg` has `18px` and `12px 24px`. The spinner of a loading button has the animation `tui-button-spin`. The button with `className="rounded-full"` has a fully round corner, where the library's style gives `8px`: the class of the app wins.
