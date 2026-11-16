// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { DataGrid } from "./index";
import type { DataGridCellValue, DataGridColumn, DataGridSubRows } from "./index";

afterEach(cleanup);

type Option = { id: number; name: string; price: string };
type Group = { id: number; name: string; options: Option[] };

const groups: Group[] = [
  {
    id: 1,
    name: "Milk",
    options: [
      { id: 11, name: "Whole", price: "0,00" },
      { id: 12, name: "Oat", price: "2,00" },
    ],
  },
  { id: 2, name: "Syrup", options: [] },
];

const columns: DataGridColumn<Group>[] = [
  { id: "name", header: "Group", cell: (group) => group.name },
  { id: "count", header: "Options", align: "right", cell: (group) => group.options.length },
];

const optionColumns: DataGridColumn<Option>[] = [
  { id: "name", header: "Option", cell: (option) => option.name },
  {
    id: "price",
    header: "Extra price",
    align: "right",
    cell: (option) => `R$ ${option.price}`,
    editor: { type: "number", value: (option) => option.price },
    editOnClick: true,
  },
];

type SaveCell = (group: Group, option: Option, columnId: string, value: DataGridCellValue) => Promise<void>;

function GroupsGrid({
  onSaveCell,
  subRows,
}: {
  onSaveCell?: SaveCell;
  subRows?: Partial<DataGridSubRows<Group, Option>>;
}) {
  const [rows, setRows] = useState(groups);
  return (
    <DataGrid
      caption="Groups"
      columns={columns}
      rows={rows}
      getRowKey={(group) => group.id}
      getRowLabel={(group) => group.name}
      subRows={{
        label: "options",
        getRows: (group) => group.options,
        columns: optionColumns,
        getRowKey: (option) => option.id,
        getRowLabel: (option) => option.name,
        onSaveCell: async (group, option, columnId, value) => {
          await onSaveCell?.(group, option, columnId, value);
          setRows((current) =>
            current.map((row) =>
              row.id === group.id
                ? {
                    ...row,
                    options: row.options.map((item) =>
                      item.id === option.id ? { ...item, [columnId]: value } : item,
                    ),
                  }
                : row,
            ),
          );
        },
        ...subRows,
      }}
    />
  );
}

describe("DataGrid: rows inside a row", () => {
  test("each row has an arrow before its first cell, closed, named by the items, the record and their number", () => {
    render(<GroupsGrid />);
    const toggle = screen.getByRole("button", { name: "Show options of Milk (2)" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(toggle.hasAttribute("aria-controls")).toBe(false);
    expect(toggle.closest("td")?.getAttribute("data-label")).toBe("Group");
    expect(screen.getByRole("button", { name: "Show options of Syrup (0)" })).toBeDefined();
    expect(screen.getAllByRole("table")).toHaveLength(1);
  });

  test("a press shows the items in a table of their own under the row, and a second press hides them", async () => {
    const user = userEvent.setup();
    render(<GroupsGrid />);
    await user.click(screen.getByRole("button", { name: "Show options of Milk (2)" }));
    const toggle = screen.getByRole("button", { name: "Hide options of Milk (2)" });
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    const inner = screen.getByRole("table", { name: "options of Milk" });
    expect(toggle.getAttribute("aria-controls")).toBe(inner.closest("[data-slot=sub-rows]")?.id);
    expect(within(inner).getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
      "Option",
      "Extra price",
    ]);
    expect(within(inner).getAllByRole("row")).toHaveLength(3);
    // A cell of an item has no "data-label": on a narrow screen it shows only its value, as in Intraweb.
    expect(inner.querySelectorAll("td[data-label]")).toHaveLength(0);
    // The inner table is in a row of its own, right after the row of the record, as wide as the table.
    const innerRow = inner.closest("[data-slot=sub-rows-row]") as HTMLElement;
    expect(innerRow.previousElementSibling?.textContent).toContain("Milk");
    expect(innerRow.querySelector("td")?.getAttribute("colspan")).toBe("2");
    await user.click(toggle);
    expect(screen.queryByRole("table", { name: "options of Milk" })).toBeNull();
    expect(screen.getByRole("button", { name: "Show options of Milk (2)" }).getAttribute("aria-expanded")).toBe(
      "false",
    );
  });

  test("the keyboard: Enter and Space on the arrow show and hide the items, and the arrow keeps the focus", async () => {
    const user = userEvent.setup();
    render(<GroupsGrid />);
    screen.getByRole("button", { name: "Show options of Milk (2)" }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("table", { name: "options of Milk" })).toBeDefined();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Hide options of Milk (2)" }));
    await user.keyboard(" ");
    expect(screen.queryByRole("table", { name: "options of Milk" })).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Show options of Milk (2)" }));
  });

  test("several rows can be open at the same time", async () => {
    const user = userEvent.setup();
    render(<GroupsGrid />);
    await user.click(screen.getByRole("button", { name: "Show options of Milk (2)" }));
    await user.click(screen.getByRole("button", { name: "Show options of Syrup (0)" }));
    expect(screen.getByRole("table", { name: "options of Milk" })).toBeDefined();
    expect(screen.getByText("No items.")).toBeDefined();
  });

  test("a record with no item shows the message, and the footer is under the items", async () => {
    const user = userEvent.setup();
    render(
      <GroupsGrid
        subRows={{
          emptyMessage: "No option in this group.",
          footer: (group) => <button type="button">Add an option to {group.name}</button>,
        }}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Show options of Syrup (0)" }));
    expect(screen.getByText("No option in this group.")).toBeDefined();
    expect(screen.getByRole("button", { name: "Add an option to Syrup" })).toBeDefined();
  });

  test("the buttons of an item receive the record and the item", async () => {
    const user = userEvent.setup();
    render(
      <GroupsGrid
        subRows={{
          rowActions: (group, option) => (
            <button type="button">
              Remove {option.name} from {group.name}
            </button>
          ),
        }}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Show options of Milk (2)" }));
    const inner = screen.getByRole("table", { name: "options of Milk" });
    expect(within(inner).getByRole("columnheader", { name: "Actions" })).toBeDefined();
    expect(within(inner).getByRole("button", { name: "Remove Oat from Milk" })).toBeDefined();
  });

  test("a cell of an item is edited in place and saved with the record and the item", async () => {
    const user = userEvent.setup();
    const onSaveCell = vi.fn<SaveCell>(async () => undefined);
    render(<GroupsGrid onSaveCell={onSaveCell} />);
    await user.click(screen.getByRole("button", { name: "Show options of Milk (2)" }));
    await user.click(screen.getByRole("button", { name: "Edit Extra price — Oat: R$ 2,00" }));
    const field = screen.getByRole("textbox", { name: "Extra price — Oat" });
    await user.clear(field);
    await user.type(field, "3,50{Enter}");
    expect(onSaveCell).toHaveBeenCalledWith(groups[0], groups[0]?.options[1], "price", "3,50");
    const cell = await screen.findByRole("button", { name: "Edit Extra price — Oat: R$ 3,50" });
    await waitFor(() => expect(document.activeElement).toBe(cell));
    // The items stay open after the save.
    expect(screen.getByRole("table", { name: "options of Milk" })).toBeDefined();
  });

  test("an error of the app stays in the cell of the item", async () => {
    const user = userEvent.setup();
    render(<GroupsGrid onSaveCell={() => Promise.reject(new Error("Give a price."))} />);
    await user.click(screen.getByRole("button", { name: "Show options of Milk (2)" }));
    await user.click(screen.getByRole("button", { name: /Edit Extra price — Whole/ }));
    await user.type(screen.getByRole("textbox", { name: "Extra price — Whole" }), "x{Enter}");
    expect((await screen.findByRole("alert")).textContent).toBe("Give a price.");
  });

  test("without subRows.onSaveCell the cells of the items are plain", async () => {
    const user = userEvent.setup();
    render(<GroupsGrid subRows={{ onSaveCell: undefined }} />);
    await user.click(screen.getByRole("button", { name: "Show options of Milk (2)" }));
    expect(screen.queryByRole("button", { name: /Edit/ })).toBeNull();
  });

  test("the texts come from labels", async () => {
    const user = userEvent.setup();
    render(
      <DataGrid
        caption="Grupos"
        columns={columns}
        rows={groups}
        getRowKey={(group) => group.id}
        getRowLabel={(group) => group.name}
        subRows={{
          label: "opções",
          getRows: (group) => group.options,
          columns: optionColumns,
          getRowKey: (option) => option.id,
          getRowLabel: (option) => option.name,
        }}
        labels={{
          showSubRows: (subRowsLabel, rowLabel, count) => `Mostrar ${subRowsLabel} de ${rowLabel} (${count})`,
          hideSubRows: (subRowsLabel, rowLabel, count) => `Esconder ${subRowsLabel} de ${rowLabel} (${count})`,
          subRowsCaption: (subRowsLabel, rowLabel) => `Opções de ${rowLabel}`,
          noSubRows: "Nenhum item.",
        }}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Mostrar opções de Milk (2)" }));
    expect(screen.getByRole("button", { name: "Esconder opções de Milk (2)" })).toBeDefined();
    expect(screen.getByRole("table", { name: "Opções de Milk" })).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Mostrar opções de Syrup (0)" }));
    expect(screen.getByText("Nenhum item.")).toBeDefined();
  });
});
