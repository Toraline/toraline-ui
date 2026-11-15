/*
 * Where a floating panel (a menu, a popover, a tooltip) goes: next to the
 * element that opened it (the anchor), and inside the window.
 *
 * This file has no React and no browser code: it only computes numbers, so a
 * test can check every case. The rule is the one of the app Intraweb
 * (components/ui/use-anchored-panel.ts), with 2 more sides for the tooltip.
 */

/** The side of the anchor where the panel opens. */
export const anchoredSides = ["bottom", "top", "right", "left"] as const;
export type AnchoredSide = (typeof anchoredSides)[number];

/**
 * Which edge of the anchor the panel lines up with, for the sides "bottom" and
 * "top". "left": the left edges. "right": the right edges. "center": the centers.
 * For the sides "right" and "left" the panel is always centered on the anchor.
 */
export const anchoredAligns = ["left", "right", "center"] as const;
export type AnchoredAlign = (typeof anchoredAligns)[number];

/** A rectangle in the window, in pixels from the top left corner of the window. */
export type AnchoredBox = { top: number; left: number; width: number; height: number };

/** A width and a height, in pixels. */
export type AnchoredSize = { width: number; height: number };

/** The space between the anchor and the panel, in pixels. */
export const ANCHORED_GAP = 4;

/** The smallest space between the panel and the edge of the window, in pixels. */
export const ANCHORED_EDGE = 8;

export type AnchoredPositionOptions = {
  /** The rectangle of the element that opened the panel. */
  anchor: AnchoredBox;
  /** The size of the panel. */
  panel: AnchoredSize;
  /** The size of the window. */
  viewport: AnchoredSize;
  /** The side that is asked for. When missing: "bottom". */
  side?: AnchoredSide;
  /** The alignment that is asked for. When missing: "left". */
  align?: AnchoredAlign;
  /** The space between the anchor and the panel. When missing: 4 pixels. */
  gap?: number;
  /** The smallest space to the edge of the window. When missing: 8 pixels. */
  edge?: number;
};

export type AnchoredPosition = {
  /** The side the panel is on. It is the opposite of the side asked for when that side has no room. */
  side: AnchoredSide;
  /** The top edge of the panel, in pixels from the top of the window. */
  top: number;
  /** The left edge of the panel, in pixels from the left of the window. */
  left: number;
  /** true when the panel is not where it was asked for: on the other side, or moved away from an edge of the window. */
  moved: boolean;
};

const oppositeSide: Record<AnchoredSide, AnchoredSide> = {
  bottom: "top",
  top: "bottom",
  right: "left",
  left: "right",
};

/** Keeps a position between the edge of the window and the place where the panel still fits. */
function keepInside(position: number, panelLength: number, viewportLength: number, edge: number): number {
  return Math.max(edge, Math.min(position, viewportLength - panelLength - edge));
}

/**
 * Computes where the panel goes.
 *
 * 1. The side: the side asked for when the panel fits there. When it does not
 *    fit, the opposite side, unless that side has even less room.
 * 2. Along the anchor: lined up as asked, then moved so that it keeps 8 pixels
 *    to each edge of the window.
 */
export function computeAnchoredPosition({
  anchor,
  panel,
  viewport,
  side = "bottom",
  align = "left",
  gap = ANCHORED_GAP,
  edge = ANCHORED_EDGE,
}: AnchoredPositionOptions): AnchoredPosition {
  const anchorBottom = anchor.top + anchor.height;
  const anchorRight = anchor.left + anchor.width;

  // The room on each side of the anchor, after the gap.
  const room: Record<AnchoredSide, number> = {
    bottom: viewport.height - anchorBottom - gap,
    top: anchor.top - gap,
    right: viewport.width - anchorRight - gap,
    left: anchor.left - gap,
  };
  const isVertical = side === "bottom" || side === "top";
  const needed = isVertical ? panel.height : panel.width;
  const opposite = oppositeSide[side];
  const fits = needed <= room[side];
  const actualSide = fits || room[opposite] <= room[side] ? side : opposite;

  if (actualSide === "bottom" || actualSide === "top") {
    const top = actualSide === "bottom" ? anchorBottom + gap : anchor.top - gap - panel.height;
    const wanted: Record<AnchoredAlign, number> = {
      left: anchor.left,
      right: anchorRight - panel.width,
      center: anchor.left + anchor.width / 2 - panel.width / 2,
    };
    const left = keepInside(wanted[align], panel.width, viewport.width, edge);
    return { side: actualSide, top, left, moved: actualSide !== side || left !== wanted[align] };
  }

  const left = actualSide === "right" ? anchorRight + gap : anchor.left - gap - panel.width;
  const wantedTop = anchor.top + anchor.height / 2 - panel.height / 2;
  const top = keepInside(wantedTop, panel.height, viewport.height, edge);
  return { side: actualSide, top, left, moved: actualSide !== side || top !== wantedTop };
}

/** The CSS position of a panel: 2 of the 4 properties, in pixels. */
export type AnchoredStyle = { top?: number; bottom?: number; left?: number; right?: number };

/**
 * Turns a position into CSS, measured from the edges of a box: the window for
 * a panel with "position: fixed", or the positioned element around the panel
 * for "position: absolute".
 *
 * As in Intraweb, a panel above the anchor is measured from the bottom, and a
 * panel lined up to the right from the right. So a panel that changes its size
 * while it is open stays against the anchor.
 */
export function toAnchoredStyle(
  position: AnchoredPosition,
  panel: AnchoredSize,
  align: AnchoredAlign,
  container: AnchoredBox,
): AnchoredStyle {
  const containerBottom = container.top + container.height;
  const containerRight = container.left + container.width;
  const vertical =
    position.side === "top"
      ? { bottom: containerBottom - (position.top + panel.height) }
      : { top: position.top - container.top };
  const fromTheRight = position.side === "left" || (position.side !== "right" && align === "right");
  const horizontal = fromTheRight
    ? { right: containerRight - (position.left + panel.width) }
    : { left: position.left - container.left };
  return { ...vertical, ...horizontal };
}
