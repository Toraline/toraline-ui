"use client";

/**
 * @toraline/ui/theme
 *
 * The React parts of the theme: the provider, the hook and the toggle.
 * They run in the browser, so this entry is a Client Component entry
 * (it starts with "use client").
 */
export { ThemeProvider, useTheme } from "./ThemeProvider.js";
export type { ThemeContextValue, ThemeProviderProps } from "./ThemeProvider.js";
export { ThemeToggle } from "./ThemeToggle.js";
export type { ThemeToggleProps } from "./ThemeToggle.js";
