import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusBadge, statusBadgeVariants } from "@toraline.tech/ui";
import { Row } from "./shared/Row";
import { optionList } from "./shared/option-list";

/**
 * A badge that shows the state of a thing: a short text on a pill in the
 * color of its meaning. The text must say the state by itself: the color and
 * the dot are decoration. The story "Variants" reads the list
 * statusBadgeVariants of the library.
 */
const meta = {
  title: "Components/StatusBadge",
  component: StatusBadge,
  args: {
    label: "Draft",
  },
  argTypes: {
    variant: optionList(statusBadgeVariants),
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The variant "neutral", with no dot. */
export const Default: Story = {};

/** Every variant. */
export const Variants: Story = {
  render: (args) => (
    <Row>
      {statusBadgeVariants.map((variant) => (
        <StatusBadge {...args} key={variant} variant={variant} label={variant} />
      ))}
    </Row>
  ),
};

/** The prop "dot": a small dot in the stronger color of the variant, before the text. Every variant. */
export const WithDot: Story = {
  render: (args) => (
    <Row>
      {statusBadgeVariants.map((variant) => (
        <StatusBadge {...args} key={variant} variant={variant} label={variant} dot />
      ))}
    </Row>
  ),
};

/** On a card (the background "surface"), where a badge is in a table or a list. Every variant, with a dot. */
export const OnACard: Story = {
  render: (args) => (
    <div className="rounded-xl border border-default bg-surface p-4">
      <Row>
        {statusBadgeVariants.map((variant) => (
          <StatusBadge {...args} key={variant} variant={variant} label={variant} dot />
        ))}
      </Row>
    </div>
  ),
};

/** A long text stays on one line: the badge does not break its text. */
export const LongText: Story = {
  args: { variant: "warning", dot: true, label: "Waiting for the answer of the client since Monday" },
};
