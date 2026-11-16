import type { DataGridColumn, DataGridFilters, DataGridFilterValue, DataGridSort } from "./data-grid-options.js";

/** The text without capital letters and without accents, so a search for "joao" finds "João". */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/** Compares two sort values. A text is compared the way the language of "locale" orders it, and "10" comes after "9". */
function compareValues(left: string | number, right: string | number, locale: string | undefined): number {
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }
  return String(left).localeCompare(String(right), locale, { numeric: true, sensitivity: "base" });
}

/** The choices of a list in the order the column shows them, so two lists with the same choices are equal. */
function inOptionOrder<Row>(column: DataGridColumn<Row>, values: readonly string[]): string[] {
  if (column.filter?.type !== "options") {
    return [...values];
  }
  const known = column.filter.options.map((option) => option.value).filter((value) => values.includes(value));
  // A value that is not a choice of the column (an old address of the page) is kept at the end.
  return [...known, ...values.filter((value) => !known.includes(value))];
}

/** The checked choices of the filter of a column: what a person chose, or the defaults of the column. An empty list filters nothing. */
export function checkedFilterValues<Row>(column: DataGridColumn<Row>, filters: DataGridFilters): string[] {
  if (column.filter?.type !== "options") {
    return [];
  }
  const chosen = filters[column.id];
  if (chosen === undefined) {
    return inOptionOrder(column, column.filter.defaultValues ?? []);
  }
  const chosenList = typeof chosen === "string" ? [chosen] : chosen;
  return chosenList.filter((value) => value !== "");
}

/** The text of the text filter of a column, or "" when it has none. */
export function filterText<Row>(column: DataGridColumn<Row>, filters: DataGridFilters): string {
  if (column.filter?.type !== "text") {
    return "";
  }
  const chosen = filters[column.id] ?? "";
  return typeof chosen === "string" ? chosen : chosen.join(",");
}

/** true while the filter of the column hides rows: a choice is checked, or the text field has a text. */
export function isFilterOn<Row>(column: DataGridColumn<Row>, filters: DataGridFilters): boolean {
  return column.filter?.type === "options"
    ? checkedFilterValues(column, filters).length > 0
    : filterText(column, filters) !== "";
}

/**
 * The filters after a person changed the filter of one column. A value that
 * is the default of the column is taken out of the object, so the object has
 * only what differs from the defaults.
 */
export function withFilterValue<Row>(
  column: DataGridColumn<Row>,
  filters: DataGridFilters,
  value: DataGridFilterValue,
): DataGridFilters {
  const otherFilters = Object.fromEntries(Object.entries(filters).filter(([columnId]) => columnId !== column.id));
  if (typeof value === "string") {
    return value === "" ? otherFilters : { ...otherFilters, [column.id]: value };
  }
  const defaultValues = column.filter?.type === "options" ? (column.filter.defaultValues ?? []) : [];
  const ordered = inOptionOrder(column, value);
  const isDefault = ordered.join("\n") === inOptionOrder(column, defaultValues).join("\n");
  return isDefault ? otherFilters : { ...otherFilters, [column.id]: ordered };
}

/** true when the row passes the filter of the column. */
function matchesFilter<Row>(row: Row, column: DataGridColumn<Row>, filters: DataGridFilters): boolean {
  const filter = column.filter;
  if (filter === undefined) {
    return true;
  }
  if (filter.type === "text") {
    const query = normalizeText(filterText(column, filters));
    return query === "" || normalizeText(filter.value(row)).includes(query);
  }
  const checked = checkedFilterValues(column, filters);
  if (checked.length === 0) {
    return true;
  }
  const value = filter.value(row);
  return typeof value === "string" ? checked.includes(value) : value.some((item) => checked.includes(item));
}

/**
 * The rows after the search, the filters and the sort, for every page.
 *
 * - The search keeps a row when one of the columns with "searchValue" has the text.
 * - A row must pass the filter of every column given. A column that is not
 *   given (a hidden column) does not filter.
 * - The sort uses "sortValue" of the sorted column. A row with null goes to the
 *   end in both directions.
 */
export function searchAndSortRows<Row>(
  rows: readonly Row[],
  columns: readonly DataGridColumn<Row>[],
  search: string,
  sort: DataGridSort,
  locale?: string,
  filters: DataGridFilters = {},
): Row[] {
  const query = normalizeText(search);
  const searchValues = columns.flatMap((column) => (column.searchValue ? [column.searchValue] : []));
  const filterColumns = columns.filter((column) => column.filter !== undefined);
  const found = rows.filter(
    (row) =>
      (query === "" || searchValues.some((searchValue) => normalizeText(searchValue(row)).includes(query))) &&
      filterColumns.every((column) => matchesFilter(row, column, filters)),
  );

  const sortValue = sort ? columns.find((column) => column.id === sort.columnId)?.sortValue : undefined;
  if (!sort || !sortValue) {
    return found;
  }
  const direction = sort.descending ? -1 : 1;
  return found.sort((leftRow, rightRow) => {
    const left = sortValue(leftRow);
    const right = sortValue(rightRow);
    if (left === null && right === null) {
      return 0;
    }
    if (left === null) {
      return 1;
    }
    if (right === null) {
      return -1;
    }
    return compareValues(left, right, locale) * direction;
  });
}

/** The sort after a press on the header of a column: ascending, then descending, then no sort. */
export function nextSort(sort: DataGridSort, columnId: string): DataGridSort {
  if (sort?.columnId !== columnId) {
    return { columnId, descending: false };
  }
  return sort.descending ? null : { columnId, descending: true };
}
