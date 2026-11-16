import Link from "next/link";
import { Suspense } from "react";
import { ThemeToggle } from "@toraline.tech/ui/theme";
import { products } from "../grid-parts/products";
import { AddressGrid } from "./AddressGrid";

/**
 * The example of TOR-1215: the state of a DataGrid kept in the address of the
 * page. Change the search, the sort, a filter or the page, and reload: the
 * grid is the same. The adapter is 2 files of this folder: grid-address.ts
 * (the state as query parameters, and back) and use-grid-address.ts (the
 * navigation of Next.js).
 */
export default function AddressPage() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="font-heading text-3xl font-semibold text-brand">The state of a grid in the address</h1>
      <p className="mt-2">
        <Link className="text-brand underline" href="/data">
          Back to the data components
        </Link>
      </p>
      <ThemeToggle className="mt-4" />
      <p className="mt-4 text-sm/5 text-secondary">
        Search, sort, filter or go to another page, and look at the address: <code>busca</code>, <code>ordem</code>,{" "}
        <code>f-category</code>, <code>pagina</code>, <code>por-pagina</code>. Reload the page, or open{" "}
        <Link
          className="text-brand underline"
          href="/data/address?busca=a&ordem=-price&f-category=Bakery,Drinks&f-status=&pagina=2"
        >
          an address with a state
        </Link>
        : the grid starts with it.
      </p>
      <div className="mt-6">
        {/* useSearchParams needs <Suspense>: Next.js renders the grid in the browser when the page is built ahead. */}
        <Suspense fallback={<p className="text-sm/5 text-secondary">Loading the products…</p>}>
          <AddressGrid products={products} />
        </Suspense>
      </div>
    </main>
  );
}
