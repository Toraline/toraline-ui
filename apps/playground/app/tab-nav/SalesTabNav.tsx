"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TabNav } from "@toraline.tech/ui";
import type { TabNavVariant } from "@toraline.tech/ui";

const items = [
  // "exact": the route of this tab is the start of the routes of the other two.
  { href: "/tab-nav", label: "Overview", exact: true },
  { href: "/tab-nav/orders", label: "Orders" },
  { href: "/tab-nav/clients", label: "Clients" },
];

/**
 * The tabs of the 3 routes under /tab-nav. This file is a Client Component
 * because usePathname, the hook of Next.js that gives the current path, runs
 * in the browser. The library does not import Next.js: this app gives it the
 * current path and the Link of "next/link".
 */
export function SalesTabNav({ variant, label }: { variant: TabNavVariant; label: string }) {
  const pathname = usePathname();

  return (
    <TabNav
      items={items}
      currentPath={pathname}
      variant={variant}
      linkComponent={Link}
      aria-label={label}
    />
  );
}
