"use client";

import { useState } from "react";
import { Button, DataGrid } from "@toraline.tech/ui";
import { productColumns } from "./product-columns";
import type { Product } from "./products";

/*
 * The example of TOR-1214: another view in the place of the table. The app
 * keeps which view is shown, and gives "renderView" only for the cards. The
 * grid keeps the search and the filters, so they apply to both views.
 */

function ProductCards({ rows }: { rows: Product[] }) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm/5 text-secondary">No product with these filters.</p>;
  }
  return (
    <ul aria-label="Products as cards" className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {rows.map((product) => (
        <li key={product.id} className="rounded-lg border border-default bg-surface p-3">
          <p className="font-heading text-sm/5 font-medium text-primary">{product.name}</p>
          <p className="text-sm/5 text-secondary">{product.category}</p>
          <p className="mt-2 text-sm/5 text-body tabular-nums">{product.price.toFixed(2)}</p>
        </li>
      ))}
    </ul>
  );
}

export function ProductViewsGrid({ products }: { products: Product[] }) {
  const [showsCards, setShowsCards] = useState(true);
  return (
    <DataGrid
      caption="Products, as a table or as cards"
      columns={productColumns}
      rows={products}
      getRowKey={(product) => product.id}
      getRowLabel={(product) => product.name}
      locale="en"
      search={{ placeholder: "Search the products" }}
      pageSize={10}
      toolbar={
        <div role="group" aria-label="View" className="flex gap-1">
          <Button
            size="sm"
            variant={showsCards ? "ghost" : "soft"}
            aria-pressed={!showsCards}
            onClick={() => setShowsCards(false)}
          >
            Table
          </Button>
          <Button
            size="sm"
            variant={showsCards ? "soft" : "ghost"}
            aria-pressed={showsCards}
            onClick={() => setShowsCards(true)}
          >
            Cards
          </Button>
        </div>
      }
      renderView={showsCards ? (rows) => <ProductCards rows={rows} /> : undefined}
    />
  );
}
