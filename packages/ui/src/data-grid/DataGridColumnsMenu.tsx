"use client";

import { useRef } from "react";
import { Button } from "../button/index.js";
import { Checkbox } from "../checkbox/index.js";
import { Popover } from "../popover/index.js";
import type { DataGridColumn, DataGridLabels } from "./data-grid-options.js";

/*
 * The classes are the ones of the column picker of the app Intraweb
 * (components/ui/data-grid/column-picker.tsx).
 */

/** The title of the list: the values of Intraweb's text style "caption-overline". */
const legendClass = "mb-1 font-heading text-xs/4 font-medium tracking-[0.05em] text-tertiary uppercase";

export type DataGridColumnsMenuProps<Row> = {
  /** Every column of the grid. A column with "required" is not in the menu. */
  columns: readonly DataGridColumn<Row>[];
  /** The "id" of each column that is hidden now. */
  hiddenColumnIds: readonly string[];
  /** false while the hidden columns are not the ones the columns ask for with "defaultHidden". */
  isDefault: boolean;
  /** Called with the "id" of a column when a person checks or unchecks it. */
  onToggle: (columnId: string) => void;
  /** Called when a person asks for the columns the screen starts with. */
  onReset: () => void;
  labels: DataGridLabels;
};

/**
 * The menu "Columns": a Popover with a checkbox for each column that is not
 * required, and a button that goes back to the columns the screen starts with.
 * With no column to choose, it renders nothing.
 */
export function DataGridColumnsMenu<Row>({
  columns,
  hiddenColumnIds,
  isDefault,
  onToggle,
  onReset,
  labels,
}: DataGridColumnsMenuProps<Row>) {
  const listRef = useRef<HTMLFieldSetElement>(null);
  const optionalColumns = columns.filter((column) => !column.required);
  if (optionalColumns.length === 0) {
    return null;
  }
  return (
    <Popover label={labels.columns} align="right" panelClassName="w-64">
      <fieldset ref={listRef} className="space-y-2" data-slot="columns-list">
        <legend className={legendClass}>{labels.visibleColumns}</legend>
        {optionalColumns.map((column) => (
          <Checkbox
            key={column.id}
            label={column.header}
            checked={!hiddenColumnIds.includes(column.id)}
            onChange={() => onToggle(column.id)}
          />
        ))}
      </fieldset>
      {isDefault ? null : (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => {
            // The button leaves the page after this press, so the focus goes to the first checkbox.
            listRef.current?.querySelector("input")?.focus();
            onReset();
          }}
        >
          {labels.resetColumns}
        </Button>
      )}
    </Popover>
  );
}
