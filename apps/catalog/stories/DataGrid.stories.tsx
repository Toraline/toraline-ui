import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Archive, Pencil, Plus } from "lucide-react";
import { expect, userEvent, within } from "storybook/test";
import { Button, DataGrid, IconButton } from "@toraline.tech/ui";
import type { DataGridColumn, DataGridProps, DataGridState } from "@toraline.tech/ui";

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
