// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { DataGrid } from "./index";
import type { DataGridColumn, DataGridProps } from "./index";

afterEach(cleanup);

type Product = { id: number; name: string; category: string; tags: string[]; active: boolean };

const products: Product[] = [
  { id: 1, name: "Pão de queijo", category: "Food", tags: ["vegetarian"], active: true },
  { id: 2, name: "Coffee", category: "Drinks", tags: ["vegan", "vegetarian"], active: true },
  { id: 3, name: "Orange juice", category: "Drinks", tags: ["vegan"], active: false },
  { id: 4, name: "Ham pie", category: "Food", tags: [], active: true },
];

const columns: DataGridColumn<Product>[] = [
  {
    id: "name",
    header: "Product",
    cell: (product) => product.name,
    searchValue: (product) => product.name,
    filter: { type: "text", value: (product) => product.name },
  },
  {
    id: "category",
    header: "Category",
    cell: (product) => product.category,
    filter: {
      type: "options",
      options: [
        { value: "Food", label: "Food" },
        { value: "Drinks", label: "Drinks" },
      ],
      value: (product) => product.category,
    },
  },
  {
    id: "tags",
    header: "Tags",
    cell: (product) => product.tags.join(", "),
    filter: {
      type: "options",
      options: [
        { value: "vegan", label: "Vegan" },
        { value: "vegetarian", label: "Vegetarian" },
      ],
      value: (product) => product.tags,
    },
  },
  {
    id: "active",
    header: "Status",
    cell: (product) => (product.active ? "Active" : "Inactive"),
    filter: {
      type: "options",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
      value: (product) => (product.active ? "active" : "inactive"),
      defaultValues: ["active"],
    },
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

function firstCells(): string[] {
  const body = screen.getByRole("table").querySelector("tbody") as HTMLElement;
  return [...body.querySelectorAll("tr")].map((row) => row.querySelector("td")?.textContent ?? "");
}

describe("DataGrid: the filter of a column", () => {
  test("a column with a filter has a button in its header, and a column without one has none", () => {
    renderGrid({ columns: [...columns, { id: "id", header: "Number", cell: (product) => product.id }] });
    const header = screen.getByRole("columnheader", { name: /Category/ });
    const button = within(header).getByRole("button", { name: "Filter Category" });
    expect(button.getAttribute("aria-haspopup")).toBe("dialog");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.hasAttribute("aria-controls")).toBe(false);
    expect(within(screen.getByRole("columnheader", { name: "Number" })).queryByRole("button")).toBeNull();
  });

  test("the default choices of a column filter the rows from the start, and its button says the filter is on", () => {
    renderGrid();
    expect(firstCells()).toEqual(["Pão de queijo", "Coffee", "Ham pie"]);
    const button = screen.getByRole("button", { name: "Filter Status (filter on)" });
    expect(button.hasAttribute("data-active")).toBe(true);
    expect(screen.getByRole("button", { name: "Filter Category" }).hasAttribute("data-active")).toBe(false);
    // The defaults are not a change of the person: there is nothing to clear.
    expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();
  });

  test("a press on the button opens a dialog with a checkbox for each choice, and the first one has the focus", async () => {
    const user = userEvent.setup();
    renderGrid();
    const button = screen.getByRole("button", { name: "Filter Category" });
    await user.click(button);
    const panel = screen.getByRole("dialog", { name: "Filter Category" });
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(button.getAttribute("aria-controls")).toBe(panel.id);
    expect(within(panel).getByRole("group", { name: "Show Category" })).toBeDefined();
    expect(within(panel).getAllByRole("checkbox").map((checkbox) => checkbox.parentElement?.parentElement?.textContent)).toEqual([
      "Food",
      "Drinks",
    ]);
    expect(document.activeElement).toBe(within(panel).getByRole("button", { name: "Select all" }));
    // The panel is in <body>, so the box of the table does not cut it.
    expect(panel.parentElement).toBe(document.body);
  });

  test("checking a choice filters the rows at once, goes to the first page and reports the state", async () => {
    const user = userEvent.setup();
    const onStateChange = vi.fn();
    renderGrid({ onStateChange, pageSize: 2, defaultState: { page: 2 } });
    await user.click(screen.getByRole("button", { name: "Filter Category" }));
    await user.click(screen.getByRole("checkbox", { name: "Drinks" }));
    expect(firstCells()).toEqual(["Coffee"]);
    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ filters: { category: ["Drinks"] }, page: 1 }),
    );
    expect(screen.getByRole("button", { name: "Filter Category (filter on)" })).toBeDefined();
    await user.click(screen.getByRole("checkbox", { name: "Food" }));
    expect(firstCells()).toEqual(["Pão de queijo", "Coffee"]);
    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ filters: { category: ["Food", "Drinks"] } }),
    );
  });

  test("a record with several values is shown when one of them is checked", async () => {
    const user = userEvent.setup();
    renderGrid();
    await user.click(screen.getByRole("button", { name: "Filter Tags" }));
    await user.click(screen.getByRole("checkbox", { name: "Vegan" }));
    expect(firstCells()).toEqual(["Coffee"]);
  });

  test('"Select all" checks every choice and "Clear" unchecks them, also the defaults', async () => {
    const user = userEvent.setup();
    const onStateChange = vi.fn();
    renderGrid({ onStateChange });
    await user.click(screen.getByRole("button", { name: "Filter Status (filter on)" }));
    const panel = screen.getByRole("dialog");
    await user.click(within(panel).getByRole("button", { name: "Clear" }));
    expect(firstCells()).toEqual(["Pão de queijo", "Coffee", "Orange juice", "Ham pie"]);
    expect(onStateChange).toHaveBeenLastCalledWith(expect.objectContaining({ filters: { active: [] } }));
    expect(screen.getByRole("button", { name: "Filter Status" }).hasAttribute("data-active")).toBe(false);
    await user.click(within(panel).getByRole("button", { name: "Select all" }));
    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ filters: { active: ["active", "inactive"] } }),
    );
    // Back to the default of the column: the filter leaves the state.
    await user.click(within(panel).getByRole("checkbox", { name: "Inactive" }));
    expect(onStateChange).toHaveBeenLastCalledWith(expect.objectContaining({ filters: {} }));
  });

  test("a text filter keeps the rows whose value has the text, with no difference for accents", async () => {
    const user = userEvent.setup();
    const onStateChange = vi.fn();
    renderGrid({ onStateChange });
    await user.click(screen.getByRole("button", { name: "Filter Product" }));
    const field = screen.getByRole("textbox", { name: "Filter Product" });
    expect(document.activeElement).toBe(field);
    expect(field.getAttribute("placeholder")).toBe("Contains…");
    await user.type(field, "pao");
    expect(firstCells()).toEqual(["Pão de queijo"]);
    expect(onStateChange).toHaveBeenLastCalledWith(expect.objectContaining({ filters: { name: "pao" } }));
    await user.clear(field);
    expect(onStateChange).toHaveBeenLastCalledWith(expect.objectContaining({ filters: {} }));
  });

  test('"Clear filters" puts every filter back to its default and empties the search', async () => {
    const user = userEvent.setup();
    const onStateChange = vi.fn();
    renderGrid({
      onStateChange,
      search: { placeholder: "Search" },
      defaultState: { search: "o", filters: { category: ["Drinks"], active: [] } },
    });
    expect(firstCells()).toEqual(["Coffee", "Orange juice"]);
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(firstCells()).toEqual(["Pão de queijo", "Coffee", "Ham pie"]);
    expect(onStateChange).toHaveBeenLastCalledWith(expect.objectContaining({ search: "", filters: {}, page: 1 }));
    expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();
  });

  test("filters that find no row show the message with the button that clears them", async () => {
    const user = userEvent.setup();
    renderGrid({ defaultState: { filters: { name: "pineapple" } } });
    const body = screen.getByRole("table").querySelector("tbody") as HTMLElement;
    expect(body.textContent).toContain("No results with these filters.");
    await user.click(within(body).getByRole("button", { name: "Clear filters" }));
    expect(firstCells()).toHaveLength(3);
  });

  test("the footer of a column receives the rows after the filters", () => {
    renderGrid({
      columns: columns.map((column) =>
        column.id === "name" ? { ...column, footer: (rows: Product[]) => `${rows.length} products` } : column,
      ),
      defaultState: { filters: { category: ["Food"] } },
    });
    expect(screen.getByRole("table").querySelector("tfoot")?.textContent).toContain("2 products");
  });

  test("a grid with groups shows no filter button", () => {
    renderGrid({ groups: [{ key: "all", title: "All", rows: products }] });
    expect(screen.queryByRole("button", { name: /Filter/ })).toBeNull();
    expect(firstCells()).toHaveLength(5);
  });

  test("the texts come from labels", async () => {
    const user = userEvent.setup();
    renderGrid({
      labels: {
        filterColumn: (columnHeader, isActive) => `Filtrar ${columnHeader}${isActive ? " (filtro ativo)" : ""}`,
        filterChoices: (columnHeader) => `Mostrar ${columnHeader}`,
        filterSelectAll: "Selecionar todos",
        filterClear: "Limpar",
        filterContains: "Contém…",
      },
    });
    await user.click(screen.getByRole("button", { name: "Filtrar Status (filtro ativo)" }));
    const panel = screen.getByRole("dialog", { name: "Filtrar Status" });
    expect(within(panel).getByRole("group", { name: "Mostrar Status" })).toBeDefined();
    expect(within(panel).getByRole("button", { name: "Selecionar todos" })).toBeDefined();
    expect(within(panel).getByRole("button", { name: "Limpar" })).toBeDefined();
  });
});

describe("DataGrid: the keyboard in the filter of a column", () => {
  test("Enter on the button opens the panel, Space checks a choice, Escape closes it and gives the focus back", async () => {
    const user = userEvent.setup();
    renderGrid();
    const button = screen.getByRole("button", { name: "Filter Category" });
    button.focus();
    await user.keyboard("{Enter}");
    const panel = screen.getByRole("dialog", { name: "Filter Category" });
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(within(panel).getByRole("checkbox", { name: "Food" }));
    await user.keyboard(" ");
    expect(firstCells()).toEqual(["Pão de queijo", "Ham pie"]);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Filter Category (filter on)" }));
  });

  test("Tab and Shift+Tab stay inside the panel", async () => {
    const user = userEvent.setup();
    renderGrid();
    await user.click(screen.getByRole("button", { name: "Filter Category" }));
    const panel = screen.getByRole("dialog");
    const first = within(panel).getByRole("button", { name: "Select all" });
    const last = within(panel).getByRole("checkbox", { name: "Drinks" });
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(last);
    await user.tab();
    expect(document.activeElement).toBe(first);
  });

  test("Escape in the panel does not reach a listener of the page, for example of a dialog under it", async () => {
    const user = userEvent.setup();
    const onDocumentKeyDown = vi.fn();
    document.addEventListener("keydown", onDocumentKeyDown);
    renderGrid();
    await user.click(screen.getByRole("button", { name: "Filter Product" }));
    await user.keyboard("{Escape}");
    document.removeEventListener("keydown", onDocumentKeyDown);
    expect(onDocumentKeyDown).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("a press outside the panel closes it", async () => {
    const user = userEvent.setup();
    renderGrid();
    await user.click(screen.getByRole("button", { name: "Filter Category" }));
    expect(screen.getByRole("dialog")).toBeDefined();
    await user.click(screen.getByRole("table"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
