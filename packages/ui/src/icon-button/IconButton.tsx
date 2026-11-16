import type { ComponentProps } from "react";
import { classNames } from "../shared/class-names.js";
import { focusRingClass } from "../shared/focus-ring.js";
import type { IconComponent } from "../shared/icon.js";

/**
 * The looks of the icon button. The first one is the default.
 * "ghost": no background and no border. "secondary": a border.
 * "soft": a quiet background in the brand color. "primary": the main action.
 */
export const iconButtonVariants = ["ghost", "secondary", "soft", "primary"] as const;
export type IconButtonVariant = (typeof iconButtonVariants)[number];

/** The sizes of the icon button: a square of 32 pixels for "sm", 40 for "md" and 48 for "lg". */
export const iconButtonSizes = ["sm", "md", "lg"] as const;
export type IconButtonSize = (typeof iconButtonSizes)[number];

/**
 * The classes every icon button has. They are the ones of the IconButton of
 * the app Intraweb (components/ui/icon-button.tsx). A disabled button has half
 * of its opacity. The focus ring and "motion-safe:" are the library's own.
 */
const baseClass = classNames(
  "inline-flex shrink-0 items-center justify-center rounded-md",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "motion-safe:transition-colors",
  focusRingClass,
);

/** The colors of each variant, at rest and while the pointer is over the button. */
const variantClass: Record<IconButtonVariant, string> = {
  ghost: "text-icon hover:bg-muted hover:text-icon-strong",
  secondary: "border border-default bg-surface text-icon-strong hover:border-hover hover:bg-subtle",
  soft: "bg-primary-subtle text-icon-brand hover:bg-primary-muted",
  primary: "bg-primary text-inverse hover:bg-primary-hover",
};

/** The size of the square of each size. */
const sizeClass: Record<IconButtonSize, string> = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
};

/** The size of the icon of each size: 16, 20 and 24 pixels. */
const iconClass: Record<IconButtonSize, string> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

export type IconButtonProps = Omit<ComponentProps<"button">, "children" | "aria-label"> & {
  /**
   * The icon: a component that draws an <svg>, for example an icon of
   * "lucide-react" (icon={Trash2}). It is decoration: a screen reader skips it.
   */
  icon: IconComponent;
  /**
   * The name of the button for a screen reader, for example "Delete the order".
   * It is required: the button has no visible text.
   */
  "aria-label": string;
  /** The look. When missing: "ghost". */
  variant?: IconButtonVariant;
  /** The size. When missing: "md". */
  size?: IconButtonSize;
};

/**
 * A button that shows only an icon.
 *
 * - It is a real <button>, so it works with the Tab, Enter and Space keys.
 * - "aria-label" is required, because the button has no text.
 * - "type" is "button" when missing.
 * - "disabled" is the HTML attribute: the button cannot get focus and cannot be pressed.
 * - Every other prop goes to the <button>, and "ref" points to it.
 */
export function IconButton({
  icon: Icon,
  variant = "ghost",
  size = "md",
  type = "button",
  className,
  ...buttonProps
}: IconButtonProps) {
  return (
    <button
      {...buttonProps}
      type={type}
      className={classNames(baseClass, sizeClass[size], variantClass[variant], className)}
      data-variant={variant}
      data-size={size}
    >
      <Icon aria-hidden="true" className={iconClass[size]} />
    </button>
  );
}
