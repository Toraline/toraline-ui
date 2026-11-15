// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { EmptyState } from "./index";

afterEach(cleanup);

/** A small icon component, with the props an icon of "lucide-react" accepts. */
function UsersIcon(props: { className?: string; "aria-hidden"?: boolean | "true" | "false" }) {
  return (
    <svg {...props} data-testid="app-icon" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

describe("EmptyState", () => {
  test("is a <section> with the look of a card, an icon and a heading of level 2", () => {
    const { container } = render(<EmptyState title="No order yet" />);
    const emptyState = container.firstElementChild as HTMLElement;
    expect(emptyState.tagName).toBe("SECTION");
    expect(emptyState.className.split(" ")).toEqual(
      expect.arrayContaining([
        "flex",
        "flex-col",
        "items-center",
        "rounded-lg",
        "bg-surface",
        "px-4",
        "py-10",
        "text-center",
        "shadow-card",
        "md:rounded-xl",
        "md:px-8",
      ]),
    );
    const title = screen.getByRole("heading", { level: 2, name: "No order yet" });
    expect(title.className.split(" ")).toEqual(
      expect.arrayContaining(["font-heading", "text-base/6", "font-medium", "text-primary"]),
    );
  });

  test("with no icon from the app it shows the empty tray, which a screen reader skips", () => {
    const { container } = render(<EmptyState title="No order yet" />);
    const iconBox = container.querySelector('[data-slot="icon"]') as HTMLElement;
    expect(iconBox.className.split(" ")).toEqual(
      expect.arrayContaining(["size-12", "rounded-full", "bg-primary-subtle"]),
    );
    const icon = iconBox.firstElementChild as SVGElement;
    expect(icon.tagName).toBe("svg");
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.getAttribute("class")?.split(" ")).toEqual(["size-6", "text-icon-brand"]);
  });

  test("icon: the icon of the app is in the circle, with the size and the color of the library", () => {
    render(<EmptyState title="No client yet" icon={UsersIcon} />);
    const icon = screen.getByTestId("app-icon");
    expect(icon.parentElement?.getAttribute("data-slot")).toBe("icon");
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.getAttribute("class")?.split(" ")).toEqual(["size-6", "text-icon-brand"]);
  });

  test("children: the text under the title", () => {
    render(<EmptyState title="No order yet">The orders of the client are shown here.</EmptyState>);
    const description = screen.getByText("The orders of the client are shown here.");
    expect(description.getAttribute("data-slot")).toBe("description");
    expect(description.className.split(" ")).toEqual(
      expect.arrayContaining(["mt-1", "max-w-md", "text-sm/5", "text-secondary"]),
    );
    expect(description.previousElementSibling).toBe(screen.getByRole("heading"));
  });

  test("action: the button of the app is under the text, and a person can press it", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <EmptyState
        title="No order yet"
        action={
          <button type="button" onClick={onClick}>
            New order
          </button>
        }
      >
        The orders of the client are shown here.
      </EmptyState>,
    );
    const button = screen.getByRole("button", { name: "New order" });
    expect(button.parentElement?.getAttribute("data-slot")).toBe("action");
    expect(button.parentElement?.previousElementSibling?.getAttribute("data-slot")).toBe("description");
    // Keyboard: the action is the only element that gets the focus.
    await user.tab();
    expect(document.activeElement).toBe(button);
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("with no text and no action it shows only the icon and the title", () => {
    const { container } = render(<EmptyState title="No order yet" />);
    expect(container.querySelector('[data-slot="description"]')).toBeNull();
    expect(container.querySelector('[data-slot="action"]')).toBeNull();
    expect((container.firstElementChild as HTMLElement).children).toHaveLength(2);
  });

  test("the title can be an element", () => {
    render(<EmptyState title={<em>No order yet</em>} />);
    expect(screen.getByRole("heading", { name: "No order yet" })).toBeDefined();
  });

  test("adds the app's className after the library's classes", () => {
    const { container } = render(<EmptyState title="No order yet" className="mt-4 py-6" />);
    const classes = (container.firstElementChild as HTMLElement).className.split(" ");
    expect(classes.slice(-2)).toEqual(["mt-4", "py-6"]);
    expect(classes).not.toContain("py-10");
    expect(classes).toContain("px-4");
  });

  test("passes other attributes to the <section>, and ref points to it", () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(<EmptyState ref={ref} title="No order yet" id="orders-empty" />);
    const emptyState = container.firstElementChild as HTMLElement;
    expect(emptyState.id).toBe("orders-empty");
    expect(ref.current).toBe(emptyState);
    // The title of the empty state is not the HTML attribute "title".
    expect(emptyState.hasAttribute("title")).toBe(false);
  });

  test("renders on the server, with an icon component given by a Server Component", () => {
    const html = renderToString(
      <EmptyState title="No client yet" icon={UsersIcon}>
        Add the first client.
      </EmptyState>,
    );
    expect(html).toMatch(/^<section class="[^"]+"><span class="[^"]+" data-slot="icon"><svg /);
    expect(html).toContain('data-slot="title">No client yet</h2>');
    expect(html).toContain('data-slot="description">Add the first client.</div>');
  });
});
