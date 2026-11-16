// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { DataGrid } from "./index";
import type { DataGridColumn, DataGridProps, DataGridRowChanges } from "./index";

afterEach(cleanup);

type Product = { id: number; name: string; price: string; unit: string; active: boolean; archived: boolean };

const products: Product[] = [
  { id: 1, name: "Granola", price: "10", unit: "kg", active: true, archived: false },
  { id: 2, name: "Cake", price: "20", unit: "un", active: true, archived: false },
  { id: 3, name: "Old bread", price: "5", unit: "un", active: false, archived: true },
];

const columns: DataGridColumn<Product>[] = [
  {
    id: "name",
    header: "Name",
    cell: (product) => product.name,
    sortValue: (product) => product.name,
    editor: { type: "text", value: (product) => product.name },
    canEdit: (product) => !product.archived,
  },
  {
    id: "price",
    header: "Price",
    align: "right",
    cell: (product) => product.price,
    editor: { type: "number", value: (product) => product.price },
    editOnClick: true,
    canEdit: (product) => !product.archived,
  },
  {
    id: "unit",
    header: "Unit",
    cell: (product) => product.unit,
    editor: {
      type: "select",
      value: (product) => product.unit,
      options: [
        { value: "un", label: "Unit" },
        { value: "kg", label: "Kilogram" },
      ],
    },
    canEdit: (product) => !product.archived,
  },
  {
    id: "active",
    header: "Active",
    cell: (product) => (product.active ? "Yes" : "No"),
    editor: { type: "checkbox", value: (product) => product.active },
    canEdit: (product) => !product.archived,
  },
  { id: "id", header: "Number", cell: (product) => product.id },
];

type SaveRow = (row: Product, changes: DataGridRowChanges) => Promise<void>;

/** A grid whose records change when a row is saved, as a screen of an app does after its API answers. */
function EditGrid({ onSaveRow, ...props }: Partial<DataGridProps<Product>> & { onSaveRow?: SaveRow }) {
  const [rows, setRows] = useState(products);
  return (
    <DataGrid
      caption="Products"
      columns={columns}
      rows={rows}
      getRowKey={(product) => product.id}
      getRowLabel={(product) => product.name}
      onSaveRow={async (row, changes) => {
        await onSaveRow?.(row, changes);
        setRows((current) => current.map((product) => (product.id === row.id ? { ...product, ...changes } : product)));
      }}
      {...props}
    />
  );
}

const field = (name: string) => screen.getByLabelText(name) as HTMLInputElement;

describe("DataGrid: the mode that edits the table", () => {
  test("without onSaveRow, or with no column that has an editor, there is no button", () => {
    const { unmount } = render(
      <DataGrid
        caption="Products"
        columns={columns}
        rows={products}
        getRowKey={(product) => product.id}
        getRowLabel={(product) => product.name}
      />,
    );
    expect(screen.queryByRole("button", { name: "Edit table" })).toBeNull();
    unmount();
    render(<EditGrid columns={[{ id: "name", header: "Name", cell: (product) => product.name }]} />);
    expect(screen.queryByRole("button", { name: "Edit table" })).toBeNull();
  });

  test("the button is disabled while the grid has no record", () => {
    render(<EditGrid rows={[]} />);
    expect((screen.getByRole("button", { name: "Edit table" }) as HTMLButtonElement).disabled).toBe(true);
  });

  test("a press turns every cell with an editor into a field named by its column and its record, with the saved value", async () => {
    const user = userEvent.setup();
    render(<EditGrid />);
    expect(screen.queryByRole("textbox")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Edit table" }));
    expect(field("Name — Granola").value).toBe("Granola");
    expect(field("Price — Granola").getAttribute("inputmode")).toBe("decimal");
    expect((screen.getByRole("combobox", { name: "Unit — Cake" }) as HTMLSelectElement).value).toBe("un");
    expect((screen.getByRole("checkbox", { name: "Active — Cake" }) as HTMLInputElement).checked).toBe(true);
    // A record that canEdit refuses, and a column with no editor, stay plain cells.
    expect(screen.queryByLabelText("Name — Old bread")).toBeNull();
    expect(screen.queryByLabelText("Number — Granola")).toBeNull();
    // A column with editOnClick is a field too, not a button.
    expect(screen.queryByRole("button", { name: /Edit Price/ })).toBeNull();
  });

  test("the toolbar shows the status and the 2 buttons in the place of the button and of the menu of the columns", async () => {
    const user = userEvent.setup();
    render(<EditGrid columnsMenu />);
    expect(screen.getByRole("button", { name: "Columns" })).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Edit table" }));
    expect(screen.queryByRole("button", { name: "Edit table" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Columns" })).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("No changes");
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDefined();
    expect((screen.getByRole("button", { name: "Save changes (0)" }) as HTMLButtonElement).disabled).toBe(true);
  });

  test("the first field gets the focus when the mode starts", async () => {
    const user = userEvent.setup();
    render(<EditGrid />);
    await user.click(screen.getByRole("button", { name: "Edit table" }));
    await waitFor(() => expect(document.activeElement).toBe(field("Name — Granola")));
  });

  test("a changed cell and its row are marked, the status counts the rows, and the saved value again is no change", async () => {
    const user = userEvent.setup();
    render(<EditGrid />);
    await user.click(screen.getByRole("button", { name: "Edit table" }));
    await user.type(field("Name — Granola"), "!");
    await user.click(screen.getByRole("checkbox", { name: "Active — Granola" }));
    expect(field("Name — Granola").getAttribute("data-changed")).toBe("true");
    expect(field("Price — Granola").hasAttribute("data-changed")).toBe(false);
    const row = field("Name — Granola").closest("tr") as HTMLElement;
    expect(row.getAttribute("data-changed")).toBe("true");
    expect(row.className.split(" ")).toContain("bg-warning");
    expect(row.className.split(" ")).not.toContain("hover:bg-subtle");
    expect(screen.getByRole("status").textContent).toBe("1 row changed");
    await user.type(field("Price — Cake"), "1");
    expect(screen.getByRole("status").textContent).toBe("2 rows changed");
    expect(screen.getByRole("button", { name: "Save changes (2)" })).toBeDefined();
    await user.type(field("Price — Cake"), "{Backspace}");
    expect(screen.getByRole("status").textContent).toBe("1 row changed");
    expect(field("Price — Cake").closest("tr")?.hasAttribute("data-changed")).toBe(false);
  });

  test("saving calls onSaveRow once for each changed row, with only its changed cells, and leaves the mode", async () => {
    const user = userEvent.setup();
    const onSaveRow = vi.fn<SaveRow>(async () => undefined);
    render(<EditGrid onSaveRow={onSaveRow} />);
    await user.click(screen.getByRole("button", { name: "Edit table" }));
    await user.clear(field("Price — Granola"));
    await user.type(field("Price — Granola"), "11,5");
    await user.click(screen.getByRole("checkbox", { name: "Active — Granola" }));
    await user.selectOptions(screen.getByRole("combobox", { name: "Unit — Cake" }), "kg");
    await user.click(screen.getByRole("button", { name: "Save changes (2)" }));
    const editButton = await screen.findByRole("button", { name: "Edit table" });
    expect(onSaveRow).toHaveBeenCalledTimes(2);
    expect(onSaveRow).toHaveBeenNthCalledWith(1, products[0], { price: "11,5", active: false });
    expect(onSaveRow).toHaveBeenNthCalledWith(2, products[1], { unit: "kg" });
    expect(screen.queryByRole("textbox")).toBeNull();
    const body = screen.getByRole("table").querySelector("tbody") as HTMLElement;
    expect(within(body).getByText("11,5")).toBeDefined();
    await waitFor(() => expect(document.activeElement).toBe(editButton));
  });

  test("while the app saves, the fields and the buttons are disabled, the button says so and the table is busy", async () => {
    const user = userEvent.setup();
    let finish: () => void = () => undefined;
    render(<EditGrid onSaveRow={() => new Promise<void>((resolve) => (finish = resolve))} />);
    await user.click(screen.getByRole("button", { name: "Edit table" }));
    await user.type(field("Name — Granola"), "!");
    await user.click(screen.getByRole("button", { name: "Save changes (1)" }));
    expect((screen.getByRole("button", { name: "Saving…" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Cancel" }) as HTMLButtonElement).disabled).toBe(true);
    expect(field("Name — Granola").disabled).toBe(true);
    expect(screen.getByRole("table").getAttribute("aria-busy")).toBe("true");
    finish();
    expect(await screen.findByRole("button", { name: "Edit table" })).toBeDefined();
    expect(screen.getByRole("table").hasAttribute("aria-busy")).toBe(false);
  });

  test("a row that the app refuses stays changed with the error under it; the saved rows leave the count", async () => {
    const user = userEvent.setup();
    const onSaveRow = vi.fn<SaveRow>(async (row) => {
      if (row.id === 2) {
        throw new Error("The price is not valid.");
      }
    });
    render(<EditGrid onSaveRow={onSaveRow} />);
    await user.click(screen.getByRole("button", { name: "Edit table" }));
    await user.type(field("Name — Granola"), "!");
    await user.clear(field("Price — Cake"));
    await user.type(field("Price — Cake"), "-1");
    await user.click(screen.getByRole("button", { name: "Save changes (2)" }));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("Cake: The price is not valid.");
    // The error is in a row of its own, right under the row of the record.
    expect(alert.closest("tr")?.previousElementSibling).toBe(field("Price — Cake").closest("tr"));
    expect(field("Price — Cake").value).toBe("-1");
    expect(field("Name — Granola!").value).toBe("Granola!");
    expect(field("Name — Granola!").hasAttribute("data-changed")).toBe(false);
    const saveButton = screen.getByRole("button", { name: "Save changes (1)" });
    await waitFor(() => expect(document.activeElement).toBe(saveButton));
    // A second try that the app accepts leaves the mode.
    onSaveRow.mockImplementation(async () => undefined);
    await user.click(saveButton);
    expect(await screen.findByRole("button", { name: "Edit table" })).toBeDefined();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(onSaveRow).toHaveBeenLastCalledWith(expect.objectContaining({ id: 2 }), { price: "-1" });
  });

  test("the error text comes from getSaveErrorMessage, or from labels.saveFailed", async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <EditGrid onSaveRow={() => Promise.reject({ detail: "Refused." })} getSaveErrorMessage={(error) => (error as { detail: string }).detail} />,
    );
    await user.click(screen.getByRole("button", { name: "Edit table" }));
    await user.type(field("Name — Granola"), "!");
    await user.click(screen.getByRole("button", { name: "Save changes (1)" }));
    expect((await screen.findByRole("alert")).textContent).toBe("Granola: Refused.");
    unmount();
    render(<EditGrid onSaveRow={() => Promise.reject("no")} />);
    await user.click(screen.getByRole("button", { name: "Edit table" }));
    await user.type(field("Name — Granola"), "!");
    await user.click(screen.getByRole("button", { name: "Save changes (1)" }));
    expect((await screen.findByRole("alert")).textContent).toBe("Granola: Could not save.");
  });

  test('"Cancel" gives up every change, saves nothing, and the focus goes back to the button', async () => {
    const user = userEvent.setup();
    const onSaveRow = vi.fn<SaveRow>(async () => undefined);
    render(<EditGrid onSaveRow={onSaveRow} />);
    await user.click(screen.getByRole("button", { name: "Edit table" }));
    await user.type(field("Name — Granola"), "!");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onSaveRow).not.toHaveBeenCalled();
    expect(screen.queryByRole("textbox")).toBeNull();
    const editButton = screen.getByRole("button", { name: "Edit table" });
    await waitFor(() => expect(document.activeElement).toBe(editButton));
    await user.click(editButton);
    expect(field("Name — Granola").value).toBe("Granola");
  });

  test("in the mode there are no buttons of the rows, no selection, no extra row, no items and no props of the app on a row", async () => {
    const user = userEvent.setup();
    render(
      <EditGrid
        rowActions={(product) => <button type="button">Delete {product.name}</button>}
        selection={{ actions: () => null }}
        renderExpanded={(product) => (product.id === 1 ? "More about the granola" : null)}
        rowProps={() => ({ draggable: true })}
        subRows={{
          label: "sizes",
          getRows: () => [],
          columns: [],
          getRowKey: () => 1,
          getRowLabel: () => "",
        }}
      />,
    );
    expect(screen.getByRole("button", { name: "Delete Granola" })).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Edit table" }));
    expect(screen.queryByRole("button", { name: "Delete Granola" })).toBeNull();
    expect(screen.queryByRole("columnheader", { name: "Actions" })).toBeNull();
    expect(screen.queryByRole("checkbox", { name: "Select all" })).toBeNull();
    expect(screen.queryByText("More about the granola")).toBeNull();
    expect(screen.queryByRole("button", { name: /Show sizes/ })).toBeNull();
    expect(field("Name — Granola").closest("tr")?.hasAttribute("draggable")).toBe(false);
  });

  test("the keyboard: Enter starts the mode, Tab goes from field to field, Space changes a checkbox, Enter on the button saves", async () => {
    const user = userEvent.setup();
    const onSaveRow = vi.fn<SaveRow>(async () => undefined);
    render(<EditGrid onSaveRow={onSaveRow} />);
    screen.getByRole("button", { name: "Edit table" }).focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(document.activeElement).toBe(field("Name — Granola")));
    await user.keyboard(" bar");
    await user.tab();
    expect(document.activeElement).toBe(field("Price — Granola"));
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("checkbox", { name: "Active — Granola" }));
    await user.keyboard(" ");
    const saveButton = screen.getByRole("button", { name: "Save changes (1)" });
    saveButton.focus();
    await user.keyboard("{Enter}");
    await screen.findByRole("button", { name: "Edit table" });
    expect(onSaveRow).toHaveBeenCalledWith(products[0], { name: "Granola bar", active: false });
  });

  test("the texts come from labels", async () => {
    const user = userEvent.setup();
    render(
      <EditGrid
        onSaveRow={() => Promise.reject(new Error("Informe o nome."))}
        labels={{
          editTable: "Editar tabela",
          noChanges: "Nenhuma alteração",
          changedRows: (count) => `${count} ${count === 1 ? "linha alterada" : "linhas alteradas"}`,
          cancelEditing: "Cancelar",
          saveChanges: (count) => `Salvar alterações (${count})`,
          savingChanges: "Salvando…",
          rowError: (rowLabel, errorMessage) => `${rowLabel} — ${errorMessage}`,
        }}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Editar tabela" }));
    expect(screen.getByRole("status").textContent).toBe("Nenhuma alteração");
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDefined();
    await user.clear(field("Name — Granola"));
    expect(screen.getByRole("status").textContent).toBe("1 linha alterada");
    await user.click(screen.getByRole("button", { name: "Salvar alterações (1)" }));
    expect((await screen.findByRole("alert")).textContent).toBe("Granola — Informe o nome.");
  });
});
