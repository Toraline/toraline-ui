// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { DataGrid } from "./index";
import type { DataGridCellValue, DataGridColumn, DataGridProps } from "./index";

afterEach(cleanup);

type Product = { id: number; name: string; price: string; unit: string; visible: boolean; archived: boolean };

const products: Product[] = [
  { id: 1, name: "Pão de queijo", price: "9,50", unit: "un", visible: true, archived: false },
  { id: 2, name: "Coffee", price: "7,00", unit: "", visible: false, archived: false },
  { id: 3, name: "Old cake", price: "5,00", unit: "kg", visible: true, archived: true },
];

const columns: DataGridColumn<Product>[] = [
  {
    id: "name",
    header: "Product",
    cell: (product) => product.name,
    editor: { type: "text", value: (product) => product.name },
    editOnClick: true,
    canEdit: (product) => !product.archived,
  },
  {
    id: "price",
    header: "Price",
    align: "right",
    cell: (product) => `R$ ${product.price}`,
    editor: { type: "number", value: (product) => product.price },
    editOnClick: true,
    canEdit: (product) => !product.archived,
  },
  {
    id: "unit",
    header: "Unit",
    cell: (product) => product.unit || "—",
    editor: {
      type: "select",
      value: (product) => product.unit,
      options: [
        { value: "un", label: "Unit" },
        { value: "kg", label: "Kilogram" },
      ],
    },
    editOnClick: true,
  },
  {
    id: "visible",
    header: "On the menu",
    cell: (product) => (product.visible ? "Yes" : "No"),
    editor: { type: "checkbox", value: (product) => product.visible },
    editOnClick: true,
  },
];

type GridProps = Partial<DataGridProps<Product>>;

/** A grid whose records change when a cell is saved, as a screen of an app does after its API answers. */
function EditableGrid({ onSaveCell, ...props }: GridProps) {
  const [rows, setRows] = useState(products);
  return (
    <DataGrid
      caption="Products"
      columns={columns}
      rows={rows}
      getRowKey={(product) => product.id}
      getRowLabel={(product) => product.name}
      onSaveCell={async (row, columnId, value) => {
        await onSaveCell?.(row, columnId, value);
        setRows((current) =>
          current.map((product) => (product.id === row.id ? { ...product, [columnId]: value } : product)),
        );
      }}
      {...props}
    />
  );
}

/** A promise that the test settles itself, to look at the grid while the app saves. */
function pendingSave() {
  let resolve: () => void = () => undefined;
  let reject: (error: unknown) => void = () => undefined;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe("DataGrid: a cell that is edited in place", () => {
  test("a cell that can be edited is a button named by the column, the record and its content", () => {
    render(<EditableGrid />);
    expect(screen.getByRole("button", { name: "Edit Price — Coffee: R$ 7,00" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Edit Product — Coffee: Coffee" })).toBeDefined();
  });

  test("a column is not edited without editOnClick, without onSaveCell, or for a record that canEdit refuses", () => {
    const { unmount } = render(
      <EditableGrid columns={columns.map((column) => ({ ...column, editOnClick: false }))} />,
    );
    expect(screen.queryByRole("button", { name: /Edit/ })).toBeNull();
    expect(screen.queryByRole("checkbox")).toBeNull();
    unmount();
    render(
      <DataGrid
        caption="Products"
        columns={columns}
        rows={products}
        getRowKey={(product) => product.id}
        getRowLabel={(product) => product.name}
      />,
    );
    expect(screen.queryByRole("button", { name: /Edit/ })).toBeNull();
    cleanup();
    render(<EditableGrid />);
    expect(screen.queryByRole("button", { name: /Edit Price — Old cake/ })).toBeNull();
    expect(screen.getByRole("button", { name: /Edit Unit — Old cake/ })).toBeDefined();
  });

  test("a press shows a field with the saved value and the focus; a text is a TextInput and a number a DecimalInput", async () => {
    const user = userEvent.setup();
    render(<EditableGrid />);
    await user.click(screen.getByRole("button", { name: /Edit Price — Coffee/ }));
    const priceField = screen.getByRole("textbox", { name: "Price — Coffee" }) as HTMLInputElement;
    expect(priceField.value).toBe("7,00");
    expect(priceField.getAttribute("inputmode")).toBe("decimal");
    expect(priceField.getAttribute("data-size")).toBe("sm");
    expect(document.activeElement).toBe(priceField);
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: /Edit Product — Coffee/ }));
    expect(screen.getByRole("textbox", { name: "Product — Coffee" }).hasAttribute("inputmode")).toBe(false);
  });

  test("Enter saves the new value, shows it and gives the focus back to the cell", async () => {
    const user = userEvent.setup();
    const onSaveCell = vi.fn(async () => undefined);
    render(<EditableGrid onSaveCell={onSaveCell} />);
    await user.click(screen.getByRole("button", { name: /Edit Price — Coffee/ }));
    const field = screen.getByRole("textbox", { name: "Price — Coffee" });
    await user.clear(field);
    await user.type(field, "8,25");
    expect(field.getAttribute("data-changed")).toBe("true");
    await user.keyboard("{Enter}");
    expect(onSaveCell).toHaveBeenCalledTimes(1);
    expect(onSaveCell).toHaveBeenCalledWith(products[1], "price", "8,25");
    const button = await screen.findByRole("button", { name: "Edit Price — Coffee: R$ 8,25" });
    await waitFor(() => expect(document.activeElement).toBe(button));
  });

  test("Escape gives up the change, saves nothing and does not reach a listener of the page", async () => {
    const user = userEvent.setup();
    const onSaveCell = vi.fn(async () => undefined);
    const onDocumentKeyDown = vi.fn();
    render(<EditableGrid onSaveCell={onSaveCell} />);
    await user.click(screen.getByRole("button", { name: /Edit Price — Coffee/ }));
    await user.type(screen.getByRole("textbox", { name: "Price — Coffee" }), "99");
    document.addEventListener("keydown", onDocumentKeyDown);
    await user.keyboard("{Escape}");
    document.removeEventListener("keydown", onDocumentKeyDown);
    expect(onSaveCell).not.toHaveBeenCalled();
    expect(onDocumentKeyDown).not.toHaveBeenCalled();
    const button = screen.getByRole("button", { name: "Edit Price — Coffee: R$ 7,00" });
    await waitFor(() => expect(document.activeElement).toBe(button));
  });

  test("the value is saved when the focus leaves the field, once", async () => {
    const user = userEvent.setup();
    const onSaveCell = vi.fn(async () => undefined);
    render(<EditableGrid onSaveCell={onSaveCell} />);
    await user.click(screen.getByRole("button", { name: /Edit Product — Coffee/ }));
    await user.type(screen.getByRole("textbox", { name: "Product — Coffee" }), " beans");
    await user.tab();
    expect(onSaveCell).toHaveBeenCalledTimes(1);
    expect(onSaveCell).toHaveBeenCalledWith(products[1], "name", "Coffee beans");
    expect(await screen.findByRole("button", { name: /Edit Product — Coffee beans/ })).toBeDefined();
  });

  test("a value that did not change is not saved", async () => {
    const user = userEvent.setup();
    const onSaveCell = vi.fn(async () => undefined);
    render(<EditableGrid onSaveCell={onSaveCell} />);
    await user.click(screen.getByRole("button", { name: /Edit Price — Coffee/ }));
    await user.keyboard("{Enter}");
    expect(onSaveCell).not.toHaveBeenCalled();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  test("while the app saves, the field is disabled and the cell says it is saving", async () => {
    const user = userEvent.setup();
    const save = pendingSave();
    render(<EditableGrid onSaveCell={() => save.promise} />);
    await user.click(screen.getByRole("button", { name: /Edit Price — Coffee/ }));
    await user.type(screen.getByRole("textbox", { name: "Price — Coffee" }), "1");
    await user.keyboard("{Enter}");
    const field = screen.getByRole("textbox", { name: "Price — Coffee" }) as HTMLInputElement;
    expect(field.disabled).toBe(true);
    expect(screen.getByRole("status").textContent).toBe("Saving…");
    expect(field.closest("[data-slot=editable-cell]")?.getAttribute("aria-busy")).toBe("true");
    save.resolve();
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  test("when the app refuses, the field stays open with the error text, linked to the field, and has the focus", async () => {
    const user = userEvent.setup();
    const onSaveCell = vi.fn(async () => {
      throw new Error("The price must be a number.");
    });
    render(<EditableGrid onSaveCell={onSaveCell} />);
    await user.click(screen.getByRole("button", { name: /Edit Price — Coffee/ }));
    const field = screen.getByRole("textbox", { name: "Price — Coffee" }) as HTMLInputElement;
    await user.clear(field);
    await user.type(field, "abc");
    await user.keyboard("{Enter}");
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("The price must be a number.");
    expect(field.getAttribute("aria-invalid")).toBe("true");
    expect(field.getAttribute("aria-describedby")).toBe(alert.id);
    expect(field.disabled).toBe(false);
    expect(field.value).toBe("abc");
    await waitFor(() => expect(document.activeElement).toBe(field));
    // A second try that the app accepts closes the field.
    onSaveCell.mockImplementationOnce(async () => undefined);
    await user.clear(field);
    await user.type(field, "8");
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  test("the error text comes from getSaveErrorMessage, or from labels.saveFailed for an error with no message", async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <EditableGrid
        onSaveCell={() => Promise.reject({ status: 400, body: { price: ["Give a number."] } })}
        getSaveErrorMessage={(error) => (error as { body: { price: string[] } }).body.price.join(" ")}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Edit Price — Coffee/ }));
    await user.type(screen.getByRole("textbox", { name: "Price — Coffee" }), "x");
    await user.keyboard("{Enter}");
    expect((await screen.findByRole("alert")).textContent).toBe("Give a number.");
    unmount();
    render(<EditableGrid onSaveCell={() => Promise.reject("no")} labels={{ saveFailed: "Não foi possível salvar." }} />);
    await user.click(screen.getByRole("button", { name: /Edit Price — Coffee/ }));
    await user.type(screen.getByRole("textbox", { name: "Price — Coffee" }), "x");
    await user.keyboard("{Enter}");
    expect((await screen.findByRole("alert")).textContent).toBe("Não foi possível salvar.");
  });

  test("a select saves when a choice is made, and shows a placeholder for a value that is not a choice", async () => {
    const user = userEvent.setup();
    const onSaveCell = vi.fn(async () => undefined);
    render(<EditableGrid onSaveCell={onSaveCell} />);
    await user.click(screen.getByRole("button", { name: /Edit Unit — Coffee/ }));
    const select = screen.getByRole("combobox", { name: "Unit — Coffee" }) as HTMLSelectElement;
    expect(document.activeElement).toBe(select);
    expect([...select.options].map((option) => option.textContent)).toEqual(["Select…", "Unit", "Kilogram"]);
    expect(select.options[0]?.disabled).toBe(true);
    await user.selectOptions(select, "kg");
    expect(onSaveCell).toHaveBeenCalledTimes(1);
    expect(onSaveCell).toHaveBeenCalledWith(products[1], "unit", "kg");
    expect(await screen.findByRole("button", { name: "Edit Unit — Coffee: kg" })).toBeDefined();
    // A record whose value is a choice has no placeholder.
    await user.click(screen.getByRole("button", { name: /Edit Unit — Pão de queijo/ }));
    const secondSelect = screen.getByRole("combobox", { name: "Unit — Pão de queijo" }) as HTMLSelectElement;
    expect([...secondSelect.options].map((option) => option.textContent)).toEqual(["Unit", "Kilogram"]);
  });

  test("a checkbox is always shown, saves when it is changed, and goes back when the app refuses", async () => {
    const user = userEvent.setup();
    const onSaveCell = vi.fn<(row: Product, columnId: string, value: DataGridCellValue) => Promise<void>>(
      async () => undefined,
    );
    render(<EditableGrid onSaveCell={onSaveCell} />);
    const checkbox = screen.getByRole("checkbox", { name: "On the menu — Coffee" }) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    await user.click(checkbox);
    expect(onSaveCell).toHaveBeenCalledWith(products[1], "visible", true);
    await waitFor(() => expect(checkbox.checked).toBe(true));
    onSaveCell.mockImplementationOnce(async () => {
      throw new Error("Not allowed.");
    });
    await user.click(checkbox);
    expect((await screen.findByRole("alert")).textContent).toBe("Not allowed.");
    expect(checkbox.checked).toBe(true);
  });

  test("the keyboard: Enter on the cell opens the field, and the texts come from labels", async () => {
    const user = userEvent.setup();
    render(
      <EditableGrid
        labels={{
          cellLabel: (columnHeader, rowLabel) => `${columnHeader} de ${rowLabel}`,
          editCell: (cellLabel) => `Editar ${cellLabel}:`,
          saving: "Salvando…",
          selectPlaceholder: "Selecione…",
        }}
      />,
    );
    const button = screen.getByRole("button", { name: "Editar Unit de Coffee: —" });
    button.focus();
    await user.keyboard("{Enter}");
    const select = screen.getByRole("combobox", { name: "Unit de Coffee" });
    expect(within(select).getByRole("option", { name: "Selecione…" })).toBeDefined();
  });
});
