// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { SplitButton, splitButtonMenuPlacements } from "./index";

afterEach(cleanup);

const makeItems = () => [
  { label: "Download the invoice", onSelect: vi.fn() },
  { label: "Download the contract", onSelect: vi.fn() },
  { label: "Send by e-mail", onSelect: vi.fn() },
];

const getMain = () => screen.getByRole("button", { name: "Download all" });
const getTrigger = () => screen.getByRole("button", { name: "More options" });
const getItem = (name: string) => screen.getByRole("menuitem", { name });

const renderSplitButton = (props: Partial<Parameters<typeof SplitButton>[0]> = {}) => {
  const items = makeItems();
  const onClick = vi.fn();
  const result = render(
    <>
      <SplitButton items={items} onClick={onClick} {...props}>
        Download all
      </SplitButton>
      <button>After</button>
    </>,
  );
  return { items, onClick, ...result };
};

describe("SplitButton", () => {
  test("renders the main button and the button that opens the menu, with the menu closed", () => {
    renderSplitButton();
    expect(getMain().getAttribute("type")).toBe("button");

    const trigger = getTrigger();
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.hasAttribute("aria-controls")).toBe(false);
    expect(trigger.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  test("a press on the main button runs the main action and does not open the menu", async () => {
    const user = userEvent.setup();
    const { onClick } = renderSplitButton();
    await user.click(getMain());
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  test("a click opens the menu, tells a screen reader, and moves the focus to the first action", async () => {
    const user = userEvent.setup();
    renderSplitButton();
    await user.click(getTrigger());

    const menu = screen.getByRole("menu", { name: "More options" });
    expect(getTrigger().getAttribute("aria-expanded")).toBe("true");
    expect(getTrigger().getAttribute("aria-controls")).toBe(menu.id);
    expect(within(menu).getAllByRole("menuitem")).toHaveLength(3);
    expect(document.activeElement).toBe(getItem("Download the invoice"));

    await user.click(getTrigger());
    expect(screen.queryByRole("menu")).toBeNull();
    expect(getTrigger().getAttribute("aria-expanded")).toBe("false");
  });

  test.each([
    ["{Enter}", "Download the invoice"],
    [" ", "Download the invoice"],
    ["{ArrowDown}", "Download the invoice"],
    ["{ArrowUp}", "Send by e-mail"],
  ])("the keyboard: the key %s opens the menu with the focus on an action", async (key, focused) => {
    const user = userEvent.setup();
    renderSplitButton();
    getTrigger().focus();
    await user.keyboard(key);
    expect(screen.getByRole("menu")).toBeTruthy();
    expect(document.activeElement).toBe(getItem(focused));
  });

  test("the keyboard: the arrow keys move between actions and go around; Home and End", async () => {
    const user = userEvent.setup();
    renderSplitButton();
    getTrigger().focus();
    await user.keyboard("{Enter}");

    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(getItem("Download the contract"));
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(document.activeElement).toBe(getItem("Download the invoice"));
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(getItem("Send by e-mail"));
    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(getItem("Download the invoice"));
    await user.keyboard("{End}");
    expect(document.activeElement).toBe(getItem("Send by e-mail"));
  });

  test("the keyboard: a letter moves the focus to the next action that starts with it", async () => {
    const user = userEvent.setup();
    renderSplitButton();
    getTrigger().focus();
    await user.keyboard("{Enter}");

    await user.keyboard("s");
    expect(document.activeElement).toBe(getItem("Send by e-mail"));
    await user.keyboard("d");
    expect(document.activeElement).toBe(getItem("Download the invoice"));
    await user.keyboard("d");
    expect(document.activeElement).toBe(getItem("Download the contract"));
  });

  test("the keyboard: Escape closes the menu and gives the focus back to the button that opened it", async () => {
    const user = userEvent.setup();
    const { items } = renderSplitButton();
    getTrigger().focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menu")).toBeTruthy();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(getTrigger());
    expect(getTrigger().getAttribute("aria-expanded")).toBe("false");
    expect(items.every((item) => item.onSelect.mock.calls.length === 0)).toBe(true);
  });

  test.each(["{Enter}", " "])(
    "the keyboard: the key %s chooses the action, closes the menu and gives the focus back",
    async (key) => {
      const user = userEvent.setup();
      const { items, onClick } = renderSplitButton();
      getTrigger().focus();
      await user.keyboard("{ArrowDown}{ArrowDown}");
      await user.keyboard(key);

      expect(items[1]?.onSelect).toHaveBeenCalledTimes(1);
      expect(items[0]?.onSelect).not.toHaveBeenCalled();
      expect(onClick).not.toHaveBeenCalled();
      expect(screen.queryByRole("menu")).toBeNull();
      expect(document.activeElement).toBe(getTrigger());
    },
  );

  test("a click on an action chooses it and closes the menu", async () => {
    const user = userEvent.setup();
    const { items } = renderSplitButton();
    await user.click(getTrigger());
    await user.click(getItem("Send by e-mail"));
    expect(items[2]?.onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  test("the keyboard: Tab closes the menu and moves the focus to the next element of the page", async () => {
    const user = userEvent.setup();
    renderSplitButton();
    getTrigger().focus();
    await user.keyboard("{Enter}");
    await user.tab();
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "After" }));
  });

  test("the actions of the menu are not in the Tab order", async () => {
    const user = userEvent.setup();
    renderSplitButton();
    await user.click(getTrigger());
    expect(screen.getAllByRole("menuitem").every((item) => item.tabIndex === -1)).toBe(true);
  });

  test("a press outside the component closes the menu", async () => {
    const user = userEvent.setup();
    renderSplitButton();
    await user.click(getTrigger());
    expect(screen.getByRole("menu")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "After" }));
    expect(screen.queryByRole("menu")).toBeNull();
  });

  test.each(splitButtonMenuPlacements)('menuPlacement "%s" is written on the element', (placement) => {
    const { container } = renderSplitButton({ menuPlacement: placement });
    expect(container.firstElementChild?.getAttribute("data-placement")).toBe(placement);
  });

  test('the menu opens under the buttons when menuPlacement is missing ("bottom")', () => {
    const { container } = renderSplitButton();
    expect(container.firstElementChild?.getAttribute("data-placement")).toBe("bottom");
  });

  test("disabled: both buttons are disabled and the menu does not open", async () => {
    const user = userEvent.setup();
    const { onClick } = renderSplitButton({ disabled: true });
    expect((getMain() as HTMLButtonElement).disabled).toBe(true);
    expect((getTrigger() as HTMLButtonElement).disabled).toBe(true);
    await user.click(getMain());
    await user.click(getTrigger());
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.queryByRole("menu")).toBeNull();
  });

  test("an icon of an action is shown and hidden from a screen reader", async () => {
    const user = userEvent.setup();
    render(
      <SplitButton
        items={[{ label: "Print", onSelect: () => {}, icon: <svg data-testid="icon" /> }]}
      >
        Download all
      </SplitButton>,
    );
    await user.click(getTrigger());
    const icon = screen.getByTestId("icon");
    expect(icon.parentElement?.getAttribute("aria-hidden")).toBe("true");
    expect(getItem("Print")).toBeTruthy();
  });

  test("menuLabel changes the name of the button that opens the menu, and of the menu", async () => {
    const user = userEvent.setup();
    renderSplitButton({ menuLabel: "Other downloads" });
    await user.click(screen.getByRole("button", { name: "Other downloads" }));
    expect(screen.getByRole("menu", { name: "Other downloads" })).toBeTruthy();
  });

  test("puts the app's className on the outermost element, after the library's classes", () => {
    const { container } = renderSplitButton({ className: "mt-4" });
    const classes = container.firstElementChild?.className.split(" ") ?? [];
    expect(classes.at(-1)).toBe("mt-4");
    expect(classes).toContain("inline-flex");
  });

  test("passes other attributes to the main <button>, and ref points to it", () => {
    const ref = createRef<HTMLButtonElement>();
    renderSplitButton({ ref, type: "submit", name: "intent", id: "download" });
    const main = getMain();
    expect(ref.current).toBe(main);
    expect(main.getAttribute("type")).toBe("submit");
    expect(main.getAttribute("name")).toBe("intent");
    expect(main.id).toBe("download");
  });
});
