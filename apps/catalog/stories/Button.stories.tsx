import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus } from "lucide-react";
import { fn } from "storybook/test";
import { Button, buttonSizes, buttonVariants } from "@toraline.tech/ui";
import { optionList } from "./shared/option-list";
import { Row } from "./shared/Row";

/**
 * A button. The stories "Variants", "Sizes", "Every Variant And Size",
 * "Disabled" and "Loading" read the lists buttonVariants and buttonSizes of
 * the library, so a new variant or size appears in the catalog with no change
 * in the story file.
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
    // An icon is a component, which the panel "Controls" cannot edit.
    icon: { control: false },
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

/** Every variant in every size: one row for each size. */
export const EveryVariantAndSize: Story = {
  render: (args) => (
    <div className="grid gap-4">
      {buttonSizes.map((size) => (
        <Row key={size}>
          {buttonVariants.map((variant) => (
            <Button {...args} key={variant} variant={variant} size={size}>
              {variant} {size}
            </Button>
          ))}
        </Row>
      ))}
    </div>
  ),
};

/**
 * The prop "icon": an icon before the text, in every variant and every size.
 * The icon here is "Plus" of the package "lucide-react", the icons the app Intraweb uses.
 * The library itself does not depend on that package.
 */
export const WithIcon: Story = {
  args: { icon: Plus },
  render: EveryVariantAndSize.render,
};

/** A long text in a narrow container: the text goes to a second line, and stays in the middle. */
export const LongText: Story = {
  args: { icon: Plus, children: "Save the order and send it to the client by e-mail" },
  render: (args) => (
    <div className="w-48">
      <Button {...args} />
    </div>
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

/** The state "loading" of a button with an icon: the spinner is in the place of the icon. */
export const LoadingWithIcon: Story = {
  args: { loading: true, icon: Plus },
  render: Variants.render,
};
