import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@toraline.tech/ui/theme";
import { ComplementGroupsGrid } from "./ComplementGroupsGrid";
import type { ComplementGroup } from "./ComplementGroupsGrid";
import { EditableProductsGrid } from "./EditableProductsGrid";
import { SavedColumnsGrid } from "./SavedColumnsGrid";
import { products } from "./products";

/**
 * The parts of the DataGrid of TOR-1209. This file is a Server Component: it
 * gives the records, which are plain data, to the Client Components that hold
 * the grids.
 */

const complementGroups: ComplementGroup[] = [
  {
    id: 1,
    name: "Milk",
    options: [
      { id: 11, name: "Whole milk", extraPrice: 0 },
      { id: 12, name: "Oat milk", extraPrice: 2 },
    ],
  },
  { id: 2, name: "Syrup", options: [{ id: 21, name: "Vanilla", extraPrice: 3 }] },
  { id: 3, name: "Toppings", options: [] },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-heading text-xl font-semibold">{title}</h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

export default function GridPartsPage() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="font-heading text-3xl font-semibold text-brand">The parts of the DataGrid</h1>
      <p className="mt-2">
        <Link className="text-brand underline" href="/data">
          Back to the data components
        </Link>
      </p>
      <ThemeToggle className="mt-4" />

      <Section title="Filters, and the columns remembered in the browser">
        <p className="text-sm/5 text-secondary">
          The columns &quot;Product&quot;, &quot;Category&quot; and &quot;Status&quot; have a filter in their header.
          The menu &quot;Columns&quot; hides and shows the columns. The choice is saved in localStorage by the file
          SavedColumnsGrid.tsx of this page, and it is still there after a reload.
        </p>
        <SavedColumnsGrid products={products} />
      </Section>

      <Section title="Cells edited in the grid">
        <p className="text-sm/5 text-secondary">
          A press on a cell shows a field. Enter saves, Escape gives up, and leaving the field saves. A price that is
          not a number is refused: the field stays open with the error text of the app.
        </p>
        <EditableProductsGrid products={products.slice(0, 6)} />
      </Section>

      <Section title="Rows inside a row">
        <p className="text-sm/5 text-secondary">
          The arrow of a group shows its options in a small table. A cell of an option is edited in place.
        </p>
        <ComplementGroupsGrid groups={complementGroups} />
      </Section>
    </main>
  );
}
