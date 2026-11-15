# @toraline.tech/ui

The styled React components of the Toraline component library.

| What | Import from | State |
|---|---|---|
| The parts that control the theme: a provider, a hook and a toggle button | `@toraline.tech/ui/theme` | Built in phase 2 |
| The components | `@toraline.tech/ui` | Built in phase 3 (TOR-997): Button, Input, Toggle, Tabs, BreadCrumbs, SplitButton. Phase 7 (TOR-1123) gives them the variants, sizes and props of the same components of the app Intraweb |
| The line that makes Tailwind CSS build the classes of everything above | `@toraline.tech/ui/tailwind.css` | One CSS file, imported once by the app |

The components are styled with Tailwind CSS 4 classes that read the tokens of [`@toraline.tech/tokens`](../tokens/README.md). The package has no CSS of its own for a component. So the app must use Tailwind CSS 4.

The default look is the look of the app Intraweb, an app of Toraline: its colors, its fonts (Inter for normal text, Poppins for headings and buttons), its radius sizes and its shadows. The tokens and the Tailwind classes have the names Intraweb uses. The library downloads no font: the app loads Inter and Poppins. Guide 1 of [`docs/guide.md`](../../docs/guide.md) shows how.

The rules every component follows are in [Rules every component follows](#rules-every-component-follows).

A theme is a set of colors, fonts, corner sizes and shadows. The page selects a theme with the attribute `data-theme` on `<html>`. The themes and their values are in [`@toraline.tech/tokens`](../tokens/README.md).

## Installation

The package is on npm since 2026-11-15. The first version is `0.1.0`.

After the first release:

```bash
npm install @toraline.tech/ui @toraline.tech/tokens
```

- Install both packages, in the same version. `@toraline.tech/ui` needs exactly its own version of `@toraline.tech/tokens`.
- The library is at version `0.x`: props and tokens may still change between versions.
- The app needs React 19 (`react` and `react-dom`) and Tailwind CSS 4 (`tailwindcss`).
- The package has ES modules only (files read with `import`), with type files for TypeScript.

Before the first release, an app can install the package files that `make pack` writes. The steps are at the start of guide 1 in [`docs/guide.md`](../../docs/guide.md).

## How to use the theme in a Next.js app

1. Import the CSS once, in the global CSS file (`app/globals.css`):

   ```css
   @import "tailwindcss";
   @import "@toraline.tech/tokens/css/tailwind.css";
   @import "@toraline.tech/ui/tailwind.css";
   ```

   All 3 lines are needed. The second line makes each token a Tailwind class, for example `bg-primary`. The third line tells Tailwind to read the built files of this package, so it builds the CSS of the classes that the components use. Tailwind does not read the folder `node_modules` by itself. Without the third line the components have no style.

2. In the root layout (`app/layout.tsx`), read the saved theme on the server, write it on `<html>`, and give it to the provider:

   ```tsx
   import { cookies } from "next/headers";
   import type { ReactNode } from "react";
   import { THEME_COOKIE_NAME, resolveTheme } from "@toraline.tech/tokens";
   import { ThemeProvider } from "@toraline.tech/ui/theme";
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
   import { ThemeToggle } from "@toraline.tech/ui/theme";

   export default function Page() {
     return <ThemeToggle />;
   }
   ```

The server writes `data-theme` in the HTML it sends, so the page never shows the wrong theme first. This working example is the app [`apps/playground`](../../apps/playground/README.md).

Reading a cookie in the root layout makes Next.js render every page at request time (dynamic rendering). An app that needs pages built once (static rendering) does not read the cookie on the server. It puts the script of `createThemeScript` from `@toraline.tech/tokens` inside `<head>`, and gives no `initialTheme` to the provider.

## The parts

All three come from `@toraline.tech/ui/theme`. They are Client Components: they run in the browser.

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
- A screen reader says the current theme and what a press does: `Theme: dark. Switch to light.` The prop `formatLabel={(theme, nextTheme) => "..."}` changes this text. Keep the text the button shows (`Theme: dark`) in it: a person who controls the device with the voice says the text they see.
- `children` replaces the text that is shown, for example with an icon.
- It has the look of the secondary Button in the size `md`.
- `className` adds classes, as described in [Styling on top](#styling-on-top). The button also accepts every other prop of `<button>`.

## The components

All of them come from `@toraline.tech/ui`. They need the 3 CSS lines of step 1 above. The page `/components` of [`apps/playground`](../../apps/playground/README.md) shows each one with every variant and state.

### `Button`

```tsx
import { Plus } from "lucide-react";
import { Button } from "@toraline.tech/ui";

<Button variant="secondary" size="sm" icon={Plus} onClick={addOrder}>
  New order
</Button>
```

| Prop | Values | Meaning |
|---|---|---|
| `variant` | `"primary"` (default), `"secondary"`, `"soft"`, `"danger"`, `"ghost"` | The look. `primary`: the main action. `secondary`: another action, with a border. `soft`: an action with a quiet background in the brand color. `danger`: an action that deletes. `ghost`: an action with no background and no border |
| `size` | `"sm"`, `"md"` (default), `"lg"` | The size. The button is at least 32 pixels high for `sm`, 40 for `md` and 48 for `lg` |
| `icon` | An icon component | An icon shown before the text. See [Icons](#icons). It is decoration: a screen reader skips it |
| `loading` | `true`, `false` (default) | `true` while the action is running. The button shows a spinner (a small turning circle) in the place of the icon, and a press does nothing |
| `disabled` | The HTML attribute | The button cannot get focus and cannot be pressed. It has half of its opacity |
| `type` | `"button"` (default), `"submit"`, `"reset"` | The HTML attribute. The default is `"button"`, so a button inside a form does not send the form by accident |

- The variants, the sizes, the paddings and the font (Poppins, weight 500) are the ones of the Button of the app Intraweb. The state `loading` is the library's own: Intraweb has none.
- Main native element: the `<button>`. Every other prop and `ref` go to it. `className` goes to it too. The spinner inside it has `data-slot="spinner"`.
- Keyboard: Tab moves the focus to it, Enter and Space press it.
- Screen reader: a loading button has `aria-busy="true"` and `aria-disabled="true"`. It keeps the keyboard focus, so a person who pressed it with the keyboard does not lose their place.
- The lists `buttonVariants` and `buttonSizes` and the types `ButtonProps`, `ButtonVariant` and `ButtonSize` are exported.
- It has no `"use client"`: a Server Component can render it and give it an icon component. Only its `<button>`, which stops the press of a loading button, runs in the browser. A function such as `onClick` still needs a Client Component, as every function does.

### `ButtonLink`

A link that looks like a Button. Use it when a press goes to another page.

```tsx
import Link from "next/link";
import { ButtonLink } from "@toraline.tech/ui";

<ButtonLink linkComponent={Link} href="/orders/new" variant="secondary">
  New order
</ButtonLink>
```

| Prop | Values | Meaning |
|---|---|---|
| `href` | An address | Where the link goes. It is the prop of the link component |
| `linkComponent` | A component. When missing: `"a"` | The component that renders the link. It receives `href`, `className`, `children` and every other prop. A Next.js app gives the `Link` of `next/link`, so a press does not load the whole page again. The library does not import Next.js |
| `variant` | The variants of Button. `"primary"` is the default | The look |
| `size` | The sizes of Button. `"md"` is the default | The size |
| `icon` | An icon component | An icon shown before the text. See [Icons](#icons) |

- It has the same classes as Button: both read them from one file.
- Main native element: the `<a>`, or the link component of the app. `className`, every other prop and `ref` go to it. With `linkComponent={Link}`, TypeScript accepts the props of that `Link`, for example `prefetch`.
- Keyboard: Tab moves the focus to it, Enter follows it.
- Screen reader: it is read as a link, not as a button.
- It has no state `disabled` and no state `loading`: a link cannot be disabled. A page that must not offer the link does not render it.
- The type `ButtonLinkProps` is exported.
- It has no `"use client"`: it also renders in a Server Component.
- Intraweb's own `ButtonLink` imports `next/link`. To move to this one, Intraweb adds `linkComponent={Link}`, or keeps a file of 5 lines that does it once: `export const ButtonLink = (props) => <UiButtonLink linkComponent={Link} {...props} />`.

### `IconButton`

A button that shows only an icon.

```tsx
import { Trash2 } from "lucide-react";
import { IconButton } from "@toraline.tech/ui";

<IconButton icon={Trash2} aria-label="Delete the order" onClick={deleteOrder} />
```

| Prop | Values | Meaning |
|---|---|---|
| `icon` | An icon component. Required | The icon. See [Icons](#icons) |
| `aria-label` | Text. Required | The name of the button for a screen reader. The button has no visible text, so TypeScript refuses an IconButton with no `aria-label` |
| `variant` | `"ghost"` (default), `"secondary"`, `"soft"`, `"primary"` | The look. `ghost`: no background and no border. `secondary`: a border. `soft`: a quiet background in the brand color. `primary`: the main action |
| `size` | `"sm"`, `"md"` (default), `"lg"` | A square of 32, 40 or 48 pixels, with an icon of 16, 20 or 24 pixels |
| `disabled` | The HTML attribute | The button cannot get focus and cannot be pressed. It has half of its opacity |
| `type` | `"button"` (default), `"submit"`, `"reset"` | The HTML attribute |

- The variants, the sizes and the colors are the ones of the IconButton of the app Intraweb.
- Main native element: the `<button>`. `className`, every other prop and `ref` go to it. It has no `children`.
- Keyboard: Tab moves the focus to it, Enter and Space press it.
- Screen reader: it says the text of `aria-label`. The icon has `aria-hidden="true"`.
- The lists `iconButtonVariants` and `iconButtonSizes` and the types `IconButtonProps`, `IconButtonVariant` and `IconButtonSize` are exported.
- It has no `"use client"`: it also renders in a Server Component.

### Icons

The library has no icon set and does not depend on one. A component with the prop `icon` receives a React component that draws one icon as an `<svg>`:

```tsx
import { Plus } from "lucide-react";

<Button icon={Plus}>New order</Button>
```

- The type is `IconComponent`, exported from `@toraline.tech/ui`: a component that accepts `className` and `aria-hidden`. Every icon of the package `lucide-react`, the icons the app Intraweb uses, has this shape. So does a small component of the app that returns an `<svg {...props}>`.
- The library gives the icon its size (a class such as `size-4`, 16 pixels) and `aria-hidden="true"`. The icon is drawn with `currentColor`, so it has the color of the text.
- Give the component, not an element: `icon={Plus}`, not `icon={<Plus />}`.
- The icons the library draws itself (the error icon of Field, the arrow of SplitButton) are small `<svg>` elements inside the components.

### `Field`

A field of a form: a label, one control, and under it a hint or an error message, all linked for a screen reader.

```tsx
import { Field, TextInput } from "@toraline.tech/ui";

<Field label="Client name" hint="As it is written on the invoice." error={nameError}>
  <TextInput name="name" />
</Field>
```

| Prop | Values | Meaning |
|---|---|---|
| `label` | Text or elements. Required | The visible name of the field, shown above the control. A click on it moves the focus to the control |
| `children` | One element, or a function. Required | The control: `<TextInput />`, a native `<select>`, a `<textarea>`. See "How a control gets linked" below |
| `hint` | Text or elements | A short help text, shown under the control while the field has no error |
| `error` | Text or elements | The error message, shown under the control with an icon, in the place of the hint |
| `optional` | `true`, `false` (default) | `true` for a field that a person may leave empty. The label then shows a mark |
| `optionalText` | Text. When missing: `"(optional)"` | The text of the mark. An app in another language gives it: `optionalText="(opcional)"` |
| `id` | Text | The id of the control. When missing: the id the control already has, or one that the component makes |

How a control gets linked:

1. When the control is the direct child, Field gives it 3 props: `id`, `aria-describedby` and `aria-invalid`. Every control of the library and every native control accepts them. The control keeps its own `aria-describedby` (Field adds to it) and its own `aria-invalid`.
2. When the control is not the direct child, give a function. It receives the 3 props: `<Field label="Amount">{(controlProps) => <div>R$ <TextInput {...controlProps} /></div>}</Field>`.
3. The id of the hint is the id of the control followed by `-hint`, and the id of the error message is the id followed by `-error`.

- The parts and their looks are the ones of the Field of the app Intraweb. Intraweb's usage, `<Field id="name" label="Nome"><TextInput id="name" /></Field>`, works unchanged. Two things differ: the text of the mark is English unless the app gives `optionalText`, and Field now writes `aria-describedby` and `aria-invalid` on the control, which Intraweb's screens wrote by hand.
- Main native element: the outermost `<div>`. `className`, every other prop and `ref` go to it. `id` is the exception: it is the id of the control. The inner parts have the attribute `data-slot` with the values `label`, `optional`, `hint`, `error` and `error-icon`.
- Screen reader: the label is a `<label>` linked to the control with `for` and `id`. The hint or the error message that is shown is read with the control. With an error the control has `aria-invalid="true"`.
- The hint and the mark have the color `text-tertiary`. On a card (`bg-surface`) its contrast is 4.97 (light theme) and 5.18 (dark theme). On the page background (`bg-page`) of the light theme it is 4.48, below the limit of 4.5: a value of Intraweb, recorded in [`docs/decisions.md`](../../docs/decisions.md).
- The types `FieldProps` and `FieldControlProps` are exported.
- It has no `"use client"`: it also renders in a Server Component. A function as `children` is then written in a Server Component too.

### `TextInput`

A text field: one line of text. It has no label of its own: put it inside [`Field`](#field).

```tsx
import { Search } from "lucide-react";
import { Field, TextInput } from "@toraline.tech/ui";

<Field label="Client name" error={nameError}>
  <TextInput name="name" />
</Field>

<TextInput aria-label="Search an order" type="search" icon={Search} size="sm" />
```

| Prop | Values | Meaning |
|---|---|---|
| `size` | `"md"` (default), `"sm"` | `md`: 48 pixels high with text of 16 pixels on a small screen, and 40 pixels with text of 14 pixels from the breakpoint `lg` of Tailwind CSS (a screen 1024 pixels wide or more). `sm`: 32 pixels, for a table or a row of filters. It replaces the HTML attribute `size` |
| `icon` | An icon component | An icon shown inside the field, on the left. See [Icons](#icons) |
| `type` | `"text"` (default), and every other type of `<input>` | The HTML attribute |
| `aria-invalid` | `true` | The field has the red border of a field that is not valid. Field sets it when it has an error |
| `disabled` | The HTML attribute | The field cannot get focus and cannot be changed. It has a quiet background and a quiet text |

- The sizes and the looks are the ones of the `TextInput` of the app Intraweb. The focus look is Intraweb's: the border in the focus color and a ring of 3 pixels, with no outline. A phone makes the page larger when a field with text smaller than 16 pixels gets the focus, which is why `md` has text of 16 pixels on a small screen.
- Main native element: the `<input>`. `className`, every other prop (`name`, `value`, `defaultValue`, `onChange`, `placeholder`, `required`, `readOnly`) and `ref` go to it. With an icon, the `<input>` is inside a `<div data-slot="wrapper">` as wide as its container, and `className` still goes to the `<input>`, as in Intraweb.
- Screen reader: inside Field, the label, the hint and the error message are linked to it. Alone, it needs `aria-label`.
- A read-only field (`readOnly`) has no look of its own.
- The list `controlSizes` and the types `TextInputProps` and `ControlSize` are exported. Every form control of the library has these sizes.
- It has no `"use client"`: it also renders in a Server Component. With `onChange`, the file of the app that gives the function is a Client Component.

### `Toggle`

A switch: a control that is on or off. It is not `ThemeToggle`, the button that changes the theme.

```tsx
import { Toggle } from "@toraline.tech/ui";

<Toggle label="Send e-mails" checked={sendEmails} onChange={(event) => setSendEmails(event.target.checked)} />
```

| Prop | Values | Meaning |
|---|---|---|
| `label` | Text or elements | The visible name of the switch, shown next to it. It says what the switch controls and does not change with the state. A switch with no `label` needs `aria-label` |
| `checked` and `onChange` | The HTML attribute and the React event | The app holds the state: `checked` is `true` when the switch is on |
| `defaultChecked` | `true`, `false` | The state the switch starts in, when the app does not hold the state |
| `disabled` | The HTML attribute | The switch cannot get focus and cannot be changed. The track has half of its opacity |

- Main native element: an `<input type="checkbox" role="switch">`. Every other prop (`name`, `value`, `id`) and `ref` go to it.
- `className` goes to the outermost element, a `<label>` that holds the switch and its text. The inner parts have the attribute `data-slot` with the values `input`, `track`, `thumb`, `check` and `label`. The switch is 36 pixels wide and 20 pixels high, the height of the checkbox of the app Intraweb, and its label has the small text size.
- Keyboard: Tab moves the focus to it, Space changes it. A click on the label also changes it.
- Screen reader: the role `switch` with the state of the checkbox, read as "on" or "off".
- A person who cannot see colors still sees the state: the circle is on the left when off, and on the right with a check mark when on.
- It has no `"use client"`: it also renders in a Server Component. With `onChange`, the file of the app that gives the function is a Client Component.

### `TabNav`

Tabs where each tab is a link to a route of the app. Use it to move between pages. To change the content inside one page, use [`Tabs`](#tabs).

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TabNav } from "@toraline.tech/ui";

const items = [
  { href: "/sales", label: "Overview", exact: true },
  { href: "/sales/orders", label: "Orders" },
  { href: "/sales/clients", label: "Clients" },
];

export function SalesTabs() {
  return <TabNav items={items} currentPath={usePathname()} linkComponent={Link} aria-label="Sales" />;
}
```

| Prop | Values | Meaning |
|---|---|---|
| `items` | A list of `{ href, label, exact }`. Required | The tabs, in the order they are shown. `href` is the address of the route. `label` is the text. `exact` is optional, see below |
| `currentPath` | Text. Required | The path of the page the person is on, for example `"/sales/orders/12"`. A Next.js app gives the result of `usePathname()` |
| `aria-label` | Text. Required | The name of the group of tabs for a screen reader |
| `variant` | `"primary"` (default), `"secondary"` | The look. `primary`: a row with a line under it, and a line in the brand color under the current tab. `secondary`: the segmented look, where the current tab is a raised white piece |
| `linkComponent` | A component. When missing: `"a"` | The component that renders each link. It receives `href`, `className`, `aria-current` and `children`. A Next.js app gives the `Link` of `next/link` |

- Which tab is the current one: the tab whose `href` is `currentPath`, or the start of it followed by `/`. So the tab `/sales/orders` is the current one on `/sales/orders/12`. A tab with `exact: true` is the current one only on its own route; give it to a first tab whose route is the start of the others (`/sales`).
- The two looks and their classes are the ones of the `TabNav` of the app Intraweb. Intraweb's `TabNav` reads the path itself with `usePathname` of Next.js. The library does not import Next.js, so the app gives `currentPath` and `linkComponent`, and the name is `aria-label` (Intraweb: `label`).
- Main native element: the `<nav>`. `className`, every other prop and `ref` go to it. Each link has `data-slot="link"`. With no item, the component renders nothing.
- Keyboard: Tab goes through the links, Enter follows one.
- Screen reader: a navigation region with links. The link of the current page has `aria-current="page"`. The tabs do not have the roles `tablist` and `tab`: those are for tabs that change the content inside one page.
- Many tabs: `primary` scrolls sideways on a narrow screen, with its right edge faded out, and goes to a second line from the breakpoint `md` of Tailwind CSS (768 pixels). `secondary` scrolls sideways.
- The list `tabNavVariants` and the types `TabNavProps`, `TabNavItem` and `TabNavVariant` are exported.
- It has no `"use client"`. The file of the app that calls `usePathname()` is a Client Component.

### `Tabs`

A row of tabs that changes the content inside one page. It has the segmented look: the selected tab is a raised white piece. To move between pages, use [`TabNav`](#tabnav).

```tsx
import { Tabs } from "@toraline.tech/ui";

// Uncontrolled: the component holds the state and shows the content.
<Tabs
  aria-label="Orders by kind"
  defaultValue="open"
  tabs={[
    { id: "all", label: "All", content: <AllOrders /> },
    { id: "open", label: "Open", content: <OpenOrders /> },
  ]}
/>

// Controlled: the app holds the state, and here it also shows the content.
<Tabs
  aria-label="Mode of the editor"
  value={mode}
  onChange={setMode}
  tabs={[
    { id: "write", label: "Write" },
    { id: "preview", label: "Preview" },
  ]}
/>
```

| Prop | Values | Meaning |
|---|---|---|
| `tabs` | A list of `{ id, label, content }`. Required | The tabs, in the order they are shown. `id` is a name no other tab has. `label` is the text of the tab. `content` is optional: what the component shows under the row while the tab is selected |
| `value` and `onChange` | The `id` of a tab, and a function that receives an `id` | Controlled: the app holds the state |
| `defaultValue` | The `id` of a tab | Uncontrolled: the component holds the state, and this tab is selected at the start. When missing: the first tab |
| `aria-label` or `aria-labelledby` | Text, or the id of an element | The name of the row of tabs for a screen reader |

- The look is the one of the `SegmentedTabs` of the app Intraweb. To move from it: `label` becomes `aria-label`, `items` becomes `tabs`, and the `key` of an item becomes `id`. `value` and `onChange` keep their names.
- When the `id`s are written as fixed texts (`as const`), TypeScript knows them: `onChange` receives `"write" | "preview"`, not any text.
- Main native element: the outermost `<div>`. `className`, every other prop and `ref` go to it. The inner parts have the attribute `data-slot` with the values `list`, `tab` and `panel`.
- Keyboard: Tab moves the focus to the selected tab, and Tab again moves it to the content. The Left and Right arrow keys move to the tab before or after and select it; after the last tab comes the first. Home selects the first tab, End the last.
- Screen reader: the row has the role `tablist`, each tab the role `tab`, and the content the role `tabpanel`. The selected tab has `aria-selected="true"`, the others `"false"`. The content takes its name from the selected tab.
- Only the content of the selected tab is on the page. A selected tab with no `content` has no `tabpanel`.
- Many tabs: the row scrolls sideways when it is wider than its container.
- The types `TabsProps` and `TabItem` are exported.
- It is a Client Component, because it holds state.

### `BreadCrumbs`

Breadcrumbs are the path from the first page of the app to the current page, as a row of links.

```tsx
import { BreadCrumbs } from "@toraline.tech/ui";

<BreadCrumbs
  crumbs={[
    { label: "Clients", href: "/clients" },
    { label: "Fernando Dias", href: "/clients/12" },
  ]}
/>
```

| Prop | Values | Meaning |
|---|---|---|
| `crumbs` | A list of `{ label, href }` | The steps of the path, in order. The last step is the current page: it is shown as text in the main text color, and its `href` is not used. A step with no `href` is also text |
| `linkComponent` | A component. When missing: `"a"` | The component that renders each link. It receives `href`, `className` and `children`. A Next.js app gives the `Link` of `next/link`, so a press does not load the whole page again |
| `aria-label` | Text. When missing: `"Breadcrumb"` | The name of the region for a screen reader |

- Main native element: the `<nav>`. `className`, every other prop and `ref` go to it. The inner parts have the attribute `data-slot` with the values `list`, `item`, `link`, `text`, `separator` and `current`.
- Keyboard: Tab goes through the links. The current page is not a link and does not get focus.
- Screen reader: a navigation region with an ordered list. The current page has `aria-current="page"`. The `/` between steps has `aria-hidden="true"`, so it is not read.
- It has no `"use client"`: it also renders in a Server Component.

### `SplitButton`

A main button for the main action, and next to it a small button that opens a menu with more actions.

```tsx
"use client";
import { SplitButton } from "@toraline.tech/ui";

<SplitButton
  onClick={downloadAll}
  menuPlacement="top"
  items={[
    { label: "Download the invoice", onSelect: downloadInvoice },
    { label: "Send by e-mail", onSelect: sendByEmail },
  ]}
>
  Download all
</SplitButton>
```

| Prop | Values | Meaning |
|---|---|---|
| `children` | Text or elements | The text of the main button |
| `onClick` | A function | The main action |
| `items` | A list of `{ label, onSelect, icon }` | The actions of the menu. `onSelect` is called when a person chooses the action. `icon` is optional and is shown before the text |
| `menuPlacement` | `"bottom"` (default), `"top"` | Where the menu opens: under the buttons, or above them (upwards) |
| `menuLabel` | Text. When missing: `"More options"` | The name a screen reader says for the button that opens the menu, and for the menu |
| `disabled` | The HTML attribute | Disables both buttons. They have half of their opacity |

- The two buttons have the look of the primary Button in the size `md`: 40 pixels high. The menu has the look of the menu of actions of the app Intraweb.
- Main native element: the main `<button>`. Every other prop and `ref` go to it.
- `className` goes to the outermost element, a `<div>` that holds the two buttons and the menu. The inner parts have the attribute `data-slot` with the values `main`, `trigger`, `arrow`, `menu`, `item` and `item-icon`.
- Keyboard, on the button that opens the menu: Enter, Space and Down arrow open the menu with the focus on the first action. Up arrow opens it with the focus on the last action.
- Keyboard, in the menu: the Up and Down arrows move between actions, and go around. Home goes to the first action, End to the last. A letter goes to the next action that starts with it. Enter and Space choose the action, close the menu and give the focus back to the button that opened the menu. Escape closes the menu and gives the focus back. Tab closes the menu and moves the focus to the next element of the page.
- A press outside the component also closes the menu.
- Screen reader: the button that opens the menu has `aria-haspopup="menu"` and `aria-expanded` (`"true"` while the menu is open). The menu has the role `menu`, and each action the role `menuitem`.
- The menu sits above the page content and does not push it down. Limit: the menu does not move by itself when there is no room on the chosen side. The app chooses the side with `menuPlacement`.
- The list `splitButtonMenuPlacements` and the types `SplitButtonProps`, `SplitButtonItem` and `SplitButtonMenuPlacement` are exported.
- It is a Client Component, because it holds state. The actions are functions, so the file of the app that uses it is a Client Component too.

## Styling on top

Every component accepts `className`. The classes go on the outermost element of the component, after the classes of the library.

1. **A Tailwind class of the app replaces the class of the library that sets the same CSS property.** Example: `<Button className="rounded-full">` has `rounded-full` and no longer has the library's `rounded-md`. The library `tailwind-merge` does this, inside every component. It works for a token class against a token class (`bg-surface` replaces `bg-primary`), and for a standard Tailwind class against a token class (`bg-red-500` replaces `bg-primary`). A class replaces only a class for the same CSS property: `text-brand` (a text color) does not remove `text-sm` (a font size), `border-brand` (a border color) does not remove `border` (a border width), and `bg-promo` does not remove the text color.
2. **A class replaces only a class with the same Tailwind variant.** A Tailwind variant is the part of a Tailwind class before the `:`, which says when the class applies. It is not a variant of a component. `bg-red-500` replaces `bg-primary`. It does not replace `hover:bg-primary-hover` or `disabled:bg-subtle`. To change the look of a state, give a class with the Tailwind variant of that state: `hover:bg-red-600`, `disabled:bg-red-200`.
3. **CSS of the app that is in no cascade layer wins too.** A cascade layer is a named group of CSS rules with a fixed priority. The Tailwind classes are in the layer `utilities`, and CSS in no layer has a higher priority than every layer. A class of the app that is inside `@layer components` or `@layer base` does not win.
4. **An inner part** of a component has the attribute `data-slot`, for example `data-slot="label"` on the `<label>` of Field. An app can select it in its own CSS: `.search [data-slot="label"] { text-transform: uppercase; }`.

## Rules every component follows

These rules were decided in TOR-1009, and the rules about styles in TOR-1205. The reasons are in [`docs/decisions.md`](../../docs/decisions.md). The folder [`src/template/`](src/template/README.md) is a small component that follows all of them: copy it to start a new component.

### Files

| File | Content |
|---|---|
| `src/<name>/<Name>.tsx` | The component |
| `src/<name>/<Name>.test.tsx` | Its tests |
| `src/<name>/index.ts` | What the folder exports |
| `src/index.ts` | Exports the component and its types from `@toraline.tech/ui` |

### Variants, sizes and states

A variant is one of the looks of a component, for example `primary` or `danger`.

The sizes have the names and the heights of Intraweb. A button (Button, ButtonLink, IconButton) is `sm`, `md` or `lg`: 32, 40 or 48 pixels high. A form control (TextInput) is `md` or `sm`, from the list `controlSizes`: `md` is 48 pixels on a small screen and 40 pixels from the breakpoint `lg`, and `sm` is 32 pixels. The default is `md`. A component that sits next to a button has the height of a button size: the two buttons of SplitButton and ThemeToggle are 40 pixels high.

1. The variants are one list in the component's file, and the type comes from the list: `export const buttonVariants = ["primary", "secondary"] as const`. Sizes work the same way (`buttonSizes`). The lists are exported, so a test or a catalog can show every value. When the component's file starts with `"use client"`, the lists are in a second file with no `"use client"`, `src/<name>/<name>-options.ts`. Next.js does not let a Server Component read a value that a `"use client"` file exports; it can only render its components.
2. The classes of each variant and of each size are one object in the component's file, with one text of Tailwind classes for each value: `const variantClass: Record<ButtonVariant, string> = { primary: "bg-primary text-inverse", ... }`. The type makes the build fail when a value has no classes. The objects are not exported.
3. The component also writes the variant and the size on its element as the attributes `data-variant` and `data-size`, so a test or the CSS of an app can select them.
4. A state (disabled, loading, error, selected, current, on, open) is written once, as the HTML or ARIA attribute that a screen reader reads: `disabled`, `aria-busy`, `aria-invalid`, `aria-selected`, `aria-current`, `checked`, `aria-expanded`. ARIA attributes are HTML attributes that describe an element to a screen reader. The class of the state has the Tailwind variant that selects the same attribute: `disabled:opacity-50`, `aria-invalid:border-invalid`, `aria-selected:bg-surface`, `aria-[current=page]:text-brand`, `peer-checked:bg-primary`. The look and what a screen reader says cannot differ, because both come from one attribute. The component does not choose the classes of a state in its code. One exception: a loading Button leaves out the class of the pointer over it (`hover:`), so that a color the app gave stays while it loads.

### Props

1. The props type is the props of the native HTML element plus the component's own props: `ComponentProps<"button"> & { variant?: ButtonVariant }`. Each own prop has a short comment.
2. A prop has the name HTML or React already uses when one exists: `disabled`, `checked`, `href`, `onChange`.
3. An icon is the prop `icon`, of the type `IconComponent` (`src/shared/icon.ts`): a component the app gives, never an element and never an icon set of the library. See [Icons](#icons).
4. `className` is joined after the library's classes with the helper `classNames(baseClass, sizeClass[size], variantClass[variant], className)` from `src/shared/class-names.ts`, and goes on the outermost element. One exception: the `className` of TextInput goes to its `<input>`, also when an icon puts the `<input>` inside a wrapper. The helper removes a class of the library when a later class sets the same CSS property.
5. Every other prop goes to the main native element: the `<button>`, the `<input>`. The component's section in this file names that element.
6. `ref` is a normal prop, as React 19 allows, and points to the main native element. No component uses `forwardRef`.
7. A relative import names the file with `.js`: `import { classNames } from "../shared/class-names.js"`, `export { Button } from "./button/index.js"`. The built type files keep the import as written, and TypeScript in an app that uses the Node module rules needs the full file name. `make check` fails when a built type file has a relative import without `.js`.
8. A file starts with `"use client"` only when the component uses React state, an effect, or an event handler of its own. `"use client"` tells Next.js that the file runs in the browser. A component without it can also render in a Server Component. A component that has the prop `icon` must not have `"use client"`: Next.js does not let a Server Component give an icon component to a Client Component. When such a component needs code that runs in the browser, that code is a second file with `"use client"`, as `src/button/ButtonElement.tsx`.
9. A component that renders a link (ButtonLink, TabNav, BreadCrumbs) has the prop `linkComponent`, with the default `"a"`. The library never imports Next.js.
10. A form control is linked to its label, hint and error message by [`Field`](#field), which gives it `id`, `aria-describedby` and `aria-invalid`. A control only has to pass these to its native element. Its box has the classes of `controlClassNames` (`src/shared/control.ts`).

### Behaviour and accessibility

1. A component uses the native HTML element that already has the behaviour: `<button>`, `<input>`, `<label>`, `<a>`, `<nav>`. The browser then gives the keyboard and the screen reader support.
2. Behaviour that HTML does not have (arrow keys between tabs, a menu) is written by hand in the component, following the pattern of the WAI-ARIA Authoring Practices Guide (https://www.w3.org/WAI/ARIA/apg/patterns/). The package uses no library of primitives. A library of primitives is a set of components with behaviour and no styles, for example Base UI, Radix or React Aria.
3. When a later component needs behaviour that is hard to write correctly (a dialog that keeps the focus inside, a select, a combobox, a tooltip or a menu that must move to stay on screen), the library to use is Base UI (`@base-ui/react`).
4. Every element that can get focus shows the focus ring: the classes of `focusRingClass` from `src/shared/focus-ring.ts` (`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus`). `outline-focus` is the class of the token `--border-focus`. One exception: a form control (TextInput) shows the focus look of Intraweb's controls, the border in the focus color and a ring of 3 pixels (`focus:border-focus focus:ring-3 focus:ring-info focus:outline-none`), from `src/shared/control.ts`.
5. An icon that is only decoration has `aria-hidden="true"`. An icon is drawn with `currentColor`, so it has the color of the text.
6. A class of a movement or a transition has the Tailwind variant `motion-safe:`, so a person who asked the device for less motion gets none.

### Styles

1. A component is styled only with Tailwind CSS 4 classes, written in its `.tsx` file. The package has no CSS file for a component. Its only CSS file is `css/tailwind.css`, which tells the Tailwind of an app to read the built files.
2. A class name is written in full, as one text: `"bg-primary"`. Tailwind reads the files as text, so it does not find a name that the code builds from parts (`"bg-" + color`).
3. A color is always a token class of its group: a background is `bg-<name>` (`bg-primary`, `bg-surface`), a text color is `text-<name>` (`text-primary`, `text-tertiary`), a border color is `border-<name>` (`border-default`), the focus outline is `outline-focus`, and the color of an icon is `text-icon`, `text-icon-strong` or `text-icon-brand`. `border-current`, `bg-current`, `border-transparent` and `bg-transparent` are allowed. A level 1 color (`bg-brand-700`), a standard Tailwind color (`bg-red-500`) and a raw color (`bg-[#f00]`) are never used.
   - When the app Intraweb has the same component, each part has the token that Intraweb's component uses. The choices for the 6 components are in the entry of TOR-1131 of [`docs/decisions.md`](../../docs/decisions.md).
4. A font size is `text-xs`, `text-sm`, `text-base` or `text-lg`, written with the line height: `text-xs/4` (a line of 16 pixels), `text-sm/5` (a line of 20 pixels, the line height Intraweb's `text-sm` has), `text-base/6` (24 pixels) or `text-base/normal`. A font is `font-body` (normal text), `font-heading` (a heading, a button, a tab) or `font-mono`. `font-heading` is Poppins, which the apps load in the weights 400, 500 and 600, so its weight is `font-normal`, `font-medium` or `font-semibold`, never `font-bold`. The text of a button, a tab and a link that looks like one is `font-heading text-sm/5 font-medium`: the values of Intraweb's text style `label`. The radius is `rounded-md` for a button or a field and `rounded-lg` for a menu; `rounded-xl` and `rounded-2xl` are for a card and a drawer. Two shapes are not tokens: a full circle or pill (`rounded-full`), and the track of the segmented look (`rounded-[10px]`, the value of Intraweb). The shadow is one of `shadow-sm`, `shadow-card`, `shadow-lg`, `shadow-xl` and `shadow-2xl`; a menu has `shadow-lg`.
5. A padding, a margin and a gap are a standard Tailwind spacing class (`px-4`, `gap-2`), which is a multiple of the token `--spacing`.
6. These are written as plain values, because they do not change with the theme: the width of a border or an outline (`border`, `border-2`, `outline-2`), a font weight (`font-bold`), a width in pixels that is not a step of the spacing scale (`border-[1.5px]`), a size in `em` or `%`, a duration, and a `z-index` (`z-10`). A length in `rem` is never used.
7. When two classes of one element set the same property in different states, the state that must win has the Tailwind variant that Tailwind writes later in the CSS. The order Tailwind uses: no Tailwind variant, `hover:`, `focus:`, `focus-visible:`, `disabled:`, then `aria-*:`, then a breakpoint (`md:`, `lg:`). When that order is not the one needed, the class names both conditions: `disabled:hover:border-default`.
8. An element that another class must select gets a marker class with the name of the component: `group/toggle`, `group/split-button`. `peer` needs no name.
9. An inner element has the attribute `data-slot` with the name of the part, so an app can select it.
10. Text on its background has a contrast of 4.5 or more in both themes. Each pair of text token and background token that a component uses is in the contrast test of `packages/tokens/src/tokens.test.ts`.

The test `src/tailwind.test.tsx` renders every component, and checks that Tailwind builds CSS for every class, rules 1, 3, 4 and 6 (no `rem`), the order of rule 7, and the Tailwind variant `motion-safe:`. The test `src/shared/class-names.test.ts` checks that a class of the app replaces the class of the library.

### What every component's test covers

The tests use Vitest, Testing Library and `@testing-library/user-event`, which presses keys the way a person does.

1. It renders, with the right role and accessible name. The accessible name is the text a screen reader says for the element.
2. Each variant and each size, from the exported lists.
3. Each state, read from the attribute a screen reader reads.
4. `className` from the app is on the outermost element, after the library's classes, and it replaces the library's class for the same CSS property.
5. Another native attribute reaches the main native element, and `ref` points to it.
6. The keyboard: every key the component answers to.
7. A component with no `"use client"` renders on the server (`renderToString`).

### After the code

1. The component is on the page of `apps/playground`, with every variant and state.
2. This file has the component's props and one short example.

## The form controls and the feedback components of phase 8

These components were added in phase 8 (TOR-1124). They come from `@toraline.tech/ui`, need the 3 CSS lines of [How to use the theme in a Next.js app](#how-to-use-the-theme-in-a-nextjs-app), and follow the [rules every component follows](#rules-every-component-follows). Each one has the parts, the classes and the measures of the same component of the app Intraweb. The page `/forms-feedback` of [`apps/playground`](../../apps/playground/README.md) shows each one with every variant and state.

### `Select`

A select: a control where a person chooses one value of a list. It has no label of its own: put it inside [`Field`](#field).

```tsx
import { Field, Select } from "@toraline.tech/ui";

<Field label="Kind of contract" error={kindError}>
  <Select name="kind" defaultValue="monthly">
    <option value="monthly">Monthly</option>
    <option value="hourly">By the hour</option>
  </Select>
</Field>

<Select aria-label="State" size="sm" className="w-auto" value={state} onChange={changeState}>
  <option value="open">Open</option>
  <option value="closed">Closed</option>
</Select>
```

| Prop | Values | Meaning |
|---|---|---|
| `size` | `"md"` (default), `"sm"` | The sizes of every form control (`controlSizes`): `md` is 48 pixels high on a small screen and 40 pixels from the breakpoint `lg`, `sm` is 32 pixels. It replaces the HTML attribute `size` |
| `children` | `<option>` and `<optgroup>` elements | The choices |
| `aria-invalid` | `true` | The select has the red border of a field that is not valid. Field sets it when it has an error |
| `disabled` | The HTML attribute | The select cannot get the focus and cannot be changed. It has a quiet background and a quiet text |

- It is a native `<select>`: the browser shows the list of choices and handles the keyboard. The library hides the arrow of the browser and shows its own, 12 pixels from the right edge.
- The box, the sizes and the focus, disabled and not valid looks are the ones of TextInput (`controlClassNames`), as in Intraweb.
- The arrow is an image inside a class, as in Intraweb. An image in a class cannot read a token, so its line is the grey `#667085` in every theme.
- Main native element: the `<select>`. `className`, every other prop (`name`, `value`, `defaultValue`, `onChange`, `required`) and `ref` go to it. A width class of the app (`w-auto`, `w-40`) replaces the full width.
- Screen reader: inside Field, the label, the hint and the error message are linked to it. Alone, it needs `aria-label`.
- The type `SelectProps` is exported. It has no `"use client"`.

### `Textarea`

A text field with more than one line. It has no label of its own: put it inside [`Field`](#field).

```tsx
import { Field, Textarea } from "@toraline.tech/ui";

<Field label="Notes" optional hint="200 characters at most.">
  <Textarea name="notes" rows={3} maxLength={200} />
</Field>
```

| Prop | Values | Meaning |
|---|---|---|
| `rows` | The HTML attribute | The height, in lines of text. When missing: 2, the value of the browser |
| `aria-invalid` | `true` | The textarea has the red border of a field that is not valid. Field sets it when it has an error |
| `disabled` | The HTML attribute | The textarea cannot get the focus and cannot be changed. It has a quiet background and a quiet text |

- It is a native `<textarea>` with the box and the focus, disabled and not valid looks of TextInput, as in Intraweb. It has one size and no prop `size`: text of 16 pixels on a small screen and 14 pixels from the breakpoint `lg`.
- Main native element: the `<textarea>`. `className`, every other prop (`name`, `value`, `defaultValue`, `onChange`, `placeholder`, `maxLength`, `readOnly`) and `ref` go to it.
- A person can change its size with the corner the browser shows. `className="resize-none"` removes it.
- Screen reader: inside Field, the label, the hint and the error message are linked to it. Alone, it needs `aria-label`.
- The type `TextareaProps` is exported. It has no `"use client"`.

### `DecimalInput`

A text field for a number with decimals: a price, a quantity, a rate. It has no label of its own: put it inside [`Field`](#field).

```tsx
"use client";
import { useState } from "react";
import { DecimalInput, Field, parseDecimalInput } from "@toraline.tech/ui";

const [priceText, setPriceText] = useState("");
const price = parseDecimalInput(priceText); // a number, null for an empty text, NaN for a text that is not a number
const priceError = price !== null && Number.isNaN(price) ? "Type a number, for example 12,50." : undefined;

<Field label="Price" error={priceError}>
  <DecimalInput name="price" value={priceText} onChange={(event) => setPriceText(event.target.value)} />
</Field>
```

| Prop | Values | Meaning |
|---|---|---|
| `size` | `"md"` (default), `"sm"` | The sizes of every form control, as in [`TextInput`](#textinput) |
| `icon` | An icon component | An icon shown inside the field, on the left. See [Icons](#icons) |
| `inputMode` | `"decimal"` (default), and the other values of the HTML attribute | The keyboard a phone shows. `decimal`: the digits and the decimal mark |
| `aria-invalid`, `disabled` | As in TextInput | The looks of a field that is not valid and of a disabled field |

- It is a [`TextInput`](#textinput) with `type="text"` and `inputMode="decimal"`, as in Intraweb. The types refuse the prop `type`. It is not `type="number"`: in some languages a browser refuses a comma in such a field, and the mouse wheel changes its value.
- Its value is the text the person typed. The field does not change the text and does not refuse a character. The app reads the number, and shows its own error message through Field.
- `parseDecimalInput(text)` reads the text as a number, the way Intraweb does. With a comma in the text, the comma is the decimal mark and every point is a mark between thousands: `"1.234,5"` is `1234.5`. With no comma, a point is the decimal mark: `"2.5"` is `2.5`. An empty text is `null`. A text that is not a number is `NaN`.
- `decimalToInput(value)` writes a number as the text of the field, with a comma: `0.4` is `"0,4"`. `null` and `undefined` are the empty text.
- The two functions follow the way a number is written in Brazil, the language of Intraweb. An English number with a comma between thousands (`"1,234.5"`) is not read correctly.
- Main native element: the `<input>`. `className`, every other prop and `ref` go to it, as in TextInput.
- The type `DecimalInputProps` is exported. It has no `"use client"`.

### `Checkbox` and `CheckboxControl`

`Checkbox` is a checkbox with its label. `CheckboxControl` is only the box, for a list or a table that has its own label.

```tsx
import { Checkbox, CheckboxControl } from "@toraline.tech/ui";

<Checkbox label="Send the invoice by e-mail" name="send" checked={send} onChange={changeSend} />

<CheckboxControl id="task-12" checked={done} onChange={changeDone} />
<label htmlFor="task-12">Buy the flowers</label>

<CheckboxControl aria-label="Select the order 12" />
```

| Prop | Component | Values | Meaning |
|---|---|---|---|
| `label` | `Checkbox` | Text or elements, required | The visible name, shown after the box. A press on it changes the box |
| `changed` | `CheckboxControl` | `true`, `false` (default) | `true` for a value a person changed that is not saved yet, for example in a table that is edited in place. The box has an orange border and ring |
| `checked`, `defaultChecked`, `onChange` | Both | The HTML attributes, as React uses them | `checked` with `onChange` controls the box from the app. `defaultChecked` sets only how it starts |
| `disabled` | Both | The HTML attribute | The box cannot get the focus and cannot be changed. It has half of its opacity |

- The box is a real `<input type="checkbox">`, drawn by the library: 20 pixels, a corner of 6 pixels, a border of 1.5 pixels. Checked, it has the color of the main action and a check mark. The Tab key moves the focus to it, the Space key changes it, and a screen reader says "checked" or "not checked".
- The keyboard focus shows the focus ring of the library (the outline), not the ring of a text field.
- `Checkbox`: the outermost element is the `<label>`, and `className` goes to it. `CheckboxControl`: the outermost element is a `<span>` with the size of the box, and `className` goes to it. In both, every other prop (`name`, `value`, `id`, `required`) and `ref` go to the `<input>`.
- `CheckboxControl` has no name of its own. Give it `aria-label`, or the `id` that a `<label>` of the app points to. Inside [`Field`](#field) it gets the label, the hint and the error message of the Field.
- A checkbox has no look for "not valid" and no state "partly checked" (indeterminate): Intraweb has neither.
- A box with `changed` has the attribute `data-changed="true"`.
- The types `CheckboxProps` and `CheckboxControlProps` are exported. Neither has `"use client"`.
