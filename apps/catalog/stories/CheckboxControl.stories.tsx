import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { CheckboxControl } from "@toraline.tech/ui";
import { Row } from "./shared/Row";

/**
 * Only the box of a checkbox, 20 pixels, for a list or a table that has its
 * own label. It has no label: give it "aria-label", or the "id" that a
 * <label> of the app points to. For a checkbox with its label, see Checkbox.
 */
const meta = {
  title: "Components/CheckboxControl",
  component: CheckboxControl,
  args: {
    "aria-label": "Paid",
    name: "paid",
  },
} satisfies Meta<typeof CheckboxControl>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Not checked. */
export const Default: Story = {};

/** The state "checked". */
export const Checked: Story = {
  args: { defaultChecked: true },
};

/** The state "focus": the focus ring around the box. The story moves the focus to it with the Tab key. */
export const Focused: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole("checkbox")).toHaveFocus();
  },
};

/** The state "disabled", not checked and checked. */
export const Disabled: Story = {
  render: (args) => (
    <Row>
      <CheckboxControl {...args} disabled aria-label="Disabled, not checked" />
      <CheckboxControl {...args} disabled defaultChecked aria-label="Disabled, checked" />
    </Row>
  ),
};

/**
 * The prop "changed": a value that a person changed and that is not saved
 * yet, for example in a table that is edited in place. The box has an orange
 * border and ring. Not checked and checked.
 */
export const Changed: Story = {
  render: (args) => (
    <Row>
      <CheckboxControl {...args} changed aria-label="Changed, not checked" />
      <CheckboxControl {...args} changed defaultChecked aria-label="Changed, checked" />
    </Row>
  ),
};

/** In a list that has its own label: the <label> of the app points to the id of the box. */
export const WithALabelOfTheApp: Story = {
  render: (args) => (
    <ul className="grid max-w-sm gap-2">
      {["Buy the flowers", "Call the band", "Send the invitations"].map((task, index) => (
        <li key={task} className="flex items-start gap-3 rounded-md border border-default bg-surface p-3">
          <CheckboxControl
            {...args}
            aria-label={undefined}
            id={`task-${index}`}
            name={`task-${index}`}
            defaultChecked={index === 0}
          />
          <label htmlFor={`task-${index}`} className="text-sm/5 text-body">
            {task}
          </label>
        </li>
      ))}
    </ul>
  ),
};
