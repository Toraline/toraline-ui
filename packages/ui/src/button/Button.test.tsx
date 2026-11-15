// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import type { FormEvent } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Button, buttonSizes, buttonVariants } from "./index";

afterEach(cleanup);

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

  test.each(buttonSizes)('has the size "%s"', (size) => {
    render(<Button size={size}>Save</Button>);
    expect(screen.getByRole("button").getAttribute("data-size")).toBe(size);
  });

  test("adds the app's className after the library's class", () => {
    render(<Button className="mt-4 rounded-full">Save</Button>);
    expect(screen.getByRole("button").className).toBe("tui-button mt-4 rounded-full");
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

    const spinner = button.querySelector(".tui-button__spinner");
    expect(spinner?.getAttribute("aria-hidden")).toBe("true");

    await user.tab();
    expect(document.activeElement).toBe(button);
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
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
});
