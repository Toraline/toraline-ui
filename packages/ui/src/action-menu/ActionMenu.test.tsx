// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Drawer } from "../drawer/index";
import { Modal } from "../modal/index";
import { ActionMenu, actionMenuTriggers } from "./index";
import type { ActionMenuProps } from "./index";

afterEach(cleanup);

/** A small icon component, with the props an icon of "lucide-react" accepts. */
function PencilIcon(props: { className?: string; "aria-hidden"?: boolean | "true" | "false" }) {
  return (
    <svg {...props} data-testid="icon" viewBox="0 0 24 24">
      <path d="M4 20h4L20 8l-4-4L4 16z" />
    </svg>
  );
}

const makeItems = () => [
  { key: "edit", label: "Edit", icon: PencilIcon, onSelect: vi.fn() },
  { key: "copy", label: "Copy", onSelect: vi.fn() },
  { key: "delete", label: "Delete", onSelect: vi.fn() },
];

const renderMenu = (props: Partial<ActionMenuProps> = {}) => {
  const items = makeItems();
  const result = render(
    <>
      <button>Before</button>
      <ActionMenu items={items} aria-label="Actions of Ana" {...props} />
      <button>After</button>
    </>,
  );
  return { items, ...result };
};

const getTrigger = () => screen.getByRole("button", { name: "Actions of Ana" });
const getMenu = () => screen.getByRole("menu", { name: "Actions of Ana" });
const queryMenu = () => screen.queryByRole("menu");
const getItem = (name: string) => screen.getByRole("menuitem", { name });

describe("ActionMenu", () => {
  test("renders a small icon button with the name the app gave, with the menu closed", () => {
    renderMenu();
    const trigger = getTrigger();
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("type")).toBe("button");
    expect(trigger.getAttribute("data-size")).toBe("sm");
    expect(trigger.getAttribute("data-variant")).toBe("ghost");
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.hasAttribute("aria-controls")).toBe(false);
    expect(trigger.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(queryMenu()).toBeNull();
  });

  test("the types refuse a menu with no aria-label", () => {
    // @ts-expect-error "aria-label" is required.
    const withoutName = <ActionMenu items={makeItems()} />;
    expect(withoutName).toBeDefined();
  });

  test("has the two triggers of the app Intraweb", () => {
    expect(actionMenuTriggers).toEqual(["icon", "button"]);
  });

  test('the trigger "button" is a small secondary Button with the text of the app and an arrow', () => {
    renderMenu({ trigger: "button", children: "Actions" });
    const trigger = getTrigger();
    expect(trigger.textContent).toBe("Actions");
    expect(trigger.getAttribute("data-variant")).toBe("secondary");
    expect(trigger.getAttribute("data-size")).toBe("sm");
    expect(trigger.querySelector('[data-slot="arrow"]')?.getAttribute("aria-hidden")).toBe("true");
  });

  test("a click opens the menu in <body>, tells a screen reader, and moves the focus to the first action", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(getTrigger());

    const menu = getMenu();
    expect(menu.parentElement).toBe(document.body);
    expect(getTrigger().getAttribute("aria-expanded")).toBe("true");
    expect(getTrigger().getAttribute("aria-controls")).toBe(menu.id);
    expect(within(menu).getAllByRole("menuitem")).toHaveLength(3);
    expect(menu.className.split(" ")).not.toContain("invisible");
    expect(document.activeElement).toBe(getItem("Edit"));

    await user.click(getTrigger());
    expect(queryMenu()).toBeNull();
    expect(getTrigger().getAttribute("aria-expanded")).toBe("false");
  });

  test.each([
    ["{Enter}", "Edit"],
    [" ", "Edit"],
    ["{ArrowDown}", "Edit"],
    ["{ArrowUp}", "Delete"],
  ])("the keyboard: the key %s opens the menu with the focus on an action", async (key, focused) => {
    const user = userEvent.setup();
    renderMenu();
    getTrigger().focus();
    await user.keyboard(key);
    expect(getMenu()).toBeDefined();
    expect(document.activeElement).toBe(getItem(focused));
  });

  test("the keyboard: the arrow keys move between actions and go around; Home and End", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(getTrigger());
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(getItem("Copy"));
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(document.activeElement).toBe(getItem("Edit"));
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(getItem("Delete"));
    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(getItem("Edit"));
    await user.keyboard("{End}");
    expect(document.activeElement).toBe(getItem("Delete"));
  });

  test("the keyboard: a letter moves the focus to the next action that starts with it", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(getTrigger());
    await user.keyboard("d");
    expect(document.activeElement).toBe(getItem("Delete"));
    await user.keyboard("c");
    expect(document.activeElement).toBe(getItem("Copy"));
  });

  test.each(["{Enter}", " "])(
    "the keyboard: the key %s chooses the action, closes the menu and gives the focus back",
    async (key) => {
      const user = userEvent.setup();
      const { items } = renderMenu();
      await user.click(getTrigger());
      await user.keyboard("{ArrowDown}");
      await user.keyboard(key);
      expect(items[1]?.onSelect).toHaveBeenCalledTimes(1);
      expect(items[0]?.onSelect).not.toHaveBeenCalled();
      expect(queryMenu()).toBeNull();
      expect(document.activeElement).toBe(getTrigger());
    },
  );

  test("a click on an action chooses it and closes the menu", async () => {
    const user = userEvent.setup();
    const { items } = renderMenu();
    await user.click(getTrigger());
    await user.click(getItem("Delete"));
    expect(items[2]?.onSelect).toHaveBeenCalledTimes(1);
    expect(queryMenu()).toBeNull();
  });

  test("the keyboard: Escape closes the menu and gives the focus back to the button", async () => {
    const user = userEvent.setup();
    const { items } = renderMenu();
    await user.click(getTrigger());
    await user.keyboard("{Escape}");
    expect(queryMenu()).toBeNull();
    expect(document.activeElement).toBe(getTrigger());
    expect(items.every((item) => item.onSelect.mock.calls.length === 0)).toBe(true);
  });

  test("the keyboard: Tab closes the menu and moves the focus to the next element of the page", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(getTrigger());
    await user.tab();
    expect(queryMenu()).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "After" }));
  });

  test("the actions of the menu are not in the Tab order", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(getTrigger());
    for (const item of screen.getAllByRole("menuitem")) {
      expect(item.getAttribute("tabindex")).toBe("-1");
    }
  });

  test("a press outside the menu closes it, and the focus is not moved", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(getTrigger());
    await user.click(screen.getByRole("button", { name: "Before" }));
    expect(queryMenu()).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Before" }));
  });

  test("an icon of an action is drawn by the library and hidden from a screen reader", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(getTrigger());
    const icon = screen.getByTestId("icon");
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.getAttribute("class")).toBe("size-4 shrink-0 text-icon");
    expect(getItem("Edit").contains(icon)).toBe(true);
  });

  test("a disabled action can get the focus, says why, and cannot be chosen", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ActionMenu
        aria-label="Actions of Ana"
        items={[
          { key: "edit", label: "Edit", onSelect: vi.fn() },
          { key: "delete", label: "Delete", onSelect, disabled: true, hint: "Ana has open orders." },
        ]}
      />,
    );
    await user.click(getTrigger());
    const item = getItem("Delete");
    expect(item.getAttribute("aria-disabled")).toBe("true");
    expect(item.getAttribute("title")).toBe("Ana has open orders.");
    expect(getItem("Edit").hasAttribute("aria-disabled")).toBe(false);
    expect(getItem("Edit").hasAttribute("title")).toBe(false);

    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(item);
    await user.keyboard("{Enter}");
    await user.click(item);
    expect(onSelect).not.toHaveBeenCalled();
    expect(queryMenu()).not.toBeNull();
  });

  test("disabled: the button is disabled and the menu does not open", async () => {
    const user = userEvent.setup();
    renderMenu({ disabled: true });
    expect(getTrigger().hasAttribute("disabled")).toBe(true);
    await user.click(getTrigger());
    expect(queryMenu()).toBeNull();
  });

  test("with no action, it renders nothing", () => {
    const { container } = render(<ActionMenu items={[]} aria-label="Actions of Ana" />);
    expect(container.innerHTML).toBe("");
  });

  test("puts the app's className on the button, passes other attributes, and ref points to it", () => {
    const ref = createRef<HTMLButtonElement>();
    renderMenu({ ref, className: "mt-4", "data-testid": "trigger" } as Partial<ActionMenuProps>);
    expect(ref.current).toBe(getTrigger());
    expect(ref.current).toBe(screen.getByTestId("trigger"));
    expect(getTrigger().className.split(" ").at(-1)).toBe("mt-4");
  });

  test("the closed menu renders on the server", () => {
    expect(renderToString(<ActionMenu items={makeItems()} aria-label="Actions of Ana" />)).toContain(
      'aria-haspopup="menu"',
    );
  });
});

describe("ActionMenu inside a Modal or a Drawer", () => {
  function ModalWithMenu({ onSelect }: { onSelect: () => void }) {
    const [isOpen, setIsOpen] = useState(true);
    return isOpen ? (
      <Modal title="Client" onClose={() => setIsOpen(false)}>
        <ActionMenu aria-label="Actions of Ana" items={[{ key: "edit", label: "Edit", onSelect }]} />
      </Modal>
    ) : null;
  }

  test("Escape closes only the menu; a second Escape closes the Modal", async () => {
    const user = userEvent.setup();
    render(<ModalWithMenu onSelect={() => undefined} />);
    await user.click(getTrigger());
    expect(document.activeElement).toBe(getItem("Edit"));

    await user.keyboard("{Escape}");
    expect(queryMenu()).toBeNull();
    expect(screen.queryByRole("dialog")).not.toBeNull();
    expect(document.activeElement).toBe(getTrigger());

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("the Modal lets the focus go into its menu, and Tab from the menu stays inside the Modal", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ModalWithMenu onSelect={onSelect} />);
    await user.click(getTrigger());
    // The menu is rendered in <body>, outside the dialog. The focus is not pulled back.
    expect(document.activeElement).toBe(getItem("Edit"));

    // The button of the menu is the last element of the dialog: Tab goes to the first one.
    await user.tab();
    expect(queryMenu()).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close" }));

    await user.click(getTrigger());
    await user.click(getItem("Edit"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  test("a click on an action of a menu in a Drawer with unsaved changes is not a click behind the Drawer", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Drawer
        title="Client"
        onClose={() => undefined}
        discardConfirmation={{
          title: "Discard the changes?",
          description: "What you typed is lost.",
          discardLabel: "Discard",
          keepEditingLabel: "Keep editing",
        }}
      >
        <input aria-label="Name" />
        <ActionMenu aria-label="Actions of Ana" items={[{ key: "edit", label: "Edit", onSelect }]} />
      </Drawer>,
    );
    await user.type(screen.getByRole("textbox", { name: "Name" }), "Ana");
    await user.click(getTrigger());
    await user.click(getItem("Edit"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });
});
