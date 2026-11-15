import type { ComponentProps, ReactNode } from "react";
import { classNames } from "../shared/class-names.js";
import { CheckboxControl } from "./CheckboxControl.js";

/** The label: the box, a space of 8 pixels, and the text in the small size. As the Checkbox of the app Intraweb. */
const rootClass = "flex items-center gap-2 font-body text-sm/5 text-body";

export type CheckboxProps = Omit<ComponentProps<"input">, "type"> & {
  /** The visible name of the checkbox, shown after the box. A press on it changes the box. */
  label: ReactNode;
};

/**
 * A checkbox with its label: a box that is checked or not.
 *
 * - It is a real <input type="checkbox"> inside a <label>: the Space key
 *   changes it, a press on the text changes it, and a screen reader says the
 *   label and "checked" or "not checked".
 * - "checked" with "onChange" controls it from the app. "defaultChecked" sets
 *   only how it starts. "disabled" is the HTML attribute.
 * - "className" goes to the outermost element, the <label>. Every other prop
 *   goes to the <input>, and "ref" points to it.
 * - For only the box, with no label, use CheckboxControl.
 */
export function Checkbox({ label, id, className, ...inputProps }: CheckboxProps) {
  return (
    <label htmlFor={id} className={classNames(rootClass, className)}>
      <CheckboxControl {...inputProps} id={id} />
      <span data-slot="label">{label}</span>
    </label>
  );
}
