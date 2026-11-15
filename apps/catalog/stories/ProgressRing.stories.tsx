import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ProgressRing, progressRingSizes, progressTones } from "@toraline.tech/ui";
import { Row } from "./shared/Row";
import { optionList } from "./shared/option-list";

/**
 * A progress ring: how much of a whole is done, as a filled part of a circle.
 * The label is not shown: it is the name a screen reader says, with the
 * percentage. The stories read the lists progressRingSizes and progressTones
 * of the library.
 */
const meta = {
  title: "Components/ProgressRing",
  component: ProgressRing,
  args: {
    label: "Ideal stock",
    value: 1,
    max: 4,
  },
  argTypes: {
    tone: optionList(progressTones, "inline-radio"),
    size: optionList(progressRingSizes, "inline-radio"),
  },
  decorators: [
    (Story) => (
      <div className="inline-block rounded-xl border border-default bg-surface p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressRing>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 1 of 4 in the size "md" and the tone "brand": 25%. The story checks what a screen reader gets. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const ring = within(canvasElement).getByRole("progressbar", { name: "Ideal stock" });
    await expect(ring).toHaveAttribute("aria-valuenow", "1");
    await expect(ring).toHaveAttribute("aria-valuemax", "4");
    await expect(ring).toHaveAttribute("aria-valuetext", "25%");
  },
};

/** Every size. "md" is 64 pixels, with the percentage in the middle. "sm" is 40 pixels, with no text. */
export const Sizes: Story = {
  render: (args) => (
    <Row>
      {progressRingSizes.map((size) => (
        <ProgressRing {...args} key={size} size={size} label={`Ideal stock, size ${size}`} />
      ))}
    </Row>
  ),
};

/** Every tone, in every size. */
export const Tones: Story = {
  render: (args) => (
    <div className="grid gap-4">
      {progressRingSizes.map((size) => (
        <Row key={size}>
          {progressTones.map((tone) => (
            <ProgressRing
              {...args}
              key={tone}
              size={size}
              tone={tone}
              value={3}
              label={`Ideal stock, ${tone}, size ${size}`}
            />
          ))}
        </Row>
      ))}
    </div>
  ),
};

/** Empty, half and full. A value outside 0 and "max" is shown as 0% or as 100%. */
export const EmptyHalfAndFull: Story = {
  render: (args) => (
    <Row>
      {[0, 2, 4, 9].map((value) => (
        <ProgressRing {...args} key={value} value={value} label={`Ideal stock, ${value} of 4`} />
      ))}
    </Row>
  ),
};

/** The size "sm" has no text. A screen reader still gets the percentage. */
export const SmallIsReadByAScreenReader: Story = {
  args: { size: "sm" },
  play: async ({ canvasElement }) => {
    const ring = within(canvasElement).getByRole("progressbar", { name: "Ideal stock" });
    await expect(ring).toHaveAttribute("aria-valuetext", "25%");
  },
};
