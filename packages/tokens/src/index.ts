/**
 * @toraline/tokens
 *
 * The design tokens and the themes of the Toraline component library.
 * This package has no React code. The CSS files are in the folder css/.
 */
export const packageName = "@toraline/tokens";

export { primitives } from "./primitives";
export type { PrimitiveName } from "./primitives";
export { darkTheme, lightTheme, themeTokenNames } from "./themes";
export type { ThemeDefinition, ThemeTokenName, ThemeTokens } from "./themes";
export { createTheme, getAddedColorNames } from "./create-theme";
export type { ThemeColorName, ThemeInput } from "./create-theme";
export {
  DEFAULT_THEMES,
  THEME_ATTRIBUTE,
  THEME_COOKIE_MAX_AGE,
  THEME_COOKIE_NAME,
  createThemeScript,
  readThemeCookie,
  resolveTheme,
  serializeThemeCookie,
} from "./theme-storage";
export type { ThemeScriptOptions } from "./theme-storage";
