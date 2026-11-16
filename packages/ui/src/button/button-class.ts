import { classNames } from "../shared/class-names.js";
import { focusRingClass } from "../shared/focus-ring.js";
import type { ButtonSize, ButtonVariant } from "./button-options.js";

/*
 * The classes of a button. Button and ButtonLink share them, so a link that
 * looks like a button cannot differ from a button.
 *
 * The class lists are the ones of the Button of the app Intraweb
 * (components/ui/button.tsx): the variants, the sizes, the font of headings
 * in the medium weight, and a disabled button with half of its opacity.
 * Three things are the library's own: the focus ring is a class (Intraweb has
 * it in its global CSS), the transition is only for a person who did not ask
 * for less motion, and a font size is written with its line height.
 */

/** The classes every button has. A state is selected by the attribute a screen reader reads. */
const baseClass = classNames(
  "inline-flex shrink-0 items-center justify-center rounded-md text-center font-heading font-medium",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "enabled:aria-busy:cursor-progress",
  "motion-safe:transition-colors",
  focusRingClass,
);

/**
 * The smallest height, the space between the icon and the text, the padding and
 * the font size of each size. The heights are 32, 40 and 48 pixels.
 * The font size classes are Intraweb's: a line of 20 pixels ("text-sm") and of
 * 24 pixels ("text-base") at a text size of 100%, as a ratio of the font size.
 */
const sizeClass: Record<ButtonSize, string> = {
  sm: "min-h-8 gap-1.5 px-3 py-1 text-sm",
  md: "min-h-10 gap-2 px-4 py-2 text-sm",
  lg: "min-h-12 gap-2 px-5 py-2.5 text-base",
};

/** The colors of each variant. */
const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-primary text-inverse",
  secondary: "border border-default bg-surface text-strong",
  soft: "bg-primary-subtle text-brand",
  danger: "border border-danger bg-surface text-danger",
  ghost: "text-body",
};

/** The colors of each variant while the pointer is over the button. A loading button does not get them. */
const hoverClass: Record<ButtonVariant, string> = {
  primary: "hover:bg-primary-hover",
  secondary: "hover:border-hover hover:bg-subtle",
  soft: "hover:bg-primary-muted",
  danger: "hover:bg-danger-subtle",
  ghost: "hover:bg-muted hover:text-primary",
};

/** The size of the icon of each size of button: 16 pixels, and 20 pixels for "lg". */
export const buttonIconClass: Record<ButtonSize, string> = {
  sm: "size-4 shrink-0",
  md: "size-4 shrink-0",
  lg: "size-5 shrink-0",
};

/** The classes of a button with this variant and size. "className" is the app's, and comes last. */
export function buttonClassNames(options: {
  variant: ButtonVariant;
  size: ButtonSize;
  /** true for a loading button: it does not get the classes of the pointer over it. */
  loading?: boolean;
  className?: string;
}): string {
  return classNames(
    baseClass,
    sizeClass[options.size],
    variantClass[options.variant],
    options.loading !== true && hoverClass[options.variant],
    options.className,
  );
}
