/**
 * Level 2 tokens: meanings.
 *
 * A key is the name of the CSS variable without the two dashes.
 * Example: the key "bg-primary" is the CSS variable --bg-primary.
 * css/themes/light.css and css/themes/dark.css must stay equal to these objects.
 * A test compares them.
 *
 * The color tokens have the names and the values of the design system of the
 * app Intraweb (its files styles/themes/light.css and styles/themes/dark.css).
 * The first part of a name says where the color is used:
 * "bg-" a background, "text-" a text, "border-" a border, "icon-" an icon,
 * "data-" a chart or a progress bar.
 *
 * The 4 radius sizes and the 5 shadows also have the names and the values of
 * Intraweb (the "@theme" block of its globals.css). They are level 2 tokens,
 * so a theme of an app can change them. The two themes of the library have
 * the same values.
 */

/** The names of the level 2 color tokens. */
export const colorTokenNames = [
  // Backgrounds.
  "bg-page",
  "bg-surface",
  "bg-subtle",
  "bg-muted",
  "bg-inverse",
  "bg-inverse-hover",
  "bg-selected",
  "bg-danger-subtle",
  "bg-error",
  "bg-success",
  "bg-warning",
  "bg-overlay",
  "bg-primary",
  "bg-primary-hover",
  "bg-primary-subtle",
  "bg-primary-muted",
  "bg-accent-subtle",
  "bg-highlight",
  "bg-info",
  "bg-tooltip",
  // Text colors.
  "text-primary",
  "text-strong",
  "text-body",
  "text-secondary",
  "text-tertiary",
  "text-muted",
  "text-inverse",
  "text-danger",
  "text-error",
  "text-success",
  "text-warning",
  "text-caution",
  "text-brand",
  "text-info",
  "text-accent",
  // Border colors.
  "border-default",
  "border-strong",
  "border-subtle",
  "border-hover",
  "border-focus",
  "border-inverse",
  "border-brand",
  "border-danger",
  "border-error",
  "border-invalid",
  "border-changed",
  "border-success",
  "border-info",
  "border-warning",
  // Icon colors.
  "icon-default",
  "icon-strong",
  "icon-brand",
  // Colors of charts and progress bars.
  "data-1",
  "data-2",
  "data-3",
  "data-success",
  "data-warning",
  "data-danger",
  "data-track",
] as const;

/** The name of a level 2 color token, without the two dashes. Example: "bg-primary". */
export type ColorTokenName = (typeof colorTokenNames)[number];

/** The names of the level 2 tokens. Every theme gives a value to each of them. */
export const themeTokenNames = [
  ...colorTokenNames,
  "font-body",
  "font-heading",
  "font-mono",
  "text-sm",
  "text-base",
  "text-lg",
  "spacing",
  // How round a corner is, from the corner of a button to the corner of a drawer.
  "radius-md",
  "radius-lg",
  "radius-xl",
  "radius-2xl",
  // Shadows, from the smallest to the shadow of a dialog.
  "shadow-sm",
  "shadow-card",
  "shadow-lg",
  "shadow-xl",
  "shadow-2xl",
] as const;

/** The name of a level 2 token, without the two dashes. Example: "bg-primary". */
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
    "bg-page": "var(--color-slate-100)",
    "bg-surface": "#ffffff",
    "bg-subtle": "var(--color-slate-50)",
    "bg-muted": "var(--color-slate-100)",
    "bg-inverse": "var(--color-brand-700)",
    "bg-inverse-hover": "var(--color-brand-800)",
    "bg-selected": "var(--color-brand-50)",
    "bg-danger-subtle": "var(--color-red-50)",
    "bg-error": "var(--color-red-50)",
    "bg-success": "var(--color-green-50)",
    "bg-warning": "var(--color-orange-50)",
    "bg-overlay": "rgb(16 24 40 / 0.5)",
    "bg-primary": "var(--color-brand-700)",
    "bg-primary-hover": "var(--color-brand-800)",
    "bg-primary-subtle": "var(--color-brand-50)",
    "bg-primary-muted": "var(--color-brand-100)",
    "bg-accent-subtle": "var(--color-pink-50)",
    "bg-highlight": "var(--color-cream-100)",
    "bg-info": "var(--color-brand-50)",
    "bg-tooltip": "var(--color-slate-900)",

    "text-primary": "var(--color-slate-900)",
    "text-strong": "var(--color-slate-800)",
    "text-body": "var(--color-slate-700)",
    "text-secondary": "var(--color-slate-600)",
    "text-tertiary": "var(--color-slate-500)",
    "text-muted": "var(--color-slate-400)",
    "text-inverse": "#ffffff",
    "text-danger": "var(--color-red-700)",
    "text-error": "var(--color-red-700)",
    "text-success": "var(--color-green-700)",
    "text-warning": "var(--color-orange-700)",
    "text-caution": "var(--color-orange-700)",
    "text-brand": "var(--color-brand-700)",
    "text-info": "var(--color-brand-700)",
    "text-accent": "var(--color-pink-700)",

    "border-default": "var(--color-slate-200)",
    "border-strong": "var(--color-slate-300)",
    "border-subtle": "var(--color-slate-100)",
    "border-hover": "var(--color-slate-400)",
    "border-focus": "var(--color-brand-600)",
    "border-inverse": "var(--color-brand-700)",
    "border-brand": "var(--color-brand-700)",
    "border-danger": "var(--color-red-200)",
    "border-error": "var(--color-red-200)",
    "border-invalid": "var(--color-red-600)",
    "border-changed": "var(--color-orange-400)",
    "border-success": "var(--color-green-200)",
    "border-info": "var(--color-brand-200)",
    "border-warning": "var(--color-orange-200)",

    "icon-default": "var(--color-slate-500)",
    "icon-strong": "var(--color-slate-700)",
    "icon-brand": "var(--color-brand-700)",

    "data-1": "var(--color-brand-600)",
    "data-2": "var(--color-brand-300)",
    "data-3": "var(--color-pink-400)",
    "data-success": "var(--color-green-500)",
    "data-warning": "var(--color-orange-400)",
    "data-danger": "var(--color-red-600)",
    "data-track": "var(--color-slate-200)",

    "font-body": "var(--font-stack-sans)",
    "font-heading": "var(--font-stack-display)",
    "font-mono": "var(--font-stack-mono)",
    "text-sm": "var(--font-size-sm)",
    "text-base": "var(--font-size-md)",
    "text-lg": "var(--font-size-lg)",
    spacing: "var(--space-1)",
    "radius-md": "0.5rem",
    "radius-lg": "0.75rem",
    "radius-xl": "1rem",
    "radius-2xl": "1.25rem",
    "shadow-sm": "0 1px 2px rgb(16 24 40 / 0.05)",
    "shadow-card": "0 1px 2px rgb(16 24 40 / 0.04), 0 4px 16px rgb(16 24 40 / 0.04)",
    "shadow-lg": "0 4px 6px -2px rgb(16 24 40 / 0.03), 0 12px 16px -4px rgb(16 24 40 / 0.08)",
    "shadow-xl": "0 8px 8px -4px rgb(16 24 40 / 0.03), 0 20px 24px -4px rgb(16 24 40 / 0.08)",
    "shadow-2xl": "0 24px 48px -12px rgb(16 24 40 / 0.18)",
  },
};

export const darkTheme: ThemeDefinition = {
  name: "dark",
  colorScheme: "dark",
  tokens: {
    "bg-page": "#0c111d",
    "bg-surface": "#161b26",
    "bg-subtle": "#1f242f",
    "bg-muted": "#252b37",
    "bg-inverse": "#8eaec5",
    "bg-inverse-hover": "#a9c2d4",
    "bg-selected": "#1c2733",
    "bg-danger-subtle": "#2a1614",
    "bg-error": "#2a1614",
    "bg-success": "#0f261b",
    "bg-warning": "#2b2112",
    "bg-overlay": "rgb(0 0 0 / 0.6)",
    "bg-primary": "#8eaec5",
    "bg-primary-hover": "#a9c2d4",
    "bg-primary-subtle": "#1c2733",
    "bg-primary-muted": "#263545",
    "bg-accent-subtle": "#2b1f1c",
    "bg-highlight": "#2a2418",
    "bg-info": "#1c2733",
    "bg-tooltip": "#f1f3f6",

    "text-primary": "#f5f5f6",
    "text-strong": "#e4e7ec",
    "text-body": "#cecfd2",
    "text-secondary": "#a4a7ae",
    "text-tertiary": "#8a8d94",
    "text-muted": "#61646c",
    "text-inverse": "#0c111d",
    "text-danger": "#f97066",
    "text-error": "#f97066",
    "text-success": "#47cd89",
    "text-warning": "#fdb022",
    "text-caution": "#fdb022",
    "text-brand": "#a9c2d4",
    "text-info": "#a9c2d4",
    "text-accent": "#e3c2b8",

    "border-default": "#333741",
    "border-strong": "#414651",
    "border-subtle": "#1f242f",
    "border-hover": "#61646c",
    "border-focus": "#8eaec5",
    "border-inverse": "#8eaec5",
    "border-brand": "#8eaec5",
    "border-danger": "#7a271a",
    "border-error": "#7a271a",
    "border-invalid": "#f97066",
    "border-changed": "#fdb022",
    "border-success": "#085d3a",
    "border-info": "#344f63",
    "border-warning": "#93370d",

    "icon-default": "#8a8d94",
    "icon-strong": "#cecfd2",
    "icon-brand": "#a9c2d4",

    "data-1": "#8eaec5",
    "data-2": "#42637c",
    "data-3": "#d7ada1",
    "data-success": "#47cd89",
    "data-warning": "#fdb022",
    "data-danger": "#f97066",
    "data-track": "#333741",

    "font-body": "var(--font-stack-sans)",
    "font-heading": "var(--font-stack-display)",
    "font-mono": "var(--font-stack-mono)",
    "text-sm": "var(--font-size-sm)",
    "text-base": "var(--font-size-md)",
    "text-lg": "var(--font-size-lg)",
    spacing: "var(--space-1)",
    "radius-md": "0.5rem",
    "radius-lg": "0.75rem",
    "radius-xl": "1rem",
    "radius-2xl": "1.25rem",
    "shadow-sm": "0 1px 2px rgb(16 24 40 / 0.05)",
    "shadow-card": "0 1px 2px rgb(16 24 40 / 0.04), 0 4px 16px rgb(16 24 40 / 0.04)",
    "shadow-lg": "0 4px 6px -2px rgb(16 24 40 / 0.03), 0 12px 16px -4px rgb(16 24 40 / 0.08)",
    "shadow-xl": "0 8px 8px -4px rgb(16 24 40 / 0.03), 0 20px 24px -4px rgb(16 24 40 / 0.08)",
    "shadow-2xl": "0 24px 48px -12px rgb(16 24 40 / 0.18)",
  },
};
