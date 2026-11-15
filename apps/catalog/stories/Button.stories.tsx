import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Button, buttonSizes, buttonVariants } from "@toraline.tech/ui";
import { optionList } from "./shared/option-list";
import { Row } from "./shared/Row";

/**
 * A button. The stories "Variants", "Sizes", "Disabled" and "Loading" read the
 * lists buttonVariants and buttonSizes of the library, so a new variant or
 * size appears in the catalog with no change in the story file.
 */
const meta = {
  title: "Components/Button",
  component: Button,
  args: {
    children: "Save",
    // "fn" records each press, and the panel "Actions" shows it.
    onClick: fn(),
  },
  argTypes: {
    variant: optionList(buttonVariants),
    size: optionList(buttonSizes),
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The button with no prop: the variant "primary" and the size "md". Change the props in the panel "Controls". */
export const Default: Story = {};

/** Every variant. A variant is one of the looks of the button. */
export const Variants: Story = {
  render: (args) => (
    <Row>
      {buttonVariants.map((variant) => (
        <Button {...args} key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </Row>
  ),
};

/** Every size. */
export const Sizes: Story = {
  render: (args) => (
    <Row>
      {buttonSizes.map((size) => (
        <Button {...args} key={size} size={size}>
          Size {size}
        </Button>
      ))}
    </Row>
  ),
};

/** The state "disabled", in every variant. The button cannot get the focus and cannot be pressed. */
export const Disabled: Story = {
  args: { disabled: true },
  render: Variants.render,
};

/**
 * The state "loading", in every variant. The button shows a spinner (a small
 * turning circle), a press does nothing, and the button keeps the keyboard focus.
 */
export const Loading: Story = {
  args: { loading: true },
  render: Variants.render,
};
