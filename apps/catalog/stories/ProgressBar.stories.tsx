import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ProgressBar, progressTones } from "@toraline.tech/ui";
import { optionList } from "./shared/option-list";

/**
 * A progress bar: how much of a whole is done, as a filled part of a line,
 * with its label and its value above. A screen reader says the label and the
 * value. The story "Tones" reads the list progressTones of the library.
 */
const meta = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  args: {
    label: "Hours of the month",
    value: 30,
    max: 40,
  },
  argTypes: {
    tone: optionList(progressTones, "inline-radio"),
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm rounded-xl border border-default bg-surface p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressBar>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 30 of 40 in the tone "brand": the bar shows 75%. The story checks what a screen reader gets. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole("progressbar", { name: "Hours of the month" });
    await expect(bar).toHaveAttribute("aria-valuenow", "30");
    await expect(bar).toHaveAttribute("aria-valuemax", "40");
    await expect(bar).toHaveAttribute("aria-valuetext", "75%");
  },
};

/** Every tone. */
export const Tones: Story = {
  render: (args) => (
    <div className="grid gap-4">
      {progressTones.map((tone) => (
        <ProgressBar {...args} key={tone} tone={tone} label={`Hours of the month, ${tone}`} />
      ))}
    </div>
  ),
};

/** The prop "valueText": the app writes the value in its own words. A screen reader reads the same text. */
export const WithValueText: Story = {
  args: { valueText: "30 of 40 h" },
};

/** The prop "hideLabel": only the bar. A screen reader still says the label and the value. */
export const WithoutLabel: Story = {
  args: { hideLabel: true },
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole("progressbar", { name: "Hours of the month" });
    await expect(bar).toHaveAttribute("aria-valuetext", "75%");
  },
};

/** Empty and full: 0 and the value of "max". A value outside is shown as 0% or as 100%. */
export const EmptyAndFull: Story = {
  render: (args) => (
    <div className="grid gap-4">
      <ProgressBar {...args} label="Nothing done" value={0} />
      <ProgressBar {...args} label="All done" value={40} tone="success" />
      <ProgressBar {...args} label="More than the goal" value={52} tone="warning" />
    </div>
  ),
};

/** A long label and a long value in a narrow place: the label goes to the next line. */
export const LongContent: Story = {
  args: {
    label: "Hours of the month that the contract of the client covers",
    valueText: "30 of 40 hours",
  },
  decorators: [
    (Story) => (
      <div className="max-w-48">
        <Story />
      </div>
    ),
  ],
};
