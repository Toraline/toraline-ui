import type { ComponentProps } from "react";
import { classNames } from "../shared/class-names.js";
import { focusRingClass } from "../shared/focus-ring.js";

/*
 * The classes of the box of a checkbox. They are the ones of the
 * CheckboxControl of the app Intraweb (components/ui/form-controls.tsx).
 *
 * The box is the real <input type="checkbox">, drawn by the library
 * ("appearance-none"): 20 pixels, a border of 1.5 pixels, a corner of 6 pixels.
 * The check mark is an icon on top of it, shown while the box is checked
 * ("peer-checked:").
 */

/** The outermost element: it holds the box and the check mark, and has the size of the box. */
const rootClass = "relative inline-flex size-5 shrink-0";

/**
 * The box. Checked: the color of the main action. The pointer over it: a
 * darker border, and a darker background while it is checked. Disabled: half
 * of the opacity. The keyboard focus: the focus ring of the library.
 */
const inputClass = classNames(
  "peer size-5 cursor-pointer appearance-none rounded-[6px] border-[1.5px] bg-surface",
  "checked:border-brand checked:bg-primary",
  "hover:border-hover checked:hover:bg-primary-hover",
  focusRingClass,
  "disabled:cursor-not-allowed disabled:opacity-50",
  "motion-safe:transition-colors",
);

/** The border of a box at rest. */
const restClass = "border-strong";

/**
 * The border and the ring of a box whose value was changed and is not saved
 * yet. The ring has the color of the token --border-warning. No ring class
 * reads that token, so the class names the token itself.
 */
const changedClass = "border-changed ring-3 ring-(color:--border-warning)";

/** The check mark: in the middle of the box, hidden until the box is checked. A press on it goes to the box. */
const checkClass =
  "pointer-events-none absolute inset-0 m-auto size-3.5 text-inverse opacity-0 peer-checked:opacity-100";

export type CheckboxControlProps = Omit<ComponentProps<"input">, "type"> & {
  /**
   * true for a value that a person changed and that is not saved yet, for
   * example in a table that is edited in place. The box then has an orange
   * border and ring. When missing: false.
   */
  changed?: boolean;
};

/**
 * Only the box of a checkbox, 20 pixels, for a list or a table that has its
 * own label. For a checkbox with its label, use Checkbox.
 *
 * - It is a real <input type="checkbox">: the Space key changes it, and a
 *   screen reader says "checked" or "not checked".
 * - It has no label. Give it "aria-label", or the "id" that a <label> of the
 *   app points to.
 * - "checked" with "onChange" controls it from the app. "defaultChecked" sets
 *   only how it starts. "disabled" is the HTML attribute.
 * - "className" goes to the outermost element, a <span> that holds the box
 *   and the check mark. Every other prop goes to the <input>, and "ref" points to it.
 */
export function CheckboxControl({ changed = false, className, ...inputProps }: CheckboxControlProps) {
  return (
    <span className={classNames(rootClass, className)}>
      <input
        {...inputProps}
        type="checkbox"
        className={classNames(inputClass, changed ? changedClass : restClass)}
        data-slot="input"
        data-changed={changed ? "true" : undefined}
      />
      {/* The shape is the icon "check" of Lucide (https://lucide.dev, ISC license), the icon Intraweb shows here. */}
      <svg
        className={checkClass}
        data-slot="check"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}
