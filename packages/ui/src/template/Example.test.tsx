// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test } from "vitest";
import { Example, exampleSizes, exampleVariants } from "./index";

afterEach(cleanup);

describe("Example", () => {
  test("renders its content with the default variant and size", () => {
    render(<Example>New</Example>);
    const example = screen.getByText("New");
    expect(example.tagName).toBe("SPAN");
    expect(example.getAttribute("data-variant")).toBe("neutral");
    expect(example.getAttribute("data-size")).toBe("md");
  });

  test.each(exampleVariants)('has the variant "%s"', (variant) => {
    render(<Example variant={variant}>New</Example>);
    expect(screen.getByText("New").getAttribute("data-variant")).toBe(variant);
  });

  test.each(exampleSizes)('has the size "%s"', (size) => {
    render(<Example size={size}>New</Example>);
    expect(screen.getByText("New").getAttribute("data-size")).toBe(size);
  });

  test("adds the app's className after the library's classes", () => {
    render(<Example className="mt-4 rounded-full">New</Example>);
    const classes = screen.getByText("New").className.split(" ");
    expect(classes.slice(-2)).toEqual(["mt-4", "rounded-full"]);
    // The app's "rounded-full" replaces the library's "rounded-md". The other classes of the library stay.
    expect(classes).not.toContain("rounded-md");
    expect(classes).toContain("bg-muted");
  });

  test("passes other attributes to the element, and ref points to it", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Example ref={ref} id="state" title="State of the order">
        New
      </Example>,
    );
    const example = screen.getByTitle("State of the order");
    expect(example.id).toBe("state");
    expect(ref.current).toBe(example);
  });

  test("renders on the server", () => {
    expect(renderToString(<Example variant="primary">New</Example>)).toMatch(
      /^<span class="[^"]+" data-variant="primary" data-size="md">New<\/span>$/,
    );
  });
});
