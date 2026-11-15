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
