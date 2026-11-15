import type { Meta, StoryObj } from "@storybook/react-vite";
import { CountBadge, countBadgeVariants } from "@toraline.tech/ui";
import { Row } from "./shared/Row";
import { optionList } from "./shared/option-list";

/**
 * A small pill with a number: how many things wait, for example next to the
 * text of a tab or a link of a menu. The prop "label" is what the number
 * means, with the number in it. It is not shown: a screen reader reads it in
 * the place of the number. The story "Variants" reads the list
 * countBadgeVariants of the library.
 */
const meta = {
  title: "Components/CountBadge",
  component: CountBadge,
  args: {
    count: 3,
    label: "3 pending orders",
  },
  argTypes: {
    variant: optionList(countBadgeVariants, "inline-radio"),
  },
} satisfies Meta<typeof CountBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The variant "warning": things that need attention. */
export const Default: Story = {};

/** Every variant. "brand" is a plain count, in the color of the main action. */
export const Variants: Story = {
  render: (args) => (
    <Row>
      {countBadgeVariants.map((variant) => (
        <CountBadge {...args} key={variant} variant={variant} />
      ))}
    </Row>
  ),
};

/** One digit is a circle of 20 pixels. A longer number makes the badge wider. Zero is shown as 0. */
export const Counts: Story = {
  render: (args) => (
    <Row>
      {[0, 7, 42, 1234].map((count) => (
        <CountBadge {...args} key={count} count={count} label={`${count} pending orders`} />
      ))}
    </Row>
  ),
};

/** Next to a text, on a card: the badge is in the middle of the height of the line. */
export const NextToAText: Story = {
  render: (args) => (
    <div className="rounded-xl border border-default bg-surface p-4">
      <p className="flex items-center gap-2 text-sm/5 text-body">
        Orders
        <CountBadge {...args} />
      </p>
      <p className="mt-3 flex items-center gap-2 text-sm/5 text-body">
        Messages
        <CountBadge {...args} variant="brand" count={12} label="12 messages not read" />
      </p>
    </div>
  ),
};
