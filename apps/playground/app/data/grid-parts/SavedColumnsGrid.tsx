"use client";

import { useMemo, useSyncExternalStore } from "react";
import { DataGrid } from "@toraline.tech/ui";
import { productColumns } from "./product-columns";
import type { Product } from "./products";

/*
 * The example of TOR-1211: the columns a person hides are remembered in the
 * storage of the browser (localStorage). The library does not save them: the
 * grid takes "hiddenColumns" and calls "onHiddenColumnsChange", and this file
 * decides where the choice is kept.
 */

/** The event that tells the other grids of this page that the saved columns changed. The "storage" event of the browser only reaches other tabs. */
const CHANGE_EVENT = "playground:hidden-columns-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** The saved text as a list of column ids. undefined when nothing is saved, or when the text is not a list of texts. */
function readHiddenColumns(saved: string | null): string[] | undefined {
  if (saved === null) {
    return undefined;
  }
  try {
    const parsed: unknown = JSON.parse(saved);
    const isListOfTexts = Array.isArray(parsed) && parsed.every((item) => typeof item === "string");
    return isListOfTexts ? (parsed as string[]) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * The hidden columns of one table, kept in localStorage under "storageKey".
 *
 * - On the server and until the browser takes over the page, the result is
 *   undefined, so the grid shows the columns the screen starts with. The HTML
 *   of the server and the first render of the browser are then the same.
 * - undefined also means "nothing saved": a column added to the screen later
 *   follows its "defaultHidden". So when a person goes back to the columns the
 *   screen starts with ("defaultHiddenColumns"), the saved choice is removed.
 */
export function useSavedHiddenColumns(storageKey: string, defaultHiddenColumns: readonly string[]) {
  const saved = useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem(storageKey),
    () => null,
  );
  const hiddenColumns = useMemo(() => readHiddenColumns(saved), [saved]);

  function saveHiddenColumns(nextHiddenColumns: string[]) {
    if (nextHiddenColumns.join("\n") === defaultHiddenColumns.join("\n")) {
      window.localStorage.removeItem(storageKey);
    } else {
      window.localStorage.setItem(storageKey, JSON.stringify(nextHiddenColumns));
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return [hiddenColumns, saveHiddenColumns] as const;
}

/** The columns that are hidden until a person shows them, in the order of the columns. */
const defaultHiddenColumns = productColumns.filter((column) => column.defaultHidden).map((column) => column.id);

export function SavedColumnsGrid({ products }: { products: Product[] }) {
  const [hiddenColumns, saveHiddenColumns] = useSavedHiddenColumns(
    "playground:columns:products",
    defaultHiddenColumns,
  );
  return (
    <DataGrid
      caption="Products, with filters and the menu of the columns"
      columns={productColumns}
      rows={products}
      getRowKey={(product) => product.id}
      getRowLabel={(product) => product.name}
      locale="en"
      search={{ placeholder: "Search the products" }}
      pageSize={10}
      columnsMenu
      hiddenColumns={hiddenColumns}
      onHiddenColumnsChange={saveHiddenColumns}
    />
  );
}
