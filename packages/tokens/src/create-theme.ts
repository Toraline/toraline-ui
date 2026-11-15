import { getReservedColorNames, getTailwindColorVariable } from "./tailwind-variables.js";
import { colorTokenNames, darkTheme, lightTheme } from "./themes.js";
import type { ColorTokenName } from "./themes.js";

/**
 * The name of a color token of the library, without the two dashes.
 * Example: "bg-primary" is the level 2 token --bg-primary.
 */
export type ThemeColorName = ColorTokenName;

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
   * Colors. The value is any CSS color, for example "#ff6600" or "var(--color-brand-300)".
   * The key decides what the color is:
   * - The name of a color token of the library (for example "bg-primary") changes that token.
   * - Another name that starts with "bg-", "text-", "border-", "icon-" or "data-"
   *   (for example "bg-promo") adds a token of that group: --bg-promo, with the
   *   Tailwind class bg-promo.
   * - Any other name (for example "promo") adds the token --color-promo: a color
   *   for every CSS property, with the Tailwind classes bg-promo, text-promo,
   *   border-promo and the others.
   */
  colors?: Partial<Record<ThemeColorName, string>> & Record<string, string>;
  /** Fonts. The value is any CSS font-family value, for example "var(--font-inter), sans-serif". */
  fonts?: {
    body?: string;
    heading?: string;
    mono?: string;
  };
  /** Font sizes of the components. The value is any CSS length, for example "0.9375rem". */
  textSizes?: {
    xs?: string;
    sm?: string;
    base?: string;
    lg?: string;
    "2xl"?: string;
    "3xl"?: string;
  };
  /**
   * The spacing unit. Every padding and gap of a component is a multiple of it.
   * Any CSS length. A smaller value makes every component more compact.
   */
  spacing?: string;
  /**
   * How round the corners are. Any CSS length, for example "0.25rem".
   * One value changes --radius-md, the corner of a button and a field.
   * An object changes each size it names: "md" (button, field), "lg" (menu,
   * popover), "xl" (card, table, dialog) and "2xl" (drawer).
   */
  radius?: string | Partial<Record<ThemeRadiusName, string>>;
  /**
   * The shadows. The value is any CSS box-shadow value. The sizes are "sm",
   * "card" (card, table), "lg" (menu, popover), "xl" and "2xl" (dialog, drawer).
   */
  shadows?: Partial<Record<ThemeShadowName, string>>;
};

/** The radius sizes of the library. "md" is the level 2 token --radius-md. */
export const themeRadiusNames = ["md", "lg", "xl", "2xl"] as const;
export type ThemeRadiusName = (typeof themeRadiusNames)[number];

/** The shadows of the library. "card" is the level 2 token --shadow-card. */
export const themeShadowNames = ["sm", "card", "lg", "xl", "2xl"] as const;
export type ThemeShadowName = (typeof themeShadowNames)[number];

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

/** The names Tailwind CSS uses for its font sizes: "text-xl" is a font size, not a color. */
const tailwindFontSizePattern = /^text-(xs|sm|base|lg|[2-9]?xl)$/;

/**
 * The name of the CSS variable, without the two dashes, that a key of "colors" sets.
 * It throws an error for a key that would break a class of the library or of Tailwind CSS.
 */
export function getColorVariableName(colorName: string): string {
  const libraryTokens: readonly string[] = colorTokenNames;
  if (libraryTokens.includes(colorName)) {
    return colorName;
  }

  if (tailwindFontSizePattern.test(colorName) || colorName.startsWith("text-shadow")) {
    throw new Error(
      `createTheme: the color name "${colorName}" is not valid. The variable --${colorName} belongs to Tailwind CSS (a font size or a text shadow). Use another name, for example "text-on-${colorName.slice("text-".length)}".`,
    );
  }

  // A new color of one group: "bg-promo" adds --bg-promo.
  if (getTailwindColorVariable(colorName) !== undefined) {
    return colorName;
  }

  // A new color for every CSS property: "promo" adds --color-promo.
  if (getReservedColorNames().includes(colorName)) {
    const tokens = libraryTokens.filter((tokenName) => tokenName.endsWith(`-${colorName}`));
    // "icon" is the only reserved name that is not the end of a token name: the class is "text-icon".
    const example = tokens[0] ?? "icon-default";
    throw new Error(
      `createTheme: the color name "${colorName}" is not valid. It is not a token of the library, and a class with this name already belongs to the library. Write the full name of a token (for example "${example}"), or use another name.`,
    );
  }
  return `color-${colorName}`;
}

/**
 * Lists the colors of a theme input that the library does not have.
 * Example: for colors { "bg-primary": "#000", "bg-promo": "#f60" } the result is ["bg-promo"].
 */
export function getAddedColorNames(input: ThemeInput): string[] {
  const libraryTokens: readonly string[] = colorTokenNames;
  return Object.keys(input.colors ?? {}).filter((colorName) => !libraryTokens.includes(colorName));
}

/**
 * Builds the CSS of one theme from an app's values.
 *
 * The result is one block of CSS variables under the selector [data-theme="<name>"].
 * It has every level 2 token: the app's value when the app gave one, and the value
 * of the default theme when it did not. A color the library does not have becomes
 * a new token: --<key> when the key starts with "bg-", "text-", "border-", "icon-"
 * or "data-", and --color-<key> for any other key.
 */
export function createTheme(input: ThemeInput): string {
  assertName(input.name, "the theme name");

  const base = defaultThemes[input.base ?? "light"];
  const tokens: Record<string, string> = { ...base.tokens };

  for (const [colorName, value] of Object.entries(input.colors ?? {})) {
    assertName(colorName, "the color name");
    assertValue(value, `the color "${colorName}"`);
    tokens[getColorVariableName(colorName)] = value;
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

  for (const [sizeName, value] of Object.entries(input.textSizes ?? {})) {
    if (!["xs", "sm", "base", "lg", "2xl", "3xl"].includes(sizeName)) {
      throw new Error(
        `createTheme: "${sizeName}" is not a text size of the library. The text sizes are "xs", "sm", "base", "lg", "2xl" and "3xl".`,
      );
    }
    assertValue(value, `the text size "${sizeName}"`);
    tokens[`text-${sizeName}`] = value;
  }

  if (input.spacing !== undefined) {
    assertValue(input.spacing, "the spacing");
    tokens.spacing = input.spacing;
  }

  // One value is the radius of a button and a field: --radius-md.
  const radius = typeof input.radius === "string" ? { md: input.radius } : (input.radius ?? {});
  for (const [radiusName, value] of Object.entries(radius)) {
    if (!(themeRadiusNames as readonly string[]).includes(radiusName)) {
      throw new Error(
        `createTheme: "${radiusName}" is not a radius size of the library. The radius sizes are "md", "lg", "xl" and "2xl".`,
      );
    }
    assertValue(value, `the radius "${radiusName}"`);
    tokens[`radius-${radiusName}`] = value;
  }

  for (const [shadowName, value] of Object.entries(input.shadows ?? {})) {
    if (!(themeShadowNames as readonly string[]).includes(shadowName)) {
      throw new Error(
        `createTheme: "${shadowName}" is not a shadow of the library. The shadows are "sm", "card", "lg", "xl" and "2xl".`,
      );
    }
    assertValue(value, `the shadow "${shadowName}"`);
    tokens[`shadow-${shadowName}`] = value;
  }

  const themeSelector = `[data-theme="${input.name}"]`;
  const selector = input.isDefault ? `:root,\n${themeSelector}` : themeSelector;
  const lines = [
    `  color-scheme: ${base.colorScheme};`,
    ...Object.entries(tokens).map(([tokenName, value]) => `  --${tokenName}: ${value};`),
  ];

  return `${selector} {\n${lines.join("\n")}\n}\n`;
}
