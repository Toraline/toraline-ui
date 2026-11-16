// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Field } from "../field/index";
import { darkTheme, lightTheme } from "@toraline.tech/tokens";
import { Checkbox, CheckboxControl } from "./index";

afterEach(cleanup);

describe("CheckboxControl", () => {
  test("is a real checkbox inside a <span>, with a check mark that a screen reader skips", () => {
    const { container } = render(<CheckboxControl aria-label="Paid" name="paid" />);
    const box = screen.getByRole("checkbox", { name: "Paid" }) as HTMLInputElement;
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("SPAN");
    expect(root.firstElementChild).toBe(box);
    expect(box.getAttribute("type")).toBe("checkbox");
    expect(box.getAttribute("name")).toBe("paid");
    expect(box.getAttribute("data-slot")).toBe("input");
    expect(box.checked).toBe(false);
    const check = root.querySelector('[data-slot="check"]') as SVGElement;
    expect(check.getAttribute("aria-hidden")).toBe("true");
    expect(check.getAttribute("class")?.split(" ")).toEqual(
      expect.arrayContaining(["pointer-events-none", "opacity-0", "peer-checked:opacity-100", "text-inverse"]),
    );
  });

  test("the box is 20 pixels, with the looks of rest, checked and the pointer over it", () => {
    render(<CheckboxControl aria-label="Paid" />);
    expect(screen.getByRole("checkbox").className.split(" ")).toEqual(
      expect.arrayContaining([
        "peer",
        "size-5",
        "appearance-none",
        "rounded-[6px]",
        "border-[1.5px]",
        "border-strong",
        "bg-surface",
        "checked:border-brand",
        "checked:bg-primary",
        "hover:border-hover",
        "checked:hover:bg-primary-hover",
      ]),
    );
  });

  test("a press checks it and a second press clears it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CheckboxControl aria-label="Paid" onChange={onChange} />);
    const box = screen.getByRole("checkbox") as HTMLInputElement;
    await user.click(box);
    expect(box.checked).toBe(true);
    await user.click(box);
    expect(box.checked).toBe(false);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  test("keyboard: Tab moves the focus to it, and Space changes it", async () => {
    const user = userEvent.setup();
    render(<CheckboxControl aria-label="Paid" />);
    const box = screen.getByRole("checkbox") as HTMLInputElement;
    await user.tab();
    expect(document.activeElement).toBe(box);
    await user.keyboard(" ");
    expect(box.checked).toBe(true);
    await user.keyboard(" ");
    expect(box.checked).toBe(false);
  });

  test("shows the focus ring of the library with the keyboard focus", () => {
    render(<CheckboxControl aria-label="Paid" />);
    expect(screen.getByRole("checkbox").className.split(" ")).toEqual(
      expect.arrayContaining([
        "focus-visible:outline-2",
        "focus-visible:outline-offset-2",
        "focus-visible:outline-focus",
      ]),
    );
  });

  test("checked and onChange control it from the app", async () => {
    const user = userEvent.setup();
    function ControlledBox() {
      const [checked, setChecked] = useState(true);
      return (
        <CheckboxControl
          aria-label="Paid"
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
        />
      );
    }
    render(<ControlledBox />);
    const box = screen.getByRole("checkbox") as HTMLInputElement;
    expect(box.checked).toBe(true);
    await user.click(box);
    expect(box.checked).toBe(false);
  });

  test("defaultChecked: it starts checked", () => {
    render(<CheckboxControl aria-label="Paid" defaultChecked />);
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(true);
  });

  test("disabled: it cannot get the focus and cannot be changed", async () => {
    const user = userEvent.setup();
    render(<CheckboxControl aria-label="Paid" disabled />);
    const box = screen.getByRole("checkbox") as HTMLInputElement;
    expect(box.disabled).toBe(true);
    expect(box.className.split(" ")).toEqual(
      expect.arrayContaining(["disabled:cursor-not-allowed", "disabled:opacity-50"]),
    );
    await user.tab();
    expect(document.activeElement).not.toBe(box);
    await user.click(box);
    expect(box.checked).toBe(false);
  });

  test("changed: an orange border and a ring, in the place of the border at rest", () => {
    render(
      <>
        <CheckboxControl aria-label="Not changed" />
        <CheckboxControl aria-label="Changed" changed />
      </>,
    );
    const changedBox = screen.getByRole("checkbox", { name: "Changed" });
    const changedClasses = changedBox.className.split(" ");
    expect(changedBox.getAttribute("data-changed")).toBe("true");
    expect(changedClasses).toEqual(
      expect.arrayContaining(["border-changed", "ring-3", "ring-(color:--border-changed-ring)"]),
    );
    expect(changedClasses).not.toContain("border-strong");
    // The ring is the light orange of Intraweb's ring in both themes, not the token of a warning
    // border, which is dark in the dark theme (before version 0.3.1).
    expect(lightTheme.tokens["border-changed-ring"]).toBe("var(--color-orange-200)");
    expect(darkTheme.tokens["border-changed-ring"]).toBe(lightTheme.tokens["border-changed-ring"]);
    // "changed" is not an HTML attribute: it does not reach the <input>.
    expect(changedBox.hasAttribute("changed")).toBe(false);

    const plainBox = screen.getByRole("checkbox", { name: "Not changed" });
    expect(plainBox.hasAttribute("data-changed")).toBe(false);
    expect(plainBox.className.split(" ")).toContain("border-strong");
    expect(plainBox.className.split(" ")).not.toContain("ring-3");
  });

  test("className goes to the outermost <span>, after the library's classes", () => {
    const { container } = render(<CheckboxControl aria-label="Paid" className="mt-0.5 size-6" />);
    const classes = (container.firstElementChild as HTMLElement).className.split(" ");
    expect(classes.slice(-2)).toEqual(["mt-0.5", "size-6"]);
    expect(classes).not.toContain("size-5");
    expect(classes).toContain("shrink-0");
  });

  test("passes other attributes to the <input>, and ref points to it", () => {
    const ref = createRef<HTMLInputElement>();
    render(<CheckboxControl ref={ref} aria-label="Paid" id="paid" value="yes" required />);
    const box = screen.getByRole("checkbox") as HTMLInputElement;
    expect(ref.current).toBe(box);
    expect(box.id).toBe("paid");
    expect(box.value).toBe("yes");
    expect(box.required).toBe(true);
  });

  test("a <label> of the app that points to its id names it", async () => {
    const user = userEvent.setup();
    render(
      <>
        <CheckboxControl id="task-12" />
        <label htmlFor="task-12">Buy the flowers</label>
      </>,
    );
    const box = screen.getByRole("checkbox", { name: "Buy the flowers" }) as HTMLInputElement;
    await user.click(screen.getByText("Buy the flowers"));
    expect(box.checked).toBe(true);
  });

  test("inside Field: the label, the hint and the error message are linked to the <input>", () => {
    render(
      <Field id="terms" label="Terms of the contract" error="Accept the terms.">
        <CheckboxControl name="terms" />
      </Field>,
    );
    const box = screen.getByRole("checkbox", { name: "Terms of the contract" });
    expect(box.id).toBe("terms");
    expect(box.getAttribute("aria-invalid")).toBe("true");
    expect(box.getAttribute("aria-describedby")).toBe("terms-error");
  });

  test("renders on the server", () => {
    expect(renderToString(<CheckboxControl aria-label="Paid" defaultChecked />)).toMatch(
      /^<span class="[^"]+"><input [^>]*type="checkbox"[^>]*\/><svg /,
    );
  });
});

describe("Checkbox", () => {
  test("is a checkbox named by its label, inside a <label>", () => {
    const { container } = render(<Checkbox label="Send the invoice by e-mail" name="send" />);
    const box = screen.getByRole("checkbox", { name: "Send the invoice by e-mail" });
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("LABEL");
    expect(root.contains(box)).toBe(true);
    expect(box.getAttribute("name")).toBe("send");
    expect(root.querySelector('[data-slot="label"]')?.textContent).toBe("Send the invoice by e-mail");
    expect(root.className.split(" ")).toEqual(
      expect.arrayContaining(["flex", "items-center", "gap-2", "text-sm", "text-body"]),
    );
  });

  test("a press on the text changes the box", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Send the invoice by e-mail" onChange={onChange} />);
    const box = screen.getByRole("checkbox") as HTMLInputElement;
    await user.click(screen.getByText("Send the invoice by e-mail"));
    expect(box.checked).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test("keyboard: Tab moves the focus to the box, and Space changes it", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Checkbox label="First" />
        <Checkbox label="Second" />
      </>,
    );
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("checkbox", { name: "First" }));
    await user.keyboard(" ");
    expect((screen.getByRole("checkbox", { name: "First" }) as HTMLInputElement).checked).toBe(true);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("checkbox", { name: "Second" }));
  });

  test("id: the <label> points to the box", () => {
    const { container } = render(<Checkbox id="send" label="Send the invoice by e-mail" />);
    expect((container.firstElementChild as HTMLLabelElement).htmlFor).toBe("send");
    expect(screen.getByRole("checkbox").id).toBe("send");
  });

  test("the label can be an element", () => {
    render(
      <Checkbox
        label={
          <>
            I accept the <a href="/terms">terms</a>
          </>
        }
      />,
    );
    expect(screen.getByRole("checkbox", { name: "I accept the terms" })).toBeDefined();
    expect(screen.getByRole("link", { name: "terms" })).toBeDefined();
  });

  test("disabled: a press on the text changes nothing", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Send the invoice by e-mail" disabled />);
    const box = screen.getByRole("checkbox") as HTMLInputElement;
    await user.click(screen.getByText("Send the invoice by e-mail"));
    expect(box.checked).toBe(false);
    await user.tab();
    expect(document.activeElement).not.toBe(box);
  });

  test("className goes to the <label>, after the library's classes", () => {
    const { container } = render(<Checkbox label="Send" className="mt-4 text-primary" />);
    const classes = (container.firstElementChild as HTMLElement).className.split(" ");
    expect(classes.slice(-2)).toEqual(["mt-4", "text-primary"]);
    expect(classes).not.toContain("text-body");
    expect(classes).toContain("gap-2");
  });

  test("passes other attributes to the <input>, and ref points to it", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} label="Send" value="yes" defaultChecked aria-describedby="send-help" />);
    const box = screen.getByRole("checkbox") as HTMLInputElement;
    expect(ref.current).toBe(box);
    expect(box.value).toBe("yes");
    expect(box.checked).toBe(true);
    expect(box.getAttribute("aria-describedby")).toBe("send-help");
  });

  test("renders on the server", () => {
    const html = renderToString(<Checkbox id="send" label="Send" />);
    expect(html).toMatch(/^<label for="send" class="[^"]+"><span class="[^"]+"><input /);
    expect(html).toContain('<span data-slot="label">Send</span>');
  });
});
