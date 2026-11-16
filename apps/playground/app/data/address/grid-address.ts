import type { DataGridColumn, DataGridFilters, DataGridSort, DataGridState } from "@toraline.tech/ui";

/*
 * The state of a DataGrid as query parameters of the address of the page, and
 * back. These 2 functions know no router: they read and write texts.
 *
 * The names are the ones of the app Intraweb, so an address saved there keeps
 * working:
 *
 * | Parameter      | Example                | Meaning                                                      |
 * |----------------|------------------------|--------------------------------------------------------------|
 * | busca          | busca=cake             | The text of the search field                                 |
 * | ordem          | ordem=name, ordem=-name| The id of the sorted column; "-" in front means descending   |
 * | f-<column id>  | f-status=active,paused | The checked choices of a filter, with commas, or its text    |
 * |                | f-status=              | Empty: a person unchecked the default choices of the column  |
 * | pagina         | pagina=3               | The page. Not written for the first page                     |
 * | por-pagina     | por-pagina=50          | The rows of a page. Not written for the size of the screen   |
 */

const SEARCH = "busca";
const SORT = "ordem";
const FILTER_PREFIX = "f-";
const PAGE = "pagina";
const PAGE_SIZE = "por-pagina";

/** What reads one query parameter: URLSearchParams, and the result of useSearchParams of Next.js. */
type QueryReader = { get: (name: string) => string | null };

function readSort(text: string | null): DataGridSort {
  if (text === null || text === "") {
    return null;
  }
  return text.startsWith("-") ? { columnId: text.slice(1), descending: true } : { columnId: text, descending: false };
}

/** The filters of the address. Only a column that has a filter is read. */
function readFilters<Row>(query: QueryReader, columns: readonly DataGridColumn<Row>[]): DataGridFilters {
  const filters: DataGridFilters = {};
  for (const column of columns) {
    const text = query.get(`${FILTER_PREFIX}${column.id}`);
    if (column.filter === undefined || text === null) {
      continue;
    }
    if (column.filter.type === "options") {
      // An empty text is an empty list: every default choice unchecked.
      filters[column.id] = text === "" ? [] : text.split(",");
    } else if (text !== "") {
      filters[column.id] = text;
    }
  }
  return filters;
}

/**
 * The state that the grid starts with, read from the address: give it to
 * "defaultState". A page size that is not one of "pageSizes" is ignored.
 */
export function readGridState<Row>(
  query: QueryReader,
  columns: readonly DataGridColumn<Row>[],
  pageSizes: readonly number[],
): Partial<DataGridState> {
  const pageSize = Number(query.get(PAGE_SIZE));
  return {
    search: query.get(SEARCH) ?? "",
    sort: readSort(query.get(SORT)),
    filters: readFilters(query, columns),
    page: Math.max(1, Math.floor(Number(query.get(PAGE))) || 1),
    ...(pageSizes.includes(pageSize) ? { pageSize } : {}),
  };
}

/**
 * The query parameters of a state of the grid: what "onStateChange" writes in
 * the address. null means "take this parameter out of the address". A value
 * that is the default (no search, no sort, the first page, the page size of
 * the screen, the default of a filter) is taken out, so the address stays short.
 */
export function gridStateToQuery<Row>(
  state: DataGridState,
  columns: readonly DataGridColumn<Row>[],
  defaultPageSize: number,
): Record<string, string | null> {
  const sortPrefix = state.sort?.descending ? "-" : "";
  const query: Record<string, string | null> = {
    [SEARCH]: state.search === "" ? null : state.search,
    [SORT]: state.sort === null ? null : `${sortPrefix}${state.sort.columnId}`,
    [PAGE]: state.page > 1 ? String(state.page) : null,
    [PAGE_SIZE]: state.pageSize === defaultPageSize ? null : String(state.pageSize),
  };
  for (const column of columns) {
    if (column.filter === undefined) {
      continue;
    }
    const value = state.filters[column.id];
    const text = typeof value === "string" ? value : value?.join(",");
    query[`${FILTER_PREFIX}${column.id}`] = text ?? null;
  }
  return query;
}
