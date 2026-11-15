import type { ComponentProps, ElementType, ReactNode } from "react";
import { classNames } from "../shared/class-names.js";
import { focusRingClass } from "../shared/focus-ring.js";

const rootClass = "font-body text-base/normal font-bold text-text-muted";

const listClass = "m-0 flex list-none flex-wrap items-baseline gap-2 p-0";

const itemClass = "inline-flex items-baseline gap-2";

const linkClass = classNames(
  "rounded text-text-muted no-underline hover:text-primary hover:underline",
  focusRingClass,
);

/** The current page: the main text color, and larger. */
const currentClass = "text-lg/normal text-text";

/** One step of the path. */
export type Crumb = {
  /** The text of the step. */
  label: ReactNode;
  /**
   * The address of the step's page. The last step is the current page:
   * it is shown as text, and its "href" is not used.
   */
  href?: string;
};

export type BreadCrumbsProps = ComponentProps<"nav"> & {
  /** The steps of the path, from the first page to the current page. */
  crumbs: readonly Crumb[];
  /**
   * The component that renders each link. It receives "href", "className" and
   * "children". When missing: "a". A Next.js app gives the Link of "next/link".
   */
  linkComponent?: ElementType;
};

/**
 * Breadcrumbs: the path from the first page of the app to the current page,
 * as a row of links. The last step is the current page.
 *
 * - Screen reader: the <nav> has the name "Breadcrumb" ("aria-label" changes it),
 *   and the current page has aria-current="page".
 * - "className" and every other prop go to the <nav>, and "ref" points to it.
 */
export function BreadCrumbs({
  crumbs,
  linkComponent: LinkComponent = "a",
  className,
  ...navProps
}: BreadCrumbsProps) {
  const lastIndex = crumbs.length - 1;

  return (
    <nav aria-label="Breadcrumb" {...navProps} className={classNames(rootClass, className)}>
      <ol className={listClass} data-slot="list">
        {crumbs.map((crumb, index) => {
          const isCurrent = index === lastIndex;
          const isLink = !isCurrent && crumb.href !== undefined;
          return (
            <li key={`${index}-${crumb.href ?? ""}`} className={itemClass} data-slot="item">
              {isLink ? (
                <LinkComponent className={linkClass} data-slot="link" href={crumb.href}>
                  {crumb.label}
                </LinkComponent>
              ) : (
                <span
                  className={isCurrent ? currentClass : undefined}
                  data-slot={isCurrent ? "current" : "text"}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              )}
              {isCurrent ? null : (
                <span data-slot="separator" aria-hidden="true">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
