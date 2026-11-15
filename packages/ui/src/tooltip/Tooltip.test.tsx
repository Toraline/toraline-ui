// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Modal } from "../modal/index";
import { Tooltip, tooltipSides } from "./index";
import type { TooltipProps } from "./index";

/*
 * jsdom, the browser-like page of these tests, loads no CSS and does not lay
 * out a page. So the tests read the classes that show and hide the tooltip
 * (the test of the styles checks that Tailwind builds them, and the story
 * tests run in a real browser), and give the element a rectangle, the tooltip
 * a size and the window a size.
 */
let elementRect = { top: 100, left: 300, width: 40, height: 40 };

beforeEach(() => {
  elementRect = { top: 100, left: 300, width: 40, height: 40 };
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 1000 });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(120);
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(24);
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(() => ({
    ...elementRect,
    right: elementRect.left + elementRect.width,
    bottom: elementRect.top + elementRect.height,
    x: elementRect.left,
    y: elementRect.top,
    toJSON: () => elementRect,
  }));
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const renderTooltip = (props: Partial<TooltipProps> = {}) =>
  render(
    <>
      <Tooltip label="Open the menu" {...props}>
        {props.children ?? <button aria-label="Menu">≡</button>}
      </Tooltip>
      <button>Another button</button>
    </>,
  );

const getTooltip = () => screen.getByRole("tooltip", { hidden: true });
const getButton = () => screen.getByRole("button", { name: "Menu" });
const classesOf = (element: Element) => element.className.split(" ");

const shownClasses = [
  "group-hover/tooltip:visible",
  "group-hover/tooltip:opacity-100",
  "group-has-focus-visible/tooltip:visible",
  "group-has-focus-visible/tooltip:opacity-100",
];

describe("Tooltip", () => {
  test("renders the element and, next to it, a tooltip with the text", () => {
    const { container } = renderTooltip();
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("SPAN");
    expect(root.firstElementChild).toBe(getButton());
    expect(getTooltip().textContent).toBe("Open the menu");
    expect(getTooltip().parentElement).toBe(root);
    expect(getTooltip().getAttribute("data-slot")).toBe("tooltip");
  });

  test("a screen reader says the text: the element is described by the tooltip", () => {
    renderTooltip();
    expect(getButton().getAttribute("aria-describedby")).toBe(getTooltip().id);
    // Testing Library computes the description the way a screen reader does.
    expect(screen.getByRole("button", { name: "Menu", description: "Open the menu" })).toBeDefined();
  });

  test("keeps a description the element already has", () => {
    renderTooltip({
      children: (
        <button aria-label="Menu" aria-describedby="other">
          ≡
        </button>
      ),
    });
    expect(getButton().getAttribute("aria-describedby")).toBe(`other ${getTooltip().id}`);
  });

  test("an element whose aria-label is the same text is not described twice", () => {
    renderTooltip({ children: <button aria-label="Open the menu">≡</button> });
    const button = screen.getByRole("button", { name: "Open the menu" });
    expect(button.hasAttribute("aria-describedby")).toBe(false);
  });

  test("is hidden at rest, and shown by the pointer over it and by the keyboard focus", () => {
    renderTooltip();
    const classes = classesOf(getTooltip());
    expect(classes).toContain("invisible");
    expect(classes).toContain("opacity-0");
    for (const shownClass of shownClasses) {
      expect(classes).toContain(shownClass);
    }
    expect(classesOf(getTooltip().parentElement as HTMLElement)).toContain("group/tooltip");
  });

  test("the pointer can move onto the tooltip: it does not ignore the pointer, and a strip joins it to the element", () => {
    renderTooltip();
    const classes = classesOf(getTooltip());
    expect(classes).not.toContain("pointer-events-none");
    expect(classes).toContain("before:absolute");
    expect(classes).toContain("before:-left-3");
    expect(classes).toContain("before:w-3");
  });

  test("the keyboard: Escape hides the tooltip of the element that has the focus, until the focus comes back", async () => {
    const user = userEvent.setup();
    renderTooltip();
    await user.tab();
    expect(document.activeElement).toBe(getButton());
    expect(classesOf(getTooltip())).toContain("group-has-focus-visible/tooltip:visible");

    await user.keyboard("{Escape}");
    for (const shownClass of shownClasses) {
      expect(classesOf(getTooltip())).not.toContain(shownClass);
    }
    expect(classesOf(getTooltip())).toContain("invisible");
    // The text is still said by a screen reader.
    expect(getButton().getAttribute("aria-describedby")).toBe(getTooltip().id);

    await user.tab();
    await user.tab({ shift: true });
    expect(classesOf(getTooltip())).toContain("group-has-focus-visible/tooltip:visible");
  });

  test("the keyboard: Escape hides the tooltip under the pointer, until the pointer comes back", async () => {
    const user = userEvent.setup();
    renderTooltip();
    await user.hover(getButton());
    await user.keyboard("{Escape}");
    expect(classesOf(getTooltip())).not.toContain("group-hover/tooltip:visible");

    await user.unhover(getButton());
    await user.hover(getButton());
    expect(classesOf(getTooltip())).toContain("group-hover/tooltip:visible");
  });

  test("Escape hides the tooltip first; a second Escape closes the Modal the element is in", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal title="Orders" onClose={onClose}>
        <Tooltip label="Open the menu">
          <button aria-label="Menu">≡</button>
        </Tooltip>
      </Modal>,
    );
    getButton().focus();
    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
    expect(classesOf(getTooltip())).not.toContain("group-hover/tooltip:visible");

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("Escape with the pointer and the focus somewhere else is not stopped", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal title="Orders" onClose={onClose}>
        <Tooltip label="Open the menu">
          <button aria-label="Menu">≡</button>
        </Tooltip>
        <button>Save</button>
      </Modal>,
    );
    screen.getByRole("button", { name: "Save" }).focus();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("has the two sides of the app Intraweb, and right when the side is missing", () => {
    expect(tooltipSides).toEqual(["right", "top"]);
    const { container } = renderTooltip();
    expect(container.firstElementChild?.getAttribute("data-side")).toBe("right");
    for (const className of ["top-1/2", "left-full", "ml-3", "-translate-y-1/2"]) {
      expect(classesOf(getTooltip())).toContain(className);
    }
  });

  test('side "top" puts the tooltip above the element, centered', () => {
    const { container } = renderTooltip({ side: "top" });
    expect(container.firstElementChild?.getAttribute("data-side")).toBe("top");
    for (const className of ["bottom-full", "left-1/2", "mb-2", "-translate-x-1/2"]) {
      expect(classesOf(getTooltip())).toContain(className);
    }
  });

  test("with room in the window, the tooltip keeps the place its classes give it", async () => {
    const user = userEvent.setup();
    const { container } = renderTooltip();
    await user.hover(getButton());
    expect(container.firstElementChild?.getAttribute("data-side")).toBe("right");
    expect(getTooltip().getAttribute("style")).toBeNull();
  });

  test("near the right edge of the screen, the tooltip is shown on the left of the element", async () => {
    const user = userEvent.setup();
    // The element ends at 980: 20 pixels are left, and the tooltip needs 12 + 120.
    elementRect = { ...elementRect, left: 940 };
    const { container } = renderTooltip();
    await user.hover(getButton());
    expect(container.firstElementChild?.getAttribute("data-side")).toBe("left");
    for (const className of ["right-full", "mr-3", "before:-right-3"]) {
      expect(classesOf(getTooltip())).toContain(className);
    }
    expect(classesOf(getTooltip())).not.toContain("left-full");
  });

  test("near the top edge of the screen, a tooltip above the element is shown below it", async () => {
    const user = userEvent.setup();
    elementRect = { ...elementRect, top: 10 };
    const { container } = renderTooltip({ side: "top" });
    await user.tab();
    expect(container.firstElementChild?.getAttribute("data-side")).toBe("bottom");
    expect(classesOf(getTooltip())).toContain("top-full");
    expect(classesOf(getTooltip())).not.toContain("bottom-full");
  });

  test("near the left edge of the screen, a tooltip above the element is moved to stay 8 pixels inside it", async () => {
    const user = userEvent.setup();
    // Centered, the tooltip (120 wide) would start at 10 + 20 - 60 = -30.
    elementRect = { ...elementRect, left: 10 };
    renderTooltip({ side: "top" });
    await user.hover(getButton());
    // 8 pixels from the edge of the window is 2 pixels left of the element.
    expect(getTooltip().style.left).toBe("-2px");
    expect(getTooltip().style.translate).toBe("none");
  });

  test("puts the app's className on the outermost element, passes other attributes, and ref points to it", () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = renderTooltip({ ref, className: "flex w-full", "data-testid": "root" } as Partial<TooltipProps>);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toBe(screen.getByTestId("root"));
    const classes = classesOf(ref.current as HTMLElement);
    expect(classes.slice(-2)).toEqual(["flex", "w-full"]);
    expect(classes).not.toContain("inline-flex");
    expect(classes).toContain("relative");
  });

  test("the app's own handlers of the pointer and the focus still run", async () => {
    const user = userEvent.setup();
    const onPointerEnter = vi.fn();
    const onFocus = vi.fn();
    renderTooltip({ onPointerEnter, onFocus });
    await user.hover(getButton());
    await user.tab();
    expect(onPointerEnter).toHaveBeenCalled();
    expect(onFocus).toHaveBeenCalled();
  });

  test("renders on the server, with the tooltip linked to the element", () => {
    const html = renderToString(
      <Tooltip label="Open the menu">
        <button aria-label="Menu">≡</button>
      </Tooltip>,
    );
    expect(html).toContain('role="tooltip"');
    expect(html).toContain("aria-describedby=");
    expect(html).toContain("Open the menu");
  });
});
