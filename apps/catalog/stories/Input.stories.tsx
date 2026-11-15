import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "@toraline.tech/ui";

/** A text field with a label and an error message. */
const meta = {
  title: "Components/Input",
  component: Input,
  args: {
    label: "Order number",
    name: "order-number",
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

/** An empty field with a label. */
export const Default: Story = {};

/** A placeholder is the quiet text a field shows while it is empty. */
export const WithPlaceholder: Story = {
  args: { placeholder: "For example 12" },
};

/** A field that already has a value. */
export const WithValue: Story = {
  args: { defaultValue: "Order 12" },
};

/**
 * The state "error". The border has the danger color, and the message is under
 * the field. A screen reader reads the message together with the field.
 */
export const WithError: Story = {
  args: { defaultValue: "Order", error: "The order number is required." },
};

/** The state "disabled". The field cannot get the focus and cannot be changed. */
export const Disabled: Story = {
  args: { defaultValue: "Order 12", disabled: true },
};

/** A field with no visible label. "aria-label" gives it a name for a screen reader. */
export const WithoutVisibleLabel: Story = {
  args: { label: undefined, "aria-label": "Order number", placeholder: "Order number" },
};
