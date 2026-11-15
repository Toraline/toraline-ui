// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import type { ComponentProps } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { ListItem } from "./index";

afterEach(cleanup);

/** A small icon component, with the props an icon of "lucide-react" accepts. */
function ClockIcon(props: { className?: string; "aria-hidden"?: boolean | "true" | "false" }) {
  return (
    <svg {...props} data-testid="icon" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

describe("ListItem", () => {
  test("with href it is a link whose name has the title, the second line and the value", () => {
    render(<ListItem title="Day off request" meta="12/10" value="8 h" href="/hours/requests/1" />);
    const link = screen.getByRole("link", { name: /Day off request/ });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/hours/requests/1");
    expect(link.textContent).toBe("Day off request12/108 h");
    expect(link.querySelector('[data-slot="chevron"]')?.getAttribute("aria-hidden")).toBe("true");
  });

  test("with only onClick it is a button, and a press calls it", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ListItem title="Ana" onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Ana" });
    expect(button.getAttribute("type")).toBe("button");
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("the button works with the keyboard", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ListItem title="Ana" onClick={onClick} />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button"));
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  test("with no href and no onClick it cannot be pressed, and has no arrow and no hover", () => {
    render(<ListItem title="No action" data-testid="item" />);
    const item = screen.getByTestId("item");
    expect(item.tagName).toBe("DIV");
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    expect(item.querySelector('[data-slot="chevron"]')).toBeNull();
    expect(item.className).not.toContain("hover:bg-subtle");
  });

  test("a link also calls onClick on a press", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(<ListItem title="Request" href="/requests/1" onClick={onClick} />);
    await user.click(screen.getByRole("link"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("the selected item has aria-current, in each of the 3 elements", () => {
    render(
      <>
        <ListItem title="Link" href="/1" selected />
        <ListItem title="Button" onClick={() => undefined} selected />
        <ListItem title="Plain" data-testid="plain" selected />
        <ListItem title="Not selected" href="/2" />
      </>,
    );
    expect(screen.getByRole("link", { name: "Link" }).getAttribute("aria-current")).toBe("true");
    expect(screen.getByRole("button", { name: "Button" }).getAttribute("aria-current")).toBe("true");
    expect(screen.getByTestId("plain").getAttribute("aria-current")).toBe("true");
    expect(screen.getByRole("link", { name: "Not selected" }).hasAttribute("aria-current")).toBe(false);
    expect(screen.getByTestId("plain").className.split(" ")).toContain("aria-[current=true]:bg-selected");
  });

  test("the icon is decoration, inside a box", () => {
    render(<ListItem title="Hours" icon={ClockIcon} data-testid="item" />);
    const icon = screen.getByTestId("icon");
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.getAttribute("class")).toBe("size-5 text-icon-brand");
    expect(icon.parentElement?.getAttribute("data-slot")).toBe("icon");
  });

  test("with only a title it has no second line, no value, no status and no icon", () => {
    render(<ListItem title="Only a title" data-testid="item" />);
    const item = screen.getByTestId("item");
    expect(item.querySelector('[data-slot="meta"]')).toBeNull();
    expect(item.querySelector('[data-slot="end"]')).toBeNull();
    expect(item.querySelector('[data-slot="icon"]')).toBeNull();
  });

  test("the status is shown under the value, and a value of 0 is shown", () => {
    render(<ListItem title="Stock" value={0} status={<span data-testid="status">Low</span>} data-testid="item" />);
    const end = screen.getByTestId("item").querySelector('[data-slot="end"]') as HTMLElement;
    expect(end.querySelector('[data-slot="value"]')?.textContent).toBe("0");
    expect(end.lastElementChild).toBe(screen.getByTestId("status"));
  });

  test("the title and the second line stay on one line", () => {
    render(<ListItem title="A very long title" meta="A very long second line" data-testid="item" />);
    const item = screen.getByTestId("item");
    expect(item.querySelector('[data-slot="title"]')?.className.split(" ")).toContain("truncate");
    expect(item.querySelector('[data-slot="meta"]')?.className.split(" ")).toContain("truncate");
  });

  test("the app gives its link component, which receives href, the classes and aria-current", () => {
    function AppLink({ href, ...anchorProps }: ComponentProps<"a">) {
      return <a {...anchorProps} href={`/app${href}`} data-testid="app-link" />;
    }
    render(<ListItem title="Request" href="/requests/1" linkComponent={AppLink} selected />);
    const link = screen.getByTestId("app-link");
    expect(link.getAttribute("href")).toBe("/app/requests/1");
    expect(link.getAttribute("aria-current")).toBe("true");
    expect(link.className.split(" ")).toContain("min-h-16");
  });

  test("className comes after the library's classes and replaces a class for the same property", () => {
    render(<ListItem title="Request" href="/1" className="rounded-lg px-6" />);
    const classes = screen.getByRole("link").className.split(" ");
    expect(classes.slice(-2)).toEqual(["rounded-lg", "px-6"]);
    expect(classes).not.toContain("px-4");
  });

  test("another attribute and ref go to the element of the item", () => {
    const linkRef = createRef<HTMLAnchorElement>();
    const buttonRef = createRef<HTMLButtonElement>();
    const plainRef = createRef<HTMLDivElement>();
    render(
      <>
        <ListItem title="Link" href="/1" ref={linkRef} id="link" />
        <ListItem title="Button" onClick={() => undefined} ref={buttonRef} id="button" />
        <ListItem title="Plain" ref={plainRef} id="plain" />
      </>,
    );
    expect(linkRef.current).toBe(screen.getByRole("link"));
    expect(buttonRef.current).toBe(screen.getByRole("button"));
    expect(plainRef.current?.id).toBe("plain");
    expect(linkRef.current?.id).toBe("link");
  });

  test("renders on the server", () => {
    const html = renderToString(<ListItem title="Request" meta="12/10" href="/1" icon={ClockIcon} />);
    expect(html).toContain("<a");
    expect(html).toContain("Request");
  });
});
