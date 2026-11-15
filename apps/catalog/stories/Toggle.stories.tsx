import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toggle } from "@toraline/ui";

/**
 * A switch: a control that is on or off.
 * It is not ThemeToggle, the button that changes the theme.
 */
const meta = {
  title: "Components/Toggle",
  component: Toggle,
  args: {
    label: "Send e-mails",
    name: "send-emails",
  },
} satisfies Meta<typeof Toggle>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The state "off". Press the switch, or press Space while it has the focus, to change it. */
export const Off: Story = {};

/** The state "on": the circle is on the right, with a check mark. */
export const On: Story = {
  args: { defaultChecked: true },
};

/** Disabled while off. */
export const DisabledOff: Story = {
  args: { disabled: true },
};

/** Disabled while on. */
export const DisabledOn: Story = {
  args: { disabled: true, defaultChecked: true },
};

/** A switch with no visible label. "aria-label" gives it a name for a screen reader. */
export const WithoutVisibleLabel: Story = {
  args: { label: undefined, "aria-label": "Send e-mails" },
};
