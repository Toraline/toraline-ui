import { describe, expect, test } from "vitest";
import { computeAnchoredPosition, toAnchoredStyle } from "./index";

// A window of 1000 by 800 pixels, and a panel of 200 by 120 pixels.
const viewport = { width: 1000, height: 800 };
const panel = { width: 200, height: 120 };
const windowBox = { top: 0, left: 0, ...viewport };

/** A button of 100 by 40 pixels with its top left corner at this place. */
const buttonAt = (left: number, top: number) => ({ left, top, width: 100, height: 40 });

describe("computeAnchoredPosition: a panel under or above a button", () => {
  test("opens below the button, 4 pixels under it, with the left edges lined up", () => {
    const position = computeAnchoredPosition({ anchor: buttonAt(300, 100), panel, viewport });
    expect(position).toEqual({ side: "bottom", top: 144, left: 300, moved: false });
  });

  test('align "right" lines up the right edges', () => {
    const position = computeAnchoredPosition({ anchor: buttonAt(300, 100), panel, viewport, align: "right" });
    // The button ends at 400, and the panel is 200 wide.
    expect(position).toEqual({ side: "bottom", top: 144, left: 200, moved: false });
  });

  test('align "center" puts the middle of the panel under the middle of the button', () => {
    const position = computeAnchoredPosition({ anchor: buttonAt(300, 100), panel, viewport, align: "center" });
    expect(position).toEqual({ side: "bottom", top: 144, left: 250, moved: false });
  });

  test("opens above the button when there is no room below", () => {
    // The button ends at 740: 60 pixels are left below, and the panel needs 124.
    const position = computeAnchoredPosition({ anchor: buttonAt(300, 700), panel, viewport });
    expect(position).toEqual({ side: "top", top: 700 - 4 - 120, left: 300, moved: true });
  });

  test("a panel that just fits below stays below", () => {
    // 800 - 124 = 676 is the lowest bottom edge of a button with room for the panel.
    const position = computeAnchoredPosition({ anchor: buttonAt(300, 636), panel, viewport });
    expect(position.side).toBe("bottom");
    expect(position.top + panel.height).toBe(800);
  });

  test("with no room on either side, it opens on the side with more room", () => {
    const tallPanel = { width: 200, height: 700 };
    expect(computeAnchoredPosition({ anchor: buttonAt(300, 100), panel: tallPanel, viewport }).side).toBe("bottom");
    expect(computeAnchoredPosition({ anchor: buttonAt(300, 600), panel: tallPanel, viewport }).side).toBe("top");
  });

  test('side "top" opens above, and below when there is no room above', () => {
    const above = computeAnchoredPosition({ anchor: buttonAt(300, 400), panel, viewport, side: "top" });
    expect(above).toEqual({ side: "top", top: 276, left: 300, moved: false });
    const below = computeAnchoredPosition({ anchor: buttonAt(300, 20), panel, viewport, side: "top" });
    expect(below).toEqual({ side: "bottom", top: 64, left: 300, moved: true });
  });

  test("near the right edge of the window, the panel keeps 8 pixels to the edge", () => {
    const position = computeAnchoredPosition({ anchor: buttonAt(880, 100), panel, viewport });
    expect(position).toEqual({ side: "bottom", top: 144, left: 1000 - 200 - 8, moved: true });
  });

  test("near the left edge of the window, the panel keeps 8 pixels to the edge", () => {
    const position = computeAnchoredPosition({ anchor: buttonAt(20, 100), panel, viewport, align: "right" });
    // Lined up to the right it would start at 120 - 200 = -80.
    expect(position).toEqual({ side: "bottom", top: 144, left: 8, moved: true });
  });

  test("the gap and the space to the edge can be changed", () => {
    const position = computeAnchoredPosition({
      anchor: buttonAt(880, 100),
      panel,
      viewport,
      gap: 8,
      edge: 0,
    });
    expect(position).toEqual({ side: "bottom", top: 148, left: 800, moved: true });
  });
});

describe("computeAnchoredPosition: a panel next to an element (the tooltip)", () => {
  test('side "right" puts the panel after the element, centered on its height', () => {
    const position = computeAnchoredPosition({ anchor: buttonAt(300, 100), panel, viewport, side: "right", gap: 12 });
    expect(position).toEqual({ side: "right", top: 100 + 20 - 60, left: 412, moved: false });
  });

  test('side "right" goes to the left when there is no room on the right', () => {
    const position = computeAnchoredPosition({ anchor: buttonAt(850, 100), panel, viewport, side: "right", gap: 12 });
    expect(position).toEqual({ side: "left", top: 60, left: 850 - 12 - 200, moved: true });
  });

  test("near the top edge of the window, the panel keeps 8 pixels to the edge", () => {
    const position = computeAnchoredPosition({ anchor: buttonAt(300, 10), panel, viewport, side: "right" });
    expect(position.top).toBe(8);
    expect(position.moved).toBe(true);
  });
});

describe("toAnchoredStyle: the CSS position", () => {
  test("a panel below, lined up to the left, is measured from the top and the left", () => {
    const position = computeAnchoredPosition({ anchor: buttonAt(300, 100), panel, viewport });
    expect(toAnchoredStyle(position, panel, "left", windowBox)).toEqual({ top: 144, left: 300 });
  });

  test("a panel above is measured from the bottom, and a panel lined up to the right from the right", () => {
    const position = computeAnchoredPosition({ anchor: buttonAt(300, 700), panel, viewport, align: "right" });
    // The panel ends 4 pixels above the button: 800 - 696. Its right edge is at 400: 1000 - 400.
    expect(toAnchoredStyle(position, panel, "right", windowBox)).toEqual({ bottom: 104, right: 600 });
  });

  test('for "position: absolute", the position is measured from the element around the panel', () => {
    const position = computeAnchoredPosition({ anchor: buttonAt(300, 100), panel, viewport });
    const container = { top: 100, left: 300, width: 100, height: 40 };
    expect(toAnchoredStyle(position, panel, "left", container)).toEqual({ top: 44, left: 0 });
    const toTheRight = computeAnchoredPosition({ anchor: buttonAt(300, 100), panel, viewport, align: "right" });
    expect(toAnchoredStyle(toTheRight, panel, "right", container)).toEqual({ top: 44, right: 0 });
  });
});
