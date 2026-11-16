import type { ComponentProps, ReactNode } from "react";
import { classNames } from "../shared/class-names.js";
import type { IconComponent } from "../shared/icon.js";

/*
 * The classes of the empty state. They are the ones of the EmptyState of the
 * app Intraweb (components/ui/empty-state.tsx): a card with everything in the
 * middle, an icon in a circle, a title, a text and one action.
 */
const rootClass =
  "flex flex-col items-center rounded-lg bg-surface px-4 py-10 text-center shadow-card md:rounded-xl md:px-8";

/** The circle of 48 pixels around the icon. */
const iconBoxClass = "flex size-12 items-center justify-center rounded-full bg-primary-subtle";

const iconClass = "size-6 text-icon-brand";

/** The title: 16 pixels in the medium weight of the heading font, the values of Intraweb's text style "heading-card". */
const titleClass = "mt-4 font-heading text-base/6 font-medium text-primary";

/** The text under the title. It is at most 448 pixels wide, so its lines stay short. */
const descriptionClass = "mt-1 max-w-md text-sm/5 text-secondary";

const actionClass = "mt-5";

/** The icon shown when the app gives none: an empty tray. It is decoration, so a screen reader skips it. */
function InboxIcon({ className }: { className?: string }) {
  // The shape is the icon "inbox" of Lucide (https://lucide.dev, ISC license), the icon Intraweb shows here.
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
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

/** true when a prop holds something to show. */
const hasContent = (value: ReactNode) =>
  value !== undefined && value !== null && value !== false && value !== "";

export type EmptyStateProps = Omit<ComponentProps<"section">, "title"> & {
  /** What is missing, in a few words, shown as a heading of level 2: for example "No order yet". */
  title: ReactNode;
  /**
   * The icon in the circle above the title: a component that draws an <svg>,
   * for example an icon of "lucide-react" (icon={Users}). When missing: an
   * empty tray. It is decoration: a screen reader skips it.
   */
  icon?: IconComponent;
  /** The next step, under the text: one button or link, for example <Button>New order</Button>. */
  action?: ReactNode;
  /** The text under the title: why the place is empty, or what will be shown here. */
  children?: ReactNode;
};

/**
 * What a list, a table or a page shows when it has nothing to show: an icon,
 * a title, a short text and one action.
 *
 * - It is a <section> with the look of a card. The title is an <h2>.
 * - It is also the place for "could not load": the app gives another title and text.
 * - "className" is added after the library's classes. Every other prop goes
 *   to the <section>, and "ref" points to it. The HTML attribute "title" (a
 *   tooltip) is replaced by the title of the empty state.
 */
export function EmptyState({
  title,
  icon: Icon = InboxIcon,
  action,
  className,
  children,
  ...sectionProps
}: EmptyStateProps) {
  return (
    <section {...sectionProps} className={classNames(rootClass, className)}>
      <span className={iconBoxClass} data-slot="icon">
        <Icon aria-hidden="true" className={iconClass} />
      </span>
      <h2 className={titleClass} data-slot="title">
        {title}
      </h2>
      {hasContent(children) ? (
        <div className={descriptionClass} data-slot="description">
          {children}
        </div>
      ) : null}
      {hasContent(action) ? (
        <div className={actionClass} data-slot="action">
          {action}
        </div>
      ) : null}
    </section>
  );
}
