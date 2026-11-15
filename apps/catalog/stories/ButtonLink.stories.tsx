import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight } from "lucide-react";
import { ButtonLink, buttonSizes, buttonVariants } from "@toraline.tech/ui";
import { optionList } from "./shared/option-list";
import { Row } from "./shared/Row";

/**
 * A link component of an app. It stands for the Link of "next/link", which the
 * catalog does not have: it renders an <a> and marks it, so the story can show
 * that ButtonLink used it.
 */
function AppLink(props: ComponentProps<"a">) {
  return <a {...props} data-app-link="true" />;
}

/**
 * A link that looks like a Button. A press goes to another page. It has the
 * variants, the sizes and the icon of Button. The stories read the lists
 * buttonVariants and buttonSizes of the library.
 */
const meta = {
  title: "Components/ButtonLink",
  component: ButtonLink,
  args: {
    children: "See the orders",
    // "#" keeps the catalog on the story when the link is pressed.
    href: "#",
  },
  argTypes: {
    variant: optionList(buttonVariants),
    size: optionList(buttonSizes),
    // A component cannot be edited in the panel "Controls".
    icon: { control: false },
    linkComponent: { control: false },
  },
} satisfies Meta<typeof ButtonLink>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The link with no prop: an <a> with the variant "primary" and the size "md". */
export const Default: Story = {};

/** Every variant. */
export const Variants: Story = {
  render: (args) => (
    <Row>
      {buttonVariants.map((variant) => (
        <ButtonLink {...args} key={variant} variant={variant}>
          {variant}
        </ButtonLink>
      ))}
    </Row>
  ),
};

/** Every size. */
export const Sizes: Story = {
  render: (args) => (
    <Row>
      {buttonSizes.map((size) => (
        <ButtonLink {...args} key={size} size={size}>
          Size {size}
        </ButtonLink>
      ))}
    </Row>
  ),
};

/** The prop "icon": an icon before the text, in every variant. */
export const WithIcon: Story = {
  args: { icon: ArrowRight },
  render: Variants.render,
};

/**
 * The prop "linkComponent": the component of the app that renders the link.
 * A Next.js app gives the Link of "next/link". Here it is a small component
 * that renders an <a> with the attribute data-app-link.
 */
export const WithTheLinkComponentOfTheApp: Story = {
  args: { linkComponent: AppLink, variant: "secondary" },
};
