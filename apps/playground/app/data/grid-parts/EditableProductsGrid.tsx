"use client";

import { useState } from "react";
import { DataGrid, parseDecimalInput } from "@toraline.tech/ui";
import type { DataGridCellValue, DataGridColumn } from "@toraline.tech/ui";
import type { Product } from "./products";

/*
 * The example of TOR-1212: cells that are edited in the grid. The grid shows
 * the field, the text "Saving…" and the error text. This file is the app: it
 * keeps the records, saves a value and says why a value is refused.
 */

const categories = ["Bakery", "Drinks", "Savory"];

const columns: DataGridColumn<Product>[] = [
  {
    id: "name",
    header: "Product",
    cell: (product) => <span className="font-medium text-primary">{product.name}</span>,
    editor: { type: "text", value: (product) => product.name },
    editOnClick: true,
  },
  {
    id: "category",
    header: "Category",
    cell: (product) => product.category,
    editor: {
      type: "select",
      value: (product) => product.category,
      options: categories.map((category) => ({ value: category, label: category })),
    },
    editOnClick: true,
  },
  {
    id: "price",
    header: "Price",
    align: "right",
    cell: (product) => product.price.toFixed(2),
    editor: { type: "number", value: (product) => product.price.toFixed(2) },
    editOnClick: true,
  },
  {
    id: "active",
    header: "Active",
    cell: (product) => (product.active ? "Yes" : "No"),
    editor: { type: "checkbox", value: (product) => product.active },
    editOnClick: true,
  },
];

/** What the API of a real app does: it waits, and it refuses a value that is not valid. */
async function saveProductCell(product: Product, columnId: string, value: DataGridCellValue): Promise<Product> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  if (columnId === "price") {
    const price = parseDecimalInput(String(value));
    if (price === null || Number.isNaN(price) || price < 0) {
      throw new Error("The price must be a number that is 0 or more.");
    }
    return { ...product, price };
  }
  if (columnId === "name" && String(value).trim() === "") {
    throw new Error("The product needs a name.");
  }
  return { ...product, [columnId]: value };
}

export function EditableProductsGrid({ products }: { products: Product[] }) {
  const [rows, setRows] = useState(products);
  return (
    <DataGrid
      caption="Products, edited in the grid"
      columns={columns}
      rows={rows}
      getRowKey={(product) => product.id}
      getRowLabel={(product) => product.name}
      locale="en"
      onSaveCell={async (product, columnId, value) => {
        const saved = await saveProductCell(product, columnId, value);
        setRows((currentRows) => currentRows.map((row) => (row.id === saved.id ? saved : row)));
      }}
    />
  );
}
