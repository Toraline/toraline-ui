import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Field, Select, controlSizes } from "@toraline.tech/ui";
import { optionList } from "./shared/option-list";

const contractKinds = (
  <>
    <option value="monthly">Monthly</option>
    <option value="hourly">By the hour</option>
    <option value="fixed">Fixed price</option>
  </>
);

/**
 * A select: a control where a person chooses one value of a list. It is a
 * native <select>, so the browser shows the list and handles the keyboard.
 * It has no label of its own: put it inside Field, as the story "Inside
 * Field" does. Alone, it needs "aria-label".
 */
const meta = {
  title: "Components/Select",
  component: Select,
  args: {
    "aria-label": "Kind of contract",
    name: "kind",
    children: contractKinds,
  },
  argTypes: {
    size: optionList(controlSizes, "inline-radio"),
    // Elements cannot be edited in the panel "Controls".
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The size "md": 48 pixels high on a small screen, 40 pixels on a screen 1024 pixels wide or more. */
export const Default: Story = {};

/** Every size. "sm" is 32 pixels high, for a table or a row of filters. */
export const Sizes: Story = {
  render: (args) => (
    <div className="grid gap-4">
      {controlSizes.map((size) => (
        <Select {...args} key={size} size={size} aria-label={`Kind of contract, size ${size}`} />
      ))}
    </div>
  ),
};

/** A first option with an empty value is the text a select shows before a person chooses. */
export const Empty: Story = {
  args: {
    defaultValue: "",
    children: (
      <>
        <option value="">Choose a kind</option>
        {contractKinds}
      </>
    ),
  },
};

/** A select with a value chosen. */
export const WithValue: Story = {
  args: { defaultValue: "hourly" },
};

/**
 * The state "focus": the border has the focus color, and a ring of 3 pixels
 * is around the select. The story moves the focus to the select by itself.
 */
export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByRole("combobox");
    select.focus();
    await expect(select).toHaveFocus();
  },
};

/** The state "not valid": aria-invalid="true" gives the select a red border. Field sets it when it has an error. */
export const Invalid: Story = {
  args: { "aria-invalid": true },
};

/** The state "disabled". The select cannot get the focus and cannot be changed. */
export const Disabled: Story = {
  args: { defaultValue: "hourly", disabled: true },
};

/** A class of the app on the <select>: "w-auto" makes it as wide as its longest option. */
export const WidthOfItsContent: Story = {
  args: { className: "w-auto" },
};

/** A long option is cut at the arrow: the text never goes under it. */
export const LongContent: Story = {
  args: {
    children: (
      <option>A contract with a fixed price for each month and a price by the hour after 40 hours</option>
    ),
  },
};

/** Inside Field, on a card: Field gives the select its label, links the hint and the error message to it, and marks it as not valid. */
export const InsideField: Story = {
  render: (args) => (
    <div className="grid gap-4 rounded-xl border border-default bg-surface p-4">
      <Field label="Kind of contract" hint="It decides how the hours are counted.">
        <Select {...args} aria-label={undefined} />
      </Field>
      <Field label="State" error="Choose a state.">
        <Select {...args} aria-label={undefined} name="state" />
      </Field>
      <Field label="Team" optional>
        <Select {...args} aria-label={undefined} name="team" size="sm" />
      </Field>
    </div>
  ),
};
