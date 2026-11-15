/**
 * The list of the places where the menu of the split button can open.
 * It is in a file with no "use client", so a Server Component can read it.
 */

/** "bottom": the menu opens under the buttons. "top": the menu opens above them. */
export const splitButtonMenuPlacements = ["bottom", "top"] as const;
export type SplitButtonMenuPlacement = (typeof splitButtonMenuPlacements)[number];
