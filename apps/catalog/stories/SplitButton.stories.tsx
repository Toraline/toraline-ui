import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { SplitButton, splitButtonMenuPlacements } from "@toraline.tech/ui";
import { optionList } from "./shared/option-list";
import { Row } from "./shared/Row";

const items = [
  { label: "Download the invoice", onSelect: fn() },
  { label: "Download the contract", onSelect: fn() },
  { label: "Send by e-mail", onSelect: fn() },
];

/** A small circle, used as the icon of an action. It has the color of the text. */
function DotIcon() {
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" fill="currentColor">
      <circle cx="8" cy="8" r="5" />
    </svg>
  );
}

// The menu sits above the page content. This space keeps an open menu inside the story.
const roomForTheMenu: CSSProperties = { paddingBlock: "calc(var(--spacing) * 40)" };

/**
 * A split button: a main button for the main action, and next to it a small
 * button that opens a menu with more actions. The story "Menu Placements"
 * reads the list splitButtonMenuPlacements of the library.
 */
const meta = {
  title: "Components/SplitButton",
  component: SplitButton,
  args: {
    children: "Download all",
    items,
    onClick: fn(),
  },
  argTypes: {
    menuPlacement: optionList(splitButtonMenuPlacements, "inline-radio"),
  },
} satisfies Meta<typeof SplitButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The menu is closed. Press the small button, or press Enter while it has the focus, to open the menu. */
export const Default: Story = {};

/** The state "open". The story presses the small button by itself: the menu opens under the buttons. */
export const MenuOpen: Story = {
  decorators: [(Story) => <div style={roomForTheMenu}>{Story()}</div>],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "More options" }));
    await expect(canvas.getByRole("menu")).toBeVisible();
    await expect(canvas.getByRole("menuitem", { name: "Download the invoice" })).toHaveFocus();
  },
};

/**
 * Every place where the menu can open, from the list splitButtonMenuPlacements.
 * The story opens the last menu by itself: it opens above the buttons.
 */
export const MenuPlacements: Story = {
  decorators: [(Story) => <div style={roomForTheMenu}>{Story()}</div>],
  render: (args) => (
    <Row>
      {splitButtonMenuPlacements.map((menuPlacement) => (
        <SplitButton
          {...args}
          key={menuPlacement}
          menuPlacement={menuPlacement}
          menuLabel={`More options, the menu opens at the ${menuPlacement}`}
        >
          Menu at the {menuPlacement}
        </SplitButton>
      ))}
    </Row>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const lastPlacement = splitButtonMenuPlacements[splitButtonMenuPlacements.length - 1];
    await userEvent.click(
      canvas.getByRole("button", { name: `More options, the menu opens at the ${lastPlacement}` }),
    );
    await expect(canvas.getByRole("menu")).toBeVisible();
  },
};

/** Each action of the menu can have an icon before its text. The story opens the menu by itself. */
export const WithIcons: Story = {
  args: {
    items: items.map((item) => ({ ...item, icon: <DotIcon /> })),
  },
  decorators: MenuOpen.decorators,
  play: MenuOpen.play,
};

/** The state "disabled": both buttons are disabled. */
export const Disabled: Story = {
  args: { disabled: true },
};
