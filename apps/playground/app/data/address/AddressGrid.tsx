"use client";

import { DataGrid } from "@toraline.tech/ui";
import { productColumns } from "../grid-parts/product-columns";
import type { Product } from "../grid-parts/products";
import { useGridAddress } from "./use-grid-address";

/** The number of rows of a page of this screen. It is not written in the address. */
const PAGE_SIZE = 10;

/** The example of TOR-1215: a grid whose search, sort, filters and page are in the address of the page. */
export function AddressGrid({ products }: { products: Product[] }) {
  const { defaultState, onStateChange } = useGridAddress(productColumns, PAGE_SIZE);
  return (
    <DataGrid
      caption="Products, with the state in the address"
      columns={productColumns}
      rows={products}
      getRowKey={(product) => product.id}
      getRowLabel={(product) => product.name}
      locale="en"
      search={{ placeholder: "Search the products" }}
      pageSize={PAGE_SIZE}
      columnsMenu
      defaultState={defaultState}
      onStateChange={onStateChange}
    />
  );
}
