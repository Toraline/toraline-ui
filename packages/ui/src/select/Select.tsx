import type { ComponentProps } from "react";
import { controlClassNames } from "../shared/control.js";
import type { ControlSize } from "../shared/control.js";

/**
 * The arrow at the right edge of the select: a background image, 16 pixels
 * wide, 12 pixels from the right edge, in the middle of the height.
 *
 * It is the arrow of the select of the app Intraweb (the class "select-chevron"
 * of its globals.css): the icon "chevron-down" of Lucide (https://lucide.dev,
 * ISC license) as an SVG image inside the class. The image is written with no
 * quote and no space ("%27" is a quote, "%20" is a space), so the class is one
 * word. An image in a class cannot read a token: the color of the line is the
 * grey of Intraweb's arrow ("%23667085" is #667085), the same in every theme.
 * The two lengths are multiples of the spacing unit.
 */
const arrowClass =
  "bg-[url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2024%2024%27%20fill=%27none%27%20stroke=%27%23667085%27%20stroke-width=%272%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%3E%3Cpath%20d=%27m6%209%206%206%206-6%27/%3E%3C/svg%3E)] bg-[position:right_calc(var(--spacing)*3)_center] bg-[size:calc(var(--spacing)*4)] bg-no-repeat";

/** The browser's own arrow is hidden, and the text leaves room for the arrow of the library. */
const selectClass = "appearance-none pr-9";

export type SelectProps = Omit<ComponentProps<"select">, "size"> & {
  /**
   * The size. "md": 48 pixels high on a small screen and 40 pixels from the
   * breakpoint "lg" (a screen 1024 pixels wide or more). "sm": 32 pixels.
   * When missing: "md". It replaces the HTML attribute "size" (the number of
   * rows of a list box), which a select with classes does not need.
   */
  size?: ControlSize;
};

/**
 * A select: a control where a person chooses one value of a list.
 *
 * - It is a native <select>. The choices are its <option> children. The
 *   browser shows the list, and the keyboard works as in any select.
 * - It has no label of its own. Put it inside Field, which gives it a label, a
 *   hint and an error message. Alone, it needs "aria-label".
 * - "disabled" is the HTML attribute. aria-invalid="true" gives it the look of
 *   a field that is not valid; Field sets it when it has an error.
 * - "className", every other prop and "ref" go to the <select>.
 */
export function Select({ size = "md", className, ...selectProps }: SelectProps) {
  return (
    <select
      {...selectProps}
      className={controlClassNames(size, arrowClass, selectClass, className)}
      data-size={size}
    />
  );
}
