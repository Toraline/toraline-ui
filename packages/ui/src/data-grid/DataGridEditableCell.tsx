"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, ReactNode } from "react";
import { classNames } from "../shared/class-names.js";
import { focusRingClass } from "../shared/focus-ring.js";
import { DataGridCellEditor } from "./DataGridCellEditor.js";
import { PencilIcon } from "./DataGridIcons.js";
import type { DataGridCellValue, DataGridColumnEditor, DataGridLabels } from "./data-grid-options.js";

/*
 * The classes and the rules are the ones of the inline cell of the app
 * Intraweb (components/ui/data-grid/inline-cell.tsx).
 */

/**
 * The cell at rest is a button as wide as the cell, with the content of the
 * cell and a pencil. It grows 8 pixels over the padding of the cell on each
 * side, so its background under the pointer has room around the text.
 */
const triggerClass = classNames(
  "group/editable-cell -mx-2 -my-1 flex w-[calc(100%+var(--spacing)*4)] min-w-0 items-center justify-between gap-2 rounded-md px-2 py-1 text-left",
  "hover:bg-muted focus-visible:bg-muted",
  focusRingClass,
);

/** The pencil is shown only under the pointer and with the keyboard focus. */
const pencilClass =
  "size-3.5 shrink-0 text-icon opacity-0 group-hover/editable-cell:opacity-100 group-focus-visible/editable-cell:opacity-100";

export type DataGridEditableCellProps<Row> = {
  /** The name of the cell: the column and the record, from "labels.cellLabel". */
  label: string;
  /** What the cell shows while it is not edited. */
  display: ReactNode;
  editor: DataGridColumnEditor<Row>;
  /** The saved value of the cell. */
  value: DataGridCellValue;
  /** Saves the value. A promise that is rejected leaves the field open with the error text. */
  onSave: (value: DataGridCellValue) => Promise<void>;
  /** The text for an error that "onSave" was rejected with. */
  getSaveErrorMessage: (error: unknown) => string;
  labels: DataGridLabels;
};

/**
 * A cell that is edited in place.
 *
 * - A press on the cell, or Enter or Space on it, shows the field with the focus.
 * - A text and a number are saved with Enter and when the focus leaves the
 *   field. A select is saved when a choice is made. A checkbox is always shown
 *   and is saved when it is changed.
 * - Escape gives up the change. It does not reach a Drawer or a Modal under the grid.
 * - While the app saves, the field is disabled and the cell shows "labels.saving".
 * - When the app refuses, the field stays open with the error text under it.
 * - A value that did not change is not saved.
 */
export function DataGridEditableCell<Row>({
  label,
  display,
  editor,
  value,
  onSave,
  getSaveErrorMessage,
  labels,
}: DataGridEditableCellProps<Row>) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<DataGridCellValue>(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Refs, not state: a choice of a select saves, and the blur right after it must not save a second time.
  const isFinishingRef = useRef(false);
  const isSavingRef = useRef(false);
  const errorId = useId();
  const actionId = useId();
  const displayId = useId();

  // Which element gets the focus after the next render: the button of the cell, or the field.
  const focusAfterRenderRef = useRef<"trigger" | "field" | null>(null);

  /**
   * After a render, when the button exists again or the field is enabled
   * again. The focus moves only when it was lost or is still in this cell.
   * When a person already moved it to another element, it stays there.
   */
  useEffect(() => {
    const target = focusAfterRenderRef.current;
    if (target === null || isSaving) {
      return;
    }
    focusAfterRenderRef.current = null;
    const active = document.activeElement;
    const isLost = active === null || active === document.body;
    if (!isLost && !containerRef.current?.contains(active)) {
      return;
    }
    const element =
      target === "trigger" ? triggerRef.current : containerRef.current?.querySelector<HTMLElement>("input, select");
    element?.focus();
  });

  function focusField() {
    focusAfterRenderRef.current = "field";
  }

  function start() {
    setDraft(value);
    setError(undefined);
    isFinishingRef.current = false;
    setIsEditing(true);
  }

  /** "restoreFocus" is for the keyboard. When the focus left the field, it is already on another element. */
  function stop(restoreFocus: boolean) {
    isFinishingRef.current = true;
    setIsEditing(false);
    setError(undefined);
    if (restoreFocus) {
      focusAfterRenderRef.current = "trigger";
    }
  }

  async function save(nextValue: DataGridCellValue, restoreFocus: boolean, onSaved: () => void) {
    if (isSavingRef.current) {
      return;
    }
    isSavingRef.current = true;
    setIsSaving(true);
    try {
      await onSave(nextValue);
      setError(undefined);
      onSaved();
    } catch (saveError) {
      setError(getSaveErrorMessage(saveError));
      // A disabled field loses the focus. It gets it back, so a person can correct the value.
      if (restoreFocus) {
        focusField();
      }
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }

  function commit(nextValue: DataGridCellValue, restoreFocus: boolean) {
    if (isFinishingRef.current || isSavingRef.current) {
      return;
    }
    if (nextValue === value) {
      stop(restoreFocus);
      return;
    }
    void save(nextValue, restoreFocus, () => stop(restoreFocus));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      // The key does not reach a Modal or a Drawer that is open under the grid.
      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();
      stop(true);
    } else if (event.key === "Enter") {
      event.preventDefault();
      commit(draft, true);
    }
  }

  function handleBlur(event: FocusEvent<HTMLElement>) {
    if (event.relatedTarget instanceof Node && containerRef.current?.contains(event.relatedTarget)) {
      return;
    }
    commit(draft, false);
  }

  const errorMessage =
    error === undefined ? null : (
      <p id={errorId} role="alert" className="text-xs/4 text-danger" data-slot="cell-error">
        {error}
      </p>
    );

  if (editor.type === "checkbox") {
    return (
      <div ref={containerRef} className="space-y-1" data-slot="editable-cell" aria-busy={isSaving ? "true" : undefined}>
        <DataGridCellEditor
          label={label}
          editor={editor}
          value={value}
          changed={false}
          disabled={isSaving}
          errorId={error === undefined ? undefined : errorId}
          selectPlaceholder={labels.selectPlaceholder}
          onChange={(nextValue) => void save(nextValue, true, focusField)}
        />
        {errorMessage}
      </div>
    );
  }

  if (!isEditing) {
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={start}
        // The name is the 2 texts with a space between them: "Edit Price — Coffee: R$ 7.00".
        aria-labelledby={`${actionId} ${displayId}`}
        className={triggerClass}
        data-slot="editable-cell"
      >
        <span id={actionId} className="sr-only">
          {labels.editCell(label)}
        </span>
        <span id={displayId} className="min-w-0">
          {display}
        </span>
        <PencilIcon aria-hidden="true" className={pencilClass} />
      </button>
    );
  }

  return (
    <div ref={containerRef} className="space-y-1" data-slot="editable-cell" aria-busy={isSaving ? "true" : undefined}>
      <DataGridCellEditor
        label={label}
        editor={editor}
        value={draft}
        changed={draft !== value}
        disabled={isSaving}
        errorId={error === undefined ? undefined : errorId}
        selectPlaceholder={labels.selectPlaceholder}
        autoFocus
        onChange={(nextValue) => {
          setDraft(nextValue);
          if (editor.type === "select") {
            commit(nextValue, true);
          }
        }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
      {isSaving ? (
        <p role="status" className="text-xs/4 text-secondary" data-slot="cell-saving">
          {labels.saving}
        </p>
      ) : null}
      {errorMessage}
    </div>
  );
}
