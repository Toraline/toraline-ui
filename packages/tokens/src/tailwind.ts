import { createTheme, getAddedColorNames } from "./create-theme";
import type { ThemeInput } from "./create-theme";

/**
 * Builds the CSS that makes the colors an app added available as Tailwind CSS 4 classes.
 *
 * Give it the same inputs the app gives to createTheme. For an added color "brand"
 * the result is an "@theme" block with --color-brand, and Tailwind then has the
 * classes bg-brand, text-brand, border-brand and the others.
 *
 * The value in the block is the value of the first theme that has the color. It is
 * used only on a page where no theme with that color is selected.
 * The result is an empty text when no theme adds a color.
 *
 * Put the result in a CSS file that Tailwind reads, after the import of
 * "@toraline/tokens/css/tailwind.css". Tailwind builds its classes from CSS files,
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

  if (addedColors.size === 0) {
    return "";
  }

  const lines = [...addedColors].map(([colorName, value]) => `  --color-${colorName}: ${value};`);
  return `@theme {\n${lines.join("\n")}\n}\n`;
}
