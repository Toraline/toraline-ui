// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Input } from "./index";

afterEach(cleanup);

describe("Input", () => {
  test("is a text field whose accessible name is its label", () => {
    render(<Input label="Title" name="title" />);
    const field = screen.getByRole("textbox", { name: "Title" });
    expect(field.tagName).toBe("INPUT");
    expect(field.getAttribute("name")).toBe("title");
    expect(field.getAttribute("data-slot")).toBe("field");

    const label = screen.getByText("Title");
    expect(label.tagName).toBe("LABEL");
    expect(label.getAttribute("for")).toBe(field.id);
    expect(field.id).not.toBe("");
  });

  test("uses the id the app gives", () => {
    render(<Input label="Title" id="title" />);
    expect(screen.getByLabelText("Title").id).toBe("title");
    expect(screen.getByText("Title").getAttribute("for")).toBe("title");
  });

  test("two fields with no id get different ids", () => {
    render(
      <>
        <Input label="First name" />
        <Input label="Last name" />
      </>,
    );
    expect(screen.getByLabelText("First name").id).not.toBe(screen.getByLabelText("Last name").id);
  });

  test("with no error, the field is not marked and there is no message", () => {
    const { container } = render(<Input label="Title" />);
    const field = screen.getByRole("textbox");
    expect(field.hasAttribute("aria-invalid")).toBe(false);
    expect(field.hasAttribute("aria-describedby")).toBe(false);
    expect(container.querySelector('[data-slot="error"]')).toBeNull();
  });

  test("error: the field is marked as not valid, and the message is its description", () => {
    render(<Input label="Title" error="The title is required." />);
    const field = screen.getByRole("textbox", { name: "Title" });
    expect(field.getAttribute("aria-invalid")).toBe("true");

    const message = screen.getByText("The title is required.");
    expect(message.getAttribute("data-slot")).toBe("error");
    expect(field.getAttribute("aria-describedby")).toBe(message.id);
    expect(screen.getByRole("textbox", { description: "The title is required." })).toBe(field);
    expect(message.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  test("error: keeps the description the app gives, and adds the message", () => {
    render(
      <>
        <Input label="Title" id="title" aria-describedby="hint" error="Too long." />
        <p id="hint">At most 40 letters.</p>
      </>,
    );
    expect(screen.getByRole("textbox").getAttribute("aria-describedby")).toBe("hint title-error");
  });

  test("disabled: the field is disabled and cannot get focus", async () => {
    const user = userEvent.setup();
    render(<Input label="Title" disabled />);
    const field = screen.getByRole("textbox") as HTMLInputElement;
    expect(field.disabled).toBe(true);
    await user.tab();
    expect(document.activeElement).not.toBe(field);
  });

  test("the keyboard: Tab moves the focus to the field, and typing changes its value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input label="Title" onChange={onChange} />);
    const field = screen.getByRole("textbox") as HTMLInputElement;

    await user.tab();
    expect(document.activeElement).toBe(field);
    await user.keyboard("Order 12");
    expect(field.value).toBe("Order 12");
    expect(onChange).toHaveBeenCalledTimes(8);
  });

  test("a click on the label moves the focus to the field", async () => {
    const user = userEvent.setup();
    render(<Input label="Title" />);
    await user.click(screen.getByText("Title"));
    expect(document.activeElement).toBe(screen.getByRole("textbox"));
  });

  test("puts the app's className on the outermost element, after the library's classes", () => {
    const { container } = render(<Input label="Title" className="w-64 gap-4" />);
    const classes = container.firstElementChild?.className.split(" ") ?? [];
    expect(classes.slice(-2)).toEqual(["w-64", "gap-4"]);
    // The app's "gap-4" replaces the library's "gap-1". The other classes of the library stay.
    expect(classes).not.toContain("gap-1");
    expect(classes).toContain("flex");
  });

  test("joins the app's aria-describedby with the id of the error message", () => {
    render(<Input label="Title" id="title" aria-describedby="title-hint" error="Required." />);
    expect(screen.getByRole("textbox").getAttribute("aria-describedby")).toBe(
      "title-hint title-error",
    );
  });

  test("passes other attributes to the <input>, and ref points to it", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Input ref={ref} label="E-mail" type="email" placeholder="you@example.com" required />,
    );
    const field = screen.getByRole("textbox") as HTMLInputElement;
    expect(ref.current).toBe(field);
    expect(field.type).toBe("email");
    expect(field.placeholder).toBe("you@example.com");
    expect(field.required).toBe(true);
  });

  test("a field with no label takes its name from aria-label", () => {
    const { container } = render(<Input aria-label="Search" />);
    expect(screen.getByRole("textbox", { name: "Search" })).toBeTruthy();
    expect(container.querySelector("label")).toBeNull();
  });

  test("renders on the server, with the label linked to the field", () => {
    const html = renderToString(<Input label="Title" id="title" error="Required." />);
    expect(html).toMatch(/<label class="[^"]+" data-slot="label" for="title">Title<\/label>/);
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('aria-describedby="title-error"');
  });
});
