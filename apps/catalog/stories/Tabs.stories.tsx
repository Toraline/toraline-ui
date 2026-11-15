import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Tabs } from "@toraline/ui";

const orderTabs = [
  { id: "all", label: "All", content: <p>The content of the tab "All".</p> },
  { id: "orders", label: "Orders", content: <p>The content of the tab "Orders".</p> },
  { id: "premium", label: "Premium", content: <p>The content of the tab "Premium".</p> },
  { id: "support", label: "Support", content: <p>The content of the tab "Support".</p> },
];

/** A row of tabs, and under it the content of the selected tab. */
const meta = {
  title: "Components/Tabs",
  component: Tabs,
  args: {
    tabs: orderTabs,
    "aria-label": "Orders by kind",
    onSelectedIdChange: fn(),
  },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The first tab is selected. Use the Left and Right arrow keys to select another tab. */
export const Default: Story = {};

/** The prop "defaultSelectedId" names the tab that is selected at the start. */
export const StartsOnAnotherTab: Story = {
  args: { defaultSelectedId: "premium" },
};

/**
 * The state after a person selects a tab with the keyboard. The story presses
 * the Right arrow key by itself: the tab "Orders" is then selected and has the focus.
 */
export const SelectedWithTheKeyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("tab", { name: "All" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "Orders" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent('The content of the tab "Orders".');
  },
};
