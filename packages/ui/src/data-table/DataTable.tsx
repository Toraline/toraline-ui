import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";
import { classNames } from "../shared/class-names.js";
import { focusRingClass } from "../shared/focus-ring.js";
import { ScrollBox } from "../shared/ScrollBox.js";

/*
 * The classes are the ones of the DataTable of the app Intraweb
 * (components/ui/data-table.tsx). The rules of a table shown as blocks on a
 * narrow screen are the ones of the class "data-table-stack" of Intraweb's
 * styles/globals.css, written as Tailwind classes.
 */

/**
 * The sides a header cell or a cell can align its content to. The first one is
 * the default. "right" is for numbers.
 */
export const tableCellAlignments = ["left", "center", "right"] as const;
export type TableCellAlignment = (typeof tableCellAlignments)[number];

/**
 * The box around the table: a card. It scrolls sideways when the table is wider
 * than the box. "relative" keeps the parts that only a screen reader reads (the
 * caption, the name of the actions column) inside the box: without it they are
 * placed against the page, and a wide table makes the whole page scroll sideways.
 */
const boxClass = classNames("relative overflow-x-auto rounded-xl bg-surface shadow-card", focusRingClass);

const tableClass = "w-full text-left font-body text-sm/5";

/**
 * Below the breakpoint "md" of Tailwind CSS (a screen less than 768 pixels
 * wide), each row is a block, and each cell with the attribute "data-label" is
 * one line: the name of the column on the left, the value on the right. The
 * header row stays for a screen reader and is not shown.
 */
const stackClass = classNames(
  "max-md:block max-md:[&_tbody]:block max-md:[&_tr]:block max-md:[&_th[scope=colgroup]]:block max-md:[&_td:not([data-label])]:block",
  "max-md:[&_thead]:absolute max-md:[&_thead]:size-px max-md:[&_thead]:overflow-hidden max-md:[&_thead]:[clip-path:inset(50%)]",
  "max-md:[&_tbody_tr]:border-b max-md:[&_tbody_tr]:border-b-default max-md:[&_tbody_tr]:py-2",
  "max-md:[&_td]:[border:0] max-md:[&_td]:py-1.5",
  "max-md:[&_td[data-label]]:flex max-md:[&_td[data-label]]:items-center max-md:[&_td[data-label]]:justify-between max-md:[&_td[data-label]]:gap-4 max-md:[&_td[data-label]]:text-right",
  "max-md:[&_td[data-label]]:before:text-left max-md:[&_td[data-label]]:before:text-xs/[calc(1.25/0.875)] max-md:[&_td[data-label]]:before:font-medium max-md:[&_td[data-label]]:before:text-tertiary max-md:[&_td[data-label]]:before:content-[attr(data-label)]",
);

const headerCellClass =
  "border-b border-default bg-subtle px-3 py-2.5 text-xs/4 font-medium whitespace-nowrap text-tertiary";

const cellClass = "border-b border-subtle px-3 py-2.5 text-body";

const headerCellAlignClass: Record<TableCellAlignment, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

/** A cell aligned to the right holds numbers: its digits all have the same width, so the numbers of a column line up. */
const cellAlignClass: Record<TableCellAlignment, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right tabular-nums",
};

/**
 * A row. The row of the record that is open (aria-current="true") has the
 * background of a selected part and a line in the brand color on its left. The
 * line is drawn on the first cell: a shadow on a <tr> is not shown by every browser.
 */
const rowClass =
  "aria-[current=true]:bg-selected aria-[current=true]:[&>td:first-child]:shadow-[inset_3px_0_0_var(--border-brand)]";

const rowHoverClass = "hover:bg-subtle";

/** A table needs a name for a screen reader: a caption, or one of the two ARIA attributes. */
type DataTableName =
  | {
      /** The name of the table. A screen reader says it; it is not shown. */
      caption: ReactNode;
      "aria-label"?: string;
      "aria-labelledby"?: string;
    }
  | { caption?: undefined; "aria-label": string; "aria-labelledby"?: string }
  | { caption?: undefined; "aria-label"?: string; "aria-labelledby": string };

export type DataTableProps = Omit<ComponentProps<"table">, "aria-label" | "aria-labelledby"> &
  DataTableName & {
    /** The parts of the table: <thead>, <tbody> and <tfoot>, with Tr, Th and Td inside. */
    children?: ReactNode;
    /**
     * true: on a screen less than 768 pixels wide, each row is a block with one
     * line "column: value" for each cell. Each Td then needs the attribute
     * "data-label" with the name of its column. When missing: false, and a
     * table wider than its box scrolls sideways.
     */
    stackOnMobile?: boolean;
  };

/**
 * A table of data inside a card.
 *
 * - It is a real <table>. Its parts are the HTML elements <thead>, <tbody> and
 *   <tfoot>, and the components Tr, Th, Td, ActionsTh and DataTableMessage.
 * - It needs a name: "caption" (not shown), "aria-label" or "aria-labelledby".
 *   The types refuse a table with none of them.
 * - A table wider than its box scrolls sideways. While it is wider, the box
 *   can get the keyboard focus, so the arrow keys scroll it.
 * - "className" goes to the box around the table. Every other prop and "ref" go to the <table>.
 */
export function DataTable({
  caption,
  stackOnMobile = false,
  className,
  children,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...tableProps
}: DataTableProps) {
  const captionId = useId();
  const hasCaption = caption !== undefined && caption !== null && caption !== false;
  const nameIsCaption = hasCaption && ariaLabel === undefined && ariaLabelledBy === undefined;

  return (
    <ScrollBox
      className={classNames(boxClass, className)}
      data-slot="box"
      aria-label={ariaLabel}
      aria-labelledby={nameIsCaption ? captionId : ariaLabelledBy}
    >
      <table
        {...tableProps}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={classNames(tableClass, stackOnMobile && stackClass)}
        data-stack-on-mobile={stackOnMobile ? "" : undefined}
      >
        {hasCaption ? (
          <caption id={captionId} className="sr-only" data-slot="caption">
            {caption}
          </caption>
        ) : null}
        {children}
      </table>
    </ScrollBox>
  );
}

export type TrProps = ComponentProps<"tr"> & {
  /**
   * true: the row of the record that is open, for example in a panel next to
   * the table. The row gets aria-current="true". When missing: false.
   */
  selected?: boolean;
  /** true: the row has a quiet background while the pointer is over it. When missing: false. */
  hoverable?: boolean;
};

/**
 * A row of a DataTable. A plain <tr> works too; Tr adds the look of the
 * selected row and of the row under the pointer.
 *
 * - Every other prop and "ref" go to the <tr>.
 */
export function Tr({ selected = false, hoverable = false, className, ...rowProps }: TrProps) {
  return (
    <tr
      {...rowProps}
      aria-current={selected ? "true" : rowProps["aria-current"]}
      className={classNames(hoverable && rowHoverClass, rowClass, className)}
    />
  );
}

export type ThProps = Omit<ComponentProps<"th">, "align"> & {
  /**
   * It replaces the old HTML attribute "align". The side the content is aligned to. When missing:
   * the side of the table, which is the left.
   */
  align?: TableCellAlignment;
};

/**
 * A header cell of a DataTable.
 *
 * - "scope" is "col" when missing: the cell names its column. Give scope="row"
 *   to a cell that names its row.
 * - Every other prop and "ref" go to the <th>.
 */
export function Th({ align, scope = "col", className, ...cellProps }: ThProps) {
  return (
    <th
      {...cellProps}
      scope={scope}
      className={classNames(headerCellClass, align && headerCellAlignClass[align], className)}
      data-align={align}
    />
  );
}

export type ActionsThProps = Omit<ThProps, "children"> & {
  /** The name of the column for a screen reader. It is not shown. When missing: "Actions". */
  label?: ReactNode;
};

/**
 * The header cell of the column of the buttons of each row. Its text is only
 * for a screen reader, and the cell keeps the background of the header.
 */
export function ActionsTh({ label = "Actions", ...cellProps }: ActionsThProps) {
  return (
    <Th {...cellProps}>
      <span className="sr-only">{label}</span>
    </Th>
  );
}

export type TdProps = Omit<ComponentProps<"td">, "align"> & {
  /**
   * It replaces the old HTML attribute "align". The side the content is aligned to. "right" is for numbers: the digits all
   * have the same width. When missing: the side of the table, which is the left.
   */
  align?: TableCellAlignment;
};

/**
 * A cell of a DataTable.
 *
 * - In a table with "stackOnMobile", give it "data-label" with the name of its column.
 * - Every other prop and "ref" go to the <td>.
 */
export function Td({ align, className, ...cellProps }: TdProps) {
  return (
    <td
      {...cellProps}
      className={classNames(cellClass, align && cellAlignClass[align], className)}
      data-align={align}
    />
  );
}

export type DataTableMessageProps = Omit<TdProps, "colSpan"> & {
  /** The number of columns of the table, so the message is as wide as the table. */
  colSpan: number;
};

/**
 * One row with one message as wide as the table, for a table with no rows
 * ("No orders yet.") or a table whose rows are loading ("Loading the orders…").
 * Put it inside <tbody>.
 *
 * - "className", every other prop and "ref" go to the <td>.
 */
export function DataTableMessage({ className, ...cellProps }: DataTableMessageProps) {
  return (
    <tr data-slot="message">
      <Td {...cellProps} className={classNames("py-8 text-center text-secondary", className)} />
    </tr>
  );
}
