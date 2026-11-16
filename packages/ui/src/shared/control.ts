import { classNames } from "./class-names.js";
import type { ClassNameValue } from "./class-names.js";

/*
 * What every form control shares: the sizes and the classes of the box of a
 * text field, a select and a textarea. They are the ones of the form controls
 * of the app Intraweb (components/ui/form-controls.tsx).
 */

/**
 * The sizes of a form control. The first one is the default.
 * "md": 48 pixels high with text of 16 pixels on a small screen, and 40 pixels
 * with text of 14 pixels from the breakpoint "lg" of Tailwind CSS (a screen
 * 1024 pixels wide or more). "sm": 32 pixels, for a table or a row of filters.
 */
export const controlSizes = ["md", "sm"] as const;
export type ControlSize = (typeof controlSizes)[number];

/**
 * The classes of the box of a control. A state is selected by the attribute a
 * screen reader reads: "disabled:" by the HTML attribute disabled,
 * "aria-invalid:" by aria-invalid="true".
 *
 * - The pointer over it: a darker border.
 * - The focus: the border in the focus color and a ring of 3 pixels around it,
 *   in the place of the outline of the other components. This is the focus
 *   look of Intraweb's controls.
 * - Not valid: a red border, which stays while the control has the focus.
 * - Disabled: a quiet background and a quiet text.
 */
const controlBaseClass = classNames(
  "w-full rounded-md border border-default bg-surface px-3 font-body text-primary",
  "placeholder:text-tertiary",
  "hover:border-hover",
  "focus:border-focus focus:ring-3 focus:ring-info focus:outline-none",
  "disabled:cursor-not-allowed disabled:bg-subtle disabled:text-tertiary disabled:hover:border-default",
  "aria-invalid:border-invalid",
  "motion-safe:transition-colors",
);

/**
 * The smallest height, the padding and the font size of each size.
 * A phone makes the page larger when a field with text smaller than 16 pixels
 * gets the focus. So "md" has text of 16 pixels below the breakpoint "lg".
 */
const controlSizeClass: Record<ControlSize, string> = {
  md: "min-h-12 py-2.5 text-base/6 lg:min-h-10 lg:py-2 lg:text-sm/5",
  sm: "min-h-8 py-1 text-sm/5",
};

/**
 * The classes of the box of a control that has no size of its own (Textarea).
 * The later values, the app's className last, replace the earlier ones.
 */
export function controlBoxClassNames(...classValues: ClassNameValue[]): string {
  return classNames(controlBaseClass, ...classValues);
}

/** The classes of the box of a control with this size. The later values, the app's className last, replace the earlier ones. */
export function controlClassNames(size: ControlSize, ...classValues: ClassNameValue[]): string {
  return classNames(controlBaseClass, controlSizeClass[size], ...classValues);
}
