# @toraline/ui

The styled React components of the Toraline component library.

| What | Import from | State |
|---|---|---|
| The parts that control the theme: a provider, a hook and a toggle button | `@toraline/ui/theme` | Built in phase 2 |
| The components | `@toraline/ui` | Phase 3 (TOR-997) builds 6: Button, Input, Toggle, Tabs, BreadCrumbs, SplitButton. Built so far: Button, Input, Toggle, Tabs, BreadCrumbs |
| The styles of everything above | `@toraline/ui/styles.css` | One CSS file |

The rules every component follows are in [Rules every component follows](#rules-every-component-follows).

A theme is a set of colors, fonts and corner sizes. The page selects a theme with the attribute `data-theme` on `<html>`. The themes and their values are in [`@toraline/tokens`](../tokens/README.md).

## How to use the theme in a Next.js app

1. Import the CSS once, in the global CSS file (`app/globals.css`):

   ```css
   @import "tailwindcss";
   @import "@toraline/tokens/css/tailwind.css";
   @import "@toraline/ui/styles.css";
   ```

   An app with no Tailwind CSS imports `@toraline/tokens/css` in place of the first two lines.

2. In the root layout (`app/layout.tsx`), read the saved theme on the server, write it on `<html>`, and give it to the provider:

   ```tsx
   import { cookies } from "next/headers";
   import type { ReactNode } from "react";
   import { THEME_COOKIE_NAME, resolveTheme } from "@toraline/tokens";
   import { ThemeProvider } from "@toraline/ui/theme";
   import "./globals.css";

   const themes = ["light", "dark"];

   export default async function RootLayout({ children }: { children: ReactNode }) {
     const cookieStore = await cookies();
     const theme = resolveTheme(cookieStore.get(THEME_COOKIE_NAME)?.value, themes);

     return (
       <html lang="en" data-theme={theme}>
         <body>
           <ThemeProvider themes={themes} initialTheme={theme}>
             {children}
           </ThemeProvider>
         </body>
       </html>
     );
   }
   ```

3. Put the toggle anywhere inside the provider:

   ```tsx
   import { ThemeToggle } from "@toraline/ui/theme";

   export default function Page() {
     return <ThemeToggle />;
   }
   ```

The server writes `data-theme` in the HTML it sends, so the page never shows the wrong theme first. This working example is the app [`apps/playground`](../../apps/playground/README.md).

Reading a cookie in the root layout makes Next.js render every page at request time (dynamic rendering). An app that needs pages built once (static rendering) does not read the cookie on the server. It puts the script of `createThemeScript` from `@toraline/tokens` inside `<head>`, and gives no `initialTheme` to the provider.

## The parts

All three come from `@toraline/ui/theme`. They are Client Components: they run in the browser.

### `ThemeProvider`

Holds the current theme, writes it on `<html data-theme="...">`, and saves the person's choice in the cookie `toraline-theme` for 1 year.

| Prop | Required | Meaning |
|---|---|---|
| `children` | Yes | The app |
| `themes` | No | The theme names of the app, in the order the toggle goes through them. When missing: `["light", "dark"]` |
| `defaultTheme` | No | The theme of a person who has not chosen yet. When missing: the first of `themes` |
| `initialTheme` | No | The theme the server already wrote on `<html>` |
| `cookieName` | No | The name of the cookie. When missing: `"toraline-theme"` |

### `useTheme()`

Returns `{ theme, themes, setTheme }`. `theme` is the current theme name. `setTheme("dark")` shows that theme and saves the choice. It throws an error for a name that is not in `themes`. `useTheme` works only inside `ThemeProvider`.

### `ThemeToggle`

A button. Each press shows the next theme of `themes`. After the last theme it goes back to the first.

- It is a real `<button type="button">`, so it works with the Tab, Enter and Space keys.
- It shows the current theme as text: `Theme: dark`.
- A screen reader says the current theme and what a press does: `Theme: dark. Switch to light.` The prop `formatLabel={(theme, nextTheme) => "..."}` changes this text.
- `children` replaces the text that is shown, for example with an icon.
- `className` adds classes. The button also accepts every other prop of `<button>`.

## The components

All of them come from `@toraline/ui`. They need the CSS of step 1 above. The page `/components` of [`apps/playground`](../../apps/playground/README.md) shows each one with every variant and state.

### `Button`

```tsx
import { Button } from "@toraline/ui";

<Button variant="danger" size="sm" onClick={deleteOrder}>
  Delete
</Button>
```

| Prop | Values | Meaning |
|---|---|---|
| `variant` | `"primary"` (default), `"secondary"`, `"danger"` | The look. `primary`: the main action. `secondary`: another action. `danger`: an action that deletes |
| `size` | `"sm"`, `"md"` (default), `"lg"` | The size |
| `loading` | `true`, `false` (default) | `true` while the action is running. The button shows a spinner (a small turning circle), and a press does nothing |
| `disabled` | The HTML attribute | The button cannot get focus and cannot be pressed |
| `type` | `"button"` (default), `"submit"`, `"reset"` | The HTML attribute. The default is `"button"`, so a button inside a form does not send the form by accident |

- Main native element: the `<button>`. Every other prop and `ref` go to it. `className` goes to it too.
- Keyboard: Tab moves the focus to it, Enter and Space press it.
- Screen reader: a loading button has `aria-busy="true"` and `aria-disabled="true"`. It keeps the keyboard focus, so a person who pressed it with the keyboard does not lose their place.
- The lists `buttonVariants` and `buttonSizes` and the types `ButtonProps`, `ButtonVariant` and `ButtonSize` are exported.
- It is a Client Component, because it has a click handler of its own.

### `Input`

```tsx
import { Input } from "@toraline/ui";

<Input label="Title" name="title" error={titleError} />
```

| Prop | Values | Meaning |
|---|---|---|
| `label` | Text or elements | The visible name of the field, shown above it. A click on it moves the focus to the field. A field with no `label` needs `aria-label` |
| `error` | Text or elements | The error message, shown under the field with an icon. When it is given, the field has the danger color on its border |
| `disabled` | The HTML attribute | The field cannot get focus and cannot be changed |
| `id` | Text | Optional. The component makes an id when it is missing |

- Main native element: the `<input>`. Every other prop (`name`, `value`, `defaultValue`, `onChange`, `type`, `placeholder`, `required`) and `ref` go to it.
- `className` goes to the outermost element, a `<div>` that holds the label, the field and the message. The inner classes are `tui-input__label`, `tui-input__field`, `tui-input__error` and `tui-input__error-icon`.
- Screen reader: the label is a `<label>` linked to the field with `for` and `id`. With an error, the field has `aria-invalid="true"`, and `aria-describedby` points to the message, so the message is read with the field.
- It has no `"use client"`: it also renders in a Server Component.

### `Toggle`

A switch: a control that is on or off. It is not `ThemeToggle`, the button that changes the theme.

```tsx
import { Toggle } from "@toraline/ui";

<Toggle label="Send e-mails" checked={sendEmails} onChange={(event) => setSendEmails(event.target.checked)} />
```

| Prop | Values | Meaning |
|---|---|---|
| `label` | Text or elements | The visible name of the switch, shown next to it. It says what the switch controls and does not change with the state. A switch with no `label` needs `aria-label` |
| `checked` and `onChange` | The HTML attribute and the React event | The app holds the state: `checked` is `true` when the switch is on |
| `defaultChecked` | `true`, `false` | The state the switch starts in, when the app does not hold the state |
| `disabled` | The HTML attribute | The switch cannot get focus and cannot be changed |

- Main native element: an `<input type="checkbox" role="switch">`. Every other prop (`name`, `value`, `id`) and `ref` go to it.
- `className` goes to the outermost element, a `<label>` that holds the switch and its text. The inner classes are `tui-toggle__input`, `tui-toggle__track`, `tui-toggle__thumb`, `tui-toggle__check` and `tui-toggle__label`. The switch has its size in `em`, so a font size on the outermost element changes its size.
- Keyboard: Tab moves the focus to it, Space changes it. A click on the label also changes it.
- Screen reader: the role `switch` with the state of the checkbox, read as "on" or "off".
- A person who cannot see colors still sees the state: the circle is on the left when off, and on the right with a check mark when on.
- It has no `"use client"`: it also renders in a Server Component. With `onChange`, the file of the app that gives the function is a Client Component.

### `Tabs`

A row of tabs, and under it the content of the selected tab.

```tsx
import { Tabs } from "@toraline/ui";

<Tabs
  aria-label="Orders by kind"
  tabs={[
    { id: "all", label: "All", content: <AllOrders /> },
    { id: "open", label: "Open", content: <OpenOrders /> },
  ]}
/>
```

| Prop | Values | Meaning |
|---|---|---|
| `tabs` | A list of `{ id, label, content }` | The tabs, in the order they are shown. `id` is a name no other tab has. `label` is the text of the tab. `content` is what the page shows while the tab is selected |
| `defaultSelectedId` | The `id` of a tab | The tab that is selected at the start. When missing: the first tab |
| `selectedId` and `onSelectedIdChange` | The `id` of a tab, and a function that receives an `id` | The app holds the state. Without them, the component holds it |
| `aria-label` or `aria-labelledby` | Text, or the id of an element | The name of the row of tabs for a screen reader |

- Main native element: the outermost `<div>`. `className`, every other prop and `ref` go to it. The inner classes are `tui-tabs__list`, `tui-tabs__tab` and `tui-tabs__panel`.
- Keyboard: Tab moves the focus to the selected tab, and Tab again moves it to the content. The Left and Right arrow keys move to the tab before or after and select it; after the last tab comes the first. Home selects the first tab, End the last.
- Screen reader: the row has the role `tablist`, each tab the role `tab`, and the content the role `tabpanel`. The selected tab has `aria-selected="true"`, the others `"false"`. The content takes its name from the selected tab.
- Only the content of the selected tab is on the page.
- It is a Client Component, because it holds state.

### `BreadCrumbs`

Breadcrumbs are the path from the first page of the app to the current page, as a row of links.

```tsx
import { BreadCrumbs } from "@toraline/ui";

<BreadCrumbs
  crumbs={[
    { label: "Clients", href: "/clients" },
    { label: "Fernando Dias", href: "/clients/12" },
  ]}
/>
```

| Prop | Values | Meaning |
|---|---|---|
| `crumbs` | A list of `{ label, href }` | The steps of the path, in order. The last step is the current page: it is shown as text, larger, and its `href` is not used. A step with no `href` is also text |
| `linkComponent` | A component. When missing: `"a"` | The component that renders each link. It receives `href`, `className` and `children`. A Next.js app gives the `Link` of `next/link`, so a press does not load the whole page again |
| `aria-label` | Text. When missing: `"Breadcrumb"` | The name of the region for a screen reader |

- Main native element: the `<nav>`. `className`, every other prop and `ref` go to it. The inner classes are `tui-breadcrumbs__list`, `tui-breadcrumbs__item`, `tui-breadcrumbs__link`, `tui-breadcrumbs__text`, `tui-breadcrumbs__separator` and `tui-breadcrumbs__current`.
- Keyboard: Tab goes through the links. The current page is not a link and does not get focus.
- Screen reader: a navigation region with an ordered list. The current page has `aria-current="page"`. The `/` between steps has `aria-hidden="true"`, so it is not read.
- It has no `"use client"`: it also renders in a Server Component.

## Styling on top

The styles of the library are in the cascade layer `components`. A cascade layer is a named group of CSS rules with a fixed priority. A Tailwind CSS class (layer `utilities`) and the CSS of an app that is in no layer both win over the library's styles. Example: `<ThemeToggle className="rounded-full" />`.

Every component accepts `className`. The classes go on the outermost element of the component. A component with more than one element gives each inner element a class named `tui-<component>__<part>`, for example `tui-input__field`. An app can use these class names in its own CSS.

## Rules every component follows

These rules were decided in TOR-1009. The reasons are in [`docs/decisions.md`](../../docs/decisions.md). The folder [`src/template/`](src/template/README.md) is a small component that follows all of them: copy it to start a new component.

### Files

| File | Content |
|---|---|
| `src/<name>/<Name>.tsx` | The component |
| `src/<name>/<Name>.test.tsx` | Its tests |
| `src/<name>/index.ts` | What the folder exports |
| `css/<name>.css` | Its styles. `css/styles.css` imports the file |
| `src/index.ts` | Exports the component and its types from `@toraline/ui` |

### Variants, sizes and states

A variant is one of the looks of a component, for example `primary` or `danger`.

1. The variants are one list in the component's file, and the type comes from the list: `export const buttonVariants = ["primary", "secondary"] as const`. Sizes work the same way (`buttonSizes`). The lists are exported, so a test or a catalog can show every value. When the component's file starts with `"use client"`, the lists are in a second file with no `"use client"`, `src/<name>/<name>-options.ts`. Next.js does not let a Server Component read a value that a `"use client"` file exports; it can only render its components.
2. The component writes the variant and the size on its element as the attributes `data-variant` and `data-size`. The CSS selects them: `.tui-button[data-variant="primary"]`.
3. A state (disabled, loading, error, selected, on, open) is written once, as the HTML or ARIA attribute that a screen reader reads: `disabled`, `aria-busy`, `aria-invalid`, `aria-selected`, `checked`, `aria-expanded`. ARIA attributes are HTML attributes that describe an element to a screen reader. The CSS selects the same attribute, for example `.tui-input__field[aria-invalid="true"]`. The look and what a screen reader says cannot differ, because both come from one attribute.

### Props

1. The props type is the props of the native HTML element plus the component's own props: `ComponentProps<"button"> & { variant?: ButtonVariant }`. Each own prop has a short comment.
2. A prop has the name HTML or React already uses when one exists: `disabled`, `checked`, `href`, `onChange`.
3. `className` is joined with the helper `classNames("tui-<name>", className)` from `src/shared/class-names.ts`, and goes on the outermost element.
4. Every other prop goes to the main native element: the `<button>`, the `<input>`. The component's section in this file names that element.
5. `ref` is a normal prop, as React 19 allows, and points to the main native element. No component uses `forwardRef`.
6. A file starts with `"use client"` only when the component uses React state, an effect, or an event handler of its own. `"use client"` tells Next.js that the file runs in the browser. A component without it can also render in a Server Component.

### Behaviour and accessibility

1. A component uses the native HTML element that already has the behaviour: `<button>`, `<input>`, `<label>`, `<a>`, `<nav>`. The browser then gives the keyboard and the screen reader support.
2. Behaviour that HTML does not have (arrow keys between tabs, a menu) is written by hand in the component, following the pattern of the WAI-ARIA Authoring Practices Guide (https://www.w3.org/WAI/ARIA/apg/patterns/). The package uses no library of primitives. A library of primitives is a set of components with behaviour and no styles, for example Base UI, Radix or React Aria.
3. When a later component needs behaviour that is hard to write correctly (a dialog that keeps the focus inside, a select, a combobox, a tooltip or a menu that must move to stay on screen), the library to use is Base UI (`@base-ui/react`).
4. Every element that can get focus shows the focus ring: `outline: 2px solid var(--color-focus-ring); outline-offset: 2px;` under `:focus-visible`.
5. An icon that is only decoration has `aria-hidden="true"`. An icon is drawn with `currentColor`, so it has the color of the text.
6. A movement or a transition is inside `@media (prefers-reduced-motion: no-preference)`, so a person who asked the device for less motion gets none.

### Styles

1. Every rule is inside `@layer components`, and every class name starts with `tui-`.
2. A CSS variable in a component's styles is always a level 2 token of `@toraline/tokens`. A component never uses a level 1 token and never defines a variable of its own.
3. A color is always a color token. `currentColor` and `transparent` are allowed.
4. A font size is `--text-sm`, `--text-base` or `--text-lg`. A font is `--font-body`, `--font-heading` or `--font-mono`.
5. A padding, a margin and a gap are a multiple of the spacing unit: `calc(var(--spacing) * 4)`.
6. These are written as plain values, because they do not change with the theme: the width of a border or an outline in `px`, a line height, a font weight, a size in `em` or `%` (a size in `em` follows the font size of the component), a duration, and a `z-index`. A length in `rem` is never used.
7. Text on its background has a contrast of 4.5 or more in both themes. Each pair of text token and background token that a component uses is in the contrast test of `packages/tokens/src/tokens.test.ts`.

The test `src/styles.test.ts` checks rules 1 to 5 on every CSS file, and that a Tailwind class wins over the library's styles.

### What every component's test covers

The tests use Vitest, Testing Library and `@testing-library/user-event`, which presses keys the way a person does.

1. It renders, with the right role and accessible name. The accessible name is the text a screen reader says for the element.
2. Each variant and each size, from the exported lists.
3. Each state, read from the attribute a screen reader reads.
4. `className` from the app is on the outermost element, after the library's class.
5. Another native attribute reaches the main native element, and `ref` points to it.
6. The keyboard: every key the component answers to.
7. A component with no `"use client"` renders on the server (`renderToString`).

### After the code

1. The component is on the page of `apps/playground`, with every variant and state.
2. This file has the component's props and one short example.
