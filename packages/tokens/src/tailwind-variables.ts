import { colorTokenNames } from "./themes.js";

/**
 * How a level 2 color token becomes a Tailwind CSS 4 class.
 *
 * The first part of a token name is its group, and says where the color is
 * used. Tailwind makes a class from a "theme variable": a variable of an
 * "@theme" block whose name starts with a fixed text. The table below gives
 * that text for each group. It is the same mapping as the "@theme inline"
 * block of the app Intraweb, so the classes have the same names:
 *
 *   --bg-primary      ->  --background-color-primary  ->  bg-primary
 *   --text-primary    ->  --text-color-primary        ->  text-primary
 *   --border-default  ->  --border-color-default      ->  border-default
 *   --icon-default    ->  --text-color-icon           ->  text-icon
 *   --icon-strong     ->  --text-color-icon-strong    ->  text-icon-strong
 *   --data-1          ->  --color-data-1              ->  bg-data-1, text-data-1, fill-data-1, ...
 */
const colorGroups: { prefix: string; themeVariable: (name: string) => string }[] = [
  { prefix: "bg-", themeVariable: (name) => `--background-color-${name}` },
  { prefix: "text-", themeVariable: (name) => `--text-color-${name}` },
  { prefix: "border-", themeVariable: (name) => `--border-color-${name}` },
  {
    prefix: "icon-",
    themeVariable: (name) => (name === "default" ? "--text-color-icon" : `--text-color-icon-${name}`),
  },
  { prefix: "data-", themeVariable: (name) => `--color-data-${name}` },
];

/**
 * The Tailwind theme variable that makes the class of a color token, or
 * undefined when the name starts with none of "bg-", "text-", "border-",
 * "icon-" and "data-". Example: "bg-primary" gives "--background-color-primary".
 */
export function getTailwindColorVariable(tokenName: string): string | undefined {
  const group = colorGroups.find(({ prefix }) => tokenName.startsWith(prefix));
  return group?.themeVariable(tokenName.slice(group.prefix.length));
}

/**
 * Two more classes of Intraweb that read a border token for another CSS
 * property: "outline-focus" (the color of the focus outline) and "ring-info"
 * (the color of the ring around a field that has the focus).
 */
export const extraTailwindColorVariables: Record<string, string> = {
  "--outline-color-focus": "var(--border-focus)",
  "--ring-color-info": "var(--border-info)",
};

/** Every line of the "@theme inline" block of the preset that maps a color token to its class. */
export function getTailwindColorMapping(): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (const tokenName of colorTokenNames) {
    const themeVariable = getTailwindColorVariable(tokenName);
    if (themeVariable !== undefined) {
      mapping[themeVariable] = `var(--${tokenName})`;
    }
  }
  return { ...mapping, ...extraTailwindColorVariables };
}

/**
 * The names that follow the first part of a color class of the library.
 * Example: the classes "bg-primary", "text-primary" and "text-icon" give
 * "primary" and "icon". An app cannot add a color for every CSS property with
 * one of these names, because part of its classes would be the library's.
 */
export function getReservedColorNames(): string[] {
  const names = Object.keys(getTailwindColorMapping()).map((themeVariable) =>
    themeVariable.replace(/^--(background-color|text-color|border-color|outline-color|ring-color|color)-/, ""),
  );
  return [...new Set(names)];
}
