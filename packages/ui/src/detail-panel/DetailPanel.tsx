import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";
import { IconButton } from "../icon-button/index.js";
import { classNames } from "../shared/class-names.js";
import { focusRingClass } from "../shared/focus-ring.js";
import { ScrollBox } from "../shared/ScrollBox.js";

/*
 * The classes are the ones of the DetailPanel of the app Intraweb
 * (components/ui/detail-panel.tsx).
 */

/**
 * The panel: a card as wide as its container. From the breakpoint "xl" of
 * Tailwind CSS (a screen 1280 pixels wide or more) it is 360 pixels wide and
 * does not shrink, so it sits next to a list.
 */
const panelClass = "flex w-full flex-col rounded-xl bg-surface font-body shadow-card xl:w-90 xl:shrink-0";

/** The text style "heading-section" of Intraweb, written as the classes of its values: Poppins, 18 pixels, weight 500. */
const titleClass = "font-heading text-lg/7 font-medium text-primary";

/**
 * The content scrolls when the app limits the height of the panel. The focus
 * ring of the content is drawn inside it, because the panel is a card.
 */
const bodyClass = classNames(
  "flex-1 space-y-4 overflow-y-auto p-5",
  focusRingClass,
  "focus-visible:-outline-offset-2",
);

/** One line of the list of fields of a DetailPanel. */
export type DetailField = {
  /** The name of the field, for example "Period". No other field of the panel has it. */
  label: string;
  /** The value of the field. */
  value: ReactNode;
};

export type DetailPanelProps = Omit<ComponentProps<"aside">, "title"> & {
  /** The title of the panel, for example the name of the record. It is the name of the panel for a screen reader. */
  title: ReactNode;
  /** Shown under the title, usually a badge with the status of the record. */
  status?: ReactNode;
  /** Called on a press of the close button. Without it, the panel has no close button. */
  onClose?: () => void;
  /** The name of the close button for a screen reader. When missing: "Close". */
  closeLabel?: string;
  /** The fields of the record, shown as a list of names and values. */
  fields?: readonly DetailField[];
  /** The actions of the record, for example "Approve" and "Refuse", shown at the bottom, on the right. */
  footer?: ReactNode;
  /** More content, shown after the fields. */
  children?: ReactNode;
};

/** The icon of the close button. The shape is the icon "x" of Lucide (https://lucide.dev, ISC license). */
function CloseIcon({ className }: { className?: string }) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/**
 * The detail of the selected record, shown next to a list. It does not cover
 * the page and does not keep the focus inside: the list can still be used.
 *
 * - It is an <aside>, a complementary region, named by its title.
 * - The title is an <h2>.
 * - The fields are a description list (<dl>): a screen reader reads each name with its value.
 * - The content scrolls when the app limits the height of the panel. While it
 *   scrolls, it can get the keyboard focus, so the arrow keys scroll it.
 * - "className", every other prop and "ref" go to the <aside>.
 */
export function DetailPanel({
  title,
  status,
  onClose,
  closeLabel = "Close",
  fields,
  footer,
  children,
  className,
  ...asideProps
}: DetailPanelProps) {
  const titleId = useId();
  return (
    <aside aria-labelledby={titleId} {...asideProps} className={classNames(panelClass, className)}>
      <div
        className="flex items-start justify-between gap-3 border-b border-default py-3 pr-3 pl-5"
        data-slot="header"
      >
        <div className="min-w-0 space-y-1.5 pt-1.5">
          <h2 id={titleId} className={titleClass} data-slot="title">
            {title}
          </h2>
          {status}
        </div>
        {onClose ? <IconButton icon={CloseIcon} aria-label={closeLabel} onClick={onClose} /> : null}
      </div>
      <ScrollBox className={bodyClass} data-slot="body" aria-labelledby={titleId}>
        {fields && fields.length > 0 ? (
          <dl className="space-y-3" data-slot="fields">
            {fields.map((field) => (
              <div key={field.label} className="space-y-0.5">
                <dt className="text-xs font-medium text-tertiary">{field.label}</dt>
                <dd className="text-sm text-primary">{field.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {children}
      </ScrollBox>
      {footer ? (
        <div className="flex flex-wrap justify-end gap-2 border-t border-default px-5 py-4" data-slot="footer">
          {footer}
        </div>
      ) : null}
    </aside>
  );
}
