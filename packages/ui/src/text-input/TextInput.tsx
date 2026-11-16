import type { ComponentProps } from "react";
import { controlClassNames } from "../shared/control.js";
import type { ControlSize } from "../shared/control.js";
import type { IconComponent } from "../shared/icon.js";

/** The icon inside the field, on the left, in the middle of its height. A press on it goes to the field. */
const iconClass = "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-icon";

export type TextInputProps = Omit<ComponentProps<"input">, "size"> & {
  /**
   * The size. "md": 48 pixels high on a small screen and 40 pixels from the
   * breakpoint "lg" (a screen 1024 pixels wide or more). "sm": 32 pixels.
   * When missing: "md". It replaces the HTML attribute "size", which a field with classes does not need.
   */
  size?: ControlSize;
  /**
   * An icon shown inside the field, on the left: a component that draws an
   * <svg>, for example an icon of "lucide-react" (icon={Search}). It is
   * decoration: a screen reader skips it.
   */
  icon?: IconComponent;
};

/**
 * A text field: one line of text.
 *
 * - It has no label of its own. Put it inside Field, which gives it a label, a
 *   hint and an error message. Alone, it needs "aria-label".
 * - "type" is "text" when missing. Give type="email", "search", "date" and the others.
 * - "disabled" is the HTML attribute. aria-invalid="true" gives it the look of
 *   a field that is not valid; Field sets it when it has an error.
 * - "className", every other prop and "ref" go to the <input>.
 */
export function TextInput({
  size = "md",
  icon: Icon,
  type = "text",
  className,
  ...inputProps
}: TextInputProps) {
  if (Icon === undefined) {
    return (
      <input
        {...inputProps}
        type={type}
        className={controlClassNames(size, className)}
        data-size={size}
      />
    );
  }

  return (
    <div className="relative w-full" data-slot="wrapper">
      <Icon aria-hidden="true" className={iconClass} />
      <input
        {...inputProps}
        type={type}
        // "pl-9" leaves room for the icon.
        className={controlClassNames(size, "pl-9", className)}
        data-size={size}
      />
    </div>
  );
}
