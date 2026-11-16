// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { DataGrid } from "./index";
import type { DataGridColumn, DataGridProps } from "./index";

afterEach(cleanup);

type Product = { id: number; name: string; category: string; price: number; notes: string };

const products: Product[] = [
  { id: 1, name: "Pão de queijo", category: "Food", price: 9.5, notes: "Frozen" },
  { id: 2, name: "Coffee", category: "Drinks", price: 7, notes: "Roasted" },
];

const columns: DataGridColumn<Product>[] = [
  { id: "name", header: "Product", required: true, cell: (product) => product.name },
  {
    id: "category",
    header: "Category",
    cell: (product) => product.category,
    sortValue: (product) => product.category,
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
    id: "price",
    header: "Price",
    align: "right",
    cell: (product) => product.price.toFixed(2),
    footer: (rows) => rows.reduce((sum, product) => sum + product.price, 0).toFixed(2),
  },
  { id: "notes", header: "Notes", defaultHidden: true, cell: (product) => product.notes },
];

function renderGrid(props: Partial<DataGridProps<Product>> = {}) {
  return render(
    <DataGrid
      caption="Products"
      columns={columns}
      rows={products}
      getRowKey={(product) => product.id}
      getRowLabel={(product) => product.name}
      columnsMenu
      {...props}
    />,
  );
}

function headers(): string[] {
  return screen.getAllByRole("columnheader").map((cell) => cell.textContent ?? "");
}

async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Columns" }));
  return screen.getByRole("group", { name: "Visible columns" });
}

describe("DataGrid: the menu of the columns", () => {
  test("without columnsMenu there is no button, and a column with defaultHidden is still hidden", () => {
    renderGrid({ columnsMenu: false });
    expect(screen.queryByRole("button", { name: "Columns" })).toBeNull();
    expect(headers()).toEqual(["Product", "Category", "Price"]);
  });

  test("the button is a disclosure: closed at first, and a press shows the list", async () => {
    const user = userEvent.setup();
    renderGrid();
    const button = screen.getByRole("button", { name: "Columns" });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    const list = await openMenu(user);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(within(list).getAllByRole("checkbox")).toHaveLength(3);
  });

  test("the list has every column that is not required, checked while the column is shown", async () => {
    const user = userEvent.setup();
    renderGrid();
    const list = await openMenu(user);
    expect(within(list).queryByRole("checkbox", { name: "Product" })).toBeNull();
    expect((within(list).getByRole("checkbox", { name: "Category" }) as HTMLInputElement).checked).toBe(true);
    expect((within(list).getByRole("checkbox", { name: "Price" }) as HTMLInputElement).checked).toBe(true);
    expect((within(list).getByRole("checkbox", { name: "Notes" }) as HTMLInputElement).checked).toBe(false);
  });

  test("unchecking a column hides its header, its cells and its footer cell, and reports the hidden columns", async () => {
    const user = userEvent.setup();
    const onHiddenColumnsChange = vi.fn();
    renderGrid({ onHiddenColumnsChange });
    const list = await openMenu(user);
    await user.click(within(list).getByRole("checkbox", { name: "Price" }));
    expect(headers()).toEqual(["Product", "Category"]);
    expect(screen.getByRole("table").querySelector("tfoot")).toBeNull();
    expect(onHiddenColumnsChange).toHaveBeenLastCalledWith(["price", "notes"]);
    await user.click(within(list).getByRole("checkbox", { name: "Notes" }));
    expect(headers()).toEqual(["Product", "Category", "Notes"]);
    expect(onHiddenColumnsChange).toHaveBeenLastCalledWith(["price"]);
  });

  test('"Back to default" is shown only after a change, restores the columns and moves the focus to the list', async () => {
    const user = userEvent.setup();
    const onHiddenColumnsChange = vi.fn();
    renderGrid({ onHiddenColumnsChange });
    const list = await openMenu(user);
    expect(screen.queryByRole("button", { name: "Back to default" })).toBeNull();
    await user.click(within(list).getByRole("checkbox", { name: "Notes" }));
    await user.click(screen.getByRole("button", { name: "Back to default" }));
    expect(headers()).toEqual(["Product", "Category", "Price"]);
    expect(onHiddenColumnsChange).toHaveBeenLastCalledWith(["notes"]);
    expect(screen.queryByRole("button", { name: "Back to default" })).toBeNull();
    expect(document.activeElement).toBe(within(list).getByRole("checkbox", { name: "Category" }));
  });

  test("the filter and the sort of a hidden column do not apply", async () => {
    const user = userEvent.setup();
    renderGrid({
      defaultState: { filters: { category: ["Drinks"] }, sort: { columnId: "category", descending: false } },
    });
    const firstCells = () =>
      [...(screen.getByRole("table").querySelector("tbody") as HTMLElement).querySelectorAll("tr")].map(
        (row) => row.querySelector("td")?.textContent,
      );
    expect(firstCells()).toEqual(["Coffee"]);
    const list = await openMenu(user);
    await user.click(within(list).getByRole("checkbox", { name: "Category" }));
    expect(firstCells()).toEqual(["Pão de queijo", "Coffee"]);
    // A person cannot see the filter of a hidden column, so there is nothing to clear.
    expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();
  });

  test("hiddenColumns from the app wins over defaultHidden, and a required column is never hidden", () => {
    renderGrid({ hiddenColumns: ["name", "category"] });
    expect(headers()).toEqual(["Product", "Price", "Notes"]);
  });

  test("an app that keeps the hidden columns controls the grid", async () => {
    const user = userEvent.setup();
    function ControlledGrid() {
      const [hiddenColumns, setHiddenColumns] = useState<string[]>(["price"]);
      return (
        <>
          <DataGrid
            caption="Products"
            columns={columns}
            rows={products}
            getRowKey={(product) => product.id}
            getRowLabel={(product) => product.name}
            columnsMenu
            hiddenColumns={hiddenColumns}
            onHiddenColumnsChange={setHiddenColumns}
          />
          <output>{hiddenColumns.join(",")}</output>
        </>
      );
    }
    render(<ControlledGrid />);
    expect(headers()).toEqual(["Product", "Category", "Notes"]);
    const list = await openMenu(user);
    await user.click(within(list).getByRole("checkbox", { name: "Category" }));
    expect(headers()).toEqual(["Product", "Notes"]);
    expect(screen.getByRole("status").textContent).toBe("category,price");
    await user.click(screen.getByRole("button", { name: "Back to default" }));
    expect(screen.getByRole("status").textContent).toBe("notes");
    expect(headers()).toEqual(["Product", "Category", "Price"]);
  });

  test("with every column required, the menu is not shown", () => {
    renderGrid({ columns: columns.map((column) => ({ ...column, required: true })) });
    expect(screen.queryByRole("button", { name: "Columns" })).toBeNull();
    expect(headers()).toEqual(["Product", "Category", "Price", "Notes"]);
  });

  test("the keyboard: Enter opens the menu, Tab goes to a checkbox, Space changes it, Escape closes and gives the focus back", async () => {
    const user = userEvent.setup();
    renderGrid();
    const button = screen.getByRole("button", { name: "Columns" });
    button.focus();
    await user.keyboard("{Enter}");
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("checkbox", { name: "Category" }));
    await user.keyboard(" ");
    expect(headers()).toEqual(["Product", "Price"]);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("group", { name: "Visible columns" })).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  test("the texts come from labels", async () => {
    const user = userEvent.setup();
    renderGrid({
      labels: { columns: "Colunas", visibleColumns: "Colunas visíveis", resetColumns: "Voltar ao padrão" },
    });
    await user.click(screen.getByRole("button", { name: "Colunas" }));
    const list = screen.getByRole("group", { name: "Colunas visíveis" });
    await user.click(within(list).getByRole("checkbox", { name: "Notes" }));
    expect(screen.getByRole("button", { name: "Voltar ao padrão" })).toBeDefined();
  });
});
