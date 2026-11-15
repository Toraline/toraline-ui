// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useAnchoredPanel } from "./index";
import type { UseAnchoredPanelOptions } from "./index";

/*
 * jsdom, the browser-like page of these tests, does not lay out a page: every
 * element is 0 pixels wide at the top left corner. So the tests give the
 * button a rectangle and the panel a size, and give the window a size.
 */
const panelSize = { width: 200, height: 120 };
let buttonRect = { top: 100, left: 300, width: 100, height: 40 };

function setWindowSize(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: height });
}

beforeEach(() => {
  buttonRect = { top: 100, left: 300, width: 100, height: 40 };
  setWindowSize(1000, 800);
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    let rect = { top: 0, left: 0, width: 0, height: 0 };
    if (this instanceof HTMLElement && this.dataset.anchor !== undefined) {
      rect = buttonRect;
    } else if (this.getAttribute("role") === "group") {
      rect = { top: 0, left: 0, ...panelSize };
    }
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

function Example(options: UseAnchoredPanelOptions) {
  const panel = useAnchoredPanel(options);
  return (
    <>
      <button ref={panel.triggerRef} data-anchor="" aria-expanded={panel.open} onClick={panel.toggle}>
        Filters
      </button>
      {panel.open ? (
        <div
          ref={panel.panelRef}
          role="group"
          aria-label="Filters"
          data-placed={panel.placed}
          data-side={panel.side}
          style={{ position: "fixed", ...panel.panelStyle }}
          onKeyDown={panel.handleEscape}
        >
          <button>Only open orders</button>
        </div>
      ) : null}
      <button>Outside</button>
    </>
  );
}

const getTrigger = () => screen.getByRole("button", { name: "Filters" });
const getPanel = () => screen.getByRole("group", { name: "Filters" });

describe("useAnchoredPanel", () => {
  test("the panel is closed at first, and a press on the button opens and closes it", async () => {
    const user = userEvent.setup();
    render(<Example />);
    expect(screen.queryByRole("group")).toBeNull();

    await user.click(getTrigger());
    expect(getPanel().getAttribute("data-placed")).toBe("true");
    expect(getTrigger().getAttribute("aria-expanded")).toBe("true");

    await user.click(getTrigger());
    expect(screen.queryByRole("group")).toBeNull();
  });

  test("opens below the button, lined up to the right", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(getTrigger());
    // 4 pixels under the button, which ends at 140. The right edges at 400: 1000 - 400.
    expect(getPanel().getAttribute("data-side")).toBe("bottom");
    expect(getPanel().style.top).toBe("144px");
    expect(getPanel().style.right).toBe("600px");
    expect(getPanel().style.bottom).toBe("");
  });

  test('opens below the button, lined up to the left, with align "left"', async () => {
    const user = userEvent.setup();
    render(<Example align="left" />);
    await user.click(getTrigger());
    expect(getPanel().style.top).toBe("144px");
    expect(getPanel().style.left).toBe("300px");
  });

  test("opens above the button when there is no room below", async () => {
    const user = userEvent.setup();
    buttonRect = { ...buttonRect, top: 700 };
    render(<Example />);
    await user.click(getTrigger());
    // The bottom edge of the panel is 4 pixels above the button: 800 - 696.
    expect(getPanel().getAttribute("data-side")).toBe("top");
    expect(getPanel().style.bottom).toBe("104px");
    expect(getPanel().style.top).toBe("");
  });

  test("near the right edge of the screen, the panel stays 8 pixels inside it", async () => {
    const user = userEvent.setup();
    buttonRect = { ...buttonRect, left: 880 };
    render(<Example align="left" />);
    await user.click(getTrigger());
    expect(getPanel().style.left).toBe("792px");
  });

  test("near the left edge of the screen, the panel stays 8 pixels inside it", async () => {
    const user = userEvent.setup();
    buttonRect = { ...buttonRect, left: 20 };
    render(<Example />);
    await user.click(getTrigger());
    // Lined up to the right it would start at -80. Its right edge is at 208: 1000 - 208.
    expect(getPanel().style.right).toBe("792px");
  });

  test("the panel is placed again when the page scrolls and when the window changes its size", async () => {
    const user = userEvent.setup();
    render(<Example align="left" />);
    await user.click(getTrigger());
    expect(getPanel().style.top).toBe("144px");

    buttonRect = { ...buttonRect, top: 60 };
    act(() => {
      fireEvent.scroll(document.body);
    });
    expect(getPanel().style.top).toBe("104px");

    setWindowSize(400, 800);
    act(() => {
      fireEvent(window, new Event("resize"));
    });
    expect(getPanel().style.left).toBe("192px");
  });

  test("a press outside the panel and the button closes the panel", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(getTrigger());
    await user.click(screen.getByRole("button", { name: "Only open orders" }));
    expect(getPanel()).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("group")).toBeNull();
  });

  test("Escape in the panel closes it, gives the focus back to the button, and stops there", async () => {
    const user = userEvent.setup();
    const onDocumentKeyDown = vi.fn();
    document.addEventListener("keydown", onDocumentKeyDown);
    render(<Example />);
    await user.click(getTrigger());
    screen.getByRole("button", { name: "Only open orders" }).focus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("group")).toBeNull();
    expect(document.activeElement).toBe(getTrigger());
    // A Modal or a Drawer under the panel listens on the document: it does not get the key.
    expect(onDocumentKeyDown).not.toHaveBeenCalled();
    document.removeEventListener("keydown", onDocumentKeyDown);
  });
});
