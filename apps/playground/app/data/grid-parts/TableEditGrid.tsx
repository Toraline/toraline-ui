"use client";

import { useState } from "react";
import { DataGrid, parseDecimalInput } from "@toraline.tech/ui";
import type { DataGridColumn, DataGridRowChanges } from "@toraline.tech/ui";
import type { Product } from "./products";

/*
 * The example of TOR-1216: the mode "Edit table". The button turns every cell
 * with an editor into a field. A person changes several cells of several rows,
 * and one button saves each changed row as one. This file is the app: it keeps
 * the records, saves a row and says why a row is refused.
 */

const columns: DataGridColumn<Product>[] = [
  {
    id: "name",
    header: "Product",
    required: true,
    cell: (product) => <span className="font-medium text-primary">{product.name}</span>,
    editor: { type: "text", value: (product) => product.name },
  },
  { id: "category", header: "Category", cell: (product) => product.category },
  {
    id: "price",
    header: "Price",
    align: "right",
    cell: (product) => product.price.toFixed(2),
    editor: { type: "number", value: (product) => product.price.toFixed(2) },
  },
  {
    id: "active",
    header: "Active",
    cell: (product) => (product.active ? "Yes" : "No"),
    editor: { type: "checkbox", value: (product) => product.active },
  },
];

/** What the API of a real app does: it waits, and it refuses a row that is not valid. */
async function saveProductRow(product: Product, changes: DataGridRowChanges): Promise<Product> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const saved = { ...product };
  if ("name" in changes) {
    const name = String(changes.name).trim();
    if (name === "") {
      throw new Error("The product needs a name.");
    }
    saved.name = name;
  }
  if ("price" in changes) {
    const price = parseDecimalInput(String(changes.price));
    if (price === null || Number.isNaN(price) || price < 0) {
      throw new Error("The price must be a number that is 0 or more.");
    }
    saved.price = price;
  }
  if ("active" in changes) {
    saved.active = changes.active === true;
  }
  return saved;
}

export function TableEditGrid({ products }: { products: Product[] }) {
  const [rows, setRows] = useState(products);
  return (
    <DataGrid
      caption="Products, edited as a table"
      columns={columns}
      rows={rows}
      getRowKey={(product) => product.id}
      getRowLabel={(product) => product.name}
      locale="en"
      columnsMenu
      onSaveRow={async (product, changes) => {
        const saved = await saveProductRow(product, changes);
        setRows((currentRows) => currentRows.map((row) => (row.id === saved.id ? saved : row)));
      }}
    />
  );
}
