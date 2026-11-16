// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Field } from "../field/index";
import { controlSizes } from "../shared/control";
import { Select } from "./index";

afterEach(cleanup);

const options = (
  <>
    <option value="monthly">Monthly</option>
    <option value="hourly">By the hour</option>
    <option value="fixed">Fixed price</option>
  </>
);

describe("Select", () => {
  test("is a native <select> with its options, in the size md", () => {
    const { container } = render(
      <Select aria-label="Kind of contract" name="kind">
        {options}
      </Select>,
    );
    const select = screen.getByRole("combobox", { name: "Kind of contract" }) as HTMLSelectElement;
    expect(select.tagName).toBe("SELECT");
    expect(select.getAttribute("name")).toBe("kind");
    expect(select.getAttribute("data-size")).toBe("md");
    expect(container.firstElementChild).toBe(select);
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
      "Monthly",
      "By the hour",
      "Fixed price",
    ]);
    expect(select.value).toBe("monthly");
  });

  test.each(controlSizes)('has the size "%s"', (size) => {
    render(
      <Select aria-label="Kind of contract" size={size}>
        {options}
      </Select>,
    );
    const select = screen.getByRole("combobox");
    expect(select.getAttribute("data-size")).toBe(size);
    // The HTML attribute size does not reach the <select>.
    expect(select.hasAttribute("size")).toBe(false);
  });

  test('the size "md" is 48 pixels high, and 40 pixels from the breakpoint "lg"; "sm" is 32 pixels high', () => {
    render(
      <>
        <Select aria-label="Medium">{options}</Select>
        <Select aria-label="Small" size="sm">
          {options}
        </Select>
      </>,
    );
    const mediumClasses = screen.getByRole("combobox", { name: "Medium" }).className.split(" ");
    expect(mediumClasses).toEqual(
      expect.arrayContaining(["min-h-12", "text-base", "lg:min-h-10", "lg:text-sm"]),
    );
    const smallClasses = screen.getByRole("combobox", { name: "Small" }).className.split(" ");
    expect(smallClasses).toEqual(expect.arrayContaining(["min-h-8", "text-sm"]));
    expect(smallClasses).not.toContain("min-h-12");
  });

  test("hides the arrow of the browser, shows its own arrow, and leaves room for it", () => {
    render(<Select aria-label="Kind of contract">{options}</Select>);
    const classes = screen.getByRole("combobox").className.split(" ");
    expect(classes).toEqual(expect.arrayContaining(["appearance-none", "pr-9", "bg-no-repeat"]));
    expect(classes.some((className) => className.startsWith("bg-[url(data:image/svg+xml,"))).toBe(true);
    // The background color of a control stays next to the background image.
    expect(classes).toContain("bg-surface");
  });

  test("the focus look is a border and a ring, with no outline", () => {
    render(<Select aria-label="Kind of contract">{options}</Select>);
    expect(screen.getByRole("combobox").className.split(" ")).toEqual(
      expect.arrayContaining(["focus:border-focus", "focus:ring-3", "focus:ring-info", "focus:outline-none"]),
    );
  });

  test("a person chooses a value with the pointer, and onChange is called", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select aria-label="Kind of contract" onChange={onChange}>
        {options}
      </Select>,
    );
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    await user.selectOptions(select, "By the hour");
    expect(select.value).toBe("hourly");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test("keyboard: Tab moves the focus to it", async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Kind of contract">{options}</Select>);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("combobox"));
  });

  test("value and onChange control it from the app", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select aria-label="Kind of contract" value="fixed" onChange={onChange}>
        {options}
      </Select>,
    );
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("fixed");
    await user.selectOptions(select, "monthly");
    expect(onChange).toHaveBeenCalledTimes(1);
    // The app did not change the value, so the select still shows it.
    expect(select.value).toBe("fixed");
  });

  test("empty: a select with no option renders", () => {
    render(<Select aria-label="Kind of contract" />);
    expect((screen.getByRole("combobox") as HTMLSelectElement).options).toHaveLength(0);
  });

  test("not valid: aria-invalid reaches the select, and its class selects that attribute", () => {
    render(
      <Select aria-label="Kind of contract" aria-invalid="true">
        {options}
      </Select>,
    );
    const select = screen.getByRole("combobox");
    expect(select.getAttribute("aria-invalid")).toBe("true");
    expect(select.className.split(" ")).toContain("aria-invalid:border-invalid");
  });

  test("disabled: it cannot get the focus and cannot be changed", async () => {
    const user = userEvent.setup();
    render(
      <Select aria-label="Kind of contract" disabled>
        {options}
      </Select>,
    );
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.disabled).toBe(true);
    expect(select.className.split(" ")).toEqual(
      expect.arrayContaining(["disabled:bg-subtle", "disabled:text-tertiary", "disabled:cursor-not-allowed"]),
    );
    await user.tab();
    expect(document.activeElement).not.toBe(select);
    await user.selectOptions(select, "hourly").catch(() => undefined);
    expect(select.value).toBe("monthly");
  });

  test("className goes to the <select>, after the library's classes", () => {
    render(
      <Select aria-label="Kind of contract" className="w-auto rounded-full">
        {options}
      </Select>,
    );
    const classes = screen.getByRole("combobox").className.split(" ");
    expect(classes.slice(-2)).toEqual(["w-auto", "rounded-full"]);
    expect(classes).not.toContain("w-full");
    expect(classes).not.toContain("rounded-md");
    expect(classes).toContain("appearance-none");
  });

  test("passes other attributes to the <select>, and ref points to it", () => {
    const ref = createRef<HTMLSelectElement>();
    render(
      <Select ref={ref} aria-label="Kind of contract" required defaultValue="hourly">
        {options}
      </Select>,
    );
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(ref.current).toBe(select);
    expect(select.required).toBe(true);
    expect(select.value).toBe("hourly");
  });

  test("inside Field: the label, the hint and the error message are linked to it", () => {
    render(
      <>
        <Field id="kind" label="Kind of contract" hint="It decides how the hours are counted.">
          <Select name="kind">{options}</Select>
        </Field>
        <Field id="state" label="State" error="Choose a state.">
          <Select name="state">{options}</Select>
        </Field>
      </>,
    );
    const kind = screen.getByRole("combobox", { name: "Kind of contract" });
    expect(kind.id).toBe("kind");
    expect(kind.getAttribute("aria-describedby")).toBe("kind-hint");
    expect(kind.hasAttribute("aria-invalid")).toBe(false);

    const state = screen.getByRole("combobox", { name: "State" });
    expect(state.getAttribute("aria-invalid")).toBe("true");
    expect(state.getAttribute("aria-describedby")).toBe("state-error");
  });

  test("renders on the server", () => {
    const html = renderToString(
      <Field id="kind" label="Kind of contract" error="Required.">
        <Select>{options}</Select>
      </Field>,
    );
    expect(html).toContain('for="kind"');
    expect(html).toMatch(/<select [^>]*id="kind"/);
    expect(html).toMatch(/<select [^>]*aria-invalid="true"/);
  });
});
