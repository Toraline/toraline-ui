"use client";

import type { ComponentProps, MouseEvent } from "react";
import { classNames } from "../shared/class-names";
import type { ButtonSize, ButtonVariant } from "./button-options";


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
      className={classNames("tui-button", className)}
      data-variant={variant}
      data-size={size}
      aria-busy={loading ? true : undefined}
      aria-disabled={loading ? true : buttonProps["aria-disabled"]}
      onClick={handleClick}
    >
      {loading ? <span className="tui-button__spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
