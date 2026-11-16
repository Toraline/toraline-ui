import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { CloseButton, iconButtonSizes, iconButtonVariants } from "@toraline.tech/ui";
import { optionList } from "./shared/option-list";
import { Row } from "./shared/Row";

/**
 * The button with a cross that closes a dialog, a side panel or a message.
 * It is an IconButton whose icon is the cross. Its name for a screen reader
 * is "Close" unless the app gives another one in "aria-label".
 */
const meta = {
  title: "Overlays/CloseButton",
  component: CloseButton,
  args: {
    onClick: fn(),
  },
  argTypes: {
    variant: optionList(iconButtonVariants),
    size: optionList(iconButtonSizes),
  },
} satisfies Meta<typeof CloseButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The button with no other prop: the variant "ghost" and the size "md", as in the header of a Modal. */
export const Default: Story = {};

/** Every size of IconButton: a square of 32, 40 and 48 pixels. */
export const Sizes: Story = {
  render: (args) => (
    <Row>
      {iconButtonSizes.map((size) => (
        <CloseButton {...args} key={size} size={size} aria-label={`Close, size ${size}`} />
      ))}
    </Row>
  ),
};

/** The name in the language of the app. */
export const NameOfTheApp: Story = {
  args: { "aria-label": "Fechar" },
};

/** The state "disabled". */
export const Disabled: Story = {
  args: { disabled: true },
};
