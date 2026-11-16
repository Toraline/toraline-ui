/**
 * The list of the alignments of Popover.
 * It is in a file with no "use client", so a Server Component can read it.
 */

/** Which edges of the button and the panel line up: the left edges or the right edges. */
export const popoverAligns = ["left", "right"] as const;
export type PopoverAlign = (typeof popoverAligns)[number];
