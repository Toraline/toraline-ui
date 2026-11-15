import type { Meta, StoryObj } from "@storybook/react-vite";
import { Receipt, ShoppingCart } from "lucide-react";
import { StatCard, statCardTones } from "@toraline.tech/ui";
import { optionList } from "./shared/option-list";

/**
 * A card with one number: a label, the number, and how it changed since an
 * earlier period. The app writes every text; the card adds only the sign of
 * the change. The story "Tones" reads the list statCardTones of the library.
 */
const meta = {
  title: "Components/StatCard",
  component: StatCard,
  args: {
    label: "Sales of the month",
    value: "R$ 12.400",
  },
  argTypes: {
    tone: optionList(statCardTones, "inline-radio"),
    // A component and an object with texts are not edited in the panel "Controls".
    icon: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatCard>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A label and a number, in the tone "default". */
export const Default: Story = {};

/** Every tone, with an icon and a trend. "tinted" is for the number that matters most. */
export const Tones: Story = {
  render: (args) => (
    <div className="grid gap-4">
      {statCardTones.map((tone) => (
        <StatCard
          {...args}
          key={tone}
          tone={tone}
          label={`Sales of the month, ${tone}`}
          icon={ShoppingCart}
          trend={{ direction: "up", value: "12%", comparison: "vs. last month" }}
        />
      ))}
    </div>
  ),
};

/** The prop "icon": an icon in a small box before the label. */
export const WithIcon: Story = {
  args: { icon: ShoppingCart },
};

/** A trend up: the number grew, and that is good. Green, with the sign "+". */
export const TrendUp: Story = {
  args: { trend: { direction: "up", value: "12%", comparison: "vs. last month" } },
};

/** A trend down: the number fell, and that is bad. Red, with the minus sign. */
export const TrendDown: Story = {
  args: { trend: { direction: "down", value: "8%", comparison: "vs. last month" } },
};

/** "upIsGood: false": for a number where growing is bad, for example costs. Up is red and down is green. */
export const UpIsBad: Story = {
  render: (args) => (
    <div className="grid gap-4">
      <StatCard
        {...args}
        label="Costs of the month"
        value="R$ 3.100"
        icon={Receipt}
        trend={{ direction: "up", value: "5%", comparison: "vs. last month", upIsGood: false }}
      />
      <StatCard
        {...args}
        label="Late orders"
        value={2}
        trend={{ direction: "down", value: "3", comparison: "vs. last week", upIsGood: false }}
      />
    </div>
  ),
};

/** Empty: the app shows a dash when it has no number yet. */
export const WithoutNumber: Story = {
  args: { value: "—" },
};

/** A long label, a long number and a long comparison in a narrow card: each goes to the next line. */
export const LongContent: Story = {
  args: {
    label: "Sales of the month in the shop and in the two delivery channels",
    value: "R$ 1.234.567,89",
    icon: ShoppingCart,
    trend: { direction: "up", value: "12,5%", comparison: "vs. the same month of the last year" },
  },
  decorators: [
    (Story) => (
      <div className="max-w-48">
        <Story />
      </div>
    ),
  ],
};

/** A row of cards, as at the top of a report. */
export const InAGrid: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-4">
      <StatCard {...args} label="Revenue" value="R$ 12.400" tone="tinted" />
      <StatCard {...args} label="Discounts" value="R$ 320" />
      <StatCard {...args} label="Sales" value={86} />
      <StatCard {...args} label="Average sale" value="R$ 144" />
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="w-xl max-w-full">
        <Story />
      </div>
    ),
  ],
};
