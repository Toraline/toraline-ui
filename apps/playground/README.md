# playground

A Next.js 16 app that tests the tokens, the themes and the theme toggle of the library in a real page. It is private: it is never published. `make check` builds it.

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

## The files

| File | What it is |
|---|---|
| `theme.config.ts` | The themes of this app: a list of inputs for the theme function `createTheme` of `@toraline/tokens` |
| `scripts/write-theme-css.ts` | Runs `createTheme` for each input and writes `app/theme.generated.css`. It runs by itself before `npm run dev` and `npm run build`. Git ignores the file it writes |
| `app/fonts.ts` | Loads the font Fraunces with `next/font/local` into the CSS variable `--font-fraunces` |
| `app/fonts/` | The font file and its license (SIL Open Font License 1.1) |
| `app/layout.tsx` | Reads the theme cookie on the server and writes `data-theme` on `<html>` |
| `app/globals.css` | Imports the CSS of the library and the generated theme file |
| `app/page.tsx` | The test page |

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
