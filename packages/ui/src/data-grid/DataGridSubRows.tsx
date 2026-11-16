"use client";

import { ActionsTh, Td, Th, Tr } from "../data-table/index.js";
import { IconButton } from "../icon-button/index.js";
import { ScrollBox } from "../shared/ScrollBox.js";
import { DataGridEditableCell } from "./DataGridEditableCell.js";
import { ChevronDownIcon, ChevronRightIcon } from "./DataGridIcons.js";
import type { DataGridColumn, DataGridLabels, DataGridSubRows } from "./data-grid-options.js";

/*
 * The classes are the ones of the rows inside a row of the app Intraweb
 * (components/ui/data-grid/sub-rows.tsx).
 */

export type DataGridSubRowsToggleProps = {
  /** The name of the button: "labels.showSubRows" or "labels.hideSubRows" of the record. */
  "aria-label": string;
  /** true while the rows inside the row are shown. */
  open: boolean;
  /** The id of the element with the rows inside the row. */
  controls: string;
  onToggle: () => void;
};

/**
 * The arrow before the first cell of a row, which shows and hides the rows
 * inside it. It is a button with aria-expanded: Enter and Space press it.
 */
export function DataGridSubRowsToggle({
  "aria-label": ariaLabel,
  open,
  controls,
  onToggle,
}: DataGridSubRowsToggleProps) {
  return (
    <IconButton
      icon={open ? ChevronDownIcon : ChevronRightIcon}
      size="sm"
      aria-label={ariaLabel}
      aria-expanded={open}
      aria-controls={open ? controls : undefined}
      className="-my-1.5 -ml-2 shrink-0"
      data-slot="sub-rows-toggle"
      onClick={onToggle}
    />
  );
}

export type DataGridSubRowsTableProps<Row, SubRow> = {
  /** The id that the arrow of the row names in aria-controls. */
  id: string;
  /** The record of the row that the items belong to. */
  parent: Row;
  /** The label of that record, for the name of the inner table. */
  parentLabel: string;
  subRows: DataGridSubRows<Row, SubRow>;
  /** The text for an error that "subRows.onSaveCell" was rejected with. */
  getSaveErrorMessage: (error: unknown) => string;
  labels: DataGridLabels;
};

/**
 * The items of one row, as a small table with its own columns, in a row of
 * its own under the row of the record. A cell of a column with "editOnClick"
 * is edited in place, and saved with "subRows.onSaveCell".
 */
export function DataGridSubRowsTable<Row, SubRow>({
  id,
  parent,
  parentLabel,
  subRows,
  getSaveErrorMessage,
  labels,
}: DataGridSubRowsTableProps<Row, SubRow>) {
  const items = subRows.getRows(parent);
  const hasActions = subRows.rowActions !== undefined;
  const caption = labels.subRowsCaption(subRows.label, parentLabel);

  function renderCell(item: SubRow, column: DataGridColumn<SubRow>) {
    const editor = column.editor;
    const onSaveCell = subRows.onSaveCell;
    const isEditable = column.editOnClick === true && (column.canEdit?.(item) ?? true);
    if (!isEditable || editor === undefined || onSaveCell === undefined) {
      return column.cell(item);
    }
    return (
      <DataGridEditableCell
        label={labels.cellLabel(column.header, subRows.getRowLabel(item))}
        display={column.cell(item)}
        editor={editor}
        value={editor.value(item)}
        onSave={(value) => onSaveCell(parent, item, column.id, value)}
        getSaveErrorMessage={getSaveErrorMessage}
        labels={labels}
      />
    );
  }

  return (
    <div id={id} className="space-y-2" data-slot="sub-rows">
      {items.length === 0 ? (
        <p className="text-sm text-secondary">{subRows.emptyMessage ?? labels.noSubRows}</p>
      ) : (
        <ScrollBox
          aria-label={caption}
          className="relative overflow-x-auto rounded-lg border border-default bg-surface"
        >
          <table className="w-full text-left text-sm">
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr>
                {subRows.columns.map((column) => (
                  <Th key={column.id} align={column.align}>
                    {column.header}
                  </Th>
                ))}
                {hasActions ? <ActionsTh label={labels.actions} /> : null}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <Tr key={subRows.getRowKey(item)} hoverable>
                  {subRows.columns.map((column) => (
                    <Td key={column.id} data-label={column.header} align={column.align}>
                      {renderCell(item, column)}
                    </Td>
                  ))}
                  {hasActions ? (
                    <Td className="w-12 text-right whitespace-nowrap">{subRows.rowActions?.(parent, item)}</Td>
                  ) : null}
                </Tr>
              ))}
            </tbody>
          </table>
        </ScrollBox>
      )}
      {subRows.footer?.(parent)}
    </div>
  );
}
