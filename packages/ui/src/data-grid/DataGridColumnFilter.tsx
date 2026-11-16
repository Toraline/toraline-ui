"use client";

import { useEffect, useId } from "react";
import type { KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useAnchoredPanel } from "../anchored-panel/use-anchored-panel.js";
import { Checkbox } from "../checkbox/index.js";
import { classNames } from "../shared/class-names.js";
import { focusRingClass } from "../shared/focus-ring.js";
import { tabbableElements } from "../shared/overlay/focusable.js";
import { OVERLAY_PANEL_ATTRIBUTE } from "../shared/overlay/use-overlay-layer.js";
import { TextInput } from "../text-input/index.js";
import { ListFilterIcon } from "./DataGridIcons.js";
import type { DataGridColumn, DataGridFilters, DataGridFilterValue, DataGridLabels } from "./data-grid-options.js";
import { checkedFilterValues, filterText, isFilterOn } from "./data-grid-rows.js";

/*
 * The classes are the ones of the column filter of the app Intraweb
 * (components/ui/data-grid/column-filter.tsx).
 */

/**
 * The button that opens the filter. While the filter hides rows, the button
 * has "data-active" and the brand colors, also under the pointer.
 */
const triggerClass = classNames(
  "relative inline-flex shrink-0 items-center justify-center rounded-md",
  "border-default text-icon hover:bg-muted hover:text-icon-strong",
  "data-active:border-brand data-active:bg-primary-subtle data-active:text-icon-brand data-active:hover:bg-primary-muted",
  "motion-safe:transition-colors",
  focusRingClass,
);

/** In the header of a column: a square of 24 pixels with only the icon. */
const iconTriggerClass = "size-6";

/** In the toolbar, where there is no header: 32 pixels high, with a border and the name of the column. */
const labeledTriggerClass = "h-8 gap-1.5 border px-2.5 text-sm/5";

/**
 * The panel is rendered in <body> with a fixed position, so the box of the
 * table, which scrolls, does not cut it. The text classes undo the look of a
 * header cell.
 */
const panelClass =
  "fixed z-50 w-64 rounded-lg border border-subtle bg-surface p-3 text-left font-body text-sm/5 font-normal normal-case shadow-lg";

/** The two small buttons above the choices. */
const quickButtonClass = classNames("font-medium hover:underline", focusRingClass);

export type DataGridColumnFilterProps<Row> = {
  column: DataGridColumn<Row>;
  /** The filters a person changed, from the state of the grid. */
  filters: DataGridFilters;
  /** Called with the new value of the filter of this column. */
  onChange: (value: DataGridFilterValue) => void;
  labels: DataGridLabels;
  /** true: the button also shows the name of the column, for the toolbar of a grid that shows another view. */
  labeled?: boolean;
};

/**
 * The filter of one column: a small button that opens a panel with a list of
 * choices (several can be checked) or a text field.
 *
 * - The panel is a dialog that does not block the page. When it opens, the
 *   focus goes to its first control. Tab and Shift+Tab stay inside it. Escape
 *   closes it and gives the focus back to the button. A press outside closes it.
 * - Each change filters the rows at once. There is no button to apply.
 */
export function DataGridColumnFilter<Row>({
  column,
  filters,
  onChange,
  labels,
  labeled = false,
}: DataGridColumnFilterProps<Row>) {
  const { open, toggle, triggerRef, panelRef, panelStyle, placed, handleEscape } = useAnchoredPanel({
    align: "left",
  });
  const panelId = useId();

  // A hidden panel cannot get the focus, so the focus moves after the panel is placed.
  useEffect(() => {
    const panel = panelRef.current;
    if (placed && panel !== null) {
      (tabbableElements(panel)[0] ?? panel).focus();
    }
  }, [placed, panelRef]);

  const filter = column.filter;
  if (filter === undefined) {
    return null;
  }
  const isActive = isFilterOn(column, filters);
  const checkedValues = checkedFilterValues(column, filters);

  function handlePanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    handleEscape(event);
    const panel = panelRef.current;
    if (event.key !== "Tab" || panel === null) {
      return;
    }
    // The panel is the last element of <body>. Without this, Tab would leave the page.
    const tabbable = tabbableElements(panel);
    const first = tabbable[0];
    const last = tabbable[tabbable.length - 1];
    if (first === undefined || last === undefined) {
      event.preventDefault();
    } else if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={labels.filterColumn(column.header, isActive)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        data-active={isActive ? "" : undefined}
        data-slot="filter-button"
        onClick={toggle}
        className={classNames(triggerClass, labeled ? labeledTriggerClass : iconTriggerClass)}
      >
        <ListFilterIcon aria-hidden="true" className="size-3.5" />
        {labeled ? <span className="text-primary">{column.header}</span> : null}
      </button>
      {open
        ? createPortal(
            <div
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-label={labels.filterColumn(column.header, false)}
              tabIndex={-1}
              onKeyDown={handlePanelKeyDown}
              style={panelStyle}
              className={classNames(panelClass, !placed && "invisible")}
              data-slot="filter-panel"
              // A click in the panel is not a click behind a Modal or a Drawer, and the focus may be in it.
              {...{ [OVERLAY_PANEL_ATTRIBUTE]: "" }}
            >
              {filter.type === "text" ? (
                <TextInput
                  size="sm"
                  aria-label={labels.filterColumn(column.header, false)}
                  placeholder={labels.filterContains}
                  value={filterText(column, filters)}
                  onChange={(event) => onChange(event.target.value)}
                />
              ) : (
                <fieldset className="space-y-2">
                  <legend className="sr-only">{labels.filterChoices(column.header)}</legend>
                  <div className="flex justify-between gap-2 pb-1 text-xs/4">
                    <button
                      type="button"
                      className={classNames(quickButtonClass, "text-brand")}
                      onClick={() => onChange(filter.options.map((option) => option.value))}
                    >
                      {labels.filterSelectAll}
                    </button>
                    <button
                      type="button"
                      className={classNames(quickButtonClass, "text-secondary")}
                      onClick={() => onChange([])}
                    >
                      {labels.filterClear}
                    </button>
                  </div>
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {filter.options.map((option) => (
                      <Checkbox
                        key={option.value}
                        label={option.label}
                        checked={checkedValues.includes(option.value)}
                        onChange={(event) =>
                          onChange(
                            event.target.checked
                              ? [...checkedValues, option.value]
                              : checkedValues.filter((value) => value !== option.value),
                          )
                        }
                      />
                    ))}
                  </div>
                </fieldset>
              )}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
