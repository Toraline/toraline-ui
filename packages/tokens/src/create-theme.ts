import { darkTheme, lightTheme, themeTokenNames } from "./themes";
import type { ThemeTokenName } from "./themes";

type ColorTokenName = Extract<ThemeTokenName, `color-${string}`>;

/**
 * The name of a color of the library, without "color-".
 * Example: "primary" is the level 2 token --color-primary.
 */
export type ThemeColorName = ColorTokenName extends `color-${infer Name}` ? Name : never;

/**
 * The values an app gives to build a theme.
 * Every field except "name" is optional. A value the app does not give
 * comes from the default theme named in "base".
 */
export type ThemeInput = {
  /** The name of the theme. The page selects it with data-theme="<name>". Lowercase letters, digits and dashes. */
  name: string;
  /** The default theme that gives the values the app does not give. When missing: "light". */
  base?: "light" | "dark";
  /** When true, the theme also applies to a page that has no data-theme attribute. */
  isDefault?: boolean;
  /**
   * Colors. The key is the color name without "color-".
   * A key the library has (for example "primary") changes that color.
   * A key the library does not have (for example "brand") adds the new token --color-brand.
   * The value is any CSS color, for example "#ff6600" or "var(--purple-300)".
   */
  colors?: Partial<Record<ThemeColorName, string>> & Record<string, string>;
  /** Fonts. The value is any CSS font-family value, for example "var(--font-inter), sans-serif". */
  fonts?: {
    body?: string;
    heading?: string;
    mono?: string;
  };
  /** How round the corners are. Any CSS length, for example "0.25rem". */
  radius?: string;
};

const defaultThemes = { light: lightTheme, dark: darkTheme };

const namePattern = /^[a-z][a-z0-9-]*$/;

const assertName = (name: string, what: string) => {
  if (!namePattern.test(name)) {
    throw new Error(
      `createTheme: ${what} "${name}" is not valid. Use lowercase letters, digits and dashes, and start with a letter.`,
    );
  }
};

const assertValue = (value: string, what: string) => {
  const isUnsafe = /[;{}<>\\]/.test(value) || value.includes("/*");
  if (typeof value !== "string" || value.trim() === "" || isUnsafe) {
    throw new Error(
      `createTheme: the value of ${what} is not valid: "${value}". It must be one CSS value, with no ";", "{", "}", "<", ">", "\\" or "/*".`,
    );
  }
};

/**
 * Lists the colors of a theme input that the library does not have.
 * Example: for colors { primary: "#000", brand: "#f60" } the result is ["brand"].
 */
export function getAddedColorNames(input: ThemeInput): string[] {
  const libraryTokens: readonly string[] = themeTokenNames;
  return Object.keys(input.colors ?? {}).filter(
    (colorName) => !libraryTokens.includes(`color-${colorName}`),
  );
}

/**
 * Builds the CSS of one theme from an app's values.
 *
 * The result is one block of CSS variables under the selector [data-theme="<name>"].
 * It has every level 2 token: the app's value when the app gave one, and the value
 * of the default theme when it did not. A color the library does not have becomes
 * a new token, --color-<key>.
 */
export function createTheme(input: ThemeInput): string {
  assertName(input.name, "the theme name");

  const base = defaultThemes[input.base ?? "light"];
  const tokens: Record<string, string> = { ...base.tokens };

  for (const [colorName, value] of Object.entries(input.colors ?? {})) {
    assertName(colorName, "the color name");
    assertValue(value, `the color "${colorName}"`);
    tokens[`color-${colorName}`] = value;
  }

  for (const [fontName, value] of Object.entries(input.fonts ?? {})) {
    if (!["body", "heading", "mono"].includes(fontName)) {
      throw new Error(
        `createTheme: "${fontName}" is not a font of the library. The fonts are "body", "heading" and "mono".`,
      );
    }
    assertValue(value, `the font "${fontName}"`);
    tokens[`font-${fontName}`] = value;
  }

  if (input.radius !== undefined) {
    assertValue(input.radius, "the radius");
    tokens.radius = input.radius;
  }

  const themeSelector = `[data-theme="${input.name}"]`;
  const selector = input.isDefault ? `:root,\n${themeSelector}` : themeSelector;
  const lines = [
    `  color-scheme: ${base.colorScheme};`,
    ...Object.entries(tokens).map(([tokenName, value]) => `  --${tokenName}: ${value};`),
  ];

  return `${selector} {\n${lines.join("\n")}\n}\n`;
}
