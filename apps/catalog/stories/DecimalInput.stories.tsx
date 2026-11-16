import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { DecimalInput, Field, controlSizes, parseDecimalInput } from "@toraline.tech/ui";
import { optionList } from "./shared/option-list";

/**
 * A text field for a number with decimals: a price, a quantity, a rate. A
 * phone shows the keyboard with the digits and the decimal mark. The value is
 * the text the person typed, with a comma or a point. The app reads the
 * number with the function parseDecimalInput, as the story "Reading The
 * Number" does.
 */
const meta = {
  title: "Components/DecimalInput",
  component: DecimalInput,
  args: {
    "aria-label": "Price",
    name: "price",
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
} satisfies Meta<typeof DecimalInput>;

export default meta;

type Story = StoryObj<typeof meta>;

/** An empty field in the size "md". */
export const Default: Story = {
  args: { placeholder: "0,00" },
};

/** Every size. "sm" is 32 pixels high, for a table or a row of filters. */
export const Sizes: Story = {
  render: (args) => (
    <div className="grid gap-4">
      {controlSizes.map((size) => (
        <DecimalInput {...args} key={size} size={size} aria-label={`Price, size ${size}`} placeholder={`Size ${size}`} />
      ))}
    </div>
  ),
};

/** A value with a comma as the decimal mark, and a value with a point. The field shows the text as it is. */
export const CommaAndPoint: Story = {
  render: (args) => (
    <div className="grid gap-4">
      <DecimalInput {...args} aria-label="Price with a comma" defaultValue="1.234,50" />
      <DecimalInput {...args} aria-label="Price with a point" defaultValue="1234.50" />
    </div>
  ),
};

/** What an app does with the text: it reads the number, and shows an error message for a text that is not a number. */
function PriceField({ initialText }: { initialText: string }) {
  const [text, setText] = useState(initialText);
  const value = parseDecimalInput(text);
  const isNotANumber = value !== null && Number.isNaN(value);
  const numberText = value === null ? "no number" : String(value);
  return (
    <div className="rounded-xl border border-default bg-surface p-4">
      <Field
        label="Price"
        hint={`The app reads: ${numberText}`}
        error={isNotANumber ? "Type a number, for example 12,50." : undefined}
      >
        <DecimalInput name="price" value={text} onChange={(event) => setText(event.target.value)} />
      </Field>
    </div>
  );
}

/**
 * The app keeps the text and reads the number with parseDecimalInput. The
 * story types "12,5" by itself, and the hint shows the number 12.5.
 */
export const ReadingTheNumber: Story = {
  render: () => <PriceField initialText="" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Price" }), "12,5");
    await expect(canvas.getByText("The app reads: 12.5")).toBeVisible();
  },
};

/**
 * The state "not valid": the text is not a number. The field keeps the text,
 * and the app shows its error message through Field.
 */
export const NotANumber: Story = {
  render: () => <PriceField initialText="12x" />,
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole("textbox", { name: "Price" });
    await expect(field).toHaveAttribute("aria-invalid", "true");
  },
};

/** The state "focus": the border has the focus color, and a ring of 3 pixels is around the field. */
export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole("textbox");
    field.focus();
    await expect(field).toHaveFocus();
  },
};

/** The state "disabled". The field cannot get the focus and cannot be changed. */
export const Disabled: Story = {
  args: { defaultValue: "12,50", disabled: true },
};

/** The state "read-only". The field can get the focus, and its value cannot be changed. */
export const ReadOnly: Story = {
  args: { defaultValue: "12,50", readOnly: true },
};

/** A class of the app on the <input>: a narrow field with the text on the right, as in a table of prices. */
export const NarrowAndRightAligned: Story = {
  args: { defaultValue: "1.234,50", size: "sm", className: "w-28 text-right" },
};
