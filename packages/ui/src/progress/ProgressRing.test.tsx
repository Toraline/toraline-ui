// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test } from "vitest";
import { ProgressRing, progressRingSizes, progressTones } from "./index";

afterEach(cleanup);

describe("ProgressRing", () => {
  test("is a ring of 64 pixels with the percentage in the middle", () => {
    render(<ProgressRing label="Ideal stock" value={1} max={4} />);
    const ring = screen.getByRole("progressbar", { name: "Ideal stock" });
    expect(ring.tagName).toBe("DIV");
    expect(ring.getAttribute("data-size")).toBe("md");
    expect(ring.getAttribute("data-tone")).toBe("brand");
    expect(ring.className.split(" ")).toEqual(
      expect.arrayContaining(["relative", "inline-flex", "shrink-0", "items-center", "justify-center", "size-16"]),
    );
    const percent = screen.getByText("25%");
    expect(percent.getAttribute("aria-hidden")).toBe("true");
    expect(percent.className.split(" ")).toEqual(
      expect.arrayContaining(["absolute", "font-heading", "text-xs/4", "font-medium", "text-primary", "tabular-nums"]),
    );
  });

  test("a screen reader gets the name, the value as a number and the percentage as text", () => {
    render(<ProgressRing label="Ideal stock" value={1} max={4} />);
    const ring = screen.getByRole("progressbar", { name: "Ideal stock" });
    expect(ring.getAttribute("aria-valuemin")).toBe("0");
    expect(ring.getAttribute("aria-valuemax")).toBe("4");
    expect(ring.getAttribute("aria-valuenow")).toBe("1");
    expect(ring.getAttribute("aria-valuetext")).toBe("25%");
    // The drawing is skipped.
    expect(ring.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  test("has the sizes md and sm, and md is the default", () => {
    expect(progressRingSizes).toEqual(["md", "sm"]);
  });

  test('the size "sm" is 40 pixels with no text, and a screen reader still gets the percentage', () => {
    render(<ProgressRing label="Ideal stock" value={1} max={4} size="sm" />);
    const ring = screen.getByRole("progressbar", { name: "Ideal stock" });
    expect(ring.getAttribute("data-size")).toBe("sm");
    expect(ring.className.split(" ")).toContain("size-10");
    expect(ring.className.split(" ")).not.toContain("size-16");
    expect(screen.queryByText("25%")).toBeNull();
    expect(ring.getAttribute("aria-valuetext")).toBe("25%");
  });

  test.each([
    ["md", "0 0 64 64", "6", "29"],
    ["sm", "0 0 40 40", "4", "18"],
  ] as const)('the drawing of the size "%s": its square, the width of its line and its radius', (size, viewBox, strokeWidth, radius) => {
    render(<ProgressRing label="Ideal stock" value={50} size={size} />);
    const drawing = screen.getByRole("progressbar").querySelector("svg") as SVGElement;
    expect(drawing.getAttribute("viewBox")).toBe(viewBox);
    expect(drawing.getAttribute("class")?.split(" ")).toEqual(["size-full", "-rotate-90"]);
    for (const circle of drawing.querySelectorAll("circle")) {
      expect(circle.getAttribute("stroke-width")).toBe(strokeWidth);
      expect(circle.getAttribute("r")).toBe(radius);
      expect(circle.getAttribute("fill")).toBe("none");
    }
  });

  test.each([
    ["brand", "stroke-data-1"],
    ["success", "stroke-data-success"],
    ["warning", "stroke-data-warning"],
    ["danger", "stroke-data-danger"],
  ] as const)('the tone "%s" draws the filled line with %s', (tone, strokeColor) => {
    render(<ProgressRing label="Ideal stock" value={50} tone={tone} />);
    const ring = screen.getByRole("progressbar");
    expect(progressTones).toContain(tone);
    expect(ring.getAttribute("data-tone")).toBe(tone);
    expect(ring.querySelector('[data-slot="fill"]')?.getAttribute("class")).toBe(strokeColor);
    expect(ring.querySelector('[data-slot="track"]')?.getAttribute("class")).toBe("stroke-data-track");
  });

  test("the filled line is as long as the percentage of the circle", () => {
    render(
      <>
        <ProgressRing label="Empty" value={0} />
        <ProgressRing label="Quarter" value={25} />
        <ProgressRing label="Full" value={100} />
      </>,
    );
    const circumference = 2 * Math.PI * 29;
    const fillOf = (name: string) =>
      screen.getByRole("progressbar", { name }).querySelector('[data-slot="fill"]') as SVGCircleElement;
    expect(Number(fillOf("Empty").getAttribute("stroke-dasharray"))).toBeCloseTo(circumference);
    expect(Number(fillOf("Empty").getAttribute("stroke-dashoffset"))).toBeCloseTo(circumference);
    expect(Number(fillOf("Quarter").getAttribute("stroke-dashoffset"))).toBeCloseTo(circumference * 0.75);
    expect(Number(fillOf("Full").getAttribute("stroke-dashoffset"))).toBeCloseTo(0);
    expect(fillOf("Quarter").getAttribute("stroke-linecap")).toBe("round");
  });

  test("a value above max is shown as full, and a value below 0 as empty", () => {
    render(
      <>
        <ProgressRing label="Above" value={150} />
        <ProgressRing label="Below" value={-20} />
      </>,
    );
    const above = screen.getByRole("progressbar", { name: "Above" });
    expect(above.getAttribute("aria-valuenow")).toBe("100");
    expect(above.getAttribute("aria-valuetext")).toBe("100%");
    const below = screen.getByRole("progressbar", { name: "Below" });
    expect(below.getAttribute("aria-valuenow")).toBe("0");
    expect(below.getAttribute("aria-valuetext")).toBe("0%");
  });

  test("it cannot get the focus", () => {
    render(<ProgressRing label="Ideal stock" value={50} />);
    expect(screen.getByRole("progressbar").tabIndex).toBe(-1);
  });

  test("adds the app's className after the library's classes", () => {
    render(<ProgressRing label="Ideal stock" value={50} className="mt-4 size-20" />);
    const classes = screen.getByRole("progressbar").className.split(" ");
    expect(classes.slice(-2)).toEqual(["mt-4", "size-20"]);
    expect(classes).not.toContain("size-16");
    expect(classes).toContain("shrink-0");
  });

  test("passes other attributes to the element, and ref points to it", () => {
    const ref = createRef<HTMLDivElement>();
    render(<ProgressRing ref={ref} label="Ideal stock" value={50} id="stock" />);
    const ring = screen.getByRole("progressbar");
    expect(ring.id).toBe("stock");
    expect(ref.current).toBe(ring);
  });

  test("renders on the server", () => {
    const html = renderToString(<ProgressRing label="Ideal stock" value={1} max={4} size="sm" tone="warning" />);
    expect(html).toMatch(/^<div role="progressbar" aria-label="Ideal stock"/);
    expect(html).toContain('aria-valuetext="25%"');
    expect(html).toContain('data-size="sm"');
    expect(html).toContain('data-tone="warning"');
  });
});
