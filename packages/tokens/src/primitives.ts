/**
 * Level 1 tokens: raw values.
 *
 * A key is the name of the CSS variable without the two dashes.
 * Example: the key "color-brand-700" is the CSS variable --color-brand-700.
 * css/primitives.css must stay equal to this object. A test compares the two.
 */
export const primitives = {
  /*
   * The color scales of the Intraweb design system. The names and the values are
   * the ones of the "@theme" block of Intraweb's globals.css, so each one is also
   * a Tailwind CSS color: --color-brand-700 gives the class bg-brand-700.
   */
  // Slate: the neutral scale, for text, borders and backgrounds.
  "color-slate-50": "#f7f8fa",
  "color-slate-100": "#f1f3f6",
  "color-slate-200": "#e4e7ec",
  "color-slate-300": "#d0d5dd",
  "color-slate-400": "#98a2b3",
  "color-slate-500": "#667085",
  "color-slate-600": "#475467",
  "color-slate-700": "#344054",
  "color-slate-800": "#1d2939",
  "color-slate-900": "#101828",

  // Brand: the blue of the brand. --color-brand-700 is the color of the main action.
  "color-brand-50": "#f2f6f9",
  "color-brand-100": "#e3ecf2",
  "color-brand-200": "#c8d8e4",
  "color-brand-300": "#a9c2d4",
  "color-brand-400": "#8eaec5",
  "color-brand-500": "#6f93ae",
  "color-brand-600": "#557a96",
  "color-brand-700": "#42637c",
  "color-brand-800": "#344f63",
  "color-brand-900": "#263a49",

  // Pink: the accent color.
  "color-pink-50": "#fbf4f2",
  "color-pink-100": "#f5e6e1",
  "color-pink-400": "#d7ada1",
  "color-pink-700": "#9a5f50",

  // Cream: the highlight background.
  "color-cream-100": "#fff5ec",

  // Green: success.
  "color-green-50": "#ecfdf3",
  "color-green-200": "#abefc6",
  "color-green-500": "#17b26a",
  "color-green-700": "#067647",

  // Orange: warning.
  "color-orange-50": "#fffaeb",
  "color-orange-200": "#fedf89",
  "color-orange-400": "#fdb022",
  "color-orange-700": "#b54708",

  // Red: error and danger.
  "color-red-50": "#fef3f2",
  "color-red-200": "#fecdca",
  "color-red-600": "#d92d20",
  "color-red-700": "#b42318",

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

  /*
   * Font stacks. A font stack is a list of fonts; the browser uses the first one it has.
   * The library downloads no font: the app loads Inter and Poppins.
   * "var(--font-inter, "Inter")" means: the font in the CSS variable --font-inter
   * when the app defines that variable on <html> (next/font does), and the font
   * named "Inter" when it does not. The fonts after it are the fonts of the device,
   * used when the app loaded no font, or while the font file loads.
   */
  // Inter: the font of normal text.
  "font-stack-sans": 'var(--font-inter, "Inter"), ui-sans-serif, system-ui, sans-serif',
  // Poppins, in the weights 400, 500 and 600: the font of headings and buttons.
  "font-stack-display": 'var(--font-poppins, "Poppins"), ui-sans-serif, system-ui, sans-serif',
  "font-stack-mono":
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
} as const;

/** The name of a level 1 token, without the two dashes. Example: "color-brand-700". */
export type PrimitiveName = keyof typeof primitives;
