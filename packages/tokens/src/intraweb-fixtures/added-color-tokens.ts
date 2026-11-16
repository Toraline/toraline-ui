/**
 * The color tokens that this library has and Intraweb's theme files do not have.
 *
 * In 3 places Intraweb's components write a level 1 color in a class
 * ("bg-slate-300", "bg-slate-400", "ring-orange-200"), which is the same color
 * in every theme. A component of the library uses only level 2 tokens, so each
 * of these colors is a level 2 token with the same value in the light and the
 * dark theme (docs/decisions.md, TOR-1223, items 7, 8 and 11).
 *
 * The tests that compare the tokens with the copies of Intraweb's files leave
 * these names out. The value is the level 1 color that Intraweb's class names.
 */
export const addedColorTokens = {
  "bg-handle": "var(--color-slate-300)",
  "border-changed-ring": "var(--color-orange-200)",
  "data-neutral": "var(--color-slate-400)",
} as const;

export const addedColorTokenNames: readonly string[] = Object.keys(addedColorTokens);
