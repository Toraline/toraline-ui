import type { DataGridColumn, DataGridSort } from "./data-grid-options.js";

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

/**
 * The rows after the search and the sort, for every page.
 *
 * - The search keeps a row when one of the columns with "searchValue" has the text.
 * - The sort uses "sortValue" of the sorted column. A row with null goes to the
 *   end in both directions.
 */
export function searchAndSortRows<Row>(
  rows: readonly Row[],
  columns: readonly DataGridColumn<Row>[],
  search: string,
  sort: DataGridSort,
  locale?: string,
): Row[] {
  const query = normalizeText(search);
  const searchValues = columns.flatMap((column) => (column.searchValue ? [column.searchValue] : []));
  const found =
    query === ""
      ? [...rows]
      : rows.filter((row) => searchValues.some((searchValue) => normalizeText(searchValue(row)).includes(query)));

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
