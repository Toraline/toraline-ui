import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field, TextInput } from "@toraline.tech/ui";

/** The classes of the native controls of the story "With Other Controls". */
const plainControlClass =
  "min-h-10 w-full rounded-md border border-default bg-surface px-3 py-2 text-sm/5 text-primary";

/**
 * A field of a form: a label, one control, and under it a hint or an error
 * message, all linked for a screen reader. The control of these stories is
 * TextInput. The story "With Other Controls" shows that Field works with any control.
 *
 * The stories are on a card (the background "surface"), where a form is in an
 * app. The hint and the mark "(optional)" have the color "text-tertiary" of
 * Intraweb, whose contrast on the page background of the light theme is 4.48,
 * below the limit of 4.5. On a card it is 4.97.
 */
const meta = {
  title: "Components/Field",
  component: Field,
  args: {
    label: "Client name",
    children: <TextInput name="client-name" />,
  },
  argTypes: {
    // An element cannot be edited in the panel "Controls".
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm rounded-xl border border-default bg-surface p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A label and a control. */
export const Default: Story = {};

/** The prop "hint": a short help text under the control. A screen reader reads it with the control. */
export const WithHint: Story = {
  args: { hint: "As it is written on the invoice." },
};

/**
 * The state "error": the message with its icon is under the control, in the
 * place of the hint. The control has aria-invalid="true", and a screen reader
 * reads the message with the control.
 */
export const WithError: Story = {
  args: {
    hint: "As it is written on the invoice.",
    error: "The client name is required.",
  },
};

/** The prop "optional": the label shows the mark of a field that a person may leave empty. */
export const Optional: Story = {
  args: { label: "Notes", optional: true },
};

/** The prop "optionalText" gives the text of the mark, for an app in another language. */
export const OptionalInAnotherLanguage: Story = {
  args: { label: "Observações", optional: true, optionalText: "(opcional)" },
};

/** Field works with any control: here a native <select> and a <textarea>. */
export const WithOtherControls: Story = {
  render: () => (
    <div className="grid gap-4">
      <Field label="Kind of contract" hint="It decides how the hours are counted.">
        <select className={plainControlClass} name="kind">
          <option>Monthly</option>
          <option>By the hour</option>
        </select>
      </Field>
      <Field label="Notes" optional error="The notes can have 200 characters at most.">
        <textarea className={plainControlClass} name="notes" rows={3} />
      </Field>
    </div>
  ),
};

/** A long label, a long hint and a long error message go to the next line. */
export const LongContent: Story = {
  args: {
    label: "The full legal name of the client, as it is written in the contract",
    optional: true,
    error:
      "The name must be the full legal name of the client, with no abbreviation, as it is written in the contract that both parts signed.",
  },
};
