import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button, Popover, TextInput, Toggle, popoverAligns } from "@toraline.tech/ui";
import { optionList } from "./shared/option-list";

// The panel sits above the page content. This space keeps an open panel inside the story.
const roomForThePanel: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  paddingBlockEnd: "calc(var(--spacing) * 48)",
};

const columns = (
  <div className="flex flex-col gap-3">
    <Toggle label="Price" defaultChecked />
    <Toggle label="Stock" />
    <Toggle label="Supplier" />
  </div>
);

const openThePanel: Story["play"] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole("button", { name: "Columns" });
  await userEvent.click(trigger);
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  // The switch itself is drawn by another element, so the test looks at the panel.
  await expect(canvas.getByRole("switch", { name: "Price" })).toBeInTheDocument();
  await waitFor(() => expect(canvasElement.querySelector('[data-slot="panel"]')).toBeVisible());
};

/**
 * A button with a floating panel under it, for example the list of columns of
 * a table. A press on the button opens and closes the panel. Escape and a
 * press outside close it. The story "Aligns" reads the list popoverAligns.
 */
const meta = {
  title: "Overlays/Popover",
  component: Popover,
  args: {
    label: "Columns",
    children: columns,
  },
  argTypes: {
    align: optionList(popoverAligns, "inline-radio"),
    children: { control: false },
  },
  decorators: [(Story) => <div style={roomForThePanel}>{Story()}</div>],
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The state "closed": only the button. */
export const Closed: Story = {};

/** The state "open". The story presses the button by itself. */
export const Open: Story = { play: openThePanel };

/** The keyboard: Enter opens the panel, Tab goes into it, and Escape closes it and gives the focus to the button. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Columns" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("switch", { name: "Price" })).toBeInTheDocument();
    await userEvent.tab();
    await expect(canvas.getByRole("switch", { name: "Price" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("switch")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

/** A press outside the button and the panel closes the panel. */
export const PressOutside: Story = {
  render: (args) => (
    <div className="flex gap-3">
      <Popover {...args} />
      <Button variant="ghost">Outside</Button>
    </div>
  ),
  play: async (context) => {
    await openThePanel(context);
    const canvas = within(context.canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Outside" }));
    await waitFor(() => expect(canvas.queryByRole("switch")).toBeNull());
  },
};

/** The right edges of the button and the panel line up. */
export const AlignRight: Story = {
  args: { align: "right" },
  play: openThePanel,
};

/** A panel with a button that closes it: "children" is a function that receives "close". */
export const WithCloseFunction: Story = {
  args: {
    children: (close: () => void) => (
      <div className="flex flex-col gap-3">
        {columns}
        <Button size="sm" onClick={close}>
          Apply
        </Button>
      </div>
    ),
  },
  play: async (context) => {
    await openThePanel(context);
    const canvas = within(context.canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Apply" }));
    await waitFor(() => expect(canvas.queryByRole("switch")).toBeNull());
  },
};

/** The state "disabled": the button cannot be pressed. */
export const Disabled: Story = {
  args: { disabled: true },
};

/** Long content in a panel with a width of the app (panelClassName). */
export const LongContent: Story = {
  args: {
    panelClassName: "w-72",
    children: (
      <p className="text-sm/5 text-body">
        A long explanation that wraps inside the panel, because the app gave the panel a width of 288 pixels
        with panelClassName.
      </p>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Columns" }));
    await expect(canvas.getByText(/A long explanation/)).toBeVisible();
  },
};

/**
 * A panel with a search field that has "autoFocus": the field gets the focus
 * when the panel opens, so a person types at once. Escape gives the focus back
 * to the button. The test opens the panel and checks where the focus is.
 */
export const FocusOnOpen: Story = {
  args: {
    label: "Choose an item",
    panelClassName: "w-72",
    children: <TextInput autoFocus aria-label="Search an item" placeholder="Name or category" />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Choose an item" });
    await userEvent.click(trigger);
    await expect(canvas.getByRole("textbox", { name: "Search an item" })).toHaveFocus();
    await waitFor(() => expect(canvasElement.querySelector('[data-slot="panel"]')).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();
  },
};

/** Near the bottom and the right edge of the window: the panel opens above the button and stays inside the window. */
export const NearTheEdge: Story = {
  decorators: [
    (Story) => <div style={{ position: "fixed", insetBlockEnd: 8, insetInlineEnd: 8 }}>{Story()}</div>,
  ],
  play: async (context) => {
    await openThePanel(context);
    const canvas = within(context.canvasElement);
    const trigger = canvas.getByRole("button", { name: "Columns" });
    const panel = context.canvasElement.querySelector('[data-slot="panel"]') as HTMLElement;
    await waitFor(() => expect(panel.getAttribute("data-side")).toBe("top"));
    const panelBox = panel.getBoundingClientRect();
    await expect(panelBox.bottom).toBeLessThanOrEqual(trigger.getBoundingClientRect().top);
    await expect(panelBox.right).toBeLessThanOrEqual(window.innerWidth);
    await expect(panelBox.left).toBeGreaterThanOrEqual(0);
  },
};
