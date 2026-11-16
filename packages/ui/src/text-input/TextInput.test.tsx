// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Field } from "../field/index";
import { controlSizes } from "../shared/control";
import { TextInput } from "./index";

afterEach(cleanup);

/** A small icon component, with the props an icon of "lucide-react" accepts. */
function SearchIcon(props: { className?: string; "aria-hidden"?: boolean | "true" | "false" }) {
  return (
    <svg {...props} data-testid="icon" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" />
    </svg>
  );
}

describe("TextInput", () => {
  test("is a text field, and with no icon it is only the <input>", () => {
    const { container } = render(<TextInput aria-label="Order number" name="order" />);
    const field = screen.getByRole("textbox", { name: "Order number" });
    expect(field.tagName).toBe("INPUT");
    expect(field.getAttribute("type")).toBe("text");
    expect(field.getAttribute("name")).toBe("order");
    expect(field.getAttribute("data-size")).toBe("md");
    expect(container.firstElementChild).toBe(field);
  });

  test("has the sizes of the form controls of the app Intraweb", () => {
    expect(controlSizes).toEqual(["md", "sm"]);
  });

  test('the size "md" is 48 pixels high, and 40 pixels from the breakpoint "lg"', () => {
    render(<TextInput aria-label="Order number" />);
    const classes = screen.getByRole("textbox").className.split(" ");
    expect(classes).toEqual(expect.arrayContaining(["min-h-12", "text-base/6", "lg:min-h-10", "lg:text-sm/5"]));
  });

  test('the size "sm" is 32 pixels high', () => {
    render(<TextInput aria-label="Order number" size="sm" />);
    const field = screen.getByRole("textbox");
    expect(field.getAttribute("data-size")).toBe("sm");
    const classes = field.className.split(" ");
    expect(classes).toEqual(expect.arrayContaining(["min-h-8", "text-sm/5"]));
    expect(classes).not.toContain("min-h-12");
  });

  test("the HTML attribute size does not reach the <input>", () => {
    render(<TextInput aria-label="Order number" size="sm" />);
    expect(screen.getByRole("textbox").hasAttribute("size")).toBe(false);
  });

  test("type: another type of field", () => {
    render(<TextInput aria-label="E-mail" type="email" />);
    expect(screen.getByRole("textbox").getAttribute("type")).toBe("email");
  });

  test("icon: the icon is inside a wrapper, before the field, and a screen reader skips it", () => {
    const { container } = render(<TextInput aria-label="Search" icon={SearchIcon} />);
    const wrapper = container.firstElementChild as HTMLElement;
    const icon = screen.getByTestId("icon");
    const field = screen.getByRole("textbox", { name: "Search" });
    expect(wrapper.getAttribute("data-slot")).toBe("wrapper");
    expect(wrapper.firstElementChild).toBe(icon);
    expect(wrapper.lastElementChild).toBe(field);
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.getAttribute("class")?.split(" ")).toEqual(
      expect.arrayContaining(["pointer-events-none", "size-4", "text-icon"]),
    );
    // The field leaves room for the icon.
    expect(field.className.split(" ")).toContain("pl-9");
  });

  test("the focus look is a border and a ring, with no outline", () => {
    render(<TextInput aria-label="Order number" />);
    const classes = screen.getByRole("textbox").className.split(" ");
    expect(classes).toEqual(
      expect.arrayContaining(["focus:border-focus", "focus:ring-3", "focus:ring-info", "focus:outline-none"]),
    );
  });

  test("not valid: aria-invalid reaches the field, and its class selects that attribute", () => {
    render(<TextInput aria-label="Order number" aria-invalid="true" />);
    const field = screen.getByRole("textbox");
    expect(field.getAttribute("aria-invalid")).toBe("true");
    expect(field.className.split(" ")).toContain("aria-invalid:border-invalid");
  });

  test("disabled: it cannot get focus and cannot be changed", async () => {
    const user = userEvent.setup();
    render(<TextInput aria-label="Order number" disabled />);
    const field = screen.getByRole("textbox") as HTMLInputElement;
    expect(field.disabled).toBe(true);
    expect(field.className.split(" ")).toEqual(
      expect.arrayContaining(["disabled:bg-subtle", "disabled:text-tertiary", "disabled:cursor-not-allowed"]),
    );
    await user.tab();
    expect(document.activeElement).not.toBe(field);
    await user.type(field, "12");
    expect(field.value).toBe("");
  });

  test("read-only: it can get the focus and cannot be changed", async () => {
    const user = userEvent.setup();
    render(<TextInput aria-label="Order number" readOnly defaultValue="12" />);
    const field = screen.getByRole("textbox") as HTMLInputElement;
    await user.tab();
    expect(document.activeElement).toBe(field);
    await user.keyboard("3");
    expect(field.value).toBe("12");
  });

  test("a person can type in it, and onChange is called", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextInput aria-label="Order number" onChange={onChange} />);
    await user.tab();
    await user.keyboard("12");
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("12");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  test("className goes to the <input>, after the library's classes, with and without an icon", () => {
    render(
      <>
        <TextInput aria-label="Plain" className="w-24 rounded-full" />
        <TextInput aria-label="With an icon" icon={SearchIcon} className="w-24 pl-12" />
      </>,
    );
    const plainClasses = screen.getByRole("textbox", { name: "Plain" }).className.split(" ");
    expect(plainClasses.slice(-2)).toEqual(["w-24", "rounded-full"]);
    expect(plainClasses).not.toContain("w-full");
    expect(plainClasses).not.toContain("rounded-md");

    const iconClasses = screen.getByRole("textbox", { name: "With an icon" }).className.split(" ");
    expect(iconClasses.slice(-2)).toEqual(["w-24", "pl-12"]);
    expect(iconClasses).not.toContain("pl-9");
  });

  test("passes other attributes to the <input>, and ref points to it, with and without an icon", () => {
    const plainRef = createRef<HTMLInputElement>();
    const iconRef = createRef<HTMLInputElement>();
    render(
      <>
        <TextInput ref={plainRef} aria-label="Plain" placeholder="Order number" required />
        <TextInput ref={iconRef} aria-label="With an icon" icon={SearchIcon} inputMode="numeric" />
      </>,
    );
    const plain = screen.getByRole("textbox", { name: "Plain" });
    expect(plainRef.current).toBe(plain);
    expect(plain.getAttribute("placeholder")).toBe("Order number");
    expect((plain as HTMLInputElement).required).toBe(true);
    const withIcon = screen.getByRole("textbox", { name: "With an icon" });
    expect(iconRef.current).toBe(withIcon);
    expect(withIcon.getAttribute("inputmode")).toBe("numeric");
  });

  test("inside Field: the label, the hint and the error message are linked to it", () => {
    render(
      <>
        <Field id="order" label="Order number" hint="The number on the invoice.">
          <TextInput name="order" />
        </Field>
        <Field id="client" label="Client" error="The client is required.">
          <TextInput name="client" icon={SearchIcon} />
        </Field>
      </>,
    );
    const order = screen.getByRole("textbox", { name: "Order number" });
    expect(order.id).toBe("order");
    expect(order.getAttribute("aria-describedby")).toBe("order-hint");
    expect(order.hasAttribute("aria-invalid")).toBe(false);

    const client = screen.getByRole("textbox", { name: "Client" });
    expect(client.id).toBe("client");
    expect(client.getAttribute("aria-invalid")).toBe("true");
    expect(client.getAttribute("aria-describedby")).toBe("client-error");
  });

  test("renders on the server, alone and inside Field", () => {
    expect(renderToString(<TextInput aria-label="Order number" />)).toMatch(/^<input [^>]*type="text"/);
    const html = renderToString(
      <Field id="order" label="Order number" error="Required.">
        <TextInput icon={SearchIcon} />
      </Field>,
    );
    expect(html).toContain('for="order"');
    expect(html).toMatch(/<input [^>]*id="order"/);
    expect(html).toMatch(/<input [^>]*aria-invalid="true"/);
  });
});
