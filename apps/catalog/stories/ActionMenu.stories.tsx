import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ActionMenu, actionMenuTriggers } from "@toraline.tech/ui";
import { optionList } from "./shared/option-list";

const items = [
  { key: "edit", label: "Edit", icon: Pencil, onSelect: fn() },
  { key: "copy", label: "Copy", icon: Copy, onSelect: fn() },
  { key: "delete", label: "Delete", icon: Trash2, onSelect: fn() },
];

// The menu sits above the page content. This space keeps an open menu inside the story.
const roomForTheMenu: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  paddingBlockEnd: "calc(var(--spacing) * 44)",
};

/** The menu is rendered in <body>, outside the element of the story. */
const getPage = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body);

/**
 * A button that opens a menu of actions, for example the actions of one row of
 * a table. The menu opens under the button, above it when there is no room,
 * and stays inside the window. The icons are the ones of the package
 * "lucide-react", which the library does not depend on.
 */
const meta = {
  title: "Overlays/ActionMenu",
  component: ActionMenu,
  args: {
    items,
    "aria-label": "Actions of Ana",
  },
  argTypes: {
    trigger: optionList(actionMenuTriggers, "inline-radio"),
  },
  decorators: [(Story) => <div style={roomForTheMenu}>{Story()}</div>],
} satisfies Meta<typeof ActionMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The state "closed": the small button with 3 dots. */
export const Closed: Story = {};

/** The state "open". The story presses the button by itself. The focus is on the first action. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    const page = getPage(canvasElement);
    await userEvent.click(page.getByRole("button", { name: "Actions of Ana" }));
    await expect(page.getByRole("menu", { name: "Actions of Ana" })).toBeVisible();
    await waitFor(() => expect(page.getByRole("menuitem", { name: "Edit" })).toHaveFocus());
  },
};

/** The keyboard: the Down arrow opens the menu, the arrows move, and Escape closes it and gives the focus back. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const page = getPage(canvasElement);
    const trigger = page.getByRole("button", { name: "Actions of Ana" });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(page.getByRole("menuitem", { name: "Edit" })).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    await expect(page.getByRole("menuitem", { name: "Copy" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(page.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("menu")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

/** The trigger "button": a small button with a text and an arrow. The story opens the menu. */
export const ButtonTrigger: Story = {
  args: { trigger: "button", children: "Actions", "aria-label": "Actions of Ana" },
  play: Open.play,
};

/** An action that cannot be chosen. It can get the focus, and its hint says why. */
export const DisabledAction: Story = {
  args: {
    items: [
      items[0],
      { key: "delete", label: "Delete", icon: Trash2, onSelect: fn(), disabled: true, hint: "Ana has open orders." },
    ] as typeof items,
  },
  play: Open.play,
};

/** The state "disabled": the button cannot be pressed. */
export const Disabled: Story = {
  args: { disabled: true },
};

/** Actions with no icon, and a long text. */
export const LongContent: Story = {
  args: {
    items: [
      { key: "edit", label: "Edit", onSelect: fn() },
      { key: "move", label: "Move the client to the list of clients that pay at the end of the month", onSelect: fn() },
    ],
  },
  play: Open.play,
};

/** Near the bottom and the right edge of the window: the menu opens above the button and stays inside the window. */
export const NearTheEdge: Story = {
  decorators: [
    (Story) => (
      <div style={{ position: "fixed", insetBlockEnd: 8, insetInlineEnd: 8 }}>{Story()}</div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const page = getPage(canvasElement);
    const trigger = page.getByRole("button", { name: "Actions of Ana" });
    await userEvent.click(trigger);
    const menu = page.getByRole("menu");
    await waitFor(() => expect(page.getByRole("menuitem", { name: "Edit" })).toHaveFocus());
    const menuBox = menu.getBoundingClientRect();
    await expect(menuBox.bottom).toBeLessThanOrEqual(trigger.getBoundingClientRect().top);
    await expect(menuBox.right).toBeLessThanOrEqual(window.innerWidth);
    await expect(menuBox.top).toBeGreaterThanOrEqual(0);
  },
};
