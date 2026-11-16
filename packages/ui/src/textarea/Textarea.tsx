import type { ComponentProps } from "react";
import { controlBoxClassNames } from "../shared/control.js";

/**
 * The padding and the font size. They are the ones of the size "md" of a
 * control: text of 16 pixels on a small screen (a phone makes the page larger
 * when a field with smaller text gets the focus) and 14 pixels from the
 * breakpoint "lg". The height comes from the number of rows.
 */
const textareaClass = "py-2.5 text-base lg:text-sm";

export type TextareaProps = ComponentProps<"textarea">;

/**
 * A text field with more than one line.
 *
 * - It is a native <textarea>. "rows" is its height in lines of text.
 * - It has no label of its own. Put it inside Field, which gives it a label, a
 *   hint and an error message. Alone, it needs "aria-label".
 * - It has one size. "disabled" is the HTML attribute. aria-invalid="true"
 *   gives it the look of a field that is not valid; Field sets it when it has an error.
 * - "className", every other prop and "ref" go to the <textarea>.
 */
export function Textarea({ className, ...textareaProps }: TextareaProps) {
  return <textarea {...textareaProps} className={controlBoxClassNames(textareaClass, className)} />;
}
