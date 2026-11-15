// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test } from "vitest";
import { CountBadge, countBadgeVariants } from "./index";

afterEach(cleanup);

/** The outermost element of the badge whose label is this text. */
const badgeOf = (label: string) => screen.getByText(label).parentElement as HTMLElement;

describe("CountBadge", () => {
  test("shows the number, in the variant warning", () => {
    render(<CountBadge count={3} label="3 pending orders" />);
    const badge = badgeOf("3 pending orders");
    expect(badge.tagName).toBe("SPAN");
    expect(badge.getAttribute("data-variant")).toBe("warning");
    expect(badge.querySelector('[data-slot="count"]')?.textContent).toBe("3");
    expect(badge.className.split(" ")).toEqual(
      expect.arrayContaining([
        "inline-flex",
        "h-5",
        "min-w-5",
        "shrink-0",
        "rounded-full",
        "px-1.5",
        "font-heading",
        "text-xs/4",
        "font-medium",
        "tabular-nums",
        "bg-warning",
        "text-warning",
      ]),
    );
  });

  test("has the 2 variants of Intraweb, and warning is the default", () => {
    expect(countBadgeVariants).toEqual(["warning", "brand"]);
  });

  test.each([
    ["warning", "bg-warning", "text-warning"],
    ["brand", "bg-primary", "text-inverse"],
  ] as const)('the variant "%s" has its background and its text color', (variant, background, text) => {
    render(<CountBadge count={3} label="3 pending orders" variant={variant} />);
    const badge = badgeOf("3 pending orders");
    expect(badge.getAttribute("data-variant")).toBe(variant);
    expect(badge.className.split(" ")).toEqual(expect.arrayContaining([background, text]));
  });

  test("a screen reader reads the label in the place of the number", () => {
    render(<CountBadge count={3} label="3 pending orders" />);
    const badge = badgeOf("3 pending orders");
    // The number that is shown is skipped by a screen reader.
    expect(badge.querySelector('[data-slot="count"]')?.getAttribute("aria-hidden")).toBe("true");
    // The label is on the page as text that is not shown.
    const label = badge.querySelector('[data-slot="label"]') as HTMLElement;
    expect(label.textContent).toBe("3 pending orders");
    expect(label.className).toBe("sr-only");
    expect(label.hasAttribute("aria-hidden")).toBe(false);
    // The <span> has no aria-label: that attribute is not allowed on an element with no role.
    expect(badge.hasAttribute("aria-label")).toBe(false);
  });

  test("empty: the count 0 is shown as 0", () => {
    render(<CountBadge count={0} label="No pending order" />);
    expect(badgeOf("No pending order").querySelector('[data-slot="count"]')?.textContent).toBe("0");
  });

  test("a long number makes the badge wider", () => {
    render(<CountBadge count={1234} label="1234 messages" />);
    const badge = badgeOf("1234 messages");
    expect(badge.querySelector('[data-slot="count"]')?.textContent).toBe("1234");
    // The width is a smallest width, not a fixed width.
    expect(badge.className.split(" ")).toContain("min-w-5");
    expect(badge.className.split(" ")).not.toContain("w-5");
  });

  test("it cannot get the focus", () => {
    render(<CountBadge count={3} label="3 pending orders" />);
    expect(badgeOf("3 pending orders").tabIndex).toBe(-1);
  });

  test("adds the app's className after the library's classes", () => {
    render(<CountBadge count={3} label="3 pending orders" className="ml-2 bg-error" />);
    const classes = badgeOf("3 pending orders").className.split(" ");
    expect(classes.slice(-2)).toEqual(["ml-2", "bg-error"]);
    expect(classes).not.toContain("bg-warning");
    expect(classes).toContain("text-warning");
  });

  test("passes other attributes to the <span>, and ref points to it", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<CountBadge ref={ref} count={3} label="3 pending orders" id="pending" title="Pending" />);
    const badge = screen.getByTitle("Pending");
    expect(badge.id).toBe("pending");
    expect(ref.current).toBe(badge);
  });

  test("renders on the server", () => {
    expect(renderToString(<CountBadge count={3} label="3 pending orders" variant="brand" />)).toMatch(
      /^<span class="[^"]+" data-variant="brand"><span aria-hidden="true" data-slot="count">3<\/span><span class="sr-only" data-slot="label">3 pending orders<\/span><\/span>$/,
    );
  });
});
