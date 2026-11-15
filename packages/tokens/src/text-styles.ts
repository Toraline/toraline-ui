/**
 * The text styles: the ready-made looks of a text.
 *
 * A text style sets the font, the size, the line height and the weight of a
 * text together. Each one is a class of the Tailwind preset with the same
 * name: <h1 className="heading-page">. The names and the values are the text
 * style utilities of the app Intraweb (its globals.css).
 *
 * A key of a style is a CSS property. css/tailwind.css must stay equal to this
 * object. A test compares the two.
 */
export const textStyles = {
  /** The title of a page. */
  "heading-page": {
    "font-family": "var(--font-heading)",
    "font-size": "1.5rem",
    "line-height": "2rem",
    "font-weight": "600",
  },
  /** The title of a section, a dialog or a drawer. */
  "heading-section": {
    "font-family": "var(--font-heading)",
    "font-size": "1.125rem",
    "line-height": "1.75rem",
    "font-weight": "500",
  },
  /** The title of a card. */
  "heading-card": {
    "font-family": "var(--font-heading)",
    "font-size": "1rem",
    "line-height": "1.5rem",
    "font-weight": "500",
  },
  /** A large number, for example a total. The digits all have the same width. */
  "display-number": {
    "font-family": "var(--font-heading)",
    "font-size": "2rem",
    "line-height": "2.5rem",
    "font-weight": "600",
    "font-variant-numeric": "tabular-nums",
  },
  /** A large number, one size smaller. */
  "display-number-sm": {
    "font-family": "var(--font-heading)",
    "font-size": "1.5rem",
    "line-height": "2rem",
    "font-weight": "600",
    "font-variant-numeric": "tabular-nums",
  },
  /** A label: the name of a field, the text of a tab or a badge. */
  "label": {
    "font-family": "var(--font-heading)",
    "font-size": "0.875rem",
    "line-height": "1.25rem",
    "font-weight": "500",
  },
  /** A larger label. */
  "label-lg": {
    "font-family": "var(--font-heading)",
    "font-size": "1rem",
    "line-height": "1.5rem",
    "font-weight": "500",
  },
  /** A smaller label. */
  "label-sm": {
    "font-family": "var(--font-heading)",
    "font-size": "0.75rem",
    "line-height": "1rem",
    "font-weight": "500",
  },
  /** A small text in capital letters above a title. */
  "caption-overline": {
    "font-family": "var(--font-heading)",
    "font-size": "0.75rem",
    "line-height": "1rem",
    "font-weight": "500",
    "letter-spacing": "0.05em",
    "text-transform": "uppercase",
  },
} as const;

/** The name of a text style, which is also the name of its Tailwind class. Example: "heading-page". */
export type TextStyleName = keyof typeof textStyles;

/** The names of the text styles, in the order of the catalog. */
export const textStyleNames = Object.keys(textStyles) as TextStyleName[];
