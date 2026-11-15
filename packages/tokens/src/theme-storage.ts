/**
 * Saving and reading the theme a person chose. No React here.
 *
 * The choice is saved in a cookie. A cookie is a small named value that the
 * browser keeps and sends to the server with every request. Because the server
 * receives it, the server can write data-theme on <html> before the page is sent.
 */

/** The attribute on the root element (<html>) that selects the theme. */
export const THEME_ATTRIBUTE = "data-theme";

/** The name of the cookie that holds the chosen theme. */
export const THEME_COOKIE_NAME = "toraline-theme";

/** How long the browser keeps the cookie: 1 year, in seconds. */
export const THEME_COOKIE_MAX_AGE = 31536000;

/** The themes of the library, in the order the toggle goes through them. */
export const DEFAULT_THEMES: readonly string[] = ["light", "dark"];

const themeNamePattern = /^[a-z][a-z0-9-]*$/;
const cookieNamePattern = /^[A-Za-z0-9_-]+$/;

const assertCookieName = (cookieName: string) => {
  if (!cookieNamePattern.test(cookieName)) {
    throw new Error(
      `The cookie name "${cookieName}" is not valid. Use letters, digits, "_" and "-".`,
    );
  }
};

const assertThemeNames = (themes: readonly string[]) => {
  if (themes.length === 0) {
    throw new Error("The list of themes is empty. Give at least one theme name.");
  }
  for (const theme of themes) {
    if (!themeNamePattern.test(theme)) {
      throw new Error(
        `The theme name "${theme}" is not valid. Use lowercase letters, digits and dashes, and start with a letter.`,
      );
    }
  }
};

/**
 * Finds the saved theme in the text of a Cookie header (or of document.cookie).
 * Example: readThemeCookie("a=1; toraline-theme=dark") is "dark".
 * Returns undefined when the cookie is not there.
 */
export function readThemeCookie(
  cookieHeader: string | null | undefined,
  cookieName: string = THEME_COOKIE_NAME,
): string | undefined {
  assertCookieName(cookieName);
  for (const part of (cookieHeader ?? "").split(";")) {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex !== -1 && part.slice(0, separatorIndex).trim() === cookieName) {
      return part.slice(separatorIndex + 1).trim();
    }
  }
  return undefined;
}

/**
 * Decides which theme to show. It is the saved theme when the saved theme is
 * one of the app's themes. Otherwise it is the default theme.
 * The default theme is the first of "themes" when "defaultTheme" is not given.
 */
export function resolveTheme(
  savedTheme: string | null | undefined,
  themes: readonly string[] = DEFAULT_THEMES,
  defaultTheme?: string,
): string {
  assertThemeNames(themes);
  const isKnown = typeof savedTheme === "string" && themes.includes(savedTheme);
  return isKnown ? savedTheme : (defaultTheme ?? (themes[0] as string));
}

/**
 * Builds the text that saves the chosen theme when it is assigned to document.cookie.
 * Example: "toraline-theme=dark; Path=/; Max-Age=31536000; SameSite=Lax".
 */
export function serializeThemeCookie(theme: string, cookieName: string = THEME_COOKIE_NAME): string {
  assertCookieName(cookieName);
  assertThemeNames([theme]);
  return `${cookieName}=${theme}; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`;
}

/** The options of createThemeScript. */
export type ThemeScriptOptions = {
  /** The theme names of the app. When missing: "light" and "dark". */
  themes?: readonly string[];
  /** The theme of a person who has not chosen yet. When missing: the first of "themes". */
  defaultTheme?: string;
  /** The name of the cookie. When missing: "toraline-theme". */
  cookieName?: string;
};

/**
 * Builds a small script, as text, for an app whose server cannot read cookies
 * (for example a page that is built once and served as a file).
 *
 * Put the text in a <script> element inside <head>. The browser runs it before
 * it paints the page: the script reads the cookie and writes data-theme on <html>.
 */
export function createThemeScript(options: ThemeScriptOptions = {}): string {
  const themes = options.themes ?? DEFAULT_THEMES;
  const cookieName = options.cookieName ?? THEME_COOKIE_NAME;
  assertThemeNames(themes);
  assertCookieName(cookieName);
  const defaultTheme = resolveTheme(options.defaultTheme, themes);

  return (
    "(function(){" +
    `var themes=${JSON.stringify(themes)};` +
    `var theme=${JSON.stringify(defaultTheme)};` +
    "try{" +
    `var match=document.cookie.match(/(?:^|;\\s*)${cookieName}=([^;]*)/);` +
    "if(match&&themes.indexOf(match[1])!==-1){theme=match[1];}" +
    "}catch(error){}" +
    `document.documentElement.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)},theme);` +
    "})();"
  );
}
