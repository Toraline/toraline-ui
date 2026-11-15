// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Field } from "../field/index";
import { Textarea } from "./index";

afterEach(cleanup);

describe("Textarea", () => {
  test("is a native <textarea>, alone on the page", () => {
    const { container } = render(<Textarea aria-label="Notes" name="notes" rows={3} />);
    const textarea = screen.getByRole("textbox", { name: "Notes" }) as HTMLTextAreaElement;
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea.getAttribute("name")).toBe("notes");
    expect(textarea.rows).toBe(3);
    expect(container.firstElementChild).toBe(textarea);
  });

  test("has the box of a form control, with text of 16 pixels, and 14 pixels from the breakpoint lg", () => {
    render(<Textarea aria-label="Notes" />);
    const classes = screen.getByRole("textbox").className.split(" ");
    expect(classes).toEqual(
      expect.arrayContaining([
        "w-full",
        "rounded-md",
        "border",
        "border-default",
        "bg-surface",
        "px-3",
        "py-2.5",
        "text-base/6",
        "lg:text-sm/5",
        "text-primary",
      ]),
    );
    // It has no smallest height: the number of rows gives the height.
    expect(classes.some((className) => className.includes("min-h-"))).toBe(false);
  });

  test("the focus look is a border and a ring, with no outline", () => {
    render(<Textarea aria-label="Notes" />);
    expect(screen.getByRole("textbox").className.split(" ")).toEqual(
      expect.arrayContaining(["focus:border-focus", "focus:ring-3", "focus:ring-info", "focus:outline-none"]),
    );
  });

  test("a person can type more than one line in it, and onChange is called", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea aria-label="Notes" onChange={onChange} />);
    await user.tab();
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(document.activeElement).toBe(textarea);
    await user.keyboard("a{Enter}b");
    expect(textarea.value).toBe("a\nb");
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  test("empty: it shows the placeholder", () => {
    render(<Textarea aria-label="Notes" placeholder="What the client asked for" />);
    const textarea = screen.getByPlaceholderText("What the client asked for") as HTMLTextAreaElement;
    expect(textarea.value).toBe("");
    expect(textarea.className.split(" ")).toContain("placeholder:text-tertiary");
  });

  test("not valid: aria-invalid reaches the textarea, and its class selects that attribute", () => {
    render(<Textarea aria-label="Notes" aria-invalid="true" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea.getAttribute("aria-invalid")).toBe("true");
    expect(textarea.className.split(" ")).toContain("aria-invalid:border-invalid");
  });

  test("disabled: it cannot get the focus and cannot be changed", async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Notes" disabled />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.disabled).toBe(true);
    expect(textarea.className.split(" ")).toEqual(
      expect.arrayContaining(["disabled:bg-subtle", "disabled:text-tertiary", "disabled:cursor-not-allowed"]),
    );
    await user.tab();
    expect(document.activeElement).not.toBe(textarea);
    await user.type(textarea, "a");
    expect(textarea.value).toBe("");
  });

  test("read-only: it can get the focus and cannot be changed", async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Notes" readOnly defaultValue="Paid" />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    await user.tab();
    expect(document.activeElement).toBe(textarea);
    await user.keyboard("x");
    expect(textarea.value).toBe("Paid");
  });

  test("className goes to the <textarea>, after the library's classes", () => {
    render(<Textarea aria-label="Notes" className="flex-1 rounded-xl" />);
    const classes = screen.getByRole("textbox").className.split(" ");
    expect(classes.slice(-2)).toEqual(["flex-1", "rounded-xl"]);
    expect(classes).not.toContain("rounded-md");
    expect(classes).toContain("bg-surface");
  });

  test("passes other attributes to the <textarea>, and ref points to it", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} aria-label="Notes" maxLength={200} required />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(ref.current).toBe(textarea);
    expect(textarea.maxLength).toBe(200);
    expect(textarea.required).toBe(true);
  });

  test("inside Field: the label, the hint and the error message are linked to it", () => {
    render(
      <>
        <Field id="notes" label="Notes" hint="200 characters at most.">
          <Textarea name="notes" />
        </Field>
        <Field id="reason" label="Reason" error="The reason is required.">
          <Textarea name="reason" />
        </Field>
      </>,
    );
    const notes = screen.getByRole("textbox", { name: "Notes" });
    expect(notes.id).toBe("notes");
    expect(notes.getAttribute("aria-describedby")).toBe("notes-hint");
    expect(notes.hasAttribute("aria-invalid")).toBe(false);

    const reason = screen.getByRole("textbox", { name: "Reason" });
    expect(reason.getAttribute("aria-invalid")).toBe("true");
    expect(reason.getAttribute("aria-describedby")).toBe("reason-error");
  });

  test("renders on the server", () => {
    const html = renderToString(
      <Field id="notes" label="Notes" error="Required.">
        <Textarea rows={2} />
      </Field>,
    );
    expect(html).toContain('for="notes"');
    expect(html).toMatch(/<textarea [^>]*id="notes"/);
    expect(html).toMatch(/<textarea [^>]*aria-invalid="true"/);
  });
});
