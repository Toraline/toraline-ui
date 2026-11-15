import type { ComponentProps, ReactNode } from "react";
import { classNames } from "../shared/class-names.js";
import type { IconComponent } from "../shared/icon.js";
import { ButtonElement } from "./ButtonElement.js";
import { buttonClassNames, buttonIconClass } from "./button-class.js";
import type { ButtonSize, ButtonVariant } from "./button-options.js";

/** The spinner: a circle with one side that has no color. It turns only when the person did not ask for less motion. */
const spinnerClass =
  "rounded-[50%] border-2 border-current border-e-transparent motion-safe:animate-[spin_0.7s_linear_infinite]";

export type ButtonProps = ComponentProps<"button"> & {
  /**
   * The look. "primary": the main action. "secondary": another action. "soft": an action with a quiet
   * background in the brand color. "danger": an action that deletes. "ghost": an action with no
   * background and no border. When missing: "primary".
   */
  variant?: ButtonVariant;
  /** The size: at least 32 pixels high for "sm", 40 for "md", 48 for "lg". When missing: "md". */
  size?: ButtonSize;
  /**
   * An icon shown before the text: a component that draws an <svg>, for example
   * an icon of "lucide-react" (icon={Plus}). It is decoration: a screen reader skips it.
   */
  icon?: IconComponent;
  /**
   * true while the action of the button is running. The button shows a spinner
   * (a small turning circle) in the place of the icon, and a press does nothing.
   * It keeps the keyboard focus.
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
  icon: Icon,
  loading = false,
  type = "button",
  className,
  children,
  ...buttonProps
}: ButtonProps) {
  const iconClass = buttonIconClass[size];
  let leadingPart: ReactNode = null;
  if (loading) {
    leadingPart = (
      <span className={classNames(spinnerClass, iconClass)} data-slot="spinner" aria-hidden="true" />
    );
  } else if (Icon !== undefined) {
    leadingPart = <Icon aria-hidden="true" className={iconClass} />;
  }

  return (
    <ButtonElement
      {...buttonProps}
      type={type}
      loading={loading}
      className={buttonClassNames({ variant, size, loading, className })}
      data-variant={variant}
      data-size={size}
    >
      {leadingPart}
      {children}
    </ButtonElement>
  );
}
