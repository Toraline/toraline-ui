"use client";

import { useState } from "react";
import { DataGrid, parseDecimalInput } from "@toraline.tech/ui";
import type { DataGridColumn } from "@toraline.tech/ui";

/*
 * The example of TOR-1213: rows inside a row. Each group of complements has
 * options; the arrow of a group shows them in a small table, and a cell of an
 * option is edited in place.
 */

export type ComplementOption = { id: number; name: string; extraPrice: number };
export type ComplementGroup = { id: number; name: string; options: ComplementOption[] };

const groupColumns: DataGridColumn<ComplementGroup>[] = [
  {
    id: "name",
    header: "Group",
    cell: (group) => <span className="font-medium text-primary">{group.name}</span>,
    sortValue: (group) => group.name,
  },
  { id: "options", header: "Options", align: "right", cell: (group) => group.options.length },
];

const optionColumns: DataGridColumn<ComplementOption>[] = [
  {
    id: "name",
    header: "Option",
    cell: (option) => option.name,
    editor: { type: "text", value: (option) => option.name },
    editOnClick: true,
  },
  {
    id: "extraPrice",
    header: "Extra price",
    align: "right",
    cell: (option) => option.extraPrice.toFixed(2),
    editor: { type: "number", value: (option) => option.extraPrice.toFixed(2) },
    editOnClick: true,
  },
];

export function ComplementGroupsGrid({ groups }: { groups: ComplementGroup[] }) {
  const [rows, setRows] = useState(groups);

  function replaceOption(groupId: number, nextOption: ComplementOption) {
    setRows((currentRows) =>
      currentRows.map((group) =>
        group.id === groupId
          ? {
              ...group,
              options: group.options.map((option) => (option.id === nextOption.id ? nextOption : option)),
            }
          : group,
      ),
    );
  }

  return (
    <DataGrid
      caption="Groups of complements"
      columns={groupColumns}
      rows={rows}
      getRowKey={(group) => group.id}
      getRowLabel={(group) => group.name}
      locale="en"
      subRows={{
        label: "options",
        getRows: (group) => group.options,
        columns: optionColumns,
        getRowKey: (option) => option.id,
        getRowLabel: (option) => option.name,
        emptyMessage: "No option in this group.",
        onSaveCell: async (group, option, columnId, value) => {
          if (columnId === "extraPrice") {
            const extraPrice = parseDecimalInput(String(value));
            if (extraPrice === null || Number.isNaN(extraPrice)) {
              throw new Error("The price must be a number.");
            }
            replaceOption(group.id, { ...option, extraPrice });
            return;
          }
          replaceOption(group.id, { ...option, name: String(value) });
        },
      }}
    />
  );
}
