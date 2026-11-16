import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@toraline.tech/ui/theme";
import { SalesTabNav } from "./SalesTabNav";

/**
 * The layout of the 3 routes under /tab-nav. It shows TabNav in its two looks.
 * Each tab is a link to one of the routes. A press changes the route, and the
 * tab of the new route becomes the current one (aria-current="page").
 */
export default function TabNavLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="font-heading text-3xl font-semibold text-brand">TabNav</h1>
      <p className="mt-4">
        Tabs where each tab is a link to a route. Press a tab: the address changes, and the tab of
        the new route is the current one.
      </p>
      <p className="mt-2">
        <Link className="text-brand underline" href="/components">
          Back to the components
        </Link>
      </p>
      <ThemeToggle className="mt-4" />

      <section className="mt-8 rounded-xl border border-default bg-surface p-4">
        <h2 className="text-sm text-secondary">The look &quot;primary&quot;: a line under the current tab</h2>
        <div className="mt-2">
          <SalesTabNav variant="primary" label="Sales, primary" />
        </div>
        <h2 className="mt-6 text-sm text-secondary">
          The look &quot;secondary&quot;: the segmented control
        </h2>
        <div className="mt-2">
          <SalesTabNav variant="secondary" label="Sales, secondary" />
        </div>
        <div className="mt-6" data-testid="tab-nav-content">
          {children}
        </div>
      </section>
    </main>
  );
}
