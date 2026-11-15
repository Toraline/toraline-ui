/**
 * The list of the sides of Tooltip.
 * It is in a file with no "use client", so a Server Component can read it.
 */

/** The side of the element where the tooltip is shown. The first one is the default. */
export const tooltipSides = ["right", "top"] as const;
export type TooltipSide = (typeof tooltipSides)[number];
