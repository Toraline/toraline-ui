import { createTheme, getAddedColorNames, getColorVariableName } from "./create-theme.js";
import type { ThemeInput } from "./create-theme.js";
import { getTailwindColorVariable } from "./tailwind-variables.js";

/**
 * Builds the CSS that makes the colors an app added available as Tailwind CSS 4 classes.
 *
 * Give it the same inputs the app gives to createTheme. The result has one line
 * for each added color:
 * - "bg-promo", a color of one group, gives the class bg-promo. In the same way
 *   "text-on-promo" gives text-on-promo, "border-promo" gives border-promo,
 *   "icon-promo" gives text-icon-promo, and "data-4" gives bg-data-4, text-data-4
 *   and the others.
 * - "promo", a color for every CSS property, gives the classes bg-promo,
 *   text-promo, border-promo and the others.
 *
 * Each class reads the CSS variable of the token, so it follows the theme. The
 * value of the first theme that has the color is the fallback: it is used only
 * on a page where no theme with that color is selected.
 * The result is an empty text when no theme adds a color.
 *
 * Put the result in a CSS file that Tailwind reads, after the import of
 * "@toraline.tech/tokens/css/tailwind.css". Tailwind builds its classes from CSS files,
 * so a <style> element in the page is too late.
 */
export function createTailwindTheme(themeInputs: readonly ThemeInput[]): string {
  const addedColors = new Map<string, string>();

  for (const themeInput of themeInputs) {
    // createTheme checks the names and the values, and throws an error for a bad one.
    createTheme(themeInput);
    for (const colorName of getAddedColorNames(themeInput)) {
      if (!addedColors.has(colorName)) {
        addedColors.set(colorName, themeInput.colors?.[colorName] as string);
      }
    }
  }

  // A color for every CSS property is already a Tailwind theme variable: --color-<name>.
  const plainLines: string[] = [];
  // A color of one group needs a line that names the Tailwind theme variable of its class.
  const inlineLines: string[] = [];
  for (const [colorName, value] of addedColors) {
    const themeVariable = getTailwindColorVariable(colorName);
    if (themeVariable === undefined) {
      plainLines.push(`  --${getColorVariableName(colorName)}: ${value};`);
    } else {
      inlineLines.push(`  ${themeVariable}: var(--${colorName}, ${value});`);
    }
  }

  const plainBlock = plainLines.length > 0 ? `@theme {\n${plainLines.join("\n")}\n}\n` : "";
  const inlineBlock = inlineLines.length > 0 ? `@theme inline {\n${inlineLines.join("\n")}\n}\n` : "";
  return plainBlock + inlineBlock;
}
