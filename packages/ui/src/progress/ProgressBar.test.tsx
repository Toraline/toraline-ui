// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test } from "vitest";
import { ProgressBar, progressTones } from "./index";
import { clampValue, percentOf } from "./progress-value";

afterEach(cleanup);

describe("ProgressBar", () => {
  test("shows the label, the percentage and the bar", () => {
    const { container } = render(<ProgressBar label="Hours of the month" value={30} max={40} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("DIV");
    expect(root.getAttribute("data-tone")).toBe("brand");
    expect(root.className).toBe("space-y-1.5");

    const label = screen.getByText("Hours of the month");
    expect(label.getAttribute("data-slot")).toBe("label");
    expect(label.className).toBe("text-secondary");
    const value = screen.getByText("75%");
    expect(value.className.split(" ")).toEqual(
      expect.arrayContaining(["font-heading", "text-sm/5", "font-medium", "text-primary", "tabular-nums"]),
    );

    const track = screen.getByRole("progressbar");
    expect(track.className.split(" ")).toEqual(
      expect.arrayContaining(["h-2", "overflow-hidden", "rounded-full", "bg-data-track"]),
    );
    const fill = track.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("75%");
    expect(fill.className.split(" ")).toEqual(expect.arrayContaining(["h-full", "rounded-full", "bg-data-1"]));
  });

  test("a screen reader gets the name, the value as a number and the value as text", () => {
    render(<ProgressBar label="Hours of the month" value={30} max={40} />);
    const bar = screen.getByRole("progressbar", { name: "Hours of the month" });
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("40");
    expect(bar.getAttribute("aria-valuenow")).toBe("30");
    expect(bar.getAttribute("aria-valuetext")).toBe("75%");
  });

  test("max is 100 when missing", () => {
    render(<ProgressBar label="Goal" value={42} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
    expect(bar.getAttribute("aria-valuetext")).toBe("42%");
  });

  test("has the 4 tones of Intraweb, and brand is the default", () => {
    expect(progressTones).toEqual(["brand", "success", "warning", "danger"]);
  });

  test.each([
    ["brand", "bg-data-1"],
    ["success", "bg-data-success"],
    ["warning", "bg-data-warning"],
    ["danger", "bg-data-danger"],
  ] as const)('the tone "%s" fills the bar with %s', (tone, fillColor) => {
    const { container } = render(<ProgressBar label="Goal" value={50} tone={tone} />);
    expect((container.firstElementChild as HTMLElement).getAttribute("data-tone")).toBe(tone);
    const fill = screen.getByRole("progressbar").firstElementChild as HTMLElement;
    expect(fill.className.split(" ")).toContain(fillColor);
  });

  test("valueText: the text of the value, shown and read by a screen reader", () => {
    render(<ProgressBar label="Hours of the month" value={30} max={40} valueText="30 of 40 h" />);
    expect(screen.getByText("30 of 40 h").getAttribute("data-slot")).toBe("value");
    expect(screen.queryByText("75%")).toBeNull();
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuetext")).toBe("30 of 40 h");
    // The filled part still follows the numbers.
    expect((bar.firstElementChild as HTMLElement).style.width).toBe("75%");
  });

  test("hideLabel: only the bar is shown, and a screen reader still says the name and the value", () => {
    const { container } = render(<ProgressBar label="Goal" value={150} hideLabel />);
    expect(screen.queryByText("Goal")).toBeNull();
    expect(screen.queryByText("100%")).toBeNull();
    expect(container.querySelector('[data-slot="header"]')).toBeNull();
    const bar = screen.getByRole("progressbar", { name: "Goal" });
    expect(bar.getAttribute("aria-valuetext")).toBe("100%");
  });

  test("a value above max is shown as full, and a value below 0 as empty", () => {
    render(
      <>
        <ProgressBar label="Above" value={150} />
        <ProgressBar label="Below" value={-20} />
      </>,
    );
    const above = screen.getByRole("progressbar", { name: "Above" });
    expect(above.getAttribute("aria-valuenow")).toBe("100");
    expect((above.firstElementChild as HTMLElement).style.width).toBe("100%");
    const below = screen.getByRole("progressbar", { name: "Below" });
    expect(below.getAttribute("aria-valuenow")).toBe("0");
    expect((below.firstElementChild as HTMLElement).style.width).toBe("0%");
  });

  test("empty and full: 0 and max", () => {
    render(
      <>
        <ProgressBar label="Empty" value={0} max={8} />
        <ProgressBar label="Full" value={8} max={8} />
      </>,
    );
    expect(screen.getByRole("progressbar", { name: "Empty" }).getAttribute("aria-valuetext")).toBe("0%");
    expect(screen.getByRole("progressbar", { name: "Full" }).getAttribute("aria-valuetext")).toBe("100%");
  });

  test("a max of 0 is shown as empty", () => {
    render(<ProgressBar label="No goal" value={5} max={0} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuetext")).toBe("0%");
    expect((bar.firstElementChild as HTMLElement).style.width).toBe("0%");
  });

  test("it cannot get the focus", () => {
    render(<ProgressBar label="Goal" value={50} />);
    expect(screen.getByRole("progressbar").tabIndex).toBe(-1);
  });

  test("adds the app's className after the library's classes, on the outermost element", () => {
    const { container } = render(<ProgressBar label="Goal" value={50} className="mt-4 space-y-3" />);
    const classes = (container.firstElementChild as HTMLElement).className.split(" ");
    expect(classes).toEqual(["mt-4", "space-y-3"]);
  });

  test("passes other attributes to the outermost element, and ref points to it", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<ProgressBar ref={ref} label="Goal" value={50} id="goal" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.id).toBe("goal");
    expect(ref.current).toBe(root);
  });

  test("renders on the server", () => {
    const html = renderToString(<ProgressBar label="Goal" value={30} max={40} tone="success" />);
    expect(html).toMatch(/^<div class="space-y-1.5" data-tone="success">/);
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuetext="75%"');
    expect(html).toContain('style="width:75%"');
  });
});

describe("percentOf and clampValue", () => {
  test.each([
    [30, 40, 75],
    [1, 3, 33],
    [2, 3, 67],
    [0, 100, 0],
    [100, 100, 100],
    [150, 100, 100],
    [-5, 100, 0],
    [5, 0, 0],
    [5, -1, 0],
  ])("%s of %s is %s%%", (value, max, percent) => {
    expect(percentOf(value, max)).toBe(percent);
  });

  test("the value is kept between 0 and max", () => {
    expect(clampValue(30, 40)).toBe(30);
    expect(clampValue(50, 40)).toBe(40);
    expect(clampValue(-1, 40)).toBe(0);
  });
});
