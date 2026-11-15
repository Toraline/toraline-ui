/**
 * Describes a prop whose value is one of a list, for the panel "Controls" and
 * for the table of props of a documentation page.
 *
 * "options" is a list that the library exports, for example buttonVariants.
 * The control then offers every value of the list, and the table shows the
 * values as text, for example "primary" | "secondary" | "danger".
 */
export function optionList(options: readonly string[], control: "select" | "inline-radio" = "select") {
  return {
    control,
    options: [...options],
    table: { type: { summary: options.map((option) => `"${option}"`).join(" | ") } },
  };
}
