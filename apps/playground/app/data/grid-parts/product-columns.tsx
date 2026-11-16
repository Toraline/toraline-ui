import type { DataGridColumn } from "@toraline.tech/ui";
import type { Product } from "./products";

/**
 * The columns of the examples: a required column, a text filter, 2 lists of
 * choices (one with a default) and a column that starts hidden. The file has
 * no "use client": only Client Components import it, because a column has functions.
 */
export const productColumns: DataGridColumn<Product>[] = [
  {
    id: "name",
    header: "Product",
    required: true,
    cell: (product) => <span className="font-medium text-primary">{product.name}</span>,
    sortValue: (product) => product.name,
    searchValue: (product) => product.name,
    filter: { type: "text", value: (product) => product.name },
  },
  {
    id: "category",
    header: "Category",
    cell: (product) => product.category,
    sortValue: (product) => product.category,
    filter: {
      type: "options",
      options: ["Bakery", "Drinks", "Savory"].map((category) => ({ value: category, label: category })),
      value: (product) => product.category,
    },
  },
  {
    id: "supplier",
    header: "Supplier",
    defaultHidden: true,
    cell: (product) => product.supplier ?? "—",
    sortValue: (product) => product.supplier,
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
  {
    id: "status",
    header: "Status",
    cell: (product) => (product.active ? "Active" : "Inactive"),
    sortValue: (product) => (product.active ? 0 : 1),
    filter: {
      type: "options",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
      value: (product) => (product.active ? "active" : "inactive"),
      defaultValues: ["active"],
    },
  },
];
