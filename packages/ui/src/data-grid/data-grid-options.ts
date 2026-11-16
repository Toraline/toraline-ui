import type { ComponentProps, ReactNode, Ref } from "react";
import type { ControlSize } from "../shared/control.js";
import type { TableCellAlignment } from "../data-table/index.js";

/*
 * The lists and the types of DataGrid. DataGrid.tsx starts with "use client",
 * and a Server Component cannot read a value that such a file exports. So the
 * values are in this file, which has no "use client".
 */

/** The numbers of rows a person can choose for one page. */
export const dataGridPageSizes = [10, 25, 50, 100] as const;

/** One choice of a list: of the filter of a column, or of a cell that is edited with a select. */
export type DataGridOption = {
  /** The value the grid keeps and gives back to the app. */
  value: string;
  /** The text a person reads. */
  label: string;
};

/**
 * The filter in the header of a column.
 *
 * - "options": a list of choices with a checkbox each. A row is shown when its
 *   value is one of the checked choices. With no choice checked, every row is shown.
 * - "text": a text field. A row is shown when its value has the text, with no
 *   difference for capital letters and accents.
 */
export type DataGridColumnFilter<Row> =
  | {
      type: "options";
      /** The choices, in the order they are shown. */
      options: readonly DataGridOption[];
      /** The value of a record, or its values: with several, one checked value is enough. */
      value: (row: Row) => string | readonly string[];
      /** The choices that are checked until a person changes the filter, for example only the active records. */
      defaultValues?: readonly string[];
    }
  | {
      type: "text";
      /** The text of a record that the filter looks in. */
      value: (row: Row) => string;
    };

/** The value of a cell that is edited: a text (also for a number and for a select), or true or false for a checkbox. */
export type DataGridCellValue = string | boolean;

/**
 * The field that takes the place of a cell while it is edited. "value" reads
 * the value of the record that the field starts with.
 *
 * - "text": a TextInput.
 * - "number": a DecimalInput. Its value is the text a person typed, with a
 *   comma or a point; the app reads the number when it saves.
 * - "select": a Select with the choices of "options".
 * - "checkbox": a CheckboxControl, which is always shown in the cell.
 */
export type DataGridColumnEditor<Row> =
  | { type: "text"; value: (row: Row) => string }
  | { type: "number"; value: (row: Row) => string }
  | { type: "select"; value: (row: Row) => string; options: readonly DataGridOption[] }
  | { type: "checkbox"; value: (row: Row) => boolean };

/** One column of a DataGrid. "Row" is the type of one record. */
export type DataGridColumn<Row> = {
  /** A name no other column of the grid has. The sort names the column by it. */
  id: string;
  /** The text of the header cell. It is also the name of the column in a row shown as a block on a narrow screen. */
  header: string;
  /** What the cell of this column shows for a record. */
  cell: (row: Row) => ReactNode;
  /** The side the content is aligned to. "right" is for numbers. When missing: the left. */
  align?: TableCellAlignment;
  /**
   * Turns on the sort by this column: a press on the header sorts the rows by
   * this value. A record with null always goes to the end.
   */
  sortValue?: (row: Row) => string | number | null;
  /** The text of this column that the search field looks in. */
  searchValue?: (row: Row) => string;
  /** The content of the footer cell, computed from the rows after the search and the filters (every page). */
  footer?: (rows: Row[]) => ReactNode;
  /** true: the column is always shown, and it is not in the menu "Columns". */
  required?: boolean;
  /** true: the column is hidden until a person turns it on in the menu "Columns". */
  defaultHidden?: boolean;
  /** The field that edits a cell of this column. It is used when "editOnClick" is true and the grid has "onSaveCell". */
  editor?: DataGridColumnEditor<Row>;
  /**
   * true: a press on a cell of this column edits it in place, and the grid
   * saves the value with "onSaveCell". An app gives false to a person who may
   * not edit.
   */
  editOnClick?: boolean;
  /** false for a record whose cell cannot be edited, for example an archived record. When missing: every record. */
  canEdit?: (row: Row) => boolean;
  /** Turns on the filter of this column: a small button in its header opens a panel with the choices or a text field. */
  filter?: DataGridColumnFilter<Row>;
};

/** A block of rows with its own header row, for example the products of one category. */
export type DataGridGroup<Row> = {
  /** A name no other group has. */
  key: string | number;
  /** The title of the group. The number of its rows is shown after it. */
  title: ReactNode;
  /** The buttons of the header row of the group. */
  actions?: ReactNode;
  /** Props for the <tr> of the header row of the group, for example the handlers of a drag. */
  headerProps?: ComponentProps<"tr">;
  /** The records of the group, in the order they are shown. */
  rows: readonly Row[];
};

/** The column the rows are sorted by and the direction, or null when the rows are in the order the app gave. */
export type DataGridSort = { columnId: string; descending: boolean } | null;

/** What a person chose in the filter of one column: the checked values of a list of choices, or the text of a text filter. */
export type DataGridFilterValue = readonly string[] | string;

/**
 * The filters a person changed, by the "id" of the column. A column that is
 * not in the object has its default: the "defaultValues" of a list of choices,
 * or no text. An empty list means that a person unchecked every choice of a
 * filter that has defaults.
 */
export type DataGridFilters = Record<string, DataGridFilterValue>;

/** What a person changed in the grid: the search text, the sort, the filters, the page and the number of rows of a page. */
export type DataGridState = {
  search: string;
  sort: DataGridSort;
  filters: DataGridFilters;
  /** The page that is shown. The first page is 1. */
  page: number;
  pageSize: number;
};

/** The texts the grid shows or gives to a screen reader. The library has no translations: an app in another language gives them. */
export type DataGridLabels = {
  /** The name of the column of the buttons of each row. Only a screen reader says it. */
  actions: string;
  /** The button that empties the search field and puts every filter back to its default. */
  clearFilters: string;
  /** The message when the search and the filters find no row. */
  noResults: string;
  /** The message while "loading" is true. */
  loading: string;
  /** The text of the first cell of the footer row, when the first column has no footer. */
  total: string;
  /** The name of the bar of the actions for the selected rows, for a screen reader. */
  bulkActions: string;
  /** The text of the bar: how many rows are selected. */
  selectedCount: (count: number) => string;
  /** The button that clears the selection. */
  clearSelection: string;
  /** The name of the checkbox of the header, which selects every row. */
  selectAll: string;
  /** The name of the checkbox of one row. It receives the result of getRowLabel. */
  selectRow: (rowLabel: string) => string;
  /** The name of the region with the page controls, for a screen reader. */
  pagination: string;
  /** Which rows are on the page: the number of the first one, of the last one, and of all the rows. */
  pageRange: (firstRow: number, lastRow: number, rowCount: number) => string;
  /** The label of the field that chooses the number of rows of a page. */
  rowsPerPage: string;
  /** The page that is shown and the number of pages. */
  pageOf: (page: number, pageCount: number) => string;
  /** The name of the button of the page before. */
  previousPage: string;
  /** The name of the button of the page after. */
  nextPage: string;
  /**
   * The name of the button that opens the filter of a column, and of its
   * panel. It receives the header of the column, and true while the filter is
   * not the default of the column.
   */
  filterColumn: (columnHeader: string, isActive: boolean) => string;
  /** The name of the list of choices of a filter, for a screen reader. It receives the header of the column. */
  filterChoices: (columnHeader: string) => string;
  /** The button of a filter that checks every choice. */
  filterSelectAll: string;
  /** The button of a filter that unchecks every choice. */
  filterClear: string;
  /** The placeholder of the text field of a text filter. */
  filterContains: string;
  /** The name of a cell that can be edited, for a screen reader: the header of its column and the label of its record. */
  cellLabel: (columnHeader: string, rowLabel: string) => string;
  /** The start of the name of the button of a cell that can be edited. Only a screen reader says it. It receives the result of cellLabel. */
  editCell: (cellLabel: string) => string;
  /** The text of a cell while the app saves its value. */
  saving: string;
  /** The error text of a cell when the app gives none. */
  saveFailed: string;
  /** The choice a select shows when the record has a value that is not one of its choices. */
  selectPlaceholder: string;
  /** The text of the button that opens the menu of the columns. */
  columns: string;
  /** The title of the list of columns in that menu. */
  visibleColumns: string;
  /** The button of that menu that goes back to the columns the screen starts with. */
  resetColumns: string;
};

/**
 * The props the grid gives to the checkbox of a row and of the header. The
 * component must give "ref" to its <input>: the grid uses it to show the
 * header checkbox as "some rows are selected".
 */
export type DataGridCheckboxProps = {
  ref?: Ref<HTMLInputElement>;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  "aria-label": string;
};

/** The props the grid gives to the field that chooses the number of rows of a page. "children" are <option> elements. */
export type DataGridSelectProps = {
  size: ControlSize;
  className: string;
  value: number;
  onChange: (event: { target: { value: string } }) => void;
  children: ReactNode;
};
