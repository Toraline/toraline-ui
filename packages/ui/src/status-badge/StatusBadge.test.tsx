// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test } from "vitest";
import { darkTheme, lightTheme } from "@toraline.tech/tokens";
import { StatusBadge, statusBadgeVariants } from "./index";

afterEach(cleanup);

describe("StatusBadge", () => {
  test("renders its text in a <span>, in the variant neutral, with no dot", () => {
    render(<StatusBadge label="Draft" />);
    const badge = screen.getByText("Draft");
    expect(badge.tagName).toBe("SPAN");
    expect(badge.getAttribute("data-variant")).toBe("neutral");
    expect(badge.querySelector('[data-slot="dot"]')).toBeNull();
    expect(badge.className.split(" ")).toEqual(
      expect.arrayContaining([
        "inline-flex",
        "rounded-full",
        "px-2.5",
        "py-1",
        "font-heading",
        "text-xs/4",
        "font-medium",
        "whitespace-nowrap",
        "bg-muted",
        "text-secondary",
      ]),
    );
  });

  test("has the 5 variants of Intraweb, and neutral is the default", () => {
    expect(statusBadgeVariants).toEqual(["neutral", "success", "warning", "error", "info"]);
  });

  test.each([
    ["neutral", "bg-muted", "text-secondary", "bg-data-neutral"],
    ["success", "bg-success", "text-success", "bg-data-success"],
    ["warning", "bg-warning", "text-warning", "bg-data-warning"],
    ["error", "bg-error", "text-error", "bg-data-danger"],
    ["info", "bg-info", "text-info", "bg-data-1"],
  ] as const)('the variant "%s" has its background, its text color and the color of its dot', (variant, background, text, dotColor) => {
    render(<StatusBadge label="State" variant={variant} dot />);
    const badge = screen.getByText("State");
    expect(badge.getAttribute("data-variant")).toBe(variant);
    expect(badge.className.split(" ")).toEqual(expect.arrayContaining([background, text]));
    const dot = badge.querySelector('[data-slot="dot"]') as HTMLElement;
    expect(dot.className.split(" ")).toEqual(expect.arrayContaining(["size-1.5", "rounded-full", dotColor]));
  });

  test("the neutral dot has the grey of Intraweb's dot, a token with the same value in both themes", () => {
    render(<StatusBadge label="Draft" dot />);
    const dot = screen.getByText("Draft").querySelector('[data-slot="dot"]') as HTMLElement;
    // Before version 0.3.1 the dot had the text color "text-muted", which is darker in the dark theme.
    expect(dot.className.split(" ")).not.toContain("text-muted");
    expect(lightTheme.tokens["data-neutral"]).toBe("var(--color-slate-400)");
    expect(darkTheme.tokens["data-neutral"]).toBe(lightTheme.tokens["data-neutral"]);
  });

  test("dot: the dot is before the text, and a screen reader skips it", () => {
    render(<StatusBadge label="Paid" variant="success" dot />);
    const badge = screen.getByText("Paid");
    const dot = badge.firstElementChild as HTMLElement;
    expect(dot.getAttribute("data-slot")).toBe("dot");
    expect(dot.getAttribute("aria-hidden")).toBe("true");
    expect(badge.textContent).toBe("Paid");
  });

  test("the label can be an element", () => {
    render(<StatusBadge label={<strong>Late</strong>} variant="error" />);
    expect(screen.getByText("Late").tagName).toBe("STRONG");
  });

  test("it cannot get the focus", () => {
    render(<StatusBadge label="Paid" />);
    expect(screen.getByText("Paid").tabIndex).toBe(-1);
  });

  test("adds the app's className after the library's classes", () => {
    render(<StatusBadge label="Paid" variant="success" className="mt-4 bg-surface" />);
    const classes = screen.getByText("Paid").className.split(" ");
    expect(classes.slice(-2)).toEqual(["mt-4", "bg-surface"]);
    expect(classes).not.toContain("bg-success");
    expect(classes).toContain("text-success");
  });

  test("passes other attributes to the <span>, and ref points to it", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<StatusBadge ref={ref} label="Paid" id="state" title="Paid on Monday" />);
    const badge = screen.getByTitle("Paid on Monday");
    expect(badge.id).toBe("state");
    expect(ref.current).toBe(badge);
  });

  test("renders on the server", () => {
    expect(renderToString(<StatusBadge label="Paid" variant="success" dot />)).toMatch(
      /^<span class="[^"]+" data-variant="success"><span aria-hidden="true" class="[^"]+" data-slot="dot"><\/span>Paid<\/span>$/,
    );
  });
});
