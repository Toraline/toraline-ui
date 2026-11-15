// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Field } from "../field/index";
import { controlSizes } from "../shared/control";
import { DecimalInput, decimalToInput, parseDecimalInput } from "./index";

afterEach(cleanup);

/** A small icon component, with the props an icon of "lucide-react" accepts. */
function CoinIcon(props: { className?: string; "aria-hidden"?: boolean | "true" | "false" }) {
  return (
    <svg {...props} data-testid="icon" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

/** What an app does: it keeps the text, reads the number, and shows an error for a text that is not a number. */
function PriceField({ onNumber }: { onNumber: (value: number | null) => void }) {
  const [text, setText] = useState("");
  const value = parseDecimalInput(text);
  const isNotANumber = value !== null && Number.isNaN(value);
  return (
    <Field label="Price" error={isNotANumber ? "Type a number, for example 12,50." : undefined}>
      <DecimalInput
        name="price"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          onNumber(parseDecimalInput(event.target.value));
        }}
      />
    </Field>
  );
}

describe("DecimalInput", () => {
  test("is a text field with the decimal keyboard of a phone", () => {
    const { container } = render(<DecimalInput aria-label="Price" name="price" />);
    const field = screen.getByRole("textbox", { name: "Price" });
    expect(field.tagName).toBe("INPUT");
    expect(field.getAttribute("type")).toBe("text");
    expect(field.getAttribute("inputmode")).toBe("decimal");
    expect(field.getAttribute("data-size")).toBe("md");
    expect(container.firstElementChild).toBe(field);
  });

  test.each(controlSizes)('has the size "%s" of a form control', (size) => {
    render(<DecimalInput aria-label="Price" size={size} />);
    expect(screen.getByRole("textbox").getAttribute("data-size")).toBe(size);
  });

  test("a person types a number with a comma, and the text stays as typed", async () => {
    const user = userEvent.setup();
    const onNumber = vi.fn();
    render(<PriceField onNumber={onNumber} />);
    await user.tab();
    await user.keyboard("12,5");
    const field = screen.getByRole("textbox", { name: "Price" }) as HTMLInputElement;
    expect(field.value).toBe("12,5");
    expect(onNumber).toHaveBeenLastCalledWith(12.5);
    expect(field.hasAttribute("aria-invalid")).toBe(false);
  });

  test("a person types a number with a point, and the app reads the same number", async () => {
    const user = userEvent.setup();
    const onNumber = vi.fn();
    render(<PriceField onNumber={onNumber} />);
    await user.type(screen.getByRole("textbox", { name: "Price" }), "12.5");
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("12.5");
    expect(onNumber).toHaveBeenLastCalledWith(12.5);
  });

  test("a number with points between thousands and a comma", async () => {
    const user = userEvent.setup();
    const onNumber = vi.fn();
    render(<PriceField onNumber={onNumber} />);
    await user.type(screen.getByRole("textbox", { name: "Price" }), "1.234,56");
    expect(onNumber).toHaveBeenLastCalledWith(1234.56);
  });

  test("a text that is not a number: the field keeps it, and the app marks the field as not valid", async () => {
    const user = userEvent.setup();
    const onNumber = vi.fn();
    render(<PriceField onNumber={onNumber} />);
    const field = screen.getByRole("textbox", { name: "Price" }) as HTMLInputElement;
    await user.type(field, "12x");
    // The field does not refuse a character.
    expect(field.value).toBe("12x");
    expect(onNumber).toHaveBeenLastCalledWith(Number.NaN);
    expect(field.getAttribute("aria-invalid")).toBe("true");
    expect(field.className.split(" ")).toContain("aria-invalid:border-invalid");
    expect(screen.getByText("Type a number, for example 12,50.").id).toBe(field.getAttribute("aria-describedby"));

    // The person fixes the text: the error goes away.
    await user.keyboard("{Backspace}");
    expect(field.value).toBe("12");
    expect(onNumber).toHaveBeenLastCalledWith(12);
    expect(field.hasAttribute("aria-invalid")).toBe(false);
  });

  test("empty: the app reads no number, and the field is valid", async () => {
    const user = userEvent.setup();
    const onNumber = vi.fn();
    render(<PriceField onNumber={onNumber} />);
    const field = screen.getByRole("textbox", { name: "Price" });
    await user.type(field, "1");
    await user.clear(field);
    expect(onNumber).toHaveBeenLastCalledWith(null);
    expect(field.hasAttribute("aria-invalid")).toBe(false);
  });

  test("type cannot be changed: the field is always a text field", () => {
    // @ts-expect-error The types refuse the prop "type".
    render(<DecimalInput aria-label="Price" type="number" />);
    expect(screen.getByRole("textbox").getAttribute("type")).toBe("text");
  });

  test("inputMode can be changed by the app", () => {
    render(<DecimalInput aria-label="Whole number" inputMode="numeric" />);
    expect(screen.getByRole("textbox").getAttribute("inputmode")).toBe("numeric");
  });

  test("icon: the icon is inside a wrapper, before the field", () => {
    const { container } = render(<DecimalInput aria-label="Price" icon={CoinIcon} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.getAttribute("data-slot")).toBe("wrapper");
    expect(wrapper.firstElementChild).toBe(screen.getByTestId("icon"));
    expect(screen.getByRole("textbox").className.split(" ")).toContain("pl-9");
  });

  test("disabled: it cannot get the focus and cannot be changed", async () => {
    const user = userEvent.setup();
    render(<DecimalInput aria-label="Price" disabled />);
    const field = screen.getByRole("textbox") as HTMLInputElement;
    await user.tab();
    expect(document.activeElement).not.toBe(field);
    await user.type(field, "12");
    expect(field.value).toBe("");
  });

  test("read-only: it can get the focus and cannot be changed", async () => {
    const user = userEvent.setup();
    render(<DecimalInput aria-label="Price" readOnly defaultValue="12,5" />);
    const field = screen.getByRole("textbox") as HTMLInputElement;
    await user.tab();
    expect(document.activeElement).toBe(field);
    await user.keyboard("3");
    expect(field.value).toBe("12,5");
  });

  test("className goes to the <input>, after the library's classes", () => {
    render(<DecimalInput aria-label="Price" className="w-24 text-right" />);
    const classes = screen.getByRole("textbox").className.split(" ");
    expect(classes.slice(-2)).toEqual(["w-24", "text-right"]);
    expect(classes).not.toContain("w-full");
  });

  test("passes other attributes to the <input>, and ref points to it", () => {
    const ref = createRef<HTMLInputElement>();
    render(<DecimalInput ref={ref} aria-label="Price" placeholder="0,00" required />);
    const field = screen.getByRole("textbox") as HTMLInputElement;
    expect(ref.current).toBe(field);
    expect(field.getAttribute("placeholder")).toBe("0,00");
    expect(field.required).toBe(true);
  });

  test("renders on the server, inside Field", () => {
    const html = renderToString(
      <Field id="price" label="Price" error="Type a number.">
        <DecimalInput />
      </Field>,
    );
    expect(html).toMatch(/<input [^>]*inputMode="decimal"/i);
    expect(html).toMatch(/<input [^>]*id="price"/);
    expect(html).toMatch(/<input [^>]*aria-invalid="true"/);
  });
});

describe("parseDecimalInput", () => {
  test.each([
    ["12,5", 12.5],
    ["12.5", 12.5],
    ["0,40", 0.4],
    ["1.234,5", 1234.5],
    ["1.234.567,89", 1234567.89],
    ["1.234", 1.234],
    ["  7  ", 7],
    ["-3,2", -3.2],
    [",5", 0.5],
  ])('"%s" is %s', (text, value) => {
    expect(parseDecimalInput(text)).toBe(value);
  });

  test.each(["", "   "])('an empty text ("%s") is null', (text) => {
    expect(parseDecimalInput(text)).toBeNull();
  });

  test.each(["abc", "12x", "1,2,3", "1.2.3", "Infinity", ","])('"%s" is not a number', (text) => {
    expect(parseDecimalInput(text)).toBeNaN();
  });
});

describe("decimalToInput", () => {
  test("writes a number with a comma as the decimal mark", () => {
    expect(decimalToInput(0.4)).toBe("0,4");
    expect(decimalToInput(1234.5)).toBe("1234,5");
    expect(decimalToInput(12)).toBe("12");
    expect(decimalToInput(0)).toBe("0");
  });

  test("no number is the empty text", () => {
    expect(decimalToInput(null)).toBe("");
    expect(decimalToInput(undefined)).toBe("");
  });

  test("the text it writes is read back as the same number", () => {
    expect(parseDecimalInput(decimalToInput(1234.56))).toBe(1234.56);
  });
});
