"use client";

import type { ComponentProps, MouseEvent } from "react";
import { classNames } from "../shared/class-names.js";
import { focusRingClass } from "../shared/focus-ring.js";
import type { ButtonSize, ButtonVariant } from "./button-options.js";

/**
 * The classes every button has. A state is selected by the attribute a screen
 * reader reads: "disabled:" by the HTML attribute disabled, "aria-busy:" by aria-busy.
 * Disabled is the same quiet look for every variant.
 * The colors of each part, the font of headings and the medium weight are the
 * ones of the Button of the app Intraweb.
 */
const baseClass = classNames(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-transparent font-heading font-medium",
  "disabled:cursor-not-allowed disabled:border-default disabled:bg-subtle disabled:text-tertiary",
  "enabled:aria-busy:cursor-progress",
  "motion-safe:transition-[background-color,border-color] motion-safe:ease-[ease]",
  focusRingClass,
);

/** The padding and the font size of each size. "/normal" is the line height. */
const sizeClass: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-sm/normal",
  md: "px-4 py-2 text-base/normal",
  lg: "px-6 py-3 text-lg/normal",
};

/** The colors of each variant. */
const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-primary text-inverse",
  secondary: "border-default bg-surface text-strong",
  danger: "border-danger bg-surface text-danger",
};

/** The colors of each variant while the pointer is over the button. A loading button does not get them. */
const hoverClass: Record<ButtonVariant, string> = {
  primary: "hover:bg-primary-hover",
  secondary: "hover:border-hover hover:bg-subtle",
  danger: "hover:bg-danger-subtle",
};

/** The spinner: a circle with one side that has no color. It turns only when the person did not ask for less motion. */
const spinnerClass =
  "size-[1em] flex-none rounded-[50%] border-2 border-current border-e-transparent motion-safe:animate-[spin_0.7s_linear_infinite]";

export type ButtonProps = ComponentProps<"button"> & {
  /** The look. "primary": the main action. "secondary": another action. "danger": an action that deletes. When missing: "primary". */
  variant?: ButtonVariant;
  /** The size. When missing: "md". */
  size?: ButtonSize;
  /**
   * true while the action of the button is running. The button shows a spinner
   * (a small turning circle) and a press does nothing. It keeps the keyboard focus.
   */
  loading?: boolean;
};

/**
 * A button.
 *
 * - It is a real <button>, so it works with the Tab, Enter and Space keys.
 * - "type" is "button" when missing. Give type="submit" to send a form.
 * - "disabled" is the HTML attribute: the button cannot get focus and cannot be pressed.
 * - Every other prop goes to the <button>, and "ref" points to it.
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  type = "button",
  className,
  children,
  onClick,
  ...buttonProps
}: ButtonProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      // Stops a press, and stops a submit button from sending its form.
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      {...buttonProps}
      type={type}
      className={classNames(
        baseClass,
        sizeClass[size],
        variantClass[variant],
        !loading && hoverClass[variant],
        className,
      )}
      data-variant={variant}
      data-size={size}
      aria-busy={loading ? true : undefined}
      aria-disabled={loading ? true : buttonProps["aria-disabled"]}
      onClick={handleClick}
    >
      {loading ? <span className={spinnerClass} data-slot="spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
