"use client";

import type { FocusEvent, KeyboardEvent } from "react";
import { CheckboxControl } from "../checkbox/index.js";
import { DecimalInput } from "../decimal-input/index.js";
import { Select } from "../select/index.js";
import { classNames } from "../shared/class-names.js";
import { TextInput } from "../text-input/index.js";
import type { DataGridCellValue, DataGridColumnEditor } from "./data-grid-options.js";

/*
 * The classes are the ones of the cell editor of the app Intraweb
 * (components/ui/data-grid/cell-editor.tsx).
 */

/**
 * The border and the background of a field whose value was changed and is not
 * saved. "!" makes them win over the pointer and over the focus, as in
 * Intraweb: the field keeps the orange border while a person types in it.
 */
const changedClass = "border-changed! bg-warning!";

export type DataGridCellEditorProps<Row> = {
  /** The name of the field for a screen reader: the column and the record. */
  label: string;
  editor: DataGridColumnEditor<Row>;
  /** The value the field shows now. */
  value: DataGridCellValue;
  /** true while the value differs from the saved one. */
  changed: boolean;
  /** true while the value is being saved. */
  disabled: boolean;
  /** The id of the error message of the cell, when it has one. */
  errorId?: string;
  /** The text of the choice shown when the saved value is not one of the choices of a select. */
  selectPlaceholder: string;
  onChange: (value: DataGridCellValue) => void;
  /** true: the field takes the focus when it is shown. */
  autoFocus?: boolean;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
};

/**
 * The small field that takes the place of a cell while it is edited: the
 * TextInput, the DecimalInput, the Select or the CheckboxControl of this
 * library, in the size "sm".
 */
export function DataGridCellEditor<Row>({
  label,
  editor,
  value,
  changed,
  disabled,
  errorId,
  selectPlaceholder,
  onChange,
  autoFocus,
  onKeyDown,
  onBlur,
}: DataGridCellEditorProps<Row>) {
  const fieldProps = {
    "aria-label": label,
    "aria-invalid": errorId === undefined ? undefined : true,
    "aria-describedby": errorId,
    disabled,
    autoFocus,
    onKeyDown,
    onBlur,
  };

  if (editor.type === "checkbox") {
    return (
      <CheckboxControl
        {...fieldProps}
        checked={value === true}
        changed={changed}
        onChange={(event) => onChange(event.target.checked)}
      />
    );
  }

  if (editor.type === "select") {
    const text = String(value);
    return (
      <Select
        {...fieldProps}
        size="sm"
        value={text}
        onChange={(event) => onChange(event.target.value)}
        className={classNames("min-w-36", changed && changedClass)}
        data-changed={changed ? "true" : undefined}
      >
        {/* Without this choice, a select whose record has no value would show its first choice as if it were the value. */}
        {editor.options.some((option) => option.value === text) ? null : (
          <option value={text} disabled>
            {selectPlaceholder}
          </option>
        )}
        {editor.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    );
  }

  const Input = editor.type === "number" ? DecimalInput : TextInput;
  return (
    <Input
      {...fieldProps}
      size="sm"
      value={String(value)}
      onChange={(event) => onChange(event.target.value)}
      className={classNames(editor.type === "number" ? "w-24 text-right" : "min-w-40", changed && changedClass)}
      data-changed={changed ? "true" : undefined}
    />
  );
}
