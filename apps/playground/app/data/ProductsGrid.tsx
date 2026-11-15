"use client";

import { Pencil } from "lucide-react";
import { Button, DataGrid, IconButton } from "@toraline.tech/ui";
import type { DataGridColumn } from "@toraline.tech/ui";

/**
 * DataGrid holds state and its columns are functions, so the file that uses it
 * is a Client Component. The page gives it the records, which are plain data.
 */

export type Product = { id: number; name: string; category: string; stock: number; price: number };

const columns: DataGridColumn<Product>[] = [
  {
    id: "name",
    header: "Product",
    cell: (product) => <span className="font-medium text-primary">{product.name}</span>,
    sortValue: (product) => product.name,
    searchValue: (product) => product.name,
  },
  {
    id: "category",
    header: "Category",
    cell: (product) => product.category,
    sortValue: (product) => product.category,
    searchValue: (product) => product.category,
  },
  {
    id: "stock",
    header: "Stock",
    align: "right",
    cell: (product) => product.stock,
    sortValue: (product) => product.stock,
    footer: (rows) => rows.reduce((sum, product) => sum + product.stock, 0),
  },
  {
    id: "price",
    header: "Price",
    align: "right",
    cell: (product) => product.price.toFixed(2),
    sortValue: (product) => product.price,
  },
];

export function ProductsGrid({ products }: { products: Product[] }) {
  return (
    <DataGrid
      caption="Products"
      columns={columns}
      rows={products}
      getRowKey={(product) => product.id}
      getRowLabel={(product) => product.name}
      locale="en"
      search={{ placeholder: "Search the products" }}
      pageSize={10}
      selection={{
        actions: (rows, clear) => (
          <Button size="sm" variant="secondary" onClick={clear}>
            Archive {rows.length}
          </Button>
        ),
      }}
      rowActions={(product) => <IconButton icon={Pencil} size="sm" aria-label={`Edit ${product.name}`} />}
      emptyMessage="No products yet."
    />
  );
}
