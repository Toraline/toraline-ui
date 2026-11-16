// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test } from "vitest";
import { Field } from "./index";

afterEach(cleanup);

describe("Field", () => {
  test("the label is linked to the control, which gets an id from the component", () => {
    render(
      <Field label="Name">
        <input name="name" />
      </Field>,
    );
    const control = screen.getByRole("textbox", { name: "Name" });
    const label = screen.getByText("Name");
    expect(label.tagName).toBe("LABEL");
    expect(control.id).not.toBe("");
    expect(label.getAttribute("for")).toBe(control.id);
    expect(control.hasAttribute("aria-describedby")).toBe(false);
    expect(control.hasAttribute("aria-invalid")).toBe(false);
  });

  test("id: the id of Field is the id of the control", () => {
    render(
      <Field id="client-name" label="Name">
        <input />
      </Field>,
    );
    expect(screen.getByLabelText("Name").id).toBe("client-name");
  });

  test("the usage of the app Intraweb works unchanged: the same id on Field and on the control", () => {
    render(
      <Field id="client-name" label="Name" error="The name is required.">
        <input id="client-name" />
      </Field>,
    );
    const control = screen.getByRole("textbox", { name: "Name" });
    expect(control.id).toBe("client-name");
    expect(control.getAttribute("aria-describedby")).toBe("client-name-error");
  });

  test("with no id on Field, the id of the control stays", () => {
    render(
      <Field label="Name">
        <input id="own-id" />
      </Field>,
    );
    expect(screen.getByLabelText("Name").id).toBe("own-id");
    expect(screen.getByText("Name").getAttribute("for")).toBe("own-id");
  });

  test("hint: the hint is under the control, and a screen reader reads it with the control", () => {
    render(
      <Field id="name" label="Name" hint="As it is written on the invoice.">
        <input />
      </Field>,
    );
    const control = screen.getByRole("textbox");
    const hint = screen.getByText("As it is written on the invoice.");
    expect(hint.getAttribute("data-slot")).toBe("hint");
    expect(hint.id).toBe("name-hint");
    expect(control.getAttribute("aria-describedby")).toBe("name-hint");
    expect(control.hasAttribute("aria-invalid")).toBe(false);
    expect(screen.getByRole("textbox", { description: "As it is written on the invoice." })).toBe(
      control,
    );
  });

  test("error: the message with its icon replaces the hint, and the control is marked as not valid", () => {
    const { container } = render(
      <Field id="name" label="Name" hint="As it is written on the invoice." error="The name is required.">
        <input />
      </Field>,
    );
    const control = screen.getByRole("textbox");
    const message = screen.getByText("The name is required.");
    expect(message.getAttribute("data-slot")).toBe("error");
    expect(message.id).toBe("name-error");
    expect(control.getAttribute("aria-invalid")).toBe("true");
    expect(control.getAttribute("aria-describedby")).toBe("name-error");
    expect(screen.getByRole("textbox", { description: "The name is required." })).toBe(control);
    expect(screen.queryByText("As it is written on the invoice.")).toBeNull();

    const icon = container.querySelector('[data-slot="error-icon"]');
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
    expect(message.firstElementChild).toBe(icon);
  });

  test("the control keeps its own aria-describedby and aria-invalid", () => {
    render(
      <>
        <Field id="name" label="Name" hint="A hint.">
          <input aria-describedby="other" aria-invalid="true" />
        </Field>
        <p id="other">Another text.</p>
      </>,
    );
    const control = screen.getByRole("textbox");
    expect(control.getAttribute("aria-describedby")).toBe("other name-hint");
    expect(control.getAttribute("aria-invalid")).toBe("true");
  });

  test("optional: the mark is after the label, and the default text is (optional)", () => {
    render(
      <Field label="Notes" optional>
        <input />
      </Field>,
    );
    const mark = screen.getByText("(optional)");
    expect(mark.getAttribute("data-slot")).toBe("optional");
    expect(screen.getByRole("textbox", { name: "Notes (optional)" })).toBeDefined();
  });

  test("optionalText: the app gives the text of the mark", () => {
    render(
      <Field label="Notas" optional optionalText="(opcional)">
        <input />
      </Field>,
    );
    expect(screen.getByRole("textbox", { name: "Notas (opcional)" })).toBeDefined();
  });

  test("a field that is not optional has no mark", () => {
    const { container } = render(
      <Field label="Name">
        <input />
      </Field>,
    );
    expect(container.querySelector('[data-slot="optional"]')).toBeNull();
  });

  test("a function as children receives the props of the control", () => {
    render(
      <Field id="amount" label="Amount" error="The amount is required.">
        {(controlProps) => (
          <div>
            <span>R$</span>
            <input {...controlProps} />
          </div>
        )}
      </Field>,
    );
    const control = screen.getByRole("textbox", { name: "Amount" });
    expect(control.id).toBe("amount");
    expect(control.getAttribute("aria-invalid")).toBe("true");
    expect(control.getAttribute("aria-describedby")).toBe("amount-error");
  });

  test("works with a native <select> and a <textarea>", () => {
    render(
      <>
        <Field label="Kind" hint="The kind of contract.">
          <select>
            <option>Monthly</option>
          </select>
        </Field>
        <Field label="Notes" error="Too long.">
          <textarea />
        </Field>
      </>,
    );
    expect(screen.getByRole("combobox", { name: "Kind", description: "The kind of contract." })).toBeDefined();
    expect(screen.getByRole("textbox", { name: "Notes" }).getAttribute("aria-invalid")).toBe("true");
  });

  test("a click on the label moves the focus to the control", async () => {
    const user = userEvent.setup();
    render(
      <Field label="Name">
        <input />
      </Field>,
    );
    await user.click(screen.getByText("Name"));
    expect(document.activeElement).toBe(screen.getByRole("textbox"));
  });

  test("className, other attributes and ref go to the outermost <div>", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Field ref={ref} label="Name" className="mt-4 space-y-3" data-testid="field">
        <input />
      </Field>,
    );
    const root = screen.getByTestId("field");
    expect(ref.current).toBe(root);
    expect(root.tagName).toBe("DIV");
    const classes = root.className.split(" ");
    expect(classes.slice(-2)).toEqual(["mt-4", "space-y-3"]);
    expect(classes).not.toContain("space-y-1.5");
  });

  test("renders on the server, with everything linked", () => {
    const html = renderToString(
      <Field id="name" label="Name" optional error="Required.">
        <input />
      </Field>,
    );
    expect(html).toContain('for="name"');
    expect(html).toMatch(/<input id="name" aria-describedby="name-error" aria-invalid="true"\/>/);
    expect(html).toContain('id="name-error"');
  });
});
