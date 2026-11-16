import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus, TriangleAlert, Users } from "lucide-react";
import { Button, EmptyState } from "@toraline.tech/ui";

/**
 * What a list, a table or a page shows when it has nothing to show: an icon,
 * a title, a short text and one action. The texts and the action come from
 * the app.
 */
const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  args: {
    title: "No order yet",
  },
  argTypes: {
    // A component and elements cannot be edited in the panel "Controls".
    icon: { control: false },
    action: { control: false },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Only the title, with the icon of the library: an empty tray. */
export const Default: Story = {};

/** The text under the title says what will be shown here. */
export const WithText: Story = {
  args: { children: "The orders of the client are shown here, with the state of each one." },
};

/** The prop "action": the next step, one button under the text. */
export const WithAction: Story = {
  args: {
    children: "The orders of the client are shown here, with the state of each one.",
    action: <Button icon={Plus}>New order</Button>,
  },
};

/** The prop "icon": an icon of the app in the place of the empty tray. */
export const WithIcon: Story = {
  args: {
    title: "No client yet",
    icon: Users,
    children: "Add the first client to start a contract.",
    action: <Button icon={Plus}>New client</Button>,
  },
};

/** The same component for "could not load": another icon, title and text, and an action that tries again. */
export const CouldNotLoad: Story = {
  args: {
    title: "The orders could not be loaded",
    icon: TriangleAlert,
    children: "Try again in a moment.",
    action: <Button variant="secondary">Try again</Button>,
  },
};

/** A long title and a long text in a narrow place: the title goes to the next line, and the text is at most 448 pixels wide. */
export const LongContent: Story = {
  args: {
    title: "No order of this client was found for the months and the states that the filters select",
    children:
      "The orders of the client are shown here, with the state of each one. Change the months or the states of the filters, or remove every filter, to see the orders that are hidden now.",
    action: <Button variant="secondary">Remove every filter</Button>,
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
};
