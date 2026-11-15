/** A value that classNames accepts. A value that is not a text is skipped. */
export type ClassNameValue = string | false | null | undefined;

/**
 * Joins class names into one text for the attribute "class".
 *
 * Every component puts its own class first and the app's className last:
 * classNames("tui-button", className). The order in the attribute does not
 * decide which style wins. The app's classes win because every style of the
 * library is in the cascade layer "components", which has a lower priority
 * than a Tailwind CSS class and than CSS that is in no layer.
 */
export function classNames(...values: ClassNameValue[]): string {
  return values.filter((value) => typeof value === "string" && value !== "").join(" ");
}
