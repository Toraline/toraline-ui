"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentProps, ElementType, ReactNode } from "react";
import { Button } from "../button/index.js";
import { CheckboxControl } from "../checkbox/index.js";
import { ActionsTh, DataTable, DataTableMessage, Td, Th, Tr } from "../data-table/index.js";
import { IconButton } from "../icon-button/index.js";
import { Select as SelectControl } from "../select/index.js";
import { classNames } from "../shared/class-names.js";
import { focusRingClass } from "../shared/focus-ring.js";
import { TextInput } from "../text-input/index.js";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  SearchIcon,
} from "./DataGridIcons.js";
import { dataGridPageSizes } from "./data-grid-options.js";
import type {
  DataGridCheckboxProps,
  DataGridColumn,
  DataGridGroup,
  DataGridLabels,
  DataGridSelectProps,
  DataGridState,
} from "./data-grid-options.js";
import { nextSort, searchAndSortRows } from "./data-grid-rows.js";

/*
 * The classes are the ones of the DataGrid of the app Intraweb
 * (components/ui/data-grid/data-grid.tsx).
 */

/** The texts of the grid in English. An app gives its own in the prop "labels". */
const defaultLabels: DataGridLabels = {
  actions: "Actions",
  clearFilters: "Clear filters",
  noResults: "No results with these filters.",
  loading: "Loading…",
  total: "Total",
  bulkActions: "Bulk actions",
  selectedCount: (count) => `${count} selected`,
  clearSelection: "Clear selection",
  selectAll: "Select all",
  selectRow: (rowLabel) => `Select ${rowLabel}`,
  pagination: "Pagination",
  pageRange: (firstRow, lastRow, rowCount) => `Showing ${firstRow}–${lastRow} of ${rowCount}`,
  rowsPerPage: "Per page",
  pageOf: (page, pageCount) => `${page} of ${pageCount}`,
  previousPage: "Previous page",
  nextPage: "Next page",
};

/**
 * The button of a header cell that sorts by its column. The header cell has
 * "aria-sort"; while the column is sorted, the text is darker.
 */
const sortButtonClass = classNames(
  "-mx-1 inline-flex items-center gap-1 rounded-[4px] px-1 py-0.5",
  "hover:bg-muted hover:text-primary",
  "in-aria-[sort=ascending]:text-primary in-aria-[sort=descending]:text-primary",
  focusRingClass,
);

/** The arrow of a sorted column is in the brand color; the two arrows of a column that is not sorted are quiet. */
const sortIconClass =
  "size-3.5 shrink-0 text-icon opacity-60 in-aria-[sort=ascending]:text-icon-brand in-aria-[sort=ascending]:opacity-100 in-aria-[sort=descending]:text-icon-brand in-aria-[sort=descending]:opacity-100";

/** The text style "label" of Intraweb, written as the classes of its values. */
const labelTextClass = "font-heading text-sm/5 font-medium";

/** A row whose checkbox is checked has the background of a selected part, also under the pointer. */
const checkedRowClass = "data-checked:bg-selected";

type RowKey = string | number;

/** The checkbox the grid shows when the app gives none: the CheckboxControl of this library. */
function DefaultCheckbox(props: DataGridCheckboxProps) {
  return <CheckboxControl {...props} />;
}

/** The field the grid shows when the app gives none: the Select of this library. */
function DefaultSelect(props: DataGridSelectProps) {
  return <SelectControl {...props} />;
}

export type DataGridProps<Row> = {
  /** The name of the table. A screen reader says it; it is not shown. */
  caption: string;
  /** The columns, in the order they are shown. */
  columns: readonly DataGridColumn<Row>[];
  /** Every record. The grid searches, sorts and cuts them into pages itself. */
  rows: readonly Row[];
  /**
   * Shows the rows in blocks, each with a header row, in the order given.
   * "rows" is still the full list. With groups there is no search, no sort, no
   * selection and no pages: the order is the order of the groups.
   */
  groups?: readonly DataGridGroup<Row>[];
  /** A value no other record has, for example its id. */
  getRowKey: (row: Row) => RowKey;
  /** The name of the record for a screen reader, for example the name of the product. */
  getRowLabel: (row: Row) => string;
  /** true for the record that is open, for example in a panel next to the grid. Its row gets aria-current="true". */
  isRowSelected?: (row: Row) => boolean;
  /** The buttons of the last column of a row, for example a menu. */
  rowActions?: (row: Row) => ReactNode;
  /** Props for the <tr> of a row, for example the handlers of a drag. */
  rowProps?: (row: Row) => ComponentProps<"tr">;
  /** Content shown in a row of its own under the row of a record. null or undefined: no extra row. */
  renderExpanded?: (row: Row) => ReactNode;
  /** The filters and the buttons of the screen, shown above the table, after the search field. */
  toolbar?: ReactNode;
  /** Turns on the search field, which looks in the columns with "searchValue". */
  search?: { placeholder: string };
  /**
   * Turns on a checkbox in each row and one in the header, which selects every
   * row the search found. While a row is selected, a bar shows what "actions"
   * returns. "clear" clears the selection, for example after an action ran.
   */
  selection?: { actions: (rows: Row[], clear: () => void) => ReactNode };
  /** Turns on the pages. The number of rows of a page, until the person chooses another. */
  pageSize?: number;
  /** The numbers of rows a person can choose for a page. When missing: 10, 25, 50 and 100. */
  pageSizeOptions?: readonly number[];
  /** The message when "rows" is empty. When missing: "No records." */
  emptyMessage?: ReactNode;
  /** true while the records are loading: the table has aria-busy="true" and shows the text of "labels.loading" in the place of the rows. */
  loading?: boolean;
  /** The search text, the sort, the page and the number of rows of a page the grid starts with, for example read from the address of the page. */
  defaultState?: Partial<DataGridState>;
  /** Called after a person changes the search text, the sort, the page or the number of rows of a page, for example to write them in the address of the page. */
  onStateChange?: (state: DataGridState) => void;
  /** The language that orders the texts of a sort, for example "pt-BR". When missing: the language of the browser. */
  locale?: string;
  /** The texts of the grid. Each one that is missing has its English default. */
  labels?: Partial<DataGridLabels>;
  /** The component of the checkbox of a row and of the header. When missing: the CheckboxControl of this library. */
  checkboxComponent?: ElementType<DataGridCheckboxProps>;
  /** The component of the field that chooses the number of rows of a page. When missing: the Select of this library. */
  selectComponent?: ElementType<DataGridSelectProps>;
  /** Classes for the element around the whole grid. */
  className?: string;
};

/**
 * A table of records with a search field, a sort by column, pages, a selection
 * with actions for the selected rows, a footer row with totals, and groups of rows.
 * Every feature is turned on by its prop or by a field of a column.
 *
 * - The app gives every record in "rows". The grid searches, sorts and cuts
 *   them into pages in the browser. It loads no data.
 * - The table is a DataTable with "stackOnMobile": on a narrow screen each row is a block.
 * - Keyboard: every control is a native button, field or checkbox.
 * - Screen reader: the header cell of a column that can be sorted has
 *   "aria-sort". The bar of the selected rows and the page controls are named
 *   regions. The row of the open record has aria-current="true".
 */
export function DataGrid<Row>({
  caption,
  columns,
  rows,
  groups,
  getRowKey,
  getRowLabel,
  isRowSelected,
  rowActions,
  rowProps,
  renderExpanded,
  toolbar,
  search,
  selection,
  pageSize,
  pageSizeOptions = dataGridPageSizes,
  emptyMessage = "No records.",
  loading = false,
  defaultState,
  onStateChange,
  locale,
  labels: givenLabels,
  checkboxComponent: Checkbox = DefaultCheckbox,
  selectComponent: Select = DefaultSelect,
  className,
}: DataGridProps<Row>) {
  const labels = { ...defaultLabels, ...givenLabels };
  const [state, setState] = useState<DataGridState>(() => ({
    search: defaultState?.search ?? "",
    sort: defaultState?.sort ?? null,
    page: Math.max(1, defaultState?.page ?? 1),
    pageSize: defaultState?.pageSize ?? pageSize ?? dataGridPageSizes[1],
  }));
  const [checkedKeys, setCheckedKeys] = useState<Set<RowKey>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);

  const isFlat = groups === undefined;
  // Without the prop "search" there is no field to empty, so a search text of defaultState does nothing.
  const searchText = search ? state.search : "";
  const foundRows = isFlat ? searchAndSortRows(rows, columns, searchText, state.sort, locale) : [...rows];
  const isPaginated = isFlat && pageSize !== undefined;
  const pageCount = isPaginated ? Math.max(1, Math.ceil(foundRows.length / state.pageSize)) : 1;
  const page = Math.min(state.page, pageCount);
  const pageRows = isPaginated
    ? foundRows.slice((page - 1) * state.pageSize, page * state.pageSize)
    : foundRows;
  const hasFilters = isFlat && searchText !== "";

  const isSelectable = isFlat && selection !== undefined && !loading;
  const selectedRows = isSelectable ? foundRows.filter((row) => checkedKeys.has(getRowKey(row))) : [];
  const areAllSelected = foundRows.length > 0 && selectedRows.length === foundRows.length;
  const areSomeSelected = selectedRows.length > 0 && !areAllSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = areSomeSelected;
    }
  }, [areSomeSelected]);

  const hasActions = rowActions !== undefined;
  const hasFooter = columns.some((column) => column.footer);
  const columnCount = columns.length + (hasActions ? 1 : 0) + (isSelectable ? 1 : 0);
  const firstColumnId = columns[0]?.id;
  const sizeOptions = pageSizeOptions.includes(state.pageSize)
    ? pageSizeOptions
    : [...pageSizeOptions, state.pageSize].sort((left, right) => left - right);

  function update(patch: Partial<DataGridState>) {
    const nextState = { ...state, ...patch };
    setState(nextState);
    onStateChange?.(nextState);
  }

  function clearFilters() {
    update({ search: "", page: 1 });
  }

  function clearSelection() {
    setCheckedKeys(new Set());
  }

  function toggleRow(row: Row) {
    const key = getRowKey(row);
    setCheckedKeys((currentKeys) => {
      const nextKeys = new Set(currentKeys);
      if (nextKeys.has(key)) {
        nextKeys.delete(key);
      } else {
        nextKeys.add(key);
      }
      return nextKeys;
    });
  }

  function renderHeader(column: DataGridColumn<Row>) {
    const isSortable = isFlat && column.sortValue !== undefined;
    const isSorted = state.sort?.columnId === column.id;
    const sortedDirection = state.sort?.descending ? "descending" : "ascending";
    const ariaSort = isSorted ? sortedDirection : "none";
    const SortedIcon = state.sort?.descending ? ArrowDownIcon : ArrowUpIcon;
    const SortIcon = isSorted ? SortedIcon : ChevronsUpDownIcon;
    const isRight = column.align === "right";
    return (
      <Th key={column.id} align={column.align} aria-sort={isSortable ? ariaSort : undefined}>
        <div
          className={classNames(
            "flex items-center gap-1",
            isRight && "justify-end",
            column.align === "center" && "justify-center",
          )}
        >
          {isSortable ? (
            <button
              type="button"
              onClick={() => update({ sort: nextSort(state.sort, column.id), page: 1 })}
              className={classNames(sortButtonClass, isRight && "flex-row-reverse")}
              data-slot="sort-button"
            >
              {column.header}
              <SortIcon aria-hidden="true" className={sortIconClass} />
            </button>
          ) : (
            column.header
          )}
        </div>
      </Th>
    );
  }

  function renderRow(row: Row) {
    const key = getRowKey(row);
    const expanded = renderExpanded?.(row);
    const isChecked = isSelectable && checkedKeys.has(key);
    const { className: rowClassName, ...otherRowProps } = rowProps?.(row) ?? {};
    return [
      <Tr
        key={key}
        {...otherRowProps}
        hoverable
        selected={isRowSelected?.(row) ?? false}
        data-checked={isChecked ? "" : undefined}
        className={classNames(checkedRowClass, rowClassName)}
      >
        {isSelectable ? (
          <Td className="w-10 pr-0">
            <Checkbox
              aria-label={labels.selectRow(getRowLabel(row))}
              checked={isChecked}
              onChange={() => toggleRow(row)}
            />
          </Td>
        ) : null}
        {columns.map((column) => (
          <Td key={column.id} data-label={column.header} align={column.align}>
            {column.cell(row)}
          </Td>
        ))}
        {hasActions ? <Td className="w-12 text-right whitespace-nowrap">{rowActions(row)}</Td> : null}
      </Tr>,
      expanded !== null && expanded !== undefined && expanded !== false ? (
        <tr key={`${key}-expanded`} data-slot="expanded-row">
          <Td colSpan={columnCount} className="bg-subtle">
            {expanded}
          </Td>
        </tr>
      ) : null,
    ];
  }

  function renderGroup(group: DataGridGroup<Row>) {
    const { className: headerClassName, ...otherHeaderProps } = group.headerProps ?? {};
    return [
      <tr key={`group-${group.key}`} {...otherHeaderProps} className={headerClassName} data-slot="group-header">
        <th
          scope="colgroup"
          colSpan={columnCount}
          className={classNames("border-t border-default bg-subtle px-4 py-2 text-left text-primary", labelTextClass)}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              {group.title}{" "}
              <span className="font-body font-normal text-tertiary">({group.rows.length})</span>
            </span>
            {group.actions ? <div className="flex gap-1 font-normal">{group.actions}</div> : null}
          </div>
        </th>
      </tr>,
      ...group.rows.map(renderRow),
    ];
  }

  function renderBody() {
    if (loading) {
      return <DataTableMessage colSpan={columnCount}>{labels.loading}</DataTableMessage>;
    }
    if (groups) {
      return groups.map(renderGroup);
    }
    if (foundRows.length > 0) {
      return pageRows.map(renderRow);
    }
    return (
      <DataTableMessage colSpan={columnCount}>
        {hasFilters ? (
          <span className="inline-flex flex-wrap items-center justify-center gap-2">
            {labels.noResults}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              {labels.clearFilters}
            </Button>
          </span>
        ) : (
          emptyMessage
        )}
      </DataTableMessage>
    );
  }

  const hasSearchField = isFlat && search !== undefined;
  const hasToolbar = hasSearchField || (toolbar !== undefined && toolbar !== null) || hasFilters;

  return (
    <div className={classNames("space-y-3", className)} data-slot="data-grid">
      {hasToolbar ? (
        <div className="flex flex-wrap items-center gap-2" data-slot="toolbar">
          {hasSearchField ? (
            <div className="w-full sm:w-80">
              <TextInput
                type="search"
                icon={SearchIcon}
                size="sm"
                aria-label={search.placeholder}
                placeholder={search.placeholder}
                value={state.search}
                onChange={(event) => update({ search: event.target.value, page: 1 })}
              />
            </div>
          ) : null}
          {toolbar}
          {hasFilters ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              {labels.clearFilters}
            </Button>
          ) : null}
        </div>
      ) : null}

      {selectedRows.length > 0 && selection ? (
        <div
          role="region"
          aria-label={labels.bulkActions}
          className="flex flex-wrap items-center gap-2 rounded-lg border border-brand bg-selected px-3 py-2"
          data-slot="bulk-actions"
        >
          <span className={classNames(labelTextClass, "text-primary")} role="status">
            {labels.selectedCount(selectedRows.length)}
          </span>
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {selection.actions(selectedRows, clearSelection)}
          </div>
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            {labels.clearSelection}
          </Button>
        </div>
      ) : null}

      <DataTable caption={caption} stackOnMobile aria-busy={loading ? "true" : undefined}>
        <thead>
          <tr>
            {isSelectable ? (
              <Th className="w-10 pr-0">
                <Checkbox
                  ref={selectAllRef}
                  aria-label={labels.selectAll}
                  checked={areAllSelected}
                  disabled={foundRows.length === 0}
                  onChange={() =>
                    setCheckedKeys(areAllSelected ? new Set() : new Set(foundRows.map(getRowKey)))
                  }
                />
              </Th>
            ) : null}
            {columns.map(renderHeader)}
            {hasActions ? <ActionsTh label={labels.actions} /> : null}
          </tr>
        </thead>
        <tbody>{renderBody()}</tbody>
        {hasFooter && !loading && foundRows.length > 0 ? (
          <tfoot>
            <tr className="bg-subtle font-medium text-strong">
              {isSelectable ? <Td className="border-t" /> : null}
              {columns.map((column) => {
                const firstCellText = column.id === firstColumnId ? labels.total : null;
                return (
                  <Td
                    key={column.id}
                    data-label={column.footer ? column.header : undefined}
                    align={column.align}
                    className="border-t text-strong"
                  >
                    {column.footer ? column.footer(foundRows) : firstCellText}
                  </Td>
                );
              })}
              {hasActions ? <Td className="border-t" /> : null}
            </tr>
          </tfoot>
        ) : null}
      </DataTable>

      {isPaginated && !loading && foundRows.length > 0 ? (
        <nav
          aria-label={labels.pagination}
          className="flex flex-wrap items-center justify-between gap-3 text-sm/5 text-secondary"
          data-slot="pagination"
        >
          <span>
            {labels.pageRange(
              (page - 1) * state.pageSize + 1,
              Math.min(page * state.pageSize, foundRows.length),
              foundRows.length,
            )}
          </span>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 whitespace-nowrap">
              {labels.rowsPerPage}
              <Select
                size="sm"
                className="w-20"
                value={state.pageSize}
                onChange={(event) => update({ pageSize: Number(event.target.value), page: 1 })}
              >
                {sizeOptions.map((sizeOption) => (
                  <option key={sizeOption} value={sizeOption}>
                    {sizeOption}
                  </option>
                ))}
              </Select>
            </label>
            <div className="flex items-center gap-1">
              <IconButton
                icon={ChevronLeftIcon}
                size="sm"
                variant="secondary"
                aria-label={labels.previousPage}
                disabled={page <= 1}
                onClick={() => update({ page: page - 1 })}
              />
              <span className="min-w-20 text-center tabular-nums">{labels.pageOf(page, pageCount)}</span>
              <IconButton
                icon={ChevronRightIcon}
                size="sm"
                variant="secondary"
                aria-label={labels.nextPage}
                disabled={page >= pageCount}
                onClick={() => update({ page: page + 1 })}
              />
            </div>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
