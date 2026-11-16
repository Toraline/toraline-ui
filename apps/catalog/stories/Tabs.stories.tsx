import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Tabs } from "@toraline.tech/ui";

const orderTabs = [
  { id: "all", label: "All", content: <p>The content of the tab "All".</p> },
  { id: "orders", label: "Orders", content: <p>The content of the tab "Orders".</p> },
  { id: "premium", label: "Premium", content: <p>The content of the tab "Premium".</p> },
  { id: "support", label: "Support", content: <p>The content of the tab "Support".</p> },
];

const editorModes = [
  { id: "write", label: "Write" },
  { id: "preview", label: "Preview" },
] as const;

const manyTabs = ["All", "Orders", "Premium", "Support", "Invoices", "Reports", "Settings"].map(
  (label) => ({ id: label.toLowerCase(), label, content: <p>The content of the tab "{label}".</p> }),
);

/**
 * A row of tabs that changes the content inside one page, with the segmented
 * look: the selected tab is a raised white piece.
 */
const meta = {
  title: "Components/Tabs",
  component: Tabs,
  args: {
    tabs: orderTabs,
    "aria-label": "Orders by kind",
    onChange: fn(),
  },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The first tab is selected. Use the Left and Right arrow keys to select another tab. */
export const Default: Story = {};

/** Uncontrolled: the component holds the state. The prop "defaultValue" names the tab that is selected at the start. */
export const StartsOnAnotherTab: Story = {
  args: { defaultValue: "premium" },
};

/**
 * Controlled: the app holds the state with "value" and "onChange". The tabs
 * here have no content: the app shows the content itself, under the row.
 */
export const Controlled: Story = {
  render: () => {
    function Editor() {
      const [mode, setMode] = useState<(typeof editorModes)[number]["id"]>("write");
      return (
        <div className="grid gap-2">
          <Tabs tabs={editorModes} value={mode} onChange={setMode} aria-label="Mode of the editor" />
          <p className="text-sm/5 text-secondary">The app shows the content of the mode: {mode}</p>
        </div>
      );
    }
    return <Editor />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: "Preview" }));
    await expect(canvas.getByRole("tab", { name: "Preview" })).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByText("The app shows the content of the mode: preview")).toBeVisible();
  },
};

/** Many tabs in a narrow container: the track scrolls sideways. */
export const ManyTabs: Story = {
  args: { tabs: manyTabs },
  render: (args) => (
    <div className="max-w-xs">
      <Tabs {...args} />
    </div>
  ),
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
