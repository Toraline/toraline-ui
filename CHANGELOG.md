# Changes

What changed in each version of `@toraline.tech/ui` and `@toraline.tech/tokens`, newest first. The two packages always have the same version, so one list covers both. The steps of a release are in [docs/releasing.md](docs/releasing.md).

The old package `@toraline/toraline-ui` (versions 0 and 1) is not in this list.

The date of a version is the date in the local time of the person who started the release. The releases so far were started from Brasília (UTC-3). The time that npm records for a version is in UTC, and can be the next day.

## 0.3.1 (not published yet)

Fixes found when the app Intraweb installed version 0.3.0 and compared 279 screenshots taken before and after (TOR-1223). After this version Intraweb needs no workaround, and the differences that version 0.3.0 recorded as known are gone. Nothing breaks: an app written for 0.3.0 builds unchanged. Two changes can be seen in an app that is not Intraweb; they are first in the list.

### Changed: what an app can see

- DataGrid, rows inside a row (`subRows`): on a screen less than 768 pixels wide, a cell of an item shows only its value, as in Intraweb. Version 0.3.0 showed the name of the column before each value.
- Dark theme, three colors are now Intraweb's, the same as in the light theme: the small bar at the top of a Modal shown as a sheet (`#d0d5dd`, was `#414651`), the dot of a neutral StatusBadge (`#98a2b3`, was `#61646c`) and the ring of a CheckboxControl with `changed` (`#fedf89`, was `#93370d`).

### Fixed

- Field: the space before the mark of an optional field is inside the mark, so the mark is where Intraweb draws it (it was about 0.3 pixels to the right).
- Field: a child that is not the control, for example a `<div>` around the control and a button, no longer receives `id`, `aria-describedby` and `aria-invalid`. Before, the `<div>` got the id of the control too, and a click on the label did not move the focus to the field. Field now finds the control inside by its id (`<Field id="x"><div><TextInput id="x" /></div></Field>`) and links the hint and the error message to it. A function as `children` still works.
- Popover: an element inside the panel with `autoFocus` gets the focus when the panel opens. Before, the focus stayed on the button.
- DataGrid: the field that chooses the number of rows of a page is as wide as its content (74 pixels with the sizes 10, 25, 50 and 100), as in Intraweb. It was 80 pixels. `selectComponent` now receives `className="w-full"` in the place of `"w-20"`.
- DataGrid: the row above the table always has its right part, also when it is empty, as in Intraweb. On a narrow screen the search field above a view (`renderView`) was 8 pixels wider.
- Text size of the page other than 100% (Intraweb offers 90%, 115% and 130%): a line of text has the height it has in Intraweb. Before, a line of `text-sm` was 23 pixels at 115% where Intraweb's is 22.98, and some lines moved by 1 pixel. The components now write a font size the way Intraweb does: alone (`text-sm`) where Intraweb writes it alone, and with a line height (`text-sm/5`) only where Intraweb uses a text style.

### New

- `@toraline.tech/tokens`: 3 level 2 color tokens with the same value in the light and the dark theme: `--bg-handle` (class `bg-handle`), `--data-neutral` (`bg-data-neutral` and the other classes of the data group) and `--border-changed-ring`. They are the 3 colors of the dark theme listed above. A theme of an app can change them. There are now 62 color tokens.
- `@toraline.tech/tokens`: the Tailwind preset writes the line height of `text-xs`, `text-sm`, `text-base` and `text-lg` into the class, as a ratio of the font size (Tailwind's own values). The computed line height of these classes in an app does not change. An app that sets `--text-sm--line-height` in its own `@theme` after the preset still wins.
- DataGrid: the labels `selectedCount`, `pageRange` and `pageOf` can return elements, not only a text. An app that writes them in the pieces Intraweb used gets the exact letters of Intraweb (the README of `@toraline.tech/ui` has the code).

### License

- The library is released under the MIT license (TOR-1200). Both packages have `"license": "MIT"` and the file `LICENSE`. The versions 0.1.0, 0.2.0 and 0.3.0 were published with no license file.

### Documentation

- A width class of the app (`w-24`, `w-auto`) on TextInput, DecimalInput, Select and Textarea wins over the full width of the control. It was already so; the README now states it with an example. In Intraweb before the library the full width won, so an app that moves from Intraweb's own components removes the width classes that did nothing.

## 0.3.0 (2026-11-15)

The DataGrid gets the parts of Intraweb's grid that version 0.2.0 left out (TOR-1209). Nothing breaks: a grid written for 0.2.0 works unchanged.

### New

- DataGrid: the filter of a column (TOR-1210). A column with `filter` has a small button in its header that opens a panel with a list of choices (`type: "options"`, with `defaultValues`) or a text field (`type: "text"`). The state of the grid (`DataGridState`, `defaultState`, `onStateChange`) has the new field `filters`. "Clear filters" puts every filter back to its default. New labels: `filterColumn`, `filterChoices`, `filterSelectAll`, `filterClear`, `filterContains`. New types: `DataGridColumnFilter`, `DataGridOption`, `DataGridFilters`, `DataGridFilterValue`.
- DataGrid: the menu "Columns" (TOR-1211). `columnsMenu` adds a button at the right of the toolbar that opens a list with a checkbox for each column. A column can be `required` (always shown, not in the menu) or `defaultHidden` (hidden until a person turns it on). The app can keep the choice: `hiddenColumns` gives the hidden columns and `onHiddenColumnsChange` reports each change. The README and the playground (`/data/grid-parts`) have an example that saves the choice in `localStorage`. New labels: `columns`, `visibleColumns`, `resetColumns`.
- DataGrid: a cell is edited in place (TOR-1212). A column with `editor` (`"text"`, `"number"`, `"select"`, `"checkbox"`) and `editOnClick` shows the library's TextInput, DecimalInput, Select or CheckboxControl in the cell. The app saves the value in the new prop `onSaveCell`, which returns a promise. The grid shows the pending state ("Saving…") and, when the promise is rejected, the error text, which the app can give with `getSaveErrorMessage`. Enter saves, Escape gives up, leaving the field saves. `canEdit` refuses single records. New labels: `cellLabel`, `editCell`, `saving`, `saveFailed`, `selectPlaceholder`. New types: `DataGridColumnEditor`, `DataGridCellValue`.
- DataGrid: rows inside a row (TOR-1213). `subRows` gives each row an arrow (a button with `aria-expanded`) that shows the items of the record in a small table under the row, with their own columns, buttons and footer. A cell of an item is edited in place with `subRows.onSaveCell`. New labels: `showSubRows`, `hideSubRows`, `subRowsCaption`, `noSubRows`. New type: `DataGridSubRows`. `DataGridProps` and `DataGrid` have a second generic type for the items, with a default, so `DataGridProps<Row>` still works.
- DataGrid: another view in the place of the table (TOR-1214). `renderView` receives the rows after the search and the filters and returns the view, for example a calendar. The search field and the toolbar stay above it, and the filters of the columns move to the toolbar as buttons with the name of their column.
- DataGrid: an example that keeps the state of the grid in the address of the page (TOR-1215). The library still imports no router. The README (`packages/ui/README.md`, "Keeping the state in the address of the page") and the playground (the route `/data/address`) have an adapter of 2 files for Next.js, built on `defaultState` and `onStateChange`. It uses the query parameter names of Intraweb: `busca`, `ordem`, `f-<column>`, `pagina`, `por-pagina`.
- DataGrid: the mode that edits the table (TOR-1216). `onSaveRow` adds the button "Edit table". In the mode every cell of a column with `editor` is a field, and one button saves each changed row as one: the app receives the record and only its changed cells, and returns a promise. The grid shows the pending state, and the error text of a refused row under that row. New labels: `editTable`, `noChanges`, `changedRows`, `cancelEditing`, `saveChanges`, `savingChanges`, `rowError`. New type: `DataGridRowChanges`.

### Changed

- The type `DataGridState` has the new field `filters`. An app that builds a full `DataGridState` object itself must add `filters: {}`. An app that only reads the state of `onStateChange`, or gives a part of it to `defaultState`, changes nothing.
- DataGrid: the row above the table has 2 groups, as in Intraweb: the search field, the toolbar of the screen and "Clear filters" on the left, and the menu "Columns" on the right. The element with `data-slot="toolbar"` is still the outermost one. Without the menu nothing looks different.

## 0.2.0 (2026-11-15)

The components get the shape of the same components of the app Intraweb: variants, sizes, props, measures and states (phase 7, TOR-1123). After this version a screen of Intraweb can import these components from the library and look the same.

### Breaking changes, with what an app must change

- **`Input` is removed. `Field` and `TextInput` replace it.** `Input` was a text field with its own label and error message. Now `Field` has the label, the hint and the error message, and `TextInput` is only the text field, as in Intraweb. To move an app:

  | Before | After |
  |---|---|
  | `import { Input } from "@toraline.tech/ui"` | `import { Field, TextInput } from "@toraline.tech/ui"` |
  | `<Input label="Title" name="title" error={titleError} />` | `<Field label="Title" error={titleError}><TextInput name="title" /></Field>` |
  | `<Input aria-label="Search" name="search" />` (no visible label) | `<TextInput aria-label="Search" name="search" />` |
  | `id="title"` on `Input` | `id="title"` on `Field` or on `TextInput`; one is enough |
  | `className` on `Input` (it went to the element around the label, the field and the message) | `className` on `Field` for that element; `className` on `TextInput` for the `<input>` |
  | `ref`, `name`, `value`, `onChange`, `placeholder`, `disabled`, `type` on `Input` | The same props on `TextInput` |
  | CSS of the app that selects `[data-slot="field"]` | Select the `<input>` with a class the app gives to `TextInput` |
  | The type `InputProps` | `TextInputProps` and `FieldProps` |

  What looks different: the field is 48 pixels high on a small screen and 40 pixels on a screen 1024 pixels wide or more (it was about 50 pixels everywhere). With the focus it shows a border and a ring (it showed an outline). The error icon is a triangle (it was a circle with a cross). A field with an error keeps its red border while it is disabled.

- **Tabs: the props of the selected tab have new names.** `selectedId` is now `value`, `onSelectedIdChange` is now `onChange`, and `defaultSelectedId` is now `defaultValue`. The app renames the 3 props. The behaviour is the same.
- **Tabs: the look is the segmented control of Intraweb.** The row is a quiet rounded track, and the selected tab is a raised white piece. It was a row with a line under the selected tab; that look is now the variant `primary` of TabNav, for tabs that are links to routes. The font size of a tab is 14 pixels (it was 16).
- **Toggle: the size is fixed, and the label is smaller.** The switch is 36 pixels wide and 20 pixels high, and its label has 14 pixels. Before, the switch had its size in `em`: a font size class on Toggle (`className="text-lg"`) made the switch larger. Now such a class changes only the label. A disabled switch has half of its opacity (it was grey).
- **BreadCrumbs: smaller text.** The text has 14 pixels in the weight 500 (it was 16 pixels, bold), and the current page has the same size as the links (it was larger). The app changes nothing.
- **SplitButton: the sizes of Button.** The two buttons are 40 pixels high with text of 14 pixels, as the primary Button in the size `md`. Disabled buttons have half of their opacity (they were grey). The arrow is a thin line. The actions of the menu have the weight 400 (they were bold) and less padding, as the menu of actions of Intraweb. The app changes nothing.
- **ThemeToggle: the look of the secondary Button in the size `md`.** 40 pixels high, text of 14 pixels, no pointer cursor.
- **Button: new sizes.** The heights are now 32 pixels (`sm`), 40 (`md`) and 48 (`lg`), with the paddings of Intraweb. The font size is 14 pixels for `sm` and `md` (it was 16 for `md`) and 16 for `lg` (it was 18). The app changes nothing; a layout that depended on the old heights must be looked at.
- **Button: a disabled button has half of its opacity**, in the colors of its variant, as in Intraweb. It was grey for every variant. An app that gave `disabled:` color classes to a Button can remove them.
- **Button: no pointer cursor.** The pointer over a button is the normal arrow, as in Intraweb and as Tailwind CSS 4 sets it. An app that wants the hand gives `className="cursor-pointer"`.

### New

- Button: the variants `soft` (a quiet background in the brand color) and `ghost` (no background and no border). The list `buttonVariants` now has 5 values: `primary`, `secondary`, `soft`, `danger`, `ghost`.
- Button: the prop `icon`, an icon component shown before the text: `<Button icon={Plus}>`. An icon of the package `lucide-react` works as it is. The library does not depend on `lucide-react`. The type is `IconComponent`.
- Button has no `"use client"` any more, so a Server Component can give it an icon component. Only its `<button>` runs in the browser.
- ButtonLink: a link that looks like a Button, with the same variants, sizes and icon. It renders an `<a>`, or the link component the app gives in `linkComponent`, for example the `Link` of `next/link`. The library does not import Next.js.
- IconButton: a button that shows only an icon, with the variants `ghost`, `secondary`, `soft` and `primary` and the sizes `sm`, `md` and `lg` (32, 40 and 48 pixels). The types require `aria-label`.
- Field: wraps any form control with a label, a hint, an error message with its icon, and the mark of an optional field. It links them to the control for a screen reader: `id`, `aria-describedby` and `aria-invalid`.
- TextInput: a text field with the sizes `md` and `sm`, an icon on the left (`icon`), and the focus, disabled and not valid looks of Intraweb's text field. The list `controlSizes` and the type `ControlSize` are the sizes of every form control.
- TabNav: tabs where each tab is a link to a route, in two looks: `primary` (a line under the current tab) and `secondary` (the segmented control). The app gives the current path (`currentPath`) and its link component (`linkComponent`). The current tab has `aria-current="page"`.
- Tabs: `content` of a tab is optional. An app that shows the content itself gives no content and reads the selected tab from `value`. The type of `value` is the ids of the tabs when they are written as fixed texts.
- `@toraline.tech/tokens`: the token `--text-xs` (the class `text-xs`, 12 pixels), the font size of the hint of Field. `createTheme` accepts `textSizes.xs`. There are now 76 level 2 tokens. A theme that an app built with `createTheme` gets the token by itself.
- Select (phase 8, TOR-1124): a native `<select>` with the box, the sizes `md` and `sm` and the focus, disabled and not valid looks of TextInput, and the arrow of Intraweb's select. It goes inside Field.
- Textarea (phase 8): a native `<textarea>` with the box and the focus, disabled and not valid looks of TextInput. It goes inside Field.
- DecimalInput (phase 8): a TextInput for a number with decimals, with the decimal keyboard of a phone. The functions `parseDecimalInput` (the typed text as a number, with a comma or a point as the decimal mark) and `decimalToInput` (a number as the text of the field) come with it.
- Checkbox and CheckboxControl (phase 8): a checkbox with its label, and only the box (20 pixels) for a list or a table. The box is a real `<input type="checkbox">`. `changed` on CheckboxControl marks a value that is not saved yet.
- StatusBadge (phase 8): a badge with the state of a thing, in the variants `neutral`, `success`, `warning`, `error` and `info`, with an optional dot.
- CountBadge (phase 8): a small pill with a number, in the variants `warning` and `brand`. `label` says what the number means to a screen reader.
- Panel (phase 8): the card that groups content, with an optional title, subtitle and actions.
- EmptyState (phase 8): what a list or a page shows when it has nothing to show: an icon, a title, a text and one action.
- ProgressBar and ProgressRing (phase 8): how much of a whole is done, as a line or as a circle, in the tones `brand`, `success`, `warning` and `danger`. The ring has the sizes `md` and `sm`. A screen reader says the label and the value. StatCard gets the prop `progress`, a progress bar at the bottom of the card.
- StatCard (phase 8): a card with one number, its label, an icon and how the number changed, in the tones `default` and `tinted`.
- `@toraline.tech/tokens` (phase 8): the tokens `--text-2xl` (the class `text-2xl`, 24 pixels) and `--text-3xl` (the class `text-3xl`, 32 pixels), the font sizes of the number of StatCard. `createTheme` accepts `textSizes["2xl"]` and `textSizes["3xl"]`. There are now 78 level 2 tokens. With the preset, the class `text-3xl` is 32 pixels; with Tailwind CSS alone it is 30 pixels. An app that uses `text-3xl` with the preset gets text 2 pixels larger.
- Overlays (phase 9, TOR-1125). An overlay is a part of the screen that opens above the page. They are written by hand, from the overlays of Intraweb, and an app sets up nothing for them.
- `useAnchoredPanel`: a hook that places a floating panel (a menu, a popover, a filter) next to the button that opened it, on the other side when there is no room, and inside the window. `computeAnchoredPosition` is the same rule as a plain function.
- CloseButton: the button with a cross that closes a dialog or a side panel. Its name for a screen reader is `"Close"` unless the app gives `aria-label`.
- Modal: a dialog above the page, in the sizes `md`, `lg`, `xl` and `full`. The focus goes into it, Tab stays inside, Escape closes only the newest overlay, and the focus goes back to the element that opened it.
- Drawer: a panel on the right side of the screen with a footer that stays at the bottom. It leaves the page next to it usable. It has the same 3 focus rules as Modal. While it is open, `<body>` has the attribute `data-drawer-open`.
- DiscardConfirmation: the question before something a person typed is lost. Modal and Drawer show it by themselves when they get the prop `discardConfirmation` with its 4 texts.
- DeleteOverlay: the dialog that asks before something is deleted, with the states `pending`, `error` and `blocked`. Every text of the 2 confirmation dialogs is a prop of the app.
- ActionMenu: a button (3 dots, or a text with an arrow) that opens a menu of actions next to it. The menu and the menu of SplitButton are the same code.
- SplitButton: Escape in its menu no longer reaches a Modal or a Drawer that the SplitButton is in, so the key closes only the menu. Nothing else changed.
- Popover: a button with a floating panel under it. Escape and a press outside close it. It opens above when there is no room below, and stays inside the window.
- Tooltip: a small label next to an element, shown on hover and on keyboard focus. A screen reader says its text as the description of the element. Escape hides it.
- DataTable, with the parts `Tr`, `Th`, `Td`, `ActionsTh` and `DataTableMessage`: a real `<table>` inside a card, with the look of Intraweb's DataTable. The table needs a name (`caption`, `aria-label` or `aria-labelledby`). `Th` and `Td` have `align`; `Tr` has `selected` (the row of the open record, `aria-current="true"`) and `hoverable`; `ActionsTh` is the header of the column of the buttons of each row; `DataTableMessage` is the row of an empty or a loading table. A table wider than its box scrolls sideways and can then be scrolled with the keyboard. `stackOnMobile` shows each row as a block on a screen less than 768 pixels wide (phase 10, TOR-1126).
- DataGrid: a table of records with a search field, a sort by column (`aria-sort`), pages, a selection with a bar of actions, a footer row with totals, groups of rows, a row of extra content, and the states empty, no result and loading. It has the look of Intraweb's DataGrid. The app gives every record; the grid loads no data. Its texts are the prop `labels`, with English defaults. `defaultState` and `onStateChange` let an app keep the search, the sort and the page in the address of the page. `checkboxComponent` and `selectComponent` take the app's checkbox and select; the defaults are the ones of the browser. Not moved from Intraweb yet: the filter of a column, the choice of columns, the editing of cells and the rows inside a row (phase 10, TOR-1126).
- ListItem: one row of a list of records, with an icon, a title, a second line, a value and a status. With `href` it is a link (the app gives its link component in `linkComponent`), with only `onClick` a button, with neither a row that cannot be pressed. The selected item has `aria-current="true"`. It has the look of Intraweb's ListItem (phase 10, TOR-1126).
- DetailPanel: the detail of the selected record, shown next to a list: an `<aside>` named by its title, with a status, a close button (`onClose`, `closeLabel`), the fields of the record as a list of names and values, more content and a footer for the actions. It is 360 pixels wide from a screen 1280 pixels wide. It has the look of Intraweb's DetailPanel (phase 10, TOR-1126).

## 0.1.0 (2026-11-15)

The first version of the new library. Inside Toraline it is called "V2". It is a pre-release: tested in Toraline's own apps, not used for real yet. Version `1.0.0` comes after the full rebrand. It replaces `@toraline/toraline-ui`, and nothing of the old package works unchanged with it.

- `@toraline.tech/tokens`: the design tokens as CSS files, the themes `light` and `dark`, the function `createTheme` that builds the theme of an app, the functions that save the chosen theme in a cookie, and the Tailwind CSS 4 preset. The tokens have the names and the values of the design system of the app Intraweb.
- `@toraline.tech/ui`: the components Button, Input, Toggle, Tabs, BreadCrumbs and SplitButton, the CSS line that makes Tailwind CSS build their classes (`@toraline.tech/ui/tailwind.css`), and the theme provider, hook and toggle (`@toraline.tech/ui/theme`).
- Needs React 19 and Tailwind CSS 4.

### The default look is the look of Intraweb (phase 6, TOR-1122)

Intraweb is an app of Toraline. Since this change the default look of the library is the look of Intraweb, and the tokens and the Tailwind classes have the names Intraweb uses. Nothing was published before this change, so no published version breaks. These points break an app that used the packages from `make pack` before 2026-11-15. The full table old name → new name is in [docs/decisions.md](docs/decisions.md), in the entries of TOR-1131 and TOR-1134.

- **Breaking: the level 2 color tokens have new names.** The 17 color tokens are replaced by 59 tokens in 5 groups, with the names of Intraweb: `--bg-*` (a background), `--text-*` (a text), `--border-*` (a border), `--icon-*` (an icon), `--data-*` (a chart or a progress bar). Examples: `--bg-page`, `--bg-surface`, `--bg-primary`, `--text-primary`, `--text-inverse`, `--border-default`, `--border-focus`.
- **Breaking: the Tailwind classes of the colors have new names, and a token is a class of its group only.** `--bg-primary` is the class `bg-primary` and nothing else; `--text-primary` is `text-primary`; `--border-default` is `border-default`; `--icon-default` is `text-icon`; `--border-focus` is also `outline-focus`. Two class names existed before and now mean something else: `text-primary` is the main text color (it was the brand color; the brand color as text is now `text-brand`), and `bg-surface` is a card or a field (it was the page; the page is now `bg-page`).
- **Breaking: the level 1 colors are the color scales of Intraweb.** `--color-slate-*`, `--color-brand-*`, `--color-pink-*`, `--color-cream-100`, `--color-green-*`, `--color-orange-*`, `--color-red-*`. The first colors of the library are removed. Each scale color is also a Tailwind color (`bg-brand-700`), and replaces the Tailwind color with the same name (`red-600`).
- **Breaking: the light and the dark theme have the values of Intraweb.** The main color is a blue-grey (`#42637c` in the light theme, `#8eaec5` in the dark theme). It was another color.
- **Breaking: one radius token and one shadow token become 4 and 5.** `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl` (classes `rounded-md` to `rounded-2xl`) and `--shadow-sm`, `--shadow-card`, `--shadow-lg`, `--shadow-xl`, `--shadow-2xl` (classes with the same names). The level 1 radius and shadow sizes are removed.
- **Breaking: the default fonts are Inter (normal text) and Poppins in the weights 400, 500 and 600 (headings and buttons).** They were the fonts of the device. The library downloads no font: the app loads the two fonts, with `next/font` and the variables `--font-inter` and `--font-poppins`, or with font files whose family names are `Inter` and `Poppins`. The guide shows both ways. An app that loads no font shows a font of the device.
- **Breaking: `createTheme`, the keys of `colors`.** A key is now the full name of a token without the two dashes: `"bg-primary"`, not a name without its group. A new name that starts with `bg-`, `text-`, `border-`, `icon-` or `data-` adds a token of that group and one Tailwind class (`"bg-promo"` adds `--bg-promo` and `bg-promo`). Any other new name still adds `--color-<name>`, a color for every CSS property. `createTheme` throws an error for a name with no group that is the end of a class of the library, for example `primary`; the error names the token to write.
- **Breaking: `createTheme`, the field `radius`.** One value now changes `--radius-md`. An object changes each size: `{ md, lg, xl, "2xl" }`.
- **Breaking: `createTailwindTheme`** writes a color of one group as a line of a block `@theme inline`. An app does not read that text, so an app changes nothing.
- **Breaking: the type `ThemeColorName`** is now the name of a color token (`"bg-primary"`). `ThemeTokenName` and `themeTokenNames` have the new names. The object `primitives` has the new level 1 names.
- **Breaking: the look of the 6 components.** Each part has the token of the same part of Intraweb's component. The `danger` Button is red text on a white background with a red border (it was a red background). The `secondary` Button and the field of Input have a grey border. A switch that is on has the main color (it was green). A selected tab has the brand color. Buttons and tabs have the font Poppins in the weight 500. Props and behaviour do not change.
- New: `createTheme` accepts `shadows` (`sm`, `card`, `lg`, `xl`, `2xl`).
- New: the 9 text styles of Intraweb, as classes of the Tailwind preset: `heading-page`, `heading-section`, `heading-card`, `display-number`, `display-number-sm`, `label`, `label-lg`, `label-sm`, `caption-overline`. The same values are the object `textStyles`.
- New: the class `font-sans` for `--font-body`, the name Intraweb uses.
- New: the list `colorTokenNames` and the type `ColorTokenName`.
- Known: some pairs of Intraweb's colors have a contrast below the accessibility limits, for example the border of a field (1.24 in the light theme; the limit for the border of a control is 3). The values were not changed. The table is in `packages/tokens/README.md`.

What an app that used the earlier packages must change:

1. Rename the token classes and the CSS variables in its own code, with the table of `docs/decisions.md`.
2. Rename the keys of `colors` in its `theme.config.ts` to full token names.
3. Load Inter and Poppins (guide 1, steps 4 and 5), or set its own fonts through `createTheme`.
4. Put `bg-page text-primary` on `<body>`.
- The components are styled with Tailwind CSS 4 classes that read the tokens. The CSS file of an app has 3 lines: `@import "tailwindcss";`, `@import "@toraline.tech/tokens/css/tailwind.css";` and `@import "@toraline.tech/ui/tailwind.css";`. A Tailwind class that an app gives in `className` replaces the class of the library for the same CSS property.
