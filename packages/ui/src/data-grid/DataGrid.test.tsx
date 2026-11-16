// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { DataGrid, dataGridPageSizes } from "./index";
import type { DataGridColumn, DataGridProps, DataGridSelectProps } from "./index";

afterEach(cleanup);

type Product = { id: number; name: string; category: string; price: number };

const products: Product[] = [
  { id: 1, name: "Pão de queijo", category: "Food", price: 9.5 },
  { id: 2, name: "Coffee", category: "Drinks", price: 7 },
  { id: 3, name: "Orange juice", category: "Drinks", price: 12 },
];

const columns: DataGridColumn<Product>[] = [
  {
    id: "name",
    header: "Product",
    cell: (product) => product.name,
    sortValue: (product) => product.name,
    searchValue: (product) => product.name,
  },
  { id: "category", header: "Category", cell: (product) => product.category },
  {
    id: "price",
    header: "Price",
    align: "right",
    cell: (product) => product.price.toFixed(2),
    sortValue: (product) => product.price,
    footer: (rows) => rows.reduce((sum, product) => sum + product.price, 0).toFixed(2),
  },
];

function renderGrid(props: Partial<DataGridProps<Product>> = {}) {
  return render(
    <DataGrid
      caption="Products"
      columns={columns}
      rows={products}
      getRowKey={(product) => product.id}
      getRowLabel={(product) => product.name}
      {...props}
    />,
  );
}

/** The texts of the first column, in the order of the rows of the body. */
function firstCells(): string[] {
  const body = screen.getByRole("table").querySelector("tbody") as HTMLElement;
  return [...body.querySelectorAll("tr")].map((row) => row.querySelector("td")?.textContent ?? "");
}

describe("DataGrid: the table", () => {
  test("is a real table named by its caption, with a header cell for each column", () => {
    renderGrid();
    const table = screen.getByRole("table", { name: "Products" });
    expect(within(table).getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
      "Product",
      "Category",
      "Price",
    ]);
    expect(firstCells()).toEqual(["Pão de queijo", "Coffee", "Orange juice"]);
  });

  test("each cell has the name of its column, for a row shown as a block on a narrow screen", () => {
    renderGrid();
    const table = screen.getByRole("table");
    expect(table.hasAttribute("data-stack-on-mobile")).toBe(true);
    expect(screen.getByRole("cell", { name: "Coffee" }).getAttribute("data-label")).toBe("Product");
    expect(screen.getByRole("cell", { name: "7.00" }).getAttribute("data-align")).toBe("right");
  });

  test("the last column holds the buttons of each row, and its header has a name for a screen reader", () => {
    renderGrid({
      rowActions: (product) => <button type="button">Edit {product.name}</button>,
      labels: { actions: "Ações" },
    });
    expect(screen.getByRole("columnheader", { name: "Ações" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Edit Coffee" })).toBeDefined();
  });

  test("the row of the open record has aria-current", () => {
    renderGrid({ isRowSelected: (product) => product.id === 2 });
    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(rows[2]?.getAttribute("aria-current")).toBe("true");
    expect(rows[1]?.hasAttribute("aria-current")).toBe(false);
  });

  test("rowProps go to the <tr> of a row, and its className is joined", () => {
    renderGrid({ rowProps: (product) => ({ id: `row-${product.id}`, className: "cursor-grab" }) });
    const row = document.getElementById("row-2") as HTMLElement;
    expect(row.tagName).toBe("TR");
    expect(row.className.split(" ")).toEqual(expect.arrayContaining(["hover:bg-subtle", "cursor-grab"]));
  });

  test("renderExpanded adds a row as wide as the table under the row of a record", () => {
    renderGrid({ renderExpanded: (product) => (product.id === 2 ? "Roasted this week" : null) });
    const cell = screen.getByRole("cell", { name: "Roasted this week" });
    expect(cell.getAttribute("colspan")).toBe("3");
    expect(document.querySelectorAll('[data-slot="expanded-row"]')).toHaveLength(1);
  });

  test("the footer row has the result of each column with a footer, and the text of the first cell", () => {
    renderGrid({ labels: { total: "Sum" } });
    const footer = screen.getByRole("table").querySelector("tfoot") as HTMLElement;
    expect([...footer.querySelectorAll("td")].map((cell) => cell.textContent)).toEqual(["Sum", "", "28.50"]);
  });

  test("className goes to the element around the grid", () => {
    renderGrid({ className: "mt-8 space-y-6" });
    const grid = document.querySelector('[data-slot="data-grid"]') as HTMLElement;
    expect(grid.className).toBe("mt-8 space-y-6");
  });
});

describe("DataGrid: empty and loading", () => {
  test("with no record it shows the message of the app, and no footer and no pages", () => {
    renderGrid({ rows: [], emptyMessage: "No products yet.", pageSize: 10 });
    expect(screen.getByRole("cell", { name: "No products yet." }).getAttribute("colspan")).toBe("3");
    expect(screen.getByRole("table").querySelector("tfoot")).toBeNull();
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  test("while loading, the table is busy and shows the loading text in the place of the rows", () => {
    renderGrid({ loading: true, labels: { loading: "Loading the products…" }, pageSize: 10 });
    expect(screen.getByRole("table").getAttribute("aria-busy")).toBe("true");
    expect(firstCells()).toEqual(["Loading the products…"]);
    expect(screen.queryByRole("navigation")).toBeNull();
  });
});

describe("DataGrid: the sort", () => {
  test("only a column with sortValue has a sort button and aria-sort", () => {
    renderGrid();
    expect(screen.getByRole("columnheader", { name: "Product" }).getAttribute("aria-sort")).toBe("none");
    expect(screen.getByRole("columnheader", { name: "Category" }).hasAttribute("aria-sort")).toBe(false);
    expect(screen.queryByRole("button", { name: "Category" })).toBeNull();
  });

  test("a press sorts ascending, a second press descending, a third press removes the sort", async () => {
    const user = userEvent.setup();
    const onStateChange = vi.fn();
    renderGrid({ onStateChange, locale: "en" });
    const header = screen.getByRole("columnheader", { name: "Product" });
    const button = screen.getByRole("button", { name: "Product" });

    await user.click(button);
    expect(header.getAttribute("aria-sort")).toBe("ascending");
    expect(firstCells()).toEqual(["Coffee", "Orange juice", "Pão de queijo"]);
    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: { columnId: "name", descending: false }, page: 1 }),
    );

    await user.click(button);
    expect(header.getAttribute("aria-sort")).toBe("descending");
    expect(firstCells()).toEqual(["Pão de queijo", "Orange juice", "Coffee"]);

    await user.click(button);
    expect(header.getAttribute("aria-sort")).toBe("none");
    expect(firstCells()).toEqual(["Pão de queijo", "Coffee", "Orange juice"]);
    expect(onStateChange).toHaveBeenLastCalledWith(expect.objectContaining({ sort: null }));
  });

  test("the sort button works with the keyboard", async () => {
    const user = userEvent.setup();
    renderGrid();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Product" }));
    await user.keyboard("{Enter}");
    expect(screen.getByRole("columnheader", { name: "Product" }).getAttribute("aria-sort")).toBe("ascending");
  });

  test("the grid starts with the sort of defaultState", () => {
    renderGrid({ defaultState: { sort: { columnId: "price", descending: true } } });
    expect(screen.getByRole("columnheader", { name: "Price" }).getAttribute("aria-sort")).toBe("descending");
    expect(firstCells()).toEqual(["Orange juice", "Pão de queijo", "Coffee"]);
  });
});

describe("DataGrid: the search", () => {
  test("has no search field without the prop", () => {
    renderGrid();
    expect(screen.queryByRole("searchbox")).toBeNull();
    expect(document.querySelector('[data-slot="toolbar"]')).toBeNull();
  });

  test("typing keeps the rows that have the text, with no difference for accents, and the footer follows", async () => {
    const user = userEvent.setup();
    const onStateChange = vi.fn();
    renderGrid({ search: { placeholder: "Search the products" }, onStateChange });
    await user.type(screen.getByRole("searchbox", { name: "Search the products" }), "pao");
    expect(firstCells()).toEqual(["Pão de queijo"]);
    const footer = screen.getByRole("table").querySelector("tfoot") as HTMLElement;
    expect(footer.textContent).toContain("9.50");
    expect(onStateChange).toHaveBeenLastCalledWith(expect.objectContaining({ search: "pao", page: 1 }));
  });

  test("a search with no result shows a message and a button that empties the field", async () => {
    const user = userEvent.setup();
    renderGrid({
      search: { placeholder: "Search" },
      defaultState: { search: "tea" },
      labels: { noResults: "Nothing found.", clearFilters: "Clear" },
    });
    expect(firstCells()).toEqual(["Nothing found.Clear"]);
    const cell = screen.getByRole("cell", { name: /Nothing found/ });
    await user.click(within(cell).getByRole("button", { name: "Clear" }));
    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("");
    expect(firstCells()).toHaveLength(3);
  });

  test("the toolbar of the app is shown after the search field", () => {
    renderGrid({ search: { placeholder: "Search" }, toolbar: <button type="button">New product</button> });
    const toolbar = document.querySelector('[data-slot="toolbar"]') as HTMLElement;
    expect(within(toolbar).getByRole("button", { name: "New product" })).toBeDefined();
  });
});

describe("DataGrid: the pages", () => {
  const manyProducts: Product[] = Array.from({ length: 23 }, (_, index) => ({
    id: index + 1,
    name: `Product ${index + 1}`,
    category: "Food",
    price: index + 1,
  }));

  test("has the page sizes 10, 25, 50 and 100", () => {
    expect(dataGridPageSizes).toEqual([10, 25, 50, 100]);
  });

  test("has no page controls without pageSize", () => {
    renderGrid({ rows: manyProducts });
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(firstCells()).toHaveLength(23);
  });

  test("shows one page, and the buttons go to the page after and the page before", async () => {
    const user = userEvent.setup();
    const onStateChange = vi.fn();
    renderGrid({ rows: manyProducts, pageSize: 10, onStateChange });
    const navigation = screen.getByRole("navigation", { name: "Pagination" });
    expect(firstCells()).toHaveLength(10);
    expect(within(navigation).getByText("Showing 1–10 of 23")).toBeDefined();
    expect(within(navigation).getByText("1 of 3")).toBeDefined();
    const previous = within(navigation).getByRole("button", { name: "Previous page" });
    const next = within(navigation).getByRole("button", { name: "Next page" });
    expect((previous as HTMLButtonElement).disabled).toBe(true);

    await user.click(next);
    await user.click(next);
    expect(within(navigation).getByText("Showing 21–23 of 23")).toBeDefined();
    expect(firstCells()).toEqual(["Product 21", "Product 22", "Product 23"]);
    expect((next as HTMLButtonElement).disabled).toBe(true);
    expect(onStateChange).toHaveBeenLastCalledWith(expect.objectContaining({ page: 3, pageSize: 10 }));

    await user.click(previous);
    expect(within(navigation).getByText("2 of 3")).toBeDefined();
  });

  test("the field of the page size changes the number of rows and goes back to the first page", async () => {
    const user = userEvent.setup();
    renderGrid({ rows: manyProducts, pageSize: 10, defaultState: { page: 2 } });
    const select = screen.getByRole("combobox", { name: "Per page" });
    expect([...select.querySelectorAll("option")].map((option) => option.textContent)).toEqual([
      "10",
      "25",
      "50",
      "100",
    ]);
    await user.selectOptions(select, "25");
    expect(firstCells()).toHaveLength(23);
    expect(screen.getByText("1 of 1")).toBeDefined();
  });

  test("a page size that is not in the list is added to the choices", () => {
    renderGrid({ rows: manyProducts, pageSize: 5 });
    const select = screen.getByRole("combobox", { name: "Per page" });
    expect([...select.querySelectorAll("option")].map((option) => option.textContent)).toEqual([
      "5",
      "10",
      "25",
      "50",
      "100",
    ]);
    expect(firstCells()).toHaveLength(5);
  });

  test("a page after the last one shows the last page", () => {
    renderGrid({ rows: manyProducts, pageSize: 10, defaultState: { page: 9 } });
    expect(screen.getByText("3 of 3")).toBeDefined();
  });

  test("the texts of the pages come from labels", () => {
    renderGrid({
      rows: manyProducts,
      pageSize: 10,
      labels: {
        pagination: "Paginação",
        pageRange: (firstRow, lastRow, rowCount) => `Mostrando ${firstRow}–${lastRow} de ${rowCount}`,
        rowsPerPage: "Por página",
        pageOf: (page, pageCount) => `${page} de ${pageCount}`,
        previousPage: "Página anterior",
        nextPage: "Próxima página",
      },
    });
    const navigation = screen.getByRole("navigation", { name: "Paginação" });
    expect(within(navigation).getByText("Mostrando 1–10 de 23")).toBeDefined();
    expect(within(navigation).getByText("1 de 3")).toBeDefined();
    expect(within(navigation).getByRole("combobox", { name: "Por página" })).toBeDefined();
    expect(within(navigation).getByRole("button", { name: "Próxima página" })).toBeDefined();
  });

  test("the texts of the pages and of the selected rows can be elements: a text in pieces, as Intraweb writes it", async () => {
    const user = userEvent.setup();
    renderGrid({
      rows: manyProducts,
      pageSize: 10,
      selection: { actions: () => null },
      labels: {
        selectedCount: (count) => (
          <>
            {count} {count === 1 ? "selecionado" : "selecionados"}
          </>
        ),
        pageRange: (firstRow, lastRow, rowCount) => (
          <>
            Mostrando {firstRow}–{lastRow} de{" "}
            {rowCount}
          </>
        ),
        pageOf: (page, pageCount) => (
          <>
            {page} de {pageCount}
          </>
        ),
      },
    });
    const range = screen.getByText("Mostrando 1–10 de 23");
    // The pieces of Intraweb: "Mostrando ", "1", "–", "10", " de", " ", "23".
    expect(range.childNodes).toHaveLength(7);
    expect(screen.getByText("1 de 3").childNodes).toHaveLength(3);
    await user.click(screen.getAllByRole("checkbox")[1] as HTMLElement);
    expect(screen.getByRole("status").textContent).toBe("1 selecionado");
    expect(screen.getByRole("status").childNodes).toHaveLength(3);
  });

  test("the field of the page size has the full width of the library's Select, with no fixed width", () => {
    renderGrid({ rows: manyProducts, pageSize: 10 });
    const classes = screen.getByRole("combobox", { name: "Per page" }).className.split(" ");
    expect(classes).toContain("w-full");
    expect(classes).not.toContain("w-20");
  });

  test("the app gives its own select component, which receives the size and the class", async () => {
    const user = userEvent.setup();
    function AppSelect({ size, ...selectProps }: DataGridSelectProps) {
      return <select {...selectProps} data-testid="app-select" data-app-size={size} />;
    }
    renderGrid({ rows: manyProducts, pageSize: 10, selectComponent: AppSelect });
    const select = screen.getByTestId("app-select");
    expect(select.getAttribute("data-app-size")).toBe("sm");
    // "w-full": the field is as wide as its content, as in Intraweb (74 pixels), not 80 pixels ("w-20").
    expect(select.className).toBe("w-full");
    await user.selectOptions(select, "50");
    expect(firstCells()).toHaveLength(23);
  });
});

describe("DataGrid: the selection", () => {
  const selection = {
    actions: (rows: Product[], clear: () => void) => (
      <button type="button" onClick={clear}>
        Archive {rows.length}
      </button>
    ),
  };

  test("has no checkbox without the prop", () => {
    renderGrid();
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  test("a checkbox in each row selects it, and the bar shows the count and the actions", async () => {
    const user = userEvent.setup();
    renderGrid({ selection });
    expect(screen.queryByRole("region")).toBeNull();
    await user.click(screen.getByRole("checkbox", { name: "Select Coffee" }));
    const bar = screen.getByRole("region", { name: "Bulk actions" });
    expect(within(bar).getByRole("status").textContent).toBe("1 selected");
    expect(within(bar).getByRole("button", { name: "Archive 1" })).toBeDefined();
    const row = screen.getByRole("checkbox", { name: "Select Coffee" }).closest("tr") as HTMLElement;
    expect(row.hasAttribute("data-checked")).toBe(true);
    const selectAll = screen.getByRole("checkbox", { name: "Select all" }) as HTMLInputElement;
    expect(selectAll.indeterminate).toBe(true);
    expect(selectAll.checked).toBe(false);
  });

  test("the checkbox of the header selects every row and clears them", async () => {
    const user = userEvent.setup();
    renderGrid({ selection });
    const selectAll = screen.getByRole("checkbox", { name: "Select all" }) as HTMLInputElement;
    await user.click(selectAll);
    expect(screen.getByRole("status").textContent).toBe("3 selected");
    expect(selectAll.checked).toBe(true);
    expect(selectAll.indeterminate).toBe(false);
    await user.click(selectAll);
    expect(screen.queryByRole("region")).toBeNull();
  });

  test("the button of the bar and the function given to the actions clear the selection", async () => {
    const user = userEvent.setup();
    renderGrid({ selection, labels: { clearSelection: "Limpar seleção" } });
    await user.click(screen.getByRole("checkbox", { name: "Select all" }));
    await user.click(screen.getByRole("button", { name: "Limpar seleção" }));
    expect(screen.queryByRole("region")).toBeNull();
    await user.click(screen.getByRole("checkbox", { name: "Select Coffee" }));
    await user.click(screen.getByRole("button", { name: "Archive 1" }));
    expect(screen.queryByRole("region")).toBeNull();
  });

  test("the checkbox of the header selects only the rows the search found", async () => {
    const user = userEvent.setup();
    renderGrid({ selection, search: { placeholder: "Search" } });
    await user.type(screen.getByRole("searchbox"), "o");
    await user.click(screen.getByRole("checkbox", { name: "Select all" }));
    expect(screen.getByRole("status").textContent).toBe(`${firstCells().length} selected`);
  });

  test("the app gives its own checkbox component", async () => {
    const user = userEvent.setup();
    function AppCheckbox(props: ComponentProps<"input">) {
      return <input {...props} type="checkbox" data-testid="app-checkbox" />;
    }
    renderGrid({
      selection,
      checkboxComponent: AppCheckbox,
      labels: { selectRow: (rowLabel) => `Selecionar ${rowLabel}`, selectedCount: (count) => `${count} itens` },
    });
    expect(screen.getAllByTestId("app-checkbox")).toHaveLength(4);
    await user.click(screen.getByRole("checkbox", { name: "Selecionar Coffee" }));
    expect(screen.getByRole("status").textContent).toBe("1 itens");
    expect((screen.getByRole("checkbox", { name: "Select all" }) as HTMLInputElement).indeterminate).toBe(true);
  });
});

describe("DataGrid: groups", () => {
  const groups = [
    {
      key: "drinks",
      title: "Drinks",
      actions: <button type="button">Rename Drinks</button>,
      headerProps: { id: "group-drinks" },
      rows: products.filter((product) => product.category === "Drinks"),
    },
    { key: "food", title: "Food", rows: products.filter((product) => product.category === "Food") },
  ];

  test("each group has a header row with its title, the number of its rows and its buttons", () => {
    renderGrid({ groups });
    const header = screen.getByRole("columnheader", { name: /Drinks \(2\)/ });
    expect(header.getAttribute("scope")).toBe("colgroup");
    expect(header.getAttribute("colspan")).toBe("3");
    expect(within(header).getByRole("button", { name: "Rename Drinks" })).toBeDefined();
    expect(header.parentElement?.id).toBe("group-drinks");
    expect(screen.getByRole("columnheader", { name: /Food \(1\)/ })).toBeDefined();
  });

  test("with groups there is no search, no sort, no selection and no pages", () => {
    renderGrid({
      groups,
      search: { placeholder: "Search" },
      selection: { actions: () => null },
      pageSize: 1,
    });
    expect(screen.queryByRole("searchbox")).toBeNull();
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.queryByRole("button", { name: "Product" })).toBeNull();
    expect(screen.getByRole("cell", { name: "Pão de queijo" })).toBeDefined();
  });
});
