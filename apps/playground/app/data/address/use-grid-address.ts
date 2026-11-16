"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { dataGridPageSizes } from "@toraline.tech/ui";
import type { DataGridColumn, DataGridState } from "@toraline.tech/ui";
import { gridStateToQuery, readGridState } from "./grid-address";

/** URLSearchParams writes "," ":" "(" ")" and "!" as codes. They are allowed as they are, and the address is easier to read. */
const READABLE: Record<string, string> = { "%2C": ",", "%3A": ":", "%28": "(", "%29": ")", "%21": "!" };

function readableQuery(params: URLSearchParams): string {
  return params.toString().replace(/%2C|%3A|%28|%29|%21/g, (code) => READABLE[code] ?? code);
}

/**
 * Keeps the search, the sort, the filters and the page of a DataGrid in the
 * address of the page, with the navigation of Next.js. It is the adapter
 * between the grid and the router: the library does not import Next.js.
 *
 * - The address is read once, when the grid is first shown: "defaultState".
 * - Each change of the grid replaces the address ("onStateChange"). It adds no
 *   step to the history of the browser, and it does not scroll the page.
 * - The other query parameters of the page are kept.
 * - One grid for each page: the names have no prefix.
 *
 * The component that calls it must be inside <Suspense>, because it reads the
 * query parameters (a rule of useSearchParams in Next.js).
 */
export function useGridAddress<Row>(columns: readonly DataGridColumn<Row>[], defaultPageSize: number) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [defaultState] = useState(() => readGridState(searchParams, columns, dataGridPageSizes));

  function onStateChange(state: DataGridState) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [name, value] of Object.entries(gridStateToQuery(state, columns, defaultPageSize))) {
      if (value === null) {
        params.delete(name);
      } else {
        params.set(name, value);
      }
    }
    const query = readableQuery(params);
    router.replace(query === "" ? pathname : `${pathname}?${query}`, { scroll: false });
  }

  return { defaultState, onStateChange };
}
