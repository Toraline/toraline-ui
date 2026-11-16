import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Archive, Pencil, Plus } from "lucide-react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button, DataGrid, IconButton } from "@toraline.tech/ui";
import type {
  DataGridCellValue,
  DataGridColumn,
  DataGridProps,
  DataGridRowChanges,
  DataGridState,
} from "@toraline.tech/ui";

type Product = {
  id: number;
  name: string;
  category: string;
  supplier: string | null;
  stock: number;
  price: number;
  active: boolean;
};

const names = [
  ["Pão de queijo", "Bakery"],
  ["Espresso coffee", "Drinks"],
  ["Orange juice", "Drinks"],
  ["Carrot cake", "Bakery"],
  ["Chicken pie", "Savory"],
  ["Açaí bowl", "Desserts"],
  ["Cheese sandwich", "Savory"],
  ["Iced tea", "Drinks"],
  ["Chocolate brigadeiro", "Desserts"],
  ["Tapioca with coconut", "Bakery"],
  ["Mineral water", "Drinks"],
  ["Ham croissant", "Savory"],
] as const;
const suppliers = ["Minas Dairy", "Serra Coffee", null, "Sweet Farm"];

/** 34 products, made from 12 names, so the stories have more than one page. */
const products: Product[] = Array.from({ length: 34 }, (_, index) => {
  const [name, category] = names[index % names.length] ?? names[0];
  const size = index < names.length ? "" : ` ${["large", "family size"][Math.floor(index / names.length) - 1]}`;
  return {
    id: index + 1,
    name: `${name}${size}`,
    category,
    supplier: suppliers[index % suppliers.length] ?? null,
    stock: (index * 37) % 120,
    price: 4.5 + ((index * 13) % 40) / 2,
    active: index % 7 !== 3,
  };
});

const money = new Intl.NumberFormat("en", { style: "currency", currency: "BRL" });

const columns: DataGridColumn<Product>[] = [
  {
    id: "name",
    header: "Product",
    cell: (product) => <span className="font-medium text-primary">{product.name}</span>,
    sortValue: (product) => product.name,
    searchValue: (product) => product.name,
  },
  {
    id: "category",
    header: "Category",
    cell: (product) => product.category,
    sortValue: (product) => product.category,
    searchValue: (product) => product.category,
  },
  {
    id: "supplier",
    header: "Supplier",
    cell: (product) => product.supplier ?? "—",
    sortValue: (product) => product.supplier,
  },
  {
    id: "stock",
    header: "Stock",
    align: "right",
    cell: (product) => product.stock,
    sortValue: (product) => product.stock,
    footer: (rows) => rows.reduce((sum, product) => sum + product.stock, 0),
  },
  {
    id: "price",
    header: "Price",
    align: "right",
    cell: (product) => money.format(product.price),
    sortValue: (product) => product.price,
  },
];

/**
 * A table of records with a search field, a sort by column, pages, a selection
 * with actions for the selected rows, a footer row with totals and groups of
 * rows. The app gives every record; the grid searches, sorts and cuts them into
 * pages in the browser. Each feature is turned on by its prop or by a field of
 * a column. The table is a DataTable: on a screen less than 768 pixels wide,
 * each row is a block.
 */
const meta = {
  title: "Components/DataGrid",
  component: DataGrid<Product>,
  args: {
    caption: "Products",
    columns,
    rows: products,
    getRowKey: (product) => product.id,
    getRowLabel: (product) => product.name,
    locale: "en",
  },
  argTypes: {
    columns: { control: false },
    rows: { control: false },
    groups: { control: false },
    toolbar: { control: false },
    checkboxComponent: { control: false },
    selectComponent: { control: false },
  },
} satisfies Meta<DataGridProps<Product>>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Only the columns and the rows: a table with a sort on the columns that have "sortValue". */
export const Default: Story = {
  args: { rows: products.slice(0, 6) },
};

/**
 * The usual list of a screen: a search field, a button of the screen in the
 * toolbar, the sort, pages of 10 rows, a footer with the total of the stock,
 * and a button in each row. The story sorts by the price and goes to the second page.
 */
export const SearchSortAndPages: Story = {
  args: {
    search: { placeholder: "Search the products" },
    toolbar: (
      <Button size="sm" icon={Plus}>
        New product
      </Button>
    ),
    pageSize: 10,
    rowActions: (product) => (
      <IconButton icon={Pencil} size="sm" aria-label={`Edit ${product.name}`} />
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Showing 1–10 of 34")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Price" }));
    await expect(canvas.getByRole("columnheader", { name: "Price" })).toHaveAttribute("aria-sort", "ascending");
    await userEvent.click(canvas.getByRole("button", { name: "Next page" }));
    await expect(canvas.getByText("2 of 4")).toBeVisible();
  },
};

/** The column "Supplier" sorted from Z to A. A product with no supplier is at the end in both directions. */
export const SortedDescending: Story = {
  args: {
    rows: products.slice(0, 8),
    defaultState: { sort: { columnId: "supplier", descending: true } },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("columnheader", { name: "Supplier" })).toHaveAttribute(
      "aria-sort",
      "descending",
    );
  },
};

/**
 * A checkbox in each row and one in the header. While a row is selected, a bar
 * shows the number of selected rows and the actions of the app. The checkbox is
 * the one of the browser: the library's Checkbox (phase 8) is given in
 * "checkboxComponent" when it exists. The story selects two rows.
 */
export const Selection: Story = {
  args: {
    rows: products.slice(0, 6),
    selection: {
      actions: (rows, clear) => (
        <Button size="sm" variant="secondary" icon={Archive} onClick={clear}>
          Archive {rows.length}
        </Button>
      ),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select Espresso coffee" }));
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select Carrot cake" }));
    await expect(canvas.getByRole("region", { name: "Bulk actions" })).toBeVisible();
    await expect(canvas.getByRole("status")).toHaveTextContent("2 selected");
  },
};

/** The row of the record that is open, for example in a panel next to the grid: aria-current="true". */
export const SelectedRow: Story = {
  args: {
    rows: products.slice(0, 5),
    isRowSelected: (product) => product.id === 3,
  },
};

/** Rows in blocks, each with a header row: its title, the number of its rows and its buttons. With groups there is no search, sort, selection or pages. */
export const Groups: Story = {
  args: {
    groups: ["Bakery", "Drinks", "Savory"].map((category) => ({
      key: category,
      title: category,
      actions: <IconButton icon={Pencil} size="sm" aria-label={`Rename the category ${category}`} />,
      rows: products.slice(0, 12).filter((product) => product.category === category),
    })),
  },
};

/** Content in a row of its own under the row of a record. */
export const ExpandedRow: Story = {
  args: {
    rows: products.slice(0, 4),
    renderExpanded: (product) =>
      product.id === 2 ? "Roasted this week. The next delivery is on 20/11/2026." : null,
  },
};

/** No record: the message the app gives. The footer and the page controls are not shown. */
export const Empty: Story = {
  args: {
    rows: [],
    emptyMessage: "No products yet.",
    search: { placeholder: "Search the products" },
    pageSize: 10,
  },
};

/** A search that finds no row: a message and a button that empties the search field. */
export const NoResults: Story = {
  args: {
    search: { placeholder: "Search the products" },
    defaultState: { search: "pineapple" },
    pageSize: 10,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("No results with these filters.")).toBeVisible();
  },
};

/** While the records load: the table has aria-busy="true" and shows the loading text. */
export const Loading: Story = {
  args: {
    rows: [],
    loading: true,
    labels: { loading: "Loading the products…" },
    search: { placeholder: "Search the products" },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("table")).toHaveAttribute("aria-busy", "true");
  },
};

/** Long text in a cell goes to the next line; the header cells stay on one line. */
export const LongText: Story = {
  args: {
    rows: [
      {
        ...(products[0] as Product),
        name: "Pão de queijo with cheese from the Canastra mountains, frozen, in a box of 40 units of 25 grams each",
        supplier: "Cooperative of the small dairy farmers of the south of Minas Gerais",
      },
      ...products.slice(1, 4),
    ],
  },
  render: (args) => (
    <div className="max-w-2xl">
      <DataGrid {...args} />
    </div>
  ),
};

/**
 * Many columns in a narrow container on a wide screen: the table scrolls
 * sideways, and its box can get the keyboard focus. The controls above and
 * under the table go to the next line.
 */
export const ManyColumnsInANarrowContainer: Story = {
  args: {
    search: { placeholder: "Search the products" },
    pageSize: 10,
    rowActions: (product) => (
      <IconButton icon={Pencil} size="sm" aria-label={`Edit ${product.name}`} />
    ),
  },
  render: (args) => (
    <div className="max-w-sm">
      <DataGrid {...args} />
    </div>
  ),
};

/** The texts of the grid in another language, given in "labels". */
export const TextsInPortuguese: Story = {
  args: {
    caption: "Produtos",
    search: { placeholder: "Buscar produtos" },
    pageSize: 10,
    locale: "pt-BR",
    emptyMessage: "Nenhum registro.",
    selection: { actions: () => <Button size="sm">Arquivar</Button> },
    labels: {
      actions: "Ações",
      clearFilters: "Limpar filtros",
      noResults: "Nenhum resultado com esses filtros.",
      loading: "Carregando…",
      total: "Total",
      bulkActions: "Ações em lote",
      selectedCount: (count) => `${count} ${count === 1 ? "selecionado" : "selecionados"}`,
      clearSelection: "Limpar seleção",
      selectAll: "Selecionar todos",
      selectRow: (rowLabel) => `Selecionar ${rowLabel}`,
      pagination: "Paginação",
      pageRange: (firstRow, lastRow, rowCount) => `Mostrando ${firstRow}–${lastRow} de ${rowCount}`,
      rowsPerPage: "Por página",
      pageOf: (page, pageCount) => `${page} de ${pageCount}`,
      previousPage: "Página anterior",
      nextPage: "Próxima página",
    },
  },
};

function GridWithState(args: DataGridProps<Product>) {
  const [state, setState] = useState<DataGridState | null>(null);
  return (
    <div className="grid gap-4">
      <DataGrid {...args} onStateChange={setState} />
      <p className="text-sm/5 text-secondary">
        The last state given to onStateChange: {state ? JSON.stringify(state) : "none yet"}
      </p>
    </div>
  );
}

/**
 * "onStateChange" gives the search text, the sort, the page and the page size
 * after each change. An app writes them in the address of the page, and gives
 * them back in "defaultState" when the page opens.
 */
export const StateForTheApp: Story = {
  args: {
    search: { placeholder: "Search the products" },
    pageSize: 10,
    defaultState: { page: 2, sort: { columnId: "name", descending: false } },
  },
  render: (args) => <GridWithState {...args} />,
};

/** The columns of the stories of the filter: a text filter, 2 lists of choices, and a list with a default. */
const filterColumns: DataGridColumn<Product>[] = columns.map((column): DataGridColumn<Product> => {
  if (column.id === "name") {
    return { ...column, filter: { type: "text", value: (product) => product.name } };
  }
  if (column.id === "category") {
    return {
      ...column,
      filter: {
        type: "options",
        options: ["Bakery", "Desserts", "Drinks", "Savory"].map((category) => ({ value: category, label: category })),
        value: (product) => product.category,
      },
    };
  }
  if (column.id === "supplier") {
    return {
      ...column,
      filter: {
        type: "options",
        options: [
          { value: "Minas Dairy", label: "Minas Dairy" },
          { value: "Serra Coffee", label: "Serra Coffee" },
          { value: "Sweet Farm", label: "Sweet Farm" },
          { value: "", label: "No supplier" },
        ],
        value: (product) => product.supplier ?? "",
      },
    };
  }
  return column;
});

const statusColumn: DataGridColumn<Product> = {
  id: "status",
  header: "Status",
  cell: (product) => (product.active ? "Active" : "Inactive"),
  sortValue: (product) => (product.active ? 0 : 1),
  filter: {
    type: "options",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
    value: (product) => (product.active ? "active" : "inactive"),
    defaultValues: ["active"],
  },
};

/**
 * A column with "filter" has a small button in its header. "Status" starts
 * with the choice "Active" checked ("defaultValues"), so its button is in the
 * brand color. A default is not a change of the person: "Clear filters" is not shown.
 */
export const ColumnFilters: Story = {
  args: {
    columns: [...filterColumns, statusColumn],
    search: { placeholder: "Search the products" },
    pageSize: 10,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Filter Status (filter on)" })).toBeVisible();
    await expect(canvas.queryByRole("button", { name: "Clear filters" })).toBeNull();
  },
};

/**
 * The panel of a filter with a list of choices, open. The story checks
 * "Drinks": the rows are filtered at once, the button of the header changes
 * its color, and "Clear filters" is shown. The panel is in <body>, so the box
 * of the table does not cut it.
 */
export const ColumnFilterOpen: Story = {
  args: {
    columns: [...filterColumns, statusColumn],
    search: { placeholder: "Search the products" },
    pageSize: 10,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Filter Category" }));
    const panel = await page.findByRole("dialog", { name: "Filter Category" });
    await userEvent.click(within(panel).getByRole("checkbox", { name: "Drinks" }));
    await expect(canvas.getByRole("button", { name: "Filter Category (filter on)" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Clear filters" })).toBeVisible();
    await expect(canvas.getByText("Showing 1–9 of 9")).toBeVisible();
  },
};

/** The panel of a text filter, open: one text field, which has the focus. The story types "cake". */
export const TextFilterOpen: Story = {
  args: {
    columns: [...filterColumns, statusColumn],
    pageSize: 10,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Filter Product" }));
    const field = await page.findByRole("textbox", { name: "Filter Product" });
    await expect(field).toHaveFocus();
    await userEvent.type(field, "cake");
    await expect(canvas.getByText("Showing 1–2 of 2")).toBeVisible();
  },
};

/** The keyboard: Enter on the button of the header opens the panel, Tab goes to a choice, Space checks it, Escape closes the panel and gives the focus back to the button. */
export const ColumnFilterKeyboard: Story = {
  args: {
    columns: [...filterColumns, statusColumn],
    rows: products.slice(0, 8),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    canvas.getByRole("button", { name: "Filter Supplier" }).focus();
    await userEvent.keyboard("{Enter}");
    const panel = await page.findByRole("dialog", { name: "Filter Supplier" });
    await userEvent.tab();
    await userEvent.tab();
    await expect(within(panel).getByRole("checkbox", { name: "Minas Dairy" })).toHaveFocus();
    await userEvent.keyboard(" ");
    await userEvent.keyboard("{Escape}");
    await expect(page.queryByRole("dialog")).toBeNull();
    await expect(canvas.getByRole("button", { name: "Filter Supplier (filter on)" })).toHaveFocus();
  },
};

/** The columns of the stories of the menu "Columns": "Product" is required, and "Supplier" starts hidden. */
const menuColumns: DataGridColumn<Product>[] = columns.map((column): DataGridColumn<Product> => {
  if (column.id === "name") {
    return { ...column, required: true };
  }
  if (column.id === "supplier") {
    return { ...column, defaultHidden: true };
  }
  return column;
});

/**
 * "columnsMenu" adds the button "Columns" at the right of the toolbar. A
 * column with "required" is always shown and is not in the menu. A column with
 * "defaultHidden" is hidden until a person checks it: here "Supplier".
 */
export const ColumnsMenu: Story = {
  args: {
    columns: menuColumns,
    columnsMenu: true,
    search: { placeholder: "Search the products" },
    pageSize: 10,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Columns" })).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.queryByRole("columnheader", { name: "Supplier" })).toBeNull();
  },
};

/**
 * The menu open. The story hides "Category" and shows "Supplier": the table
 * changes at once, and the button "Back to default" is shown.
 */
export const ColumnsMenuOpen: Story = {
  args: {
    columns: menuColumns,
    columnsMenu: true,
    search: { placeholder: "Search the products" },
    rows: products.slice(0, 8),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Columns" }));
    const list = canvas.getByRole("group", { name: "Visible columns" });
    await userEvent.click(within(list).getByRole("checkbox", { name: "Category" }));
    await userEvent.click(within(list).getByRole("checkbox", { name: "Supplier" }));
    await expect(canvas.queryByRole("columnheader", { name: "Category" })).toBeNull();
    await expect(canvas.getByRole("columnheader", { name: "Supplier" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Back to default" })).toBeVisible();
  },
};

function GridWithHiddenColumns(args: DataGridProps<Product>) {
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(["stock", "price"]);
  return (
    <div className="grid gap-4">
      <DataGrid {...args} hiddenColumns={hiddenColumns} onHiddenColumnsChange={setHiddenColumns} />
      <p className="text-sm/5 text-secondary">
        The hidden columns the app keeps: {hiddenColumns.length > 0 ? hiddenColumns.join(", ") : "none"}
      </p>
    </div>
  );
}

/**
 * The app keeps the hidden columns: it gives them in "hiddenColumns" and
 * receives each change in "onHiddenColumnsChange". An app saves them where it
 * wants, for example in the storage of the browser; the playground has that example.
 */
export const HiddenColumnsKeptByTheApp: Story = {
  args: {
    columns: menuColumns,
    columnsMenu: true,
    rows: products.slice(0, 6),
  },
  render: (args) => <GridWithHiddenColumns {...args} />,
};

/** The columns of the stories of the editing: a text, a number, a select and a checkbox. An inactive product cannot be edited, except its status. */
const editableColumns: DataGridColumn<Product>[] = [
  {
    id: "name",
    header: "Product",
    cell: (product) => <span className="font-medium text-primary">{product.name}</span>,
    editor: { type: "text", value: (product) => product.name },
    editOnClick: true,
    canEdit: (product) => product.active,
  },
  {
    id: "category",
    header: "Category",
    cell: (product) => product.category,
    editor: {
      type: "select",
      value: (product) => product.category,
      options: ["Bakery", "Desserts", "Drinks", "Savory"].map((category) => ({ value: category, label: category })),
    },
    editOnClick: true,
    canEdit: (product) => product.active,
  },
  {
    id: "price",
    header: "Price",
    align: "right",
    cell: (product) => money.format(product.price),
    editor: { type: "number", value: (product) => product.price.toFixed(2) },
    editOnClick: true,
    canEdit: (product) => product.active,
  },
  {
    id: "active",
    header: "Active",
    cell: (product) => (product.active ? "Yes" : "No"),
    editor: { type: "checkbox", value: (product) => product.active },
    editOnClick: true,
  },
];

/** The record with the new value of one cell, as the API of an app would return it. */
function withCellValue(product: Product, columnId: string, value: DataGridCellValue): Product {
  if (columnId === "price") {
    return { ...product, price: Number(String(value).replace(",", ".")) };
  }
  return { ...product, [columnId]: value };
}

type EditableGridProps = DataGridProps<Product> & {
  /** What the app does with a value: it saves it, it never answers, or it refuses it. */
  answer?: "save" | "never" | "refuse";
};

function EditableGrid({ answer = "save", rows: firstRows, ...args }: EditableGridProps) {
  const [rows, setRows] = useState(firstRows);
  return (
    <DataGrid
      {...args}
      rows={rows}
      onSaveCell={async (row, columnId, value) => {
        if (answer === "never") {
          await new Promise(() => undefined);
        }
        if (answer === "refuse" || (columnId === "price" && Number.isNaN(Number(String(value).replace(",", "."))))) {
          throw new Error("The price must be a number, for example 12.50.");
        }
        setRows((currentRows) =>
          currentRows.map((product) => (product.id === row.id ? withCellValue(product, columnId, value) : product)),
        );
      }}
    />
  );
}

/**
 * A column with "editor" and "editOnClick" is edited in the grid, and the app
 * saves the value in "onSaveCell". At rest a cell looks like any cell; the
 * pointer over it, or the keyboard focus, shows a quiet background and a
 * pencil. A checkbox is always shown. The fourth product is not active, so
 * "canEdit" leaves only its checkbox.
 */
export const EditableCells: Story = {
  args: { columns: editableColumns, rows: products.slice(0, 5) },
  render: (args) => <EditableGrid {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Edit Price — Espresso coffee: R$11.00" })).toBeVisible();
    await expect(canvas.queryByRole("button", { name: /Edit Price — Carrot cake/ })).toBeNull();
  },
};

/**
 * A press on a cell shows the field, with the focus. The story types another
 * price: the field has the border and the background of a changed value until
 * it is saved. Enter saves, and Escape gives up.
 */
export const EditingACell: Story = {
  args: { columns: editableColumns, rows: products.slice(0, 5) },
  render: (args) => <EditableGrid {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Edit Price — Espresso coffee/ }));
    const field = canvas.getByRole("textbox", { name: "Price — Espresso coffee" });
    await expect(field).toHaveFocus();
    await userEvent.clear(field);
    await userEvent.type(field, "12.50");
    await expect(field).toHaveAttribute("data-changed", "true");
  },
};

/** The keyboard: Enter on a cell opens the field, Enter in the field saves, and the focus goes back to the cell with the new value. */
export const EditingWithTheKeyboard: Story = {
  args: { columns: editableColumns, rows: products.slice(0, 5) },
  render: (args) => <EditableGrid {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("button", { name: /Edit Product — Orange juice/ }).focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" with ice{Enter}");
    const cell = await canvas.findByRole("button", { name: "Edit Product — Orange juice with ice: Orange juice with ice" });
    await waitFor(() => expect(cell).toHaveFocus());
  },
};

/** While the app saves: the field is disabled and the cell says "Saving…". In this story the app never answers. */
export const SavingACell: Story = {
  args: { columns: editableColumns, rows: products.slice(0, 5) },
  render: (args) => <EditableGrid {...args} answer="never" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Edit Product — Espresso coffee/ }));
    await userEvent.keyboard(" double{Enter}");
    await expect(canvas.getByRole("status")).toHaveTextContent("Saving…");
    await expect(canvas.getByRole("textbox", { name: "Product — Espresso coffee" })).toBeDisabled();
  },
};

/** The app refuses the value: the field stays open with the error text of the app under it, and keeps the focus. */
export const CellSaveError: Story = {
  args: { columns: editableColumns, rows: products.slice(0, 5) },
  render: (args) => <EditableGrid {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Edit Price — Espresso coffee/ }));
    const field = canvas.getByRole("textbox", { name: "Price — Espresso coffee" });
    await userEvent.clear(field);
    await userEvent.type(field, "twelve{Enter}");
    await expect(await canvas.findByRole("alert")).toHaveTextContent("The price must be a number, for example 12.50.");
    await expect(field).toHaveAttribute("aria-invalid", "true");
    await waitFor(() => expect(field).toHaveFocus());
  },
};

/** A select is saved when a choice is made. The story opens the select of a category. */
export const EditingWithASelect: Story = {
  args: { columns: editableColumns, rows: products.slice(0, 5) },
  render: (args) => <EditableGrid {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Edit Category — Orange juice/ }));
    await expect(canvas.getByRole("combobox", { name: "Category — Orange juice" })).toHaveFocus();
  },
};

type ComplementOption = { id: number; name: string; extraPrice: number; active: boolean };
type ComplementGroup = { id: number; name: string; choices: string; options: ComplementOption[] };

const complementGroups: ComplementGroup[] = [
  {
    id: 1,
    name: "Milk",
    choices: "Choose 1",
    options: [
      { id: 11, name: "Whole milk", extraPrice: 0, active: true },
      { id: 12, name: "Oat milk", extraPrice: 2, active: true },
      { id: 13, name: "Lactose-free milk", extraPrice: 1.5, active: false },
    ],
  },
  {
    id: 2,
    name: "Syrup",
    choices: "Up to 2",
    options: [
      { id: 21, name: "Vanilla", extraPrice: 3, active: true },
      { id: 22, name: "Caramel", extraPrice: 3, active: true },
    ],
  },
  { id: 3, name: "Toppings", choices: "Up to 3", options: [] },
];

const complementGroupColumns: DataGridColumn<ComplementGroup>[] = [
  {
    id: "name",
    header: "Group",
    cell: (group) => <span className="font-medium text-primary">{group.name}</span>,
    sortValue: (group) => group.name,
  },
  { id: "choices", header: "Choices", cell: (group) => group.choices },
  { id: "options", header: "Options", align: "right", cell: (group) => group.options.length },
];

const complementOptionColumns: DataGridColumn<ComplementOption>[] = [
  {
    id: "name",
    header: "Option",
    cell: (option) => <span className="font-medium text-primary">{option.name}</span>,
    editor: { type: "text", value: (option) => option.name },
    editOnClick: true,
  },
  {
    id: "extraPrice",
    header: "Extra price",
    align: "right",
    cell: (option) => money.format(option.extraPrice),
    editor: { type: "number", value: (option) => option.extraPrice.toFixed(2) },
    editOnClick: true,
  },
  {
    id: "active",
    header: "Active",
    cell: (option) => (option.active ? "Yes" : "No"),
    editor: { type: "checkbox", value: (option) => option.active },
    editOnClick: true,
  },
];

function ComplementGroupsGrid() {
  const [groups, setGroups] = useState(complementGroups);
  return (
    <DataGrid
      caption="Groups of complements"
      columns={complementGroupColumns}
      rows={groups}
      getRowKey={(group) => group.id}
      getRowLabel={(group) => group.name}
      locale="en"
      subRows={{
        label: "options",
        getRows: (group) => group.options,
        columns: complementOptionColumns,
        getRowKey: (option) => option.id,
        getRowLabel: (option) => option.name,
        emptyMessage: "No option in this group.",
        rowActions: (group, option) => (
          <IconButton icon={Archive} size="sm" aria-label={`Archive ${option.name} of ${group.name}`} />
        ),
        footer: (group) => (
          <Button size="sm" variant="secondary" icon={Plus}>
            Add an option to {group.name}
          </Button>
        ),
        onSaveCell: async (group, option, columnId, value) => {
          const savedValue = columnId === "extraPrice" ? Number(String(value).replace(",", ".")) : value;
          if (typeof savedValue === "number" && Number.isNaN(savedValue)) {
            throw new Error("The price must be a number, for example 2.50.");
          }
          setGroups((currentGroups) =>
            currentGroups.map((currentGroup) =>
              currentGroup.id === group.id
                ? {
                    ...currentGroup,
                    options: currentGroup.options.map((currentOption) =>
                      currentOption.id === option.id ? { ...currentOption, [columnId]: savedValue } : currentOption,
                    ),
                  }
                : currentGroup,
            ),
          );
        },
      }}
    />
  );
}

/**
 * "subRows" gives each row an arrow before its first cell. The arrow is a
 * button with aria-expanded; its name has the items, the record and the number
 * of items. In this story every row is closed.
 */
export const RowsInsideARow: StoryObj = {
  render: () => <ComplementGroupsGrid />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Show options of Milk (3)" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  },
};

/**
 * A row open: its items are a small table with its own columns, in a row of
 * its own with a quiet background, with the buttons of each item and the
 * content of "footer" under it. The third row has no item and shows the message.
 */
export const RowsInsideARowOpen: StoryObj = {
  render: () => <ComplementGroupsGrid />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Show options of Milk (3)" }));
    await userEvent.click(canvas.getByRole("button", { name: "Show options of Toppings (0)" }));
    await expect(canvas.getByRole("button", { name: "Hide options of Milk (3)" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(canvas.getByRole("table", { name: "options of Milk" })).toBeVisible();
    await expect(canvas.getByText("No option in this group.")).toBeVisible();
  },
};

/** The keyboard: Enter on the arrow shows the items, and a cell of an item is edited in place: Enter opens the field and Enter saves. */
export const RowsInsideARowKeyboard: StoryObj = {
  render: () => <ComplementGroupsGrid />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("button", { name: "Show options of Syrup (2)" }).focus();
    await userEvent.keyboard("{Enter}");
    canvas.getByRole("button", { name: /Edit Extra price — Vanilla/ }).focus();
    await userEvent.keyboard("{Enter}");
    const field = canvas.getByRole("textbox", { name: "Extra price — Vanilla" });
    await userEvent.clear(field);
    await userEvent.type(field, "4.50{Enter}");
    const cell = await canvas.findByRole("button", { name: "Edit Extra price — Vanilla: R$4.50" });
    await waitFor(() => expect(cell).toHaveFocus());
  },
};

/** The view of the stories: the products as cards, one for each row the grid gives. */
function ProductCards({ rows }: { rows: Product[] }) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm/5 text-secondary">No product with these filters.</p>;
  }
  return (
    <ul aria-label="Products as cards" className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {rows.map((product) => (
        <li key={product.id} className="rounded-lg border border-default bg-surface p-3">
          <p className="font-heading text-sm/5 font-medium text-primary">{product.name}</p>
          <p className="text-sm/5 text-secondary">{product.category}</p>
          <p className="mt-2 text-sm/5 text-body tabular-nums">{money.format(product.price)}</p>
        </li>
      ))}
    </ul>
  );
}

function GridWithViews({ startWithCards, ...args }: DataGridProps<Product> & { startWithCards: boolean }) {
  const [showsCards, setShowsCards] = useState(startWithCards);
  return (
    <DataGrid
      {...args}
      toolbar={
        <div role="group" aria-label="View" className="flex gap-1">
          <Button size="sm" variant={showsCards ? "ghost" : "soft"} aria-pressed={!showsCards} onClick={() => setShowsCards(false)}>
            Table
          </Button>
          <Button size="sm" variant={showsCards ? "soft" : "ghost"} aria-pressed={showsCards} onClick={() => setShowsCards(true)}>
            Cards
          </Button>
        </div>
      }
      renderView={showsCards ? (rows) => <ProductCards rows={rows} /> : undefined}
    />
  );
}

/**
 * "renderView" shows another view in the place of the table: here cards, in
 * an app for example a calendar. The search field and the toolbar stay, and
 * the filters of the columns are buttons with the name of their column in the
 * toolbar. The view receives the rows after the search and the filters. The
 * story searches "juice".
 */
export const AnotherView: Story = {
  args: {
    columns: [...filterColumns, statusColumn],
    rows: products.slice(0, 12),
    search: { placeholder: "Search the products" },
    pageSize: 10,
  },
  render: (args) => <GridWithViews {...args} startWithCards />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("table")).toBeNull();
    await expect(canvas.getByRole("button", { name: "Filter Status (filter on)" })).toHaveTextContent("Status");
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search the products" }), "juice");
    await expect(within(canvas.getByRole("list", { name: "Products as cards" })).getAllByRole("listitem")).toHaveLength(1);
  },
};

/**
 * The panel of a filter open above the view. The story checks "Bakery", and
 * then goes to the table: the same filter is still on, now in the header of its column.
 */
export const AnotherViewWithAFilterOpen: Story = {
  args: {
    columns: [...filterColumns, statusColumn],
    rows: products.slice(0, 12),
    search: { placeholder: "Search the products" },
  },
  render: (args) => <GridWithViews {...args} startWithCards />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Filter Category" }));
    const panel = await page.findByRole("dialog", { name: "Filter Category" });
    await userEvent.click(within(panel).getByRole("checkbox", { name: "Bakery" }));
    await expect(canvas.getByRole("button", { name: "Filter Category (filter on)" })).toBeVisible();
  },
};

/** The columns of the stories of the mode "Edit table": the same editors as the cells edited by a press, with no "editOnClick". */
const tableEditColumns: DataGridColumn<Product>[] = editableColumns.map((column) => ({ ...column, editOnClick: false }));

/** The record with the changed cells of a row, as the API of an app would return it. A price that is not a number is refused. */
function withRowChanges(product: Product, changes: DataGridRowChanges): Product {
  return Object.entries(changes).reduce((changedProduct, [columnId, value]) => {
    if (columnId === "price" && Number.isNaN(Number(String(value).replace(",", ".")))) {
      throw new Error("The price must be a number, for example 12.50.");
    }
    return withCellValue(changedProduct, columnId, value);
  }, product);
}

function TableEditGrid({ rows: firstRows, ...args }: DataGridProps<Product>) {
  const [rows, setRows] = useState(firstRows);
  return (
    <DataGrid
      {...args}
      rows={rows}
      onSaveRow={async (row, changes) => {
        const savedRow = withRowChanges(row, changes);
        setRows((currentRows) => currentRows.map((product) => (product.id === row.id ? savedRow : product)));
      }}
    />
  );
}

/**
 * "onSaveRow" adds the button "Edit table" at the right of the toolbar. The
 * table looks as always until a person presses it.
 */
export const EditTable: Story = {
  args: {
    columns: tableEditColumns,
    rows: products.slice(0, 5),
    columnsMenu: true,
    rowActions: (product) => <IconButton icon={Pencil} size="sm" aria-label={`Edit ${product.name}`} />,
  },
  render: (args) => <TableEditGrid {...args} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Edit table" })).toBeVisible();
  },
};

/**
 * The mode on. Every cell of a column with "editor" is a field; the buttons of
 * the rows and the menu of the columns are hidden. The story changes 2 cells of
 * one row and 1 cell of another: each changed field has the orange border, each
 * changed row the quiet orange background, and the toolbar counts the rows.
 */
export const EditTableWithChanges: Story = {
  args: EditTable.args,
  render: (args) => <TableEditGrid {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Edit table" }));
    await waitFor(() => expect(canvas.getByRole("textbox", { name: "Product — Pão de queijo" })).toHaveFocus());
    await userEvent.type(canvas.getByRole("textbox", { name: "Product — Espresso coffee" }), " double");
    const price = canvas.getByRole("textbox", { name: "Price — Espresso coffee" });
    await userEvent.clear(price);
    await userEvent.type(price, "12.50");
    await userEvent.click(canvas.getByRole("checkbox", { name: "Active — Orange juice" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("2 rows changed");
    await expect(canvas.getByRole("button", { name: "Save changes (2)" })).toBeEnabled();
  },
};

/**
 * Two cells of one row are changed and the row is saved as one: "onSaveRow"
 * receives the record and its 2 changed cells. After every row is saved, the
 * mode ends, the table shows the new values and the focus is on "Edit table".
 */
export const EditTableSaved: Story = {
  args: EditTable.args,
  render: (args) => <TableEditGrid {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Edit table" }));
    await userEvent.type(canvas.getByRole("textbox", { name: "Product — Espresso coffee" }), " double");
    const price = canvas.getByRole("textbox", { name: "Price — Espresso coffee" });
    await userEvent.clear(price);
    await userEvent.type(price, "12.50");
    await userEvent.click(canvas.getByRole("button", { name: "Save changes (1)" }));
    const editButton = await canvas.findByRole("button", { name: "Edit table" });
    await expect(canvas.getByText("Espresso coffee double")).toBeVisible();
    await expect(canvas.getByText("R$12.50")).toBeVisible();
    await waitFor(() => expect(editButton).toHaveFocus());
  },
};

/**
 * The app refuses one of 2 changed rows. The saved row is no longer changed.
 * The refused row keeps its values, and the error text of the app is in a row
 * of its own under it. The button counts 1 row and has the focus.
 */
export const EditTableSaveError: Story = {
  args: EditTable.args,
  render: (args) => <TableEditGrid {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Edit table" }));
    await userEvent.type(canvas.getByRole("textbox", { name: "Product — Pão de queijo" }), " large");
    const price = canvas.getByRole("textbox", { name: "Price — Espresso coffee" });
    await userEvent.clear(price);
    await userEvent.type(price, "twelve");
    await userEvent.click(canvas.getByRole("button", { name: "Save changes (2)" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "Espresso coffee: The price must be a number, for example 12.50.",
    );
    const saveButton = canvas.getByRole("button", { name: "Save changes (1)" });
    await waitFor(() => expect(saveButton).toHaveFocus());
  },
};
