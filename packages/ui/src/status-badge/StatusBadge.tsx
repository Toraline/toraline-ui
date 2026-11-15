import type { ComponentProps, ReactNode } from "react";
import { classNames } from "../shared/class-names.js";

/** The looks of the badge. The first one is the default. */
export const statusBadgeVariants = ["neutral", "success", "warning", "error", "info"] as const;
export type StatusBadgeVariant = (typeof statusBadgeVariants)[number];

/*
 * The classes of the badge. They are the ones of the StatusBadge of the app
 * Intraweb (components/ui/status-badge.tsx): a pill with a small text in the
 * medium weight of the heading font, which stays on one line.
 */
const baseClass =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-heading text-xs/4 font-medium whitespace-nowrap";

/** The background and the text color of each variant. */
const variantClass: Record<StatusBadgeVariant, string> = {
  neutral: "bg-muted text-secondary",
  success: "bg-success text-success",
  warning: "bg-warning text-warning",
  error: "bg-error text-error",
  info: "bg-info text-info",
};

/** The dot: a circle of 6 pixels before the text. */
const dotBaseClass = "size-1.5 rounded-full";

/**
 * The color of the dot of each variant: the stronger color of the same
 * meaning, from the colors of charts. The neutral dot has the color of the
 * text token "text-muted" ("bg-current" paints with the text color), because
 * no background token has that grey.
 */
const dotVariantClass: Record<StatusBadgeVariant, string> = {
  neutral: "bg-current text-muted",
  success: "bg-data-success",
  warning: "bg-data-warning",
  error: "bg-data-danger",
  info: "bg-data-1",
};

export type StatusBadgeProps = Omit<ComponentProps<"span">, "children"> & {
  /** The text of the badge: the state of a thing, for example "Paid" or "Late". */
  label: ReactNode;
  /**
   * The look. "neutral": a state with no meaning of good or bad. "success":
   * done or good. "warning": needs attention. "error": failed or bad. "info":
   * a fact. When missing: "neutral".
   */
  variant?: StatusBadgeVariant;
  /** true shows a small dot in the color of the variant before the text. When missing: false. */
  dot?: boolean;
};

/**
 * A badge that shows the state of a thing: a short text on a pill in the
 * color of its meaning.
 *
 * - It is a <span> with its text. A screen reader reads the text. The color
 *   and the dot are decoration: the text must say the state by itself.
 * - It has no behaviour: it cannot get the focus.
 * - "className" is added after the library's classes. Every other prop goes
 *   to the <span>, and "ref" points to it.
 */
export function StatusBadge({
  label,
  variant = "neutral",
  dot = false,
  className,
  ...spanProps
}: StatusBadgeProps) {
  return (
    <span
      {...spanProps}
      className={classNames(baseClass, variantClass[variant], className)}
      data-variant={variant}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={classNames(dotBaseClass, dotVariantClass[variant])}
          data-slot="dot"
        />
      ) : null}
      {label}
    </span>
  );
}
