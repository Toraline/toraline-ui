import type { ReactNode } from "react";

/*
 * The icons the grid draws itself. Each shape is an icon of Lucide
 * (https://lucide.dev, ISC license), the icons Intraweb shows in the same
 * places. They are decoration: a screen reader skips them.
 */

type IconProps = { className?: string; "aria-hidden"?: boolean | "true" | "false" };

function Icon({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** "arrow-up": the rows are sorted from the smallest value to the largest. */
export function ArrowUpIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </Icon>
  );
}

/** "arrow-down": the rows are sorted from the largest value to the smallest. */
export function ArrowDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </Icon>
  );
}

/** "chevrons-up-down": the column can be sorted, and it is not sorted now. */
export function ChevronsUpDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </Icon>
  );
}

/** "chevron-left": the page before. */
export function ChevronLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m15 18-6-6 6-6" />
    </Icon>
  );
}

/** "chevron-right": the page after. */
export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m9 18 6-6-6-6" />
    </Icon>
  );
}

/** "search": the search field. */
export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m21 21-4.34-4.34" />
      <circle cx="11" cy="11" r="8" />
    </Icon>
  );
}

/** "pencil": the cell can be edited. */
export function PencilIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
      <path d="m15 5 4 4" />
    </Icon>
  );
}

/** "list-filter": the filter of a column. */
export function ListFilterIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2 5h20" />
      <path d="M6 12h12" />
      <path d="M9 19h6" />
    </Icon>
  );
}
