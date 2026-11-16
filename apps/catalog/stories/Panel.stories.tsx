import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pencil, Plus } from "lucide-react";
import { Button, Panel } from "@toraline.tech/ui";

/**
 * A card that groups content: the box with a shadow that holds one part of a
 * page, with an optional title, subtitle and actions at its top. The corner
 * and the padding are larger on a screen 768 pixels wide or more.
 */
const meta = {
  title: "Components/Panel",
  component: Panel,
  args: {
    children: <p className="text-sm/5 text-body">Monthly contract, signed in March. 40 hours for each month.</p>,
  },
  argTypes: {
    // Elements cannot be edited in the panel "Controls".
    actions: { control: false },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Panel>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Only the content: no title and no actions, so the card has no header. */
export const Default: Story = {};

/** The prop "title": a heading of level 2 at the top of the card. */
export const WithTitle: Story = {
  args: { title: "Contract" },
};

/** The prop "subtitle": a quiet line under the title. */
export const WithSubtitle: Story = {
  args: { title: "Contract", subtitle: "What the client pays for each month" },
};

/** The prop "actions": buttons at the top right of the card. */
export const WithActions: Story = {
  args: {
    title: "Contract",
    subtitle: "What the client pays for each month",
    actions: (
      <>
        <Button variant="secondary" size="sm" icon={Pencil}>
          Edit
        </Button>
        <Button size="sm" icon={Plus}>
          New contract
        </Button>
      </>
    ),
  },
};

/** Actions with no title: the actions stay on the right. */
export const ActionsWithoutTitle: Story = {
  args: {
    actions: (
      <Button variant="secondary" size="sm" icon={Pencil}>
        Edit
      </Button>
    ),
  },
};

/** Empty: a card with a title and no content. */
export const WithoutContent: Story = {
  args: { title: "Contract", children: undefined },
};

/** A long title, a long subtitle and several actions in a narrow card: the texts go to the next line, and the actions go under the title. */
export const LongContent: Story = {
  args: {
    title: "The contract of the client, with every change since the first version of March",
    subtitle:
      "What the client pays for each month, the hours that the price covers, and the price of each hour after them",
    actions: WithActions.args?.actions,
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
};

/** Two cards, one after the other, as on a page of details. */
export const Stacked: Story = {
  render: (args) => (
    <div className="grid gap-4">
      <Panel {...args} title="Contract" />
      <Panel {...args} title="Payments" subtitle="The last 3 months">
        <p className="text-sm/5 text-body">March, April and May are paid.</p>
      </Panel>
    </div>
  ),
};
