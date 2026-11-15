/**
 * Level 1 tokens: raw values.
 *
 * A key is the name of the CSS variable without the two dashes.
 * Example: the key "purple-500" is the CSS variable --purple-500.
 * css/primitives.css must stay equal to this object. A test compares the two.
 */
export const primitives = {
  "purple-50": "#f6efff",
  "purple-100": "#d0b1ff",
  "purple-200": "#b593ea",
  "purple-300": "#833cda",
  "purple-400": "#6f1dc0",
  "purple-500": "#5e00a1",
  "purple-600": "#51009b",
  "purple-700": "#3d0069",

  "grey-100": "#ffffff",
  "grey-200": "#f3f3f4",
  "grey-300": "#e7e8e9",
  "grey-400": "#cfd1d4",
  "grey-500": "#9fa3a9",
  "grey-600": "#6f757e",
  "grey-700": "#3f4753",
  "grey-800": "#27303e",
  "grey-900": "#0f1928",

  "red-300": "#f47878",
  "red-500": "#f04848",
  "red-600": "#d92d2d",

  "green-300": "#84d235",
  "green-400": "#7ec36d",
  "green-500": "#68a15f",
  "green-700": "#2f6f14",

  black: "#000000",
  white: "#ffffff",

  "space-1": "0.25rem",
  "space-2": "0.5rem",
  "space-3": "0.75rem",
  "space-4": "1rem",
  "space-6": "1.5rem",
  "space-8": "2rem",
  "space-12": "3rem",
  "space-16": "4rem",

  "font-size-xs": "0.75rem",
  "font-size-sm": "0.875rem",
  "font-size-md": "1rem",
  "font-size-lg": "1.125rem",
  "font-size-xl": "1.25rem",
  "font-size-2xl": "1.5rem",
  "font-size-3xl": "2rem",

  "font-stack-sans":
    'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  "font-stack-mono":
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',

  "radius-size-none": "0",
  "radius-size-sm": "0.25rem",
  "radius-size-md": "0.5rem",
  "radius-size-lg": "1rem",
  "radius-size-full": "9999px",

  "shadow-size-sm": "0 1px 2px rgb(15 25 40 / 0.12)",
  "shadow-size-md": "0 4px 12px rgb(15 25 40 / 0.16)",
  "shadow-size-lg": "0 12px 32px rgb(15 25 40 / 0.2)",
} as const;

/** The name of a level 1 token, without the two dashes. Example: "purple-500". */
export type PrimitiveName = keyof typeof primitives;
