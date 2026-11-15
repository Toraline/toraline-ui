import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Menu, Settings } from "lucide-react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button, IconButton, Tooltip, tooltipSides } from "@toraline.tech/ui";
import { optionList } from "./shared/option-list";
import { Row } from "./shared/Row";

// The tooltip sits above the page content. This space keeps it inside the story.
const roomForTheTooltip: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  paddingBlock: "calc(var(--spacing) * 12)",
};

const getTooltip = (canvasElement: HTMLElement) =>
  canvasElement.querySelector('[role="tooltip"]') as HTMLElement;

/**
 * A small label next to an element, shown while the pointer is over the
 * element and while it has the keyboard focus. A screen reader says its text
 * as the description of the element. Escape hides it. The story "Sides" reads
 * the list tooltipSides of the library.
 */
const meta = {
  title: "Overlays/Tooltip",
  component: Tooltip,
  args: {
    label: "Open the settings of the shop",
    children: <IconButton icon={Settings} aria-label="Settings" variant="secondary" />,
  },
  argTypes: {
    side: optionList(tooltipSides, "inline-radio"),
    children: { control: false },
  },
  decorators: [(Story) => <div style={roomForTheTooltip}>{Story()}</div>],
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The state "closed": the tooltip is hidden. Move the pointer over the button, or press Tab, to show it. */
export const Closed: Story = {
  play: async ({ canvasElement }) => {
    await expect(getTooltip(canvasElement)).not.toBeVisible();
    // A screen reader gets the text also while the tooltip is hidden.
    await expect(
      within(canvasElement).getByRole("button", { name: "Settings", description: "Open the settings of the shop" }),
    ).toBeInTheDocument();
  },
};

/** The state "open", by the keyboard focus. The story presses Tab by itself. */
export const ShownByTheKeyboardFocus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole("button", { name: "Settings" })).toHaveFocus();
    await waitFor(() => expect(getTooltip(canvasElement)).toBeVisible());
  },
};

/** The state "open", by the pointer. The story moves the pointer over the button by itself. */
export const ShownByThePointer: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole("button", { name: "Settings" }));
    await expect(getTooltip(canvasElement).parentElement).toHaveAttribute("data-side", "right");
  },
};

/** The keyboard: Escape hides the tooltip while the button keeps the focus. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await waitFor(() => expect(getTooltip(canvasElement)).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(getTooltip(canvasElement)).not.toBeVisible());
    await expect(within(canvasElement).getByRole("button", { name: "Settings" })).toHaveFocus();
  },
};

/** Every side, from the list tooltipSides. The story gives the focus to the last one: the tooltip is above the button. */
export const Sides: Story = {
  render: (args) => (
    <Row>
      {tooltipSides.map((side) => (
        <Tooltip {...args} key={side} side={side} label={`The side ${side}`}>
          <Button variant="secondary">Side {side}</Button>
        </Tooltip>
      ))}
    </Row>
  ),
  play: async ({ canvasElement }) => {
    const lastSide = tooltipSides[tooltipSides.length - 1];
    within(canvasElement).getByRole("button", { name: `Side ${lastSide}` }).focus();
    await userEvent.tab();
    await userEvent.tab({ shift: true });
    const tooltips = canvasElement.querySelectorAll('[role="tooltip"]');
    await waitFor(() => expect(tooltips[tooltips.length - 1]).toBeVisible());
  },
};

/** On a link. The tooltip has the same text as the name of the link, so it is not said twice. */
export const SameTextAsTheName: Story = {
  args: {
    label: "Menu",
    children: (
      <a href="#menu" aria-label="Menu" className="inline-flex size-10 items-center justify-center text-icon">
        <Menu aria-hidden="true" className="size-5" />
      </a>
    ),
  },
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    const link = within(canvasElement).getByRole("link", { name: "Menu" });
    await expect(link).toHaveFocus();
    await expect(link).not.toHaveAttribute("aria-describedby");
    await waitFor(() => expect(getTooltip(canvasElement)).toBeVisible());
  },
};

/** Near the right edge of the window: the tooltip is shown on the left of the button. */
export const NearTheEdge: Story = {
  decorators: [
    (Story) => <div style={{ position: "fixed", insetBlockStart: 8, insetInlineEnd: 8 }}>{Story()}</div>,
  ],
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    const tooltip = getTooltip(canvasElement);
    await waitFor(() => expect(tooltip.parentElement).toHaveAttribute("data-side", "left"));
    await waitFor(() => expect(tooltip).toBeVisible());
    const box = tooltip.getBoundingClientRect();
    await expect(box.right).toBeLessThanOrEqual(window.innerWidth);
    await expect(box.left).toBeGreaterThanOrEqual(0);
  },
};
