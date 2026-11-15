import type { ComponentProps } from "react";
import { classNames } from "../shared/class-names.js";

/** The looks of the badge. The first one is the default. */
export const countBadgeVariants = ["warning", "brand"] as const;
export type CountBadgeVariant = (typeof countBadgeVariants)[number];

/*
 * The classes of the badge. They are the ones of the CountBadge of the app
 * Intraweb (components/ui/count-badge.tsx): a pill 20 pixels high and at
 * least 20 pixels wide, so one digit is a circle. The digits all have the
 * same width ("tabular-nums").
 */
const baseClass =
  "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 font-heading text-xs/4 font-medium tabular-nums";

/** The background and the text color of each variant. */
const variantClass: Record<CountBadgeVariant, string> = {
  warning: "bg-warning text-warning",
  brand: "bg-primary text-inverse",
};

export type CountBadgeProps = Omit<ComponentProps<"span">, "children"> & {
  /** The number the badge shows. */
  count: number;
  /**
   * What the number means, for a screen reader, with the number in it: for
   * example "3 pending orders". It is not shown. A screen reader reads it in
   * the place of the number alone.
   */
  label: string;
  /**
   * The look. "warning": things that need attention. "brand": a plain count,
   * in the color of the main action. When missing: "warning".
   */
  variant?: CountBadgeVariant;
};

/**
 * A small pill with a number: how many things wait, for example next to the
 * text of a tab or a link of a menu.
 *
 * - A number alone means nothing to a person who cannot see where it is. So
 *   "label" is required: a screen reader reads it ("3 pending orders") in the
 *   place of the number.
 * - It has no behaviour: it cannot get the focus.
 * - "className" is added after the library's classes. Every other prop goes
 *   to the <span>, and "ref" points to it.
 */
export function CountBadge({ count, label, variant = "warning", className, ...spanProps }: CountBadgeProps) {
  return (
    <span
      {...spanProps}
      className={classNames(baseClass, variantClass[variant], className)}
      data-variant={variant}
    >
      <span aria-hidden="true" data-slot="count">
        {count}
      </span>
      <span className="sr-only" data-slot="label">
        {label}
      </span>
    </span>
  );
}
