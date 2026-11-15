/**
 * Level 2 tokens: meanings.
 *
 * A key is the name of the CSS variable without the two dashes.
 * Example: the key "color-primary" is the CSS variable --color-primary.
 * css/themes/light.css and css/themes/dark.css must stay equal to these objects.
 * A test compares them.
 */

/** The names of the level 2 tokens. Every theme gives a value to each of them. */
export const themeTokenNames = [
  "color-surface",
  "color-surface-raised",
  "color-surface-muted",
  "color-text",
  "color-text-muted",
  "color-border",
  "color-border-strong",
  "color-primary",
  "color-primary-hover",
  "color-primary-foreground",
  "color-danger",
  "color-danger-hover",
  "color-danger-foreground",
  "color-success",
  "color-success-foreground",
  "color-focus-ring",
  "color-overlay",
  "font-body",
  "font-heading",
  "font-mono",
  "text-sm",
  "text-base",
  "text-lg",
  "spacing",
  "radius",
  "shadow",
] as const;

/** The name of a level 2 token, without the two dashes. Example: "color-primary". */
export type ThemeTokenName = (typeof themeTokenNames)[number];

/** The value of every level 2 token in one theme. */
export type ThemeTokens = Record<ThemeTokenName, string>;

/**
 * One theme of the library.
 * "colorScheme" tells the browser which look to give to its own parts,
 * for example scroll bars and date pickers.
 */
export type ThemeDefinition = {
  name: string;
  colorScheme: "light" | "dark";
  tokens: ThemeTokens;
};

export const lightTheme: ThemeDefinition = {
  name: "light",
  colorScheme: "light",
  tokens: {
    "color-surface": "var(--grey-100)",
    "color-surface-raised": "var(--grey-100)",
    "color-surface-muted": "var(--grey-200)",
    "color-text": "var(--grey-900)",
    "color-text-muted": "var(--grey-600)",
    "color-border": "var(--grey-400)",
    "color-border-strong": "var(--grey-600)",
    "color-primary": "var(--purple-500)",
    "color-primary-hover": "var(--purple-700)",
    "color-primary-foreground": "var(--white)",
    "color-danger": "var(--red-600)",
    "color-danger-hover": "var(--red-700)",
    "color-danger-foreground": "var(--white)",
    "color-success": "var(--green-700)",
    "color-success-foreground": "var(--white)",
    "color-focus-ring": "var(--purple-300)",
    "color-overlay": "rgb(15 25 40 / 0.6)",
    "font-body": "var(--font-stack-sans)",
    "font-heading": "var(--font-stack-sans)",
    "font-mono": "var(--font-stack-mono)",
    "text-sm": "var(--font-size-sm)",
    "text-base": "var(--font-size-md)",
    "text-lg": "var(--font-size-lg)",
    spacing: "var(--space-1)",
    radius: "var(--radius-size-md)",
    shadow: "var(--shadow-size-sm)",
  },
};

export const darkTheme: ThemeDefinition = {
  name: "dark",
  colorScheme: "dark",
  tokens: {
    "color-surface": "var(--grey-900)",
    "color-surface-raised": "var(--grey-800)",
    "color-surface-muted": "var(--grey-800)",
    "color-text": "var(--grey-200)",
    "color-text-muted": "var(--grey-500)",
    "color-border": "var(--grey-700)",
    "color-border-strong": "var(--grey-600)",
    "color-primary": "var(--purple-200)",
    "color-primary-hover": "var(--purple-100)",
    "color-primary-foreground": "var(--grey-900)",
    "color-danger": "var(--red-300)",
    "color-danger-hover": "var(--red-200)",
    "color-danger-foreground": "var(--grey-900)",
    "color-success": "var(--green-400)",
    "color-success-foreground": "var(--grey-900)",
    "color-focus-ring": "var(--purple-100)",
    "color-overlay": "rgb(0 0 0 / 0.7)",
    "font-body": "var(--font-stack-sans)",
    "font-heading": "var(--font-stack-sans)",
    "font-mono": "var(--font-stack-mono)",
    "text-sm": "var(--font-size-sm)",
    "text-base": "var(--font-size-md)",
    "text-lg": "var(--font-size-lg)",
    spacing: "var(--space-1)",
    radius: "var(--radius-size-md)",
    shadow: "var(--shadow-size-md)",
  },
};
