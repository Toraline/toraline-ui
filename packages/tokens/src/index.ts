/**
 * @toraline.tech/tokens
 *
 * The design tokens and the themes of the Toraline component library.
 * This package has no React code. The CSS files are in the folder css/.
 */
export const packageName = "@toraline.tech/tokens";

export { primitives } from "./primitives.js";
export type { PrimitiveName } from "./primitives.js";
export { colorTokenNames, darkTheme, lightTheme, themeTokenNames } from "./themes.js";
export type { ColorTokenName, ThemeDefinition, ThemeTokenName, ThemeTokens } from "./themes.js";
export { createTheme, getAddedColorNames } from "./create-theme.js";
export type { ThemeColorName, ThemeInput } from "./create-theme.js";
export {
  DEFAULT_THEMES,
  THEME_ATTRIBUTE,
  THEME_COOKIE_MAX_AGE,
  THEME_COOKIE_NAME,
  createThemeScript,
  readThemeCookie,
  resolveTheme,
  serializeThemeCookie,
} from "./theme-storage.js";
export type { ThemeScriptOptions } from "./theme-storage.js";
export { createTailwindTheme } from "./tailwind.js";
export { textStyleNames, textStyles } from "./text-styles.js";
export type { TextStyleName } from "./text-styles.js";
