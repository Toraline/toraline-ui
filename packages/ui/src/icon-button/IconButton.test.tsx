// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { IconButton, iconButtonSizes, iconButtonVariants } from "./index";

afterEach(cleanup);

/** A small icon component, with the props an icon of "lucide-react" accepts. */
function TrashIcon(props: { className?: string; "aria-hidden"?: boolean | "true" | "false" }) {
  return (
    <svg {...props} data-testid="icon" viewBox="0 0 24 24">
      <path d="M3 6h18M8 6v14h8V6" />
    </svg>
  );
}

describe("IconButton", () => {
  test("is a real button whose accessible name is its aria-label", () => {
    render(<IconButton icon={TrashIcon} aria-label="Delete the order" />);
    const button = screen.getByRole("button", { name: "Delete the order" });
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("data-variant")).toBe("ghost");
    expect(button.getAttribute("data-size")).toBe("md");
  });

  test("the types refuse an icon button with no aria-label, and one with children", () => {
    // @ts-expect-error "aria-label" is required.
    const withoutName = <IconButton icon={TrashIcon} />;
    const withText = (
      // @ts-expect-error An icon button has no children.
      <IconButton icon={TrashIcon} aria-label="Delete">
        Delete
      </IconButton>
    );
    expect(withoutName).toBeDefined();
    expect(withText).toBeDefined();
  });

  test("has the variants and the sizes of the app Intraweb", () => {
    expect(iconButtonVariants).toEqual(["ghost", "secondary", "soft", "primary"]);
    expect(iconButtonSizes).toEqual(["sm", "md", "lg"]);
  });

  test.each(iconButtonVariants)('has the variant "%s"', (variant) => {
    render(<IconButton icon={TrashIcon} aria-label="Delete" variant={variant} />);
    expect(screen.getByRole("button").getAttribute("data-variant")).toBe(variant);
  });

  test.each([
    ["sm", "size-8", "size-4"],
    ["md", "size-10", "size-5"],
    ["lg", "size-12", "size-6"],
  ] as const)('has the size "%s": the square "%s" and the icon "%s"', (size, boxClass, iconClass) => {
    render(<IconButton icon={TrashIcon} aria-label="Delete" size={size} />);
    const button = screen.getByRole("button");
    expect(button.getAttribute("data-size")).toBe(size);
    expect(button.className.split(" ")).toContain(boxClass);
    expect(screen.getByTestId("icon").getAttribute("class")).toBe(iconClass);
  });

  test("the icon is decoration: a screen reader skips it", () => {
    render(<IconButton icon={TrashIcon} aria-label="Delete" />);
    expect(screen.getByTestId("icon").getAttribute("aria-hidden")).toBe("true");
  });

  test("adds the app's className after the library's classes", () => {
    render(
      <IconButton icon={TrashIcon} aria-label="Delete" variant="primary" className="mt-4 rounded-full" />,
    );
    const classes = screen.getByRole("button").className.split(" ");
    expect(classes.slice(-2)).toEqual(["mt-4", "rounded-full"]);
    expect(classes).not.toContain("rounded-md");
    expect(classes).toContain("bg-primary");
  });

  test("passes other attributes to the <button>, and ref points to it", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <IconButton
        ref={ref}
        icon={TrashIcon}
        aria-label="Delete"
        type="submit"
        name="intent"
        aria-expanded="false"
      />,
    );
    const button = screen.getByRole("button");
    expect(ref.current).toBe(button);
    expect(button.getAttribute("type")).toBe("submit");
    expect(button.getAttribute("name")).toBe("intent");
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  test("a click, the Enter key and the Space key press it", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton icon={TrashIcon} aria-label="Delete" onClick={onClick} />);

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button"));
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  test("disabled: it cannot get focus and cannot be pressed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton icon={TrashIcon} aria-label="Delete" disabled onClick={onClick} />);
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.className.split(" ")).toContain("disabled:opacity-50");

    await user.tab();
    expect(document.activeElement).not.toBe(button);
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("renders on the server", () => {
    const html = renderToString(<IconButton icon={TrashIcon} aria-label="Delete" />);
    expect(html).toMatch(/^<button [^>]*aria-label="Delete"/);
    expect(html).toContain('data-testid="icon"');
  });
});
