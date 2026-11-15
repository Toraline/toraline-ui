import type { ElementType, HTMLAttributes, MouseEventHandler, ReactNode, Ref } from "react";
import { classNames } from "../shared/class-names.js";
import { focusRingClass } from "../shared/focus-ring.js";
import type { IconComponent } from "../shared/icon.js";

/*
 * The classes are the ones of the ListItem of the app Intraweb
 * (components/ui/list-item.tsx). The selected item is selected by
 * aria-current="true", the attribute a screen reader reads.
 */

/**
 * The row: at least 64 pixels high. The selected item has the background of a
 * selected part, and a short line in the brand color on its left edge.
 */
const baseClass = classNames(
  "relative flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left font-body",
  "aria-[current=true]:bg-selected",
  "aria-[current=true]:before:absolute aria-[current=true]:before:inset-y-2 aria-[current=true]:before:left-0 aria-[current=true]:before:w-[3px] aria-[current=true]:before:rounded-r-full aria-[current=true]:before:bg-primary",
  "motion-safe:transition-colors",
);

/**
 * An item that is a link or a button has a quiet background under the pointer,
 * and the focus ring. The ring is drawn inside the item, because a list is
 * often inside a card that cuts what is outside it.
 */
const interactiveClass = classNames("hover:bg-subtle", focusRingClass, "focus-visible:-outline-offset-2");

const iconBoxClass = "flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-primary-subtle";

type ListItemElement = HTMLAnchorElement | HTMLButtonElement | HTMLDivElement;

export type ListItemProps = Omit<HTMLAttributes<HTMLElement>, "title" | "onClick" | "children"> & {
  /** The main text, for example the name of the record. One line: a long text ends with "…". */
  title: ReactNode;
  /** The second line, for example a date or the person in charge. One line: a long text ends with "…". */
  meta?: ReactNode;
  /** The value on the right, for example "8 h" or "R$ 120,00". */
  value?: ReactNode;
  /** Shown under the value, usually a badge with the status of the record. */
  status?: ReactNode;
  /**
   * An icon shown before the text, in a box of 40 pixels: a component that
   * draws an <svg>, for example an icon of "lucide-react" (icon={Clock}).
   * It is decoration: a screen reader skips it.
   */
  icon?: IconComponent;
  /** true: the item that is open, for example in a panel next to the list. It gets aria-current="true". When missing: false. */
  selected?: boolean;
  /** The address the item goes to. With it, the item is a link. */
  href?: string;
  /** Called on a press. With it and no "href", the item is a button. */
  onClick?: MouseEventHandler<HTMLElement>;
  /**
   * The component that renders the link, when the item has "href". It
   * receives "href", "className", "onClick", "aria-current" and "children".
   * When missing: "a". A Next.js app gives the Link of "next/link".
   */
  linkComponent?: ElementType;
  /** Points to the element of the item: the <a>, the <button> or the <div>. */
  ref?: Ref<ListItemElement>;
};

/** The arrow of an item that is a link or a button. The shape is the icon "chevron-right" of Lucide (https://lucide.dev, ISC license). */
function ChevronIcon() {
  return (
    <svg
      className="size-5 shrink-0 text-icon"
      data-slot="chevron"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/**
 * One row of a list of records: an icon, a title and a second line, and a
 * value and a status on the right.
 *
 * - With "href" it is a link, with only "onClick" it is a <button>, and with
 *   neither it is a <div> that cannot be pressed. A link or a button shows an
 *   arrow on the right.
 * - Keyboard: Tab moves the focus to a link or a button; Enter follows the
 *   link; Enter and Space press the button.
 * - Screen reader: the selected item has aria-current="true".
 * - Put each item inside an <li> of a list.
 * - "className", every other prop and "ref" go to the element of the item.
 */
export function ListItem({
  title,
  meta,
  value,
  status,
  icon: Icon,
  selected = false,
  href,
  onClick,
  linkComponent: LinkComponent = "a",
  className,
  ref,
  ...elementProps
}: ListItemProps) {
  const isInteractive = href !== undefined || onClick !== undefined;
  const hasValue = value !== undefined && value !== null && value !== false;
  const hasStatus = status !== undefined && status !== null && status !== false;
  const sharedProps = {
    ...elementProps,
    "aria-current": selected ? ("true" as const) : elementProps["aria-current"],
    className: classNames(baseClass, isInteractive && interactiveClass, className),
  };
  const content = (
    <>
      {Icon ? (
        <span className={iconBoxClass} data-slot="icon">
          <Icon aria-hidden="true" className="size-5 text-icon-brand" />
        </span>
      ) : null}
      <span className="min-w-0 flex-1" data-slot="text">
        <span className="block truncate text-sm/5 font-medium text-primary" data-slot="title">
          {title}
        </span>
        {meta ? (
          <span className="block truncate text-sm/5 text-tertiary" data-slot="meta">
            {meta}
          </span>
        ) : null}
      </span>
      {hasValue || hasStatus ? (
        <span className="flex shrink-0 flex-col items-end gap-1" data-slot="end">
          {hasValue ? (
            <span className="text-sm/5 font-medium text-primary tabular-nums" data-slot="value">
              {value}
            </span>
          ) : null}
          {hasStatus ? status : null}
        </span>
      ) : null}
      {isInteractive ? <ChevronIcon /> : null}
    </>
  );

  if (href !== undefined) {
    return (
      <LinkComponent {...sharedProps} ref={ref} href={href} onClick={onClick}>
        {content}
      </LinkComponent>
    );
  }
  if (onClick !== undefined) {
    return (
      <button {...sharedProps} ref={ref as Ref<HTMLButtonElement>} type="button" onClick={onClick}>
        {content}
      </button>
    );
  }
  return (
    <div {...sharedProps} ref={ref as Ref<HTMLDivElement>}>
      {content}
    </div>
  );
}
