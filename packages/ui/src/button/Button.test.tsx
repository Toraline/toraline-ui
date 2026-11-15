// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createRef } from "react";
import type { FormEvent } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Button, buttonSizes, buttonVariants } from "./index";

afterEach(cleanup);

/** A small icon component, with the props an icon of "lucide-react" accepts. */
function PlusIcon(props: { className?: string; "aria-hidden"?: boolean | "true" | "false" }) {
  return (
    <svg {...props} data-testid="icon" viewBox="0 0 24 24">
      <path d="M5 12h14M12 5v14" />
    </svg>
  );
}

describe("Button", () => {
  test("is a real button with its text as the accessible name", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("data-variant")).toBe("primary");
    expect(button.getAttribute("data-size")).toBe("md");
    expect(button.hasAttribute("aria-busy")).toBe(false);
    expect(button.hasAttribute("aria-disabled")).toBe(false);
  });

  test.each(buttonVariants)('has the variant "%s"', (variant) => {
    render(<Button variant={variant}>Save</Button>);
    expect(screen.getByRole("button").getAttribute("data-variant")).toBe(variant);
  });

  test("has the 5 variants and the 3 sizes of the app Intraweb", () => {
    expect(buttonVariants).toEqual(["primary", "secondary", "soft", "danger", "ghost"]);
    expect(buttonSizes).toEqual(["sm", "md", "lg"]);
  });

  test.each([
    ["sm", "min-h-8"],
    ["md", "min-h-10"],
    ["lg", "min-h-12"],
  ] as const)('has the size "%s", with the smallest height "%s"', (size, heightClass) => {
    render(<Button size={size}>Save</Button>);
    const button = screen.getByRole("button");
    expect(button.getAttribute("data-size")).toBe(size);
    expect(button.className.split(" ")).toContain(heightClass);
  });

  test("the font is the font of headings, in the medium weight", () => {
    render(<Button>Save</Button>);
    const classes = screen.getByRole("button").className.split(" ");
    expect(classes).toContain("font-heading");
    expect(classes).toContain("font-medium");
  });

  test("icon: the icon is before the text, has the size of the button's size, and a screen reader skips it", () => {
    render(
      <Button icon={PlusIcon} size="lg">
        New order
      </Button>,
    );
    const button = screen.getByRole("button", { name: "New order" });
    const icon = screen.getByTestId("icon");
    expect(button.firstElementChild).toBe(icon);
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.getAttribute("class")).toBe("size-5 shrink-0");
  });

  test("no icon: the button has only its text", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button").children).toHaveLength(0);
  });

  test("adds the app's className after the library's classes", () => {
    render(<Button className="mt-4 rounded-full">Save</Button>);
    const classes = screen.getByRole("button").className.split(" ");
    expect(classes.slice(-2)).toEqual(["mt-4", "rounded-full"]);
    // The app's "rounded-full" replaces the library's "rounded-md". The other classes of the library stay.
    expect(classes).not.toContain("rounded-md");
    expect(classes).toContain("bg-primary");
  });

  test("a color class of the app replaces the color class of the variant", () => {
    render(
      <Button variant="danger" className="bg-highlight hover:bg-primary-hover">
        Save
      </Button>,
    );
    const classes = screen.getByRole("button").className.split(" ");
    expect(classes).toContain("bg-highlight");
    expect(classes).toContain("hover:bg-primary-hover");
    expect(classes).not.toContain("bg-surface");
    expect(classes).not.toContain("hover:bg-danger-subtle");
    // A class of the app for another CSS property does not remove the border color or the text color.
    expect(classes).toContain("border-danger");
    expect(classes).toContain("text-danger");
    // The class of a state has another variant, so it stays.
    expect(classes).toContain("disabled:opacity-50");
  });

  test("a loading button has no class for the pointer over it, so its colors stay", () => {
    render(<Button loading>Save</Button>);
    const classes = screen.getByRole("button").className.split(" ");
    expect(classes).toContain("bg-primary");
    expect(classes).not.toContain("hover:bg-primary-hover");
  });

  test("passes other attributes to the <button>, and ref points to it", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} type="submit" name="intent" value="save" aria-describedby="hint">
        Save
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(ref.current).toBe(button);
    expect(button.getAttribute("type")).toBe("submit");
    expect(button.getAttribute("name")).toBe("intent");
    expect(button.getAttribute("aria-describedby")).toBe("hint");
  });

  test("a click, the Enter key and the Space key press it", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button"));
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  test("disabled: it cannot get focus and cannot be pressed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    await user.tab();
    expect(document.activeElement).not.toBe(button);
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("loading: it tells a screen reader, shows the spinner, keeps the focus, and a press does nothing", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" }) as HTMLButtonElement;
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.disabled).toBe(false);

    const spinner = button.querySelector('[data-slot="spinner"]');
    expect(spinner?.getAttribute("aria-hidden")).toBe("true");
    // The spinner has the size of the icon, so the text does not move when it replaces the icon.
    expect(spinner?.className.split(" ")).toContain("size-4");

    await user.tab();
    expect(document.activeElement).toBe(button);
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("loading: the spinner is in the place of the icon", () => {
    render(
      <Button loading icon={PlusIcon}>
        Save
      </Button>,
    );
    expect(screen.queryByTestId("icon")).toBeNull();
    expect(screen.getByRole("button").querySelectorAll('[data-slot="spinner"]')).toHaveLength(1);
  });

  test("loading: a submit button does not send its form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    const { rerender } = render(
      <form onSubmit={onSubmit}>
        <Button type="submit" loading>
          Save
        </Button>
      </form>,
    );
    await user.click(screen.getByRole("button"));
    expect(onSubmit).not.toHaveBeenCalled();

    rerender(
      <form onSubmit={onSubmit}>
        <Button type="submit">Save</Button>
      </form>,
    );
    await user.click(screen.getByRole("button"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  test("renders on the server, with its icon", () => {
    const html = renderToString(<Button icon={PlusIcon}>Save</Button>);
    expect(html).toMatch(/^<button [^>]*type="button"/);
    expect(html).toContain('data-testid="icon"');
  });

  test('only the file of the <button> has "use client", so a Server Component can give an icon component', () => {
    const readSource = (fileName: string) => readFileSync(join(import.meta.dirname, fileName), "utf8");
    expect(readSource("Button.tsx").startsWith('"use client"')).toBe(false);
    expect(readSource("ButtonElement.tsx").startsWith('"use client"')).toBe(true);
  });
});
