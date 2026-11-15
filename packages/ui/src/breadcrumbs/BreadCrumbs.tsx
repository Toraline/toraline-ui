import type { ComponentProps, ElementType, ReactNode } from "react";
import { classNames } from "../shared/class-names";

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
    <nav aria-label="Breadcrumb" {...navProps} className={classNames("tui-breadcrumbs", className)}>
      <ol className="tui-breadcrumbs__list">
        {crumbs.map((crumb, index) => {
          const isCurrent = index === lastIndex;
          const isLink = !isCurrent && crumb.href !== undefined;
          return (
            <li key={`${index}-${crumb.href ?? ""}`} className="tui-breadcrumbs__item">
              {isLink ? (
                <LinkComponent className="tui-breadcrumbs__link" href={crumb.href}>
                  {crumb.label}
                </LinkComponent>
              ) : (
                <span
                  className={isCurrent ? "tui-breadcrumbs__current" : "tui-breadcrumbs__text"}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              )}
              {isCurrent ? null : (
                <span className="tui-breadcrumbs__separator" aria-hidden="true">
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
