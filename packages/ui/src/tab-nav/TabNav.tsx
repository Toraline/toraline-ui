import type { ComponentProps, ElementType, ReactNode } from "react";
import { classNames } from "../shared/class-names.js";
import { focusRingClass } from "../shared/focus-ring.js";
import { segmentedItemClass, segmentedTrackClass } from "../shared/segmented.js";

/**
 * The looks of the tabs. The first one is the default.
 * "primary": a row with a line under it, and a line in the brand color under the current tab.
 * "secondary": the segmented look, where the current tab is a raised white piece.
 */
export const tabNavVariants = ["primary", "secondary"] as const;
export type TabNavVariant = (typeof tabNavVariants)[number];

/*
 * The classes are the ones of the TabNav of the app Intraweb
 * (components/ui/tab-nav.tsx). The current tab is selected by
 * aria-current="page", the attribute a screen reader reads.
 */

/**
 * The row of each variant. "primary": on a narrow screen the row scrolls
 * sideways and its right edge fades out; from the breakpoint "md" the tabs go
 * to a second line when they do not fit.
 */
const navClass: Record<TabNavVariant, string> = {
  primary:
    "flex gap-1 overflow-x-auto border-b border-default [mask-image:linear-gradient(to_right,black_calc(100%-(var(--spacing)*8)),transparent)] md:flex-wrap md:overflow-visible md:[mask-image:none]",
  secondary: segmentedTrackClass,
};

/** One tab of each variant. In "primary" the negative margin puts the line of the current tab on the line of the row. */
const linkClass: Record<TabNavVariant, string> = {
  primary: classNames(
    "-mb-px flex h-11 shrink-0 items-center border-b-2 border-transparent px-3 font-heading text-sm/5 font-medium whitespace-nowrap text-secondary",
    "hover:text-primary",
    "aria-[current=page]:border-brand aria-[current=page]:text-brand",
    "motion-safe:transition-colors",
    focusRingClass,
    // The focus ring is drawn inside the tab, because the row cuts what is outside it.
    "focus-visible:-outline-offset-2",
  ),
  secondary: classNames(
    segmentedItemClass,
    "aria-[current=page]:bg-surface aria-[current=page]:text-primary aria-[current=page]:shadow-sm",
  ),
};

/** One tab: a link to a route of the app. */
export type TabNavItem = {
  /** The address of the route. It is also the name no other tab of the list has. */
  href: string;
  /** The text of the tab. */
  label: ReactNode;
  /**
   * true: the tab is the current one only on its own route. When missing or
   * false, it is also the current one on every route under it
   * ("/orders" is current on "/orders/12"). Give true to a first tab whose
   * route is the start of the routes of the other tabs.
   */
  exact?: boolean;
};

export type TabNavProps = Omit<ComponentProps<"nav">, "children" | "aria-label"> & {
  /** The tabs, in the order they are shown. */
  items: readonly TabNavItem[];
  /**
   * The path of the page the person is on, for example "/orders/12". The tab
   * of that route is the current one. A Next.js app gives the result of usePathname().
   */
  currentPath: string;
  /** The name of the group of tabs for a screen reader, for example "Orders". */
  "aria-label": string;
  /** The look. When missing: "primary". */
  variant?: TabNavVariant;
  /**
   * The component that renders each link. It receives "href", "className",
   * "aria-current" and "children". When missing: "a". A Next.js app gives the
   * Link of "next/link", so a press does not load the whole page again.
   */
  linkComponent?: ElementType;
};

/** true when the tab is the tab of the current page. */
function isCurrentItem(item: TabNavItem, currentPath: string): boolean {
  if (currentPath === item.href) {
    return true;
  }
  return item.exact !== true && currentPath.startsWith(`${item.href}/`);
}

/**
 * Tabs where each tab is a link to a route of the app. Use it to move between
 * pages. To change the content inside one page, use Tabs.
 *
 * - Screen reader: a navigation region with links. The link of the current
 *   page has aria-current="page". The tabs are links, not role="tab": a press
 *   goes to another page.
 * - Keyboard: Tab goes through the links, Enter follows one.
 * - With no item, it renders nothing.
 * - "className", every other prop and "ref" go to the <nav>.
 */
export function TabNav({
  items,
  currentPath,
  variant = "primary",
  linkComponent: LinkComponent = "a",
  className,
  ...navProps
}: TabNavProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav {...navProps} className={classNames(navClass[variant], className)} data-variant={variant}>
      {items.map((item) => (
        <LinkComponent
          key={item.href}
          href={item.href}
          className={linkClass[variant]}
          data-slot="link"
          aria-current={isCurrentItem(item, currentPath) ? "page" : undefined}
        >
          {item.label}
        </LinkComponent>
      ))}
    </nav>
  );
}
