/*
 * The two functions that go with DecimalInput. They are the functions with the
 * same names of the app Intraweb (lib/format/number.ts), unchanged.
 *
 * A decimal mark is the character between the whole part and the decimal part
 * of a number: a comma in Brazil ("0,4"), a point in English ("0.4").
 */

/**
 * Reads the text a person typed in a DecimalInput as a number.
 *
 * - An empty text, or only spaces: null.
 * - A text with a comma: the comma is the decimal mark, and every point is a
 *   mark between thousands, which is removed. "1.234,5" is 1234.5, "0,40" is 0.4.
 * - A text with no comma: a point is the decimal mark. "2.5" is 2.5, and "1.234" is 1.234.
 * - A text that is not a number ("abc", "1,2,3"): NaN. Test it with Number.isNaN.
 */
export function parseDecimalInput(text: string): number | null {
  const trimmedText = text.trim();
  if (trimmedText === "") {
    return null;
  }
  const normalizedText = trimmedText.includes(",")
    ? trimmedText.replace(/\./g, "").replace(",", ".")
    : trimmedText;
  const value = Number(normalizedText);
  return Number.isFinite(value) ? value : Number.NaN;
}

/**
 * Writes a number as the text of a DecimalInput, with a comma as the decimal
 * mark: 0.4 is "0,4". No number (null or undefined) is the empty text.
 */
export function decimalToInput(value: number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value).replace(".", ",");
}
