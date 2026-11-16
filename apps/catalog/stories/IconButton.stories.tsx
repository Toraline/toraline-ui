import type { Meta, StoryObj } from "@storybook/react-vite";
import { Trash2 } from "lucide-react";
import { fn } from "storybook/test";
import { IconButton, iconButtonSizes, iconButtonVariants } from "@toraline.tech/ui";
import { optionList } from "./shared/option-list";
import { Row } from "./shared/Row";

/**
 * A button that shows only an icon. "aria-label" gives it a name for a screen
 * reader, and the types of the library require it. The stories read the lists
 * iconButtonVariants and iconButtonSizes of the library. The icons are the ones
 * of the package "lucide-react", which the library does not depend on.
 */
const meta = {
  title: "Components/IconButton",
  component: IconButton,
  args: {
    icon: Trash2,
    "aria-label": "Delete the order",
    onClick: fn(),
  },
  argTypes: {
    variant: optionList(iconButtonVariants),
    size: optionList(iconButtonSizes),
    // A component cannot be edited in the panel "Controls".
    icon: { control: false },
  },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The icon button with no other prop: the variant "ghost" and the size "md". */
export const Default: Story = {};

/** Every variant. */
export const Variants: Story = {
  render: (args) => (
    <Row>
      {iconButtonVariants.map((variant) => (
        <IconButton {...args} key={variant} variant={variant} aria-label={`Delete, ${variant}`} />
      ))}
    </Row>
  ),
};

/** Every size: a square of 32, 40 and 48 pixels. */
export const Sizes: Story = {
  render: (args) => (
    <Row>
      {iconButtonSizes.map((size) => (
        <IconButton {...args} key={size} size={size} aria-label={`Delete, size ${size}`} />
      ))}
    </Row>
  ),
};

/** Every variant in every size: one row for each size. */
export const EveryVariantAndSize: Story = {
  render: (args) => (
    <div className="grid gap-4">
      {iconButtonSizes.map((size) => (
        <Row key={size}>
          {iconButtonVariants.map((variant) => (
            <IconButton
              {...args}
              key={variant}
              variant={variant}
              size={size}
              aria-label={`Delete, ${variant}, size ${size}`}
            />
          ))}
        </Row>
      ))}
    </div>
  ),
};

/** The state "disabled", in every variant. The button cannot get the focus and cannot be pressed. */
export const Disabled: Story = {
  args: { disabled: true },
  render: Variants.render,
};
