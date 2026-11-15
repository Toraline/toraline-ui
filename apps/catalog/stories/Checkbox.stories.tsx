import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Checkbox } from "@toraline.tech/ui";

/**
 * A checkbox with its label: a box that is checked or not. It is a real
 * <input type="checkbox"> inside a <label>, so the Space key and a press on
 * the text change it. For only the box, see CheckboxControl.
 */
const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  args: {
    label: "Send the invoice by e-mail",
    name: "send-invoice",
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Not checked. */
export const Default: Story = {};

/** The state "checked": the box has the color of the main action and shows a check mark. */
export const Checked: Story = {
  args: { defaultChecked: true },
};

/** The state "focus": the box shows the focus ring. The story moves the focus to it with the Tab key. */
export const Focused: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole("checkbox")).toHaveFocus();
  },
};

/** The keyboard: the story moves the focus to the box with Tab and checks it with Space. */
export const CheckedWithTheKeyboard: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await userEvent.keyboard(" ");
    await expect(within(canvasElement).getByRole("checkbox")).toBeChecked();
  },
};

/** The state "disabled", not checked and checked: half of the opacity. A press changes nothing. */
export const Disabled: Story = {
  render: (args) => (
    <div className="grid gap-3">
      <Checkbox {...args} disabled label="Disabled, not checked" />
      <Checkbox {...args} disabled defaultChecked label="Disabled, checked" />
    </div>
  ),
};

/** A long label goes to the next line. The box stays in the middle of the height of the text. */
export const LongLabel: Story = {
  args: {
    label:
      "Send the invoice by e-mail to the address of the contract, and a second copy to the accountant of the client, every month",
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
};

/** The label can be an element, for example a text with a link. */
export const LabelWithALink: Story = {
  args: {
    label: (
      <>
        I accept the{" "}
        <a className="text-brand underline" href="#terms">
          terms of the contract
        </a>
      </>
    ),
  },
};

/** A group of checkboxes inside a <fieldset>, whose <legend> names the group for a screen reader. */
export const Group: Story = {
  render: (args) => (
    <fieldset className="grid gap-3">
      <legend className="mb-3 text-sm/5 font-medium text-strong">Send the invoice by</legend>
      <Checkbox {...args} name="by-email" label="E-mail" defaultChecked />
      <Checkbox {...args} name="by-post" label="Post" />
      <Checkbox {...args} name="by-message" label="Message on the phone" />
    </fieldset>
  ),
};
