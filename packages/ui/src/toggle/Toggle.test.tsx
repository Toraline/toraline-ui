// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Toggle } from "./index";

afterEach(cleanup);

describe("Toggle", () => {
  test("is a switch whose accessible name is its label, and it starts off", () => {
    render(<Toggle label="Send e-mails" />);
    const toggle = screen.getByRole("switch", { name: "Send e-mails", checked: false });
    expect(toggle.tagName).toBe("INPUT");
    expect(toggle.getAttribute("type")).toBe("checkbox");
    expect(toggle.getAttribute("data-slot")).toBe("input");
  });

  test("defaultChecked: it starts on, and a screen reader is told it is on", () => {
    render(<Toggle label="Send e-mails" defaultChecked />);
    const toggle = screen.getByRole("switch", { checked: true }) as HTMLInputElement;
    expect(toggle.checked).toBe(true);
  });

  test("the keyboard: Tab moves the focus to it, and the Space key changes it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Toggle label="Send e-mails" onChange={onChange} />);
    const toggle = screen.getByRole("switch") as HTMLInputElement;

    await user.tab();
    expect(document.activeElement).toBe(toggle);

    await user.keyboard(" ");
    expect(toggle.checked).toBe(true);
    expect(screen.getByRole("switch", { checked: true })).toBe(toggle);

    await user.keyboard(" ");
    expect(toggle.checked).toBe(false);
    expect(screen.getByRole("switch", { checked: false })).toBe(toggle);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  test("a click on the label changes it", async () => {
    const user = userEvent.setup();
    render(<Toggle label="Send e-mails" />);
    await user.click(screen.getByText("Send e-mails"));
    expect((screen.getByRole("switch") as HTMLInputElement).checked).toBe(true);
  });

  test("the app can control it with checked and onChange", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [isOn, setIsOn] = useState(true);
      return (
        <>
          <Toggle
            label="Send e-mails"
            checked={isOn}
            onChange={(event) => setIsOn(event.target.checked)}
          />
          <p>{isOn ? "It is on" : "It is off"}</p>
        </>
      );
    }
    render(<Controlled />);
    expect(screen.getByText("It is on")).toBeTruthy();
    await user.click(screen.getByRole("switch"));
    expect(screen.getByText("It is off")).toBeTruthy();
    expect(screen.getByRole("switch", { checked: false })).toBeTruthy();
  });

  test("disabled: it cannot get focus and cannot be changed", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Toggle label="Send e-mails" disabled onChange={onChange} />);
    const toggle = screen.getByRole("switch") as HTMLInputElement;
    expect(toggle.disabled).toBe(true);

    await user.tab();
    expect(document.activeElement).not.toBe(toggle);
    await user.click(screen.getByText("Send e-mails"));
    expect(toggle.checked).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  test("puts the app's className on the outermost element, after the library's classes", () => {
    const { container } = render(<Toggle label="Send e-mails" className="mt-4" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("LABEL");
    const classes = root.className.split(" ");
    expect(classes.at(-1)).toBe("mt-4");
    expect(classes).toContain("inline-flex");
  });

  test("passes other attributes to the <input>, and ref points to it", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Toggle ref={ref} label="Send e-mails" id="emails" name="emails" value="yes" />);
    const toggle = screen.getByRole("switch") as HTMLInputElement;
    expect(ref.current).toBe(toggle);
    expect(toggle.id).toBe("emails");
    expect(toggle.name).toBe("emails");
    expect(toggle.value).toBe("yes");
  });

  test("a switch with no label takes its name from aria-label", () => {
    const { container } = render(<Toggle aria-label="Dark mode" />);
    expect(screen.getByRole("switch", { name: "Dark mode" })).toBeTruthy();
    expect(container.querySelector('[data-slot="label"]')).toBeNull();
  });

  test("the drawing of the switch is hidden from a screen reader", () => {
    const { container } = render(<Toggle label="Send e-mails" />);
    expect(container.querySelector('[data-slot="track"]')?.getAttribute("aria-hidden")).toBe("true");
  });

  test("renders on the server", () => {
    const html = renderToString(<Toggle label="Send e-mails" defaultChecked />);
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('role="switch"');
    expect(html).toContain("checked");
  });
});
