import { TextInput } from "../text-input/index.js";
import type { TextInputProps } from "../text-input/index.js";

export type DecimalInputProps = Omit<TextInputProps, "type">;

/**
 * A text field for a number with decimals: a price, a quantity, a rate.
 *
 * - It is a TextInput with type="text" and inputMode="decimal": a phone shows
 *   the keyboard with the digits and the decimal mark.
 * - Its value is the text the person typed, with a comma or a point as the
 *   decimal mark. The field does not change the text and does not refuse a
 *   character. The app reads the number with parseDecimalInput, and shows its
 *   own error message (in Field) when the result is NaN.
 * - It is not type="number": a browser refuses a comma in such a field in some
 *   languages, and changes the value with the mouse wheel.
 * - "size", "icon", "className", every other prop and "ref" work as in TextInput.
 */
export function DecimalInput(props: DecimalInputProps) {
  return <TextInput inputMode="decimal" {...props} type="text" />;
}
