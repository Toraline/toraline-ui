// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Modal } from "../modal/index";
import { Popover, popoverAligns } from "./index";
import type { PopoverProps } from "./index";

/*
 * jsdom, the browser-like page of these tests, does not lay out a page. The
 * tests that check the place of the panel give the button a rectangle, the
 * panel a size and the window a size.
 */
let buttonRect = { top: 100, left: 300, width: 100, height: 40 };

beforeEach(() => {
  buttonRect = { top: 100, left: 300, width: 100, height: 40 };
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 1000 });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
  // The element around the button and the panel starts where the button starts, and is as large.
  vi.spyOn(HTMLElement.prototype, "offsetParent", "get").mockImplementation(function (this: HTMLElement) {
    return this.parentElement;
  });
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    // The panel is 200 by 120 pixels. Every other element has the rectangle of the button.
    const rect =
      this.getAttribute("data-slot") === "panel" ? { top: 0, left: 0, width: 200, height: 120 } : buttonRect;
    return {
      ...rect,
      right: rect.left + rect.width,
      bottom: rect.top + rect.height,
      x: rect.left,
      y: rect.top,
      toJSON: () => rect,
    };
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const renderPopover = (props: Partial<PopoverProps> = {}) =>
  render(
    <>
      <Popover label="Columns" {...props}>
        {props.children ?? <button>Show the price</button>}
      </Popover>
      <button>Outside</button>
    </>,
  );

const getTrigger = (name = "Columns") => screen.getByRole("button", { name });
const getPanel = () => document.querySelector('[data-slot="panel"]') as HTMLElement;
const queryPanel = () => document.querySelector('[data-slot="panel"]');

describe("Popover", () => {
  test("renders a secondary Button with the label, and the panel is closed", () => {
    renderPopover();
    const trigger = getTrigger();
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("type")).toBe("button");
    expect(trigger.getAttribute("data-variant")).toBe("secondary");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    // The panel is not on the page, so the button does not point to it.
    expect(trigger.hasAttribute("aria-controls")).toBe(false);
    expect(queryPanel()).toBeNull();
  });

  test("a press on the button opens the panel and tells a screen reader; a second press closes it", async () => {
    const user = userEvent.setup();
    renderPopover();
    await user.click(getTrigger());
    expect(getTrigger().getAttribute("aria-expanded")).toBe("true");
    expect(getTrigger().getAttribute("aria-controls")).toBe(getPanel().id);
    expect(getPanel().className.split(" ")).not.toContain("invisible");
    expect(screen.getByRole("button", { name: "Show the price" })).toBeDefined();
    // The focus stays on the button; the panel comes right after it in the page.
    expect(document.activeElement).toBe(getTrigger());
    expect(getTrigger().nextElementSibling).toBe(getPanel());

    await user.click(getTrigger());
    expect(queryPanel()).toBeNull();
    expect(getTrigger().getAttribute("aria-expanded")).toBe("false");
  });

  test("the keyboard: Enter and Space open the panel, and Tab goes from the button into it", async () => {
    const user = userEvent.setup();
    renderPopover();
    getTrigger().focus();
    await user.keyboard("{Enter}");
    expect(queryPanel()).not.toBeNull();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Show the price" }));

    getTrigger().focus();
    await user.keyboard(" ");
    expect(queryPanel()).toBeNull();
  });

  test("the keyboard: Escape with the focus inside the panel closes it and gives the focus to the button", async () => {
    const user = userEvent.setup();
    renderPopover();
    await user.click(getTrigger());
    await user.tab();
    await user.keyboard("{Escape}");
    expect(queryPanel()).toBeNull();
    expect(document.activeElement).toBe(getTrigger());
  });

  test("the keyboard: Escape with the focus on the button closes the panel", async () => {
    const user = userEvent.setup();
    renderPopover();
    await user.click(getTrigger());
    await user.keyboard("{Escape}");
    expect(queryPanel()).toBeNull();
    expect(document.activeElement).toBe(getTrigger());
  });

  test("Escape closes only the panel, not the Modal that the Popover is in", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal title="Orders" onClose={onClose}>
        <Popover label="Columns">
          <button>Show the price</button>
        </Popover>
      </Modal>,
    );
    await user.click(getTrigger());
    await user.keyboard("{Escape}");
    expect(queryPanel()).toBeNull();
    expect(onClose).not.toHaveBeenCalled();

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("a press outside closes the panel; a press inside does not", async () => {
    const user = userEvent.setup();
    renderPopover();
    await user.click(getTrigger());
    await user.click(screen.getByRole("button", { name: "Show the price" }));
    expect(queryPanel()).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(queryPanel()).toBeNull();
  });

  test("children can be a function that receives close", async () => {
    const user = userEvent.setup();
    renderPopover({ children: (close) => <button onClick={close}>Apply</button> });
    await user.click(getTrigger());
    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(queryPanel()).toBeNull();
  });

  test("has the two alignments of the app Intraweb", () => {
    expect(popoverAligns).toEqual(["left", "right"]);
  });

  test("opens below the button, 8 pixels under it, with the left edges lined up", async () => {
    const user = userEvent.setup();
    const { container } = renderPopover();
    await user.click(getTrigger());
    expect(container.firstElementChild?.getAttribute("data-align")).toBe("left");
    expect(getPanel().getAttribute("data-side")).toBe("bottom");
    // Measured from the element around the button: 40 pixels of button and 8 of space.
    expect(getPanel().style.top).toBe("48px");
    expect(getPanel().style.left).toBe("0px");
  });

  test('align "right" lines up the right edges', async () => {
    const user = userEvent.setup();
    renderPopover({ align: "right" });
    await user.click(getTrigger());
    expect(getPanel().style.top).toBe("48px");
    expect(getPanel().style.right).toBe("0px");
    expect(getPanel().style.left).toBe("");
  });

  test("opens above the button when there is no room below", async () => {
    const user = userEvent.setup();
    buttonRect = { ...buttonRect, top: 700 };
    renderPopover();
    await user.click(getTrigger());
    expect(getPanel().getAttribute("data-side")).toBe("top");
    // The bottom edge of the panel is 8 pixels above the button.
    expect(getPanel().style.bottom).toBe("48px");
    expect(getPanel().style.top).toBe("");
  });

  test("near the right edge of the screen, the panel moves left to stay 8 pixels inside it", async () => {
    const user = userEvent.setup();
    buttonRect = { ...buttonRect, left: 880 };
    renderPopover();
    await user.click(getTrigger());
    // The panel is 200 wide: it starts at 792, which is 88 pixels left of the button.
    expect(getPanel().style.left).toBe("-88px");
  });

  test("aria-label names the button when the label is not plain text", () => {
    renderPopover({ label: <svg />, "aria-label": "Choose the columns" });
    expect(getTrigger("Choose the columns")).toBeDefined();
  });

  test("disabled: the button is disabled and the panel does not open", async () => {
    const user = userEvent.setup();
    renderPopover({ disabled: true });
    await user.click(getTrigger());
    expect(queryPanel()).toBeNull();
  });

  test("autoFocus: an element inside the panel gets the focus when the panel opens", async () => {
    const user = userEvent.setup();
    renderPopover({ children: <input autoFocus aria-label="Search" /> });
    await user.click(getTrigger());
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Search" }));
    // A panel with "visibility: hidden" cannot give the focus to an element inside it. The page of
    // these tests does not apply that rule; the story "Focus On Open" checks it in a real browser.
    expect(getPanel().className.split(" ")).not.toContain("invisible");
  });

  test("with no autoFocus inside the panel, the focus stays on the button", async () => {
    const user = userEvent.setup();
    renderPopover();
    await user.click(getTrigger());
    expect(document.activeElement).toBe(getTrigger());
  });

  test("panelClassName goes to the panel, after the library's classes", async () => {
    const user = userEvent.setup();
    renderPopover({ panelClassName: "w-64 p-2" });
    await user.click(getTrigger());
    const classes = getPanel().className.split(" ");
    expect(classes.slice(-2)).toEqual(["w-64", "p-2"]);
    expect(classes).not.toContain("p-4");
    expect(classes).toContain("shadow-lg");
  });

  test("puts the app's className on the outermost element, after the library's classes", () => {
    const { container } = renderPopover({ className: "inline-block" });
    const classes = container.firstElementChild?.className.split(" ") ?? [];
    expect(classes).toEqual(["relative", "inline-block"]);
  });

  test("passes other attributes to the <button>, and ref points to it", () => {
    const ref = createRef<HTMLButtonElement>();
    renderPopover({ ref, "data-testid": "trigger" } as Partial<PopoverProps>);
    expect(ref.current).toBe(screen.getByTestId("trigger"));
    expect(ref.current).toBe(getTrigger());
  });

  test("the closed popover renders on the server", () => {
    const html = renderToString(<Popover label="Columns">The content</Popover>);
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain("The content");
  });
});
