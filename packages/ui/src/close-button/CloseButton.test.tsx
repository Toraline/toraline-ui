// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { CloseButton } from "./index";

afterEach(cleanup);

describe("CloseButton", () => {
  test('is a real button with the name "Close" and a cross that a screen reader skips', () => {
    render(<CloseButton />);
    const button = screen.getByRole("button", { name: "Close" });
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  test("the app gives the name in its own language", () => {
    render(<CloseButton aria-label="Fechar" />);
    expect(screen.getByRole("button", { name: "Fechar" })).toBeDefined();
  });

  test('has the look of the IconButton "ghost" in the size "md", unless the app gives others', () => {
    render(
      <>
        <CloseButton />
        <CloseButton aria-label="Small" size="sm" variant="secondary" />
      </>,
    );
    const button = screen.getByRole("button", { name: "Close" });
    expect(button.getAttribute("data-variant")).toBe("ghost");
    expect(button.getAttribute("data-size")).toBe("md");
    const small = screen.getByRole("button", { name: "Small" });
    expect(small.getAttribute("data-variant")).toBe("secondary");
    expect(small.getAttribute("data-size")).toBe("sm");
  });

  test("a click, Enter and Space call onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<CloseButton onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  test("disabled: it cannot be pressed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<CloseButton onClick={onClick} disabled />);
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  test("adds the app's className after the library's classes", () => {
    render(<CloseButton className="mt-4 rounded-full" />);
    const classes = screen.getByRole("button").className.split(" ");
    expect(classes.slice(-2)).toEqual(["mt-4", "rounded-full"]);
    expect(classes).not.toContain("rounded-md");
  });

  test("passes other attributes to the <button>, and ref points to it", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<CloseButton ref={ref} data-testid="close" />);
    expect(ref.current).toBe(screen.getByTestId("close"));
  });

  test("renders on the server", () => {
    expect(renderToString(<CloseButton />)).toContain('aria-label="Close"');
  });
});
