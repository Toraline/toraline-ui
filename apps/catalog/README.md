# catalog

The catalog of the library: a site that shows each component alone, in every theme. It is built with Storybook 10. Storybook is a tool that shows one component at a time, outside of an app. Each example of a component is called a story.

The catalog is private. It is never published and never deployed.

## Commands

Run them from the repository root.

```bash
make catalog         # opens the catalog on http://localhost:6006, for development
make catalog-build   # builds the static catalog into apps/catalog/storybook-static
```

`make catalog` needs no build before it: the catalog reads the source of `packages/tokens` and `packages/ui`. A change in a component shows in the open catalog at once. Stop it with Ctrl+C.

`make check` also builds the static catalog.

## How to change the theme

The toolbar above a story has the control **Theme**. It lists every theme of the library (`light`, `dark`). Choose one: every story is shown in that theme.

The control does what an app does: it writes the attribute `data-theme` on `<html>`, and each story is inside `ThemeProvider`. A press on the library's `ThemeToggle` inside a story also changes the control.

## The files

| File | What it is |
|---|---|
| `.storybook/main.ts` | Which files are stories, which addons are on, and how Vite builds the catalog. An addon is a plugin of Storybook |
| `.storybook/preview.tsx` | What every story gets: the CSS of the tokens and of the components, the control **Theme**, and the decorator that applies the theme. A decorator is a function that wraps every story |
| `.storybook/themes.ts` | The list of themes of the control. It is `DEFAULT_THEMES` of `@toraline/tokens` |
| `.storybook/preview.css` | The CSS of the catalog itself: the page behind a story gets the colors of the current theme |
| `stories/` | The stories (`*.stories.tsx`) and the documentation pages (`*.mdx`) |

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
