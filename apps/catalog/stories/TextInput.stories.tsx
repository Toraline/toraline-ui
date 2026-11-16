import type { Meta, StoryObj } from "@storybook/react-vite";
import { Search } from "lucide-react";
import { expect, within } from "storybook/test";
import { Field, TextInput, controlSizes } from "@toraline.tech/ui";
import { optionList } from "./shared/option-list";

/**
 * A text field: one line of text. It has no label of its own: put it inside
 * Field, as the story "Inside Field" does. Alone, it needs "aria-label".
 * The story "Sizes" reads the list controlSizes of the library.
 */
const meta = {
  title: "Components/TextInput",
  component: TextInput,
  args: {
    "aria-label": "Order number",
    name: "order-number",
  },
  argTypes: {
    size: optionList(controlSizes, "inline-radio"),
    // A component cannot be edited in the panel "Controls".
    icon: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextInput>;

export default meta;

type Story = StoryObj<typeof meta>;

/** An empty field in the size "md": 48 pixels high on a small screen, 40 pixels on a screen 1024 pixels wide or more. */
export const Default: Story = {};

/** Every size. "sm" is 32 pixels high, for a table or a row of filters. */
export const Sizes: Story = {
  render: (args) => (
    <div className="grid gap-4">
      {controlSizes.map((size) => (
        <TextInput
          {...args}
          key={size}
          size={size}
          aria-label={`Order number, size ${size}`}
          placeholder={`Size ${size}`}
        />
      ))}
    </div>
  ),
};

/** A placeholder is the quiet text a field shows while it is empty. */
export const WithPlaceholder: Story = {
  args: { placeholder: "For example 12" },
};

/** A field that already has a value. */
export const WithValue: Story = {
  args: { defaultValue: "Order 12" },
};

/** The prop "icon": an icon inside the field, on the left, in every size. */
export const WithIcon: Story = {
  args: { icon: Search, placeholder: "Search an order" },
  render: Sizes.render,
};

/**
 * The state "focus": the border has the focus color, and a ring of 3 pixels
 * is around the field. The story moves the focus to the field by itself.
 */
export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole("textbox");
    field.focus();
    await expect(field).toHaveFocus();
  },
};

/** The state "not valid": aria-invalid="true" gives the field a red border. Field sets it when it has an error. */
export const Invalid: Story = {
  args: { defaultValue: "Order", "aria-invalid": true },
};

/** The state "disabled". The field cannot get the focus and cannot be changed. */
export const Disabled: Story = {
  args: { defaultValue: "Order 12", disabled: true },
};

/** The state "read-only". The field can get the focus, and its value cannot be changed. It has no look of its own. */
export const ReadOnly: Story = {
  args: { defaultValue: "Order 12", readOnly: true },
};

/**
 * Inside Field, on a card: Field gives the field its label, links the hint
 * and the error message to it, and marks it as not valid.
 */
export const InsideField: Story = {
  render: (args) => (
    <div className="grid gap-4 rounded-xl border border-default bg-surface p-4">
      <Field label="Order number" hint="The number on the invoice.">
        <TextInput {...args} aria-label={undefined} />
      </Field>
      <Field label="Client" error="The client is required.">
        <TextInput {...args} aria-label={undefined} name="client" icon={Search} />
      </Field>
      <Field label="Notes" optional>
        <TextInput {...args} aria-label={undefined} name="notes" size="sm" />
      </Field>
    </div>
  ),
};
