import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Field, Textarea } from "@toraline.tech/ui";

/**
 * A text field with more than one line. It is a native <textarea>. It has no
 * label of its own: put it inside Field, as the story "Inside Field" does.
 * Alone, it needs "aria-label". It has one size; "rows" gives its height.
 */
const meta = {
  title: "Components/Textarea",
  component: Textarea,
  args: {
    "aria-label": "Notes",
    name: "notes",
    rows: 3,
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

/** An empty textarea with 3 rows. */
export const Default: Story = {};

/** A placeholder is the quiet text a field shows while it is empty. */
export const WithPlaceholder: Story = {
  args: { placeholder: "What the client asked for" },
};

/** A textarea that already has a value. */
export const WithValue: Story = {
  args: { defaultValue: "The client asked for the invoice by e-mail.\nSend it before Friday." },
};

/** The prop "rows": the height in lines of text. */
export const Rows: Story = {
  render: (args) => (
    <div className="grid gap-4">
      {[2, 5].map((rows) => (
        <Textarea {...args} key={rows} rows={rows} aria-label={`Notes, ${rows} rows`} placeholder={`${rows} rows`} />
      ))}
    </div>
  ),
};

/**
 * The state "focus": the border has the focus color, and a ring of 3 pixels
 * is around the textarea. The story moves the focus to it by itself.
 */
export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole("textbox");
    textarea.focus();
    await expect(textarea).toHaveFocus();
  },
};

/** The state "not valid": aria-invalid="true" gives the textarea a red border. Field sets it when it has an error. */
export const Invalid: Story = {
  args: { defaultValue: "Paid", "aria-invalid": true },
};

/** The state "disabled". The textarea cannot get the focus and cannot be changed. */
export const Disabled: Story = {
  args: { defaultValue: "The client asked for the invoice by e-mail.", disabled: true },
};

/** The state "read-only". The textarea can get the focus, and its value cannot be changed. It has no look of its own. */
export const ReadOnly: Story = {
  args: { defaultValue: "The client asked for the invoice by e-mail.", readOnly: true },
};

/** A text longer than the textarea: the textarea scrolls. */
export const LongContent: Story = {
  args: {
    rows: 2,
    defaultValue:
      "The client asked for the invoice by e-mail. Send it before Friday. The address is the one of the contract. The second copy goes to the accountant, who asked for it last month and did not get it.",
  },
};

/** Inside Field, on a card: Field gives the textarea its label, links the hint and the error message to it, and marks it as not valid. */
export const InsideField: Story = {
  render: (args) => (
    <div className="grid gap-4 rounded-xl border border-default bg-surface p-4">
      <Field label="Notes" optional hint="200 characters at most.">
        <Textarea {...args} aria-label={undefined} />
      </Field>
      <Field label="Reason" error="The reason is required.">
        <Textarea {...args} aria-label={undefined} name="reason" />
      </Field>
    </div>
  ),
};
