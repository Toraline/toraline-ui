"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  DEFAULT_THEMES,
  THEME_ATTRIBUTE,
  THEME_COOKIE_NAME,
  resolveTheme,
  serializeThemeCookie,
} from "@toraline/tokens";

/** What useTheme returns. */
export type ThemeContextValue = {
  /** The name of the theme the page shows now. */
  theme: string;
  /** The theme names of the app, in the order the toggle goes through them. */
  themes: readonly string[];
  /** Shows another theme and saves the choice. Throws an error for a name that is not in "themes". */
  setTheme: (theme: string) => void;
};

export type ThemeProviderProps = {
  children: ReactNode;
  /** The theme names of the app. When missing: "light" and "dark". */
  themes?: readonly string[];
  /** The theme of a person who has not chosen yet. When missing: the first of "themes". */
  defaultTheme?: string;
  /**
   * The theme the server already wrote on <html>, read from the cookie.
   * Give it when the app renders on a server, so the first render knows the theme.
   */
  initialTheme?: string;
  /** The name of the cookie that holds the choice. When missing: "toraline-theme". */
  cookieName?: string;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Holds the current theme, writes it on the root element (<html data-theme="...">)
 * and saves the person's choice in a cookie.
 */
export function ThemeProvider({
  children,
  themes = DEFAULT_THEMES,
  defaultTheme,
  initialTheme,
  cookieName = THEME_COOKIE_NAME,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState(() =>
    resolveTheme(initialTheme, themes, defaultTheme),
  );

  // Runs once in the browser. When <html> already has a theme (written by the
  // server or by the script of createThemeScript), the provider takes that theme.
  // When it has none, the provider writes its own.
  useEffect(() => {
    const root = document.documentElement;
    const themeOnPage = root.getAttribute(THEME_ATTRIBUTE);
    if (themeOnPage !== null && themes.includes(themeOnPage)) {
      setThemeState(themeOnPage);
    } else {
      root.setAttribute(THEME_ATTRIBUTE, theme);
    }
    // The empty list means: run only after the first render in the browser.
  }, []);

  const setTheme = useCallback(
    (nextTheme: string) => {
      if (!themes.includes(nextTheme)) {
        throw new Error(
          `setTheme: "${nextTheme}" is not a theme of this app. The themes are: ${themes.join(", ")}.`,
        );
      }
      document.documentElement.setAttribute(THEME_ATTRIBUTE, nextTheme);
      document.cookie = serializeThemeCookie(nextTheme, cookieName);
      setThemeState(nextTheme);
    },
    [themes, cookieName],
  );

  const value = useMemo(() => ({ theme, themes, setTheme }), [theme, themes, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Reads the current theme and the function that changes it. Works only inside ThemeProvider. */
export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (value === null) {
    throw new Error("useTheme must be used inside <ThemeProvider>.");
  }
  return value;
}
