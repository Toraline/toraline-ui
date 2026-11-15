import { classNames } from "./class-names.js";
import { focusRingClass } from "./focus-ring.js";

/*
 * The segmented look: a row of choices inside a quiet rounded track, where the
 * chosen one is a raised white piece. TabNav (variant "secondary") and Tabs
 * share it. The classes are the ones of the segmented control of the app
 * Intraweb (components/ui/tab-nav.tsx).
 */

/**
 * The track. It is never wider than its container: with many choices it scrolls sideways.
 * Its corner is 10 pixels, the value of Intraweb: the corner of a piece (8 pixels) plus half of the padding.
 */
export const segmentedTrackClass =
  "inline-flex max-w-full gap-1 overflow-x-auto rounded-[10px] bg-muted p-1";

/**
 * One piece, at rest and while the pointer is over it. The component adds the
 * classes of the chosen piece, with the Tailwind variant of the attribute a
 * screen reader reads (aria-current or aria-selected):
 * a "surface" background, the main text color and a small shadow.
 * The text has the style of a label: the font of headings, 14 pixels, medium.
 */
export const segmentedItemClass = classNames(
  "shrink-0 rounded-md px-3 py-1.5 font-heading text-sm/5 font-medium whitespace-nowrap text-secondary",
  "hover:text-primary",
  "motion-safe:transition-colors",
  focusRingClass,
);
