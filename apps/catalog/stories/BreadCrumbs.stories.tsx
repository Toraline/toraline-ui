import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { BreadCrumbs } from "@toraline/ui";

// The addresses start with "#", so a press on a link does not leave the story.
const crumbs = [
  { label: "Clients", href: "#clients" },
  { label: "Fernando Dias", href: "#client-12" },
  { label: "Orders", href: "#orders" },
];

/**
 * Stands for the link component of an app, for example the Link of next/link.
 * It marks its links with the attribute data-app-link.
 */
function AppLink(props: ComponentProps<"a">) {
  return <a {...props} data-app-link="true" />;
}

/**
 * Breadcrumbs are the path from the first page of the app to the current
 * page, as a row of links.
 */
const meta = {
  title: "Components/BreadCrumbs",
  component: BreadCrumbs,
  args: { crumbs },
} satisfies Meta<typeof BreadCrumbs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 3 steps. The last step is the current page: it is text, not a link. */
export const Default: Story = {};

/** 1 step: only the current page. */
export const OneStep: Story = {
  args: { crumbs: crumbs.slice(0, 1) },
};

/** A step with no "href" is text, not a link. Here it is the second step. */
export const StepWithNoLink: Story = {
  args: {
    crumbs: [{ label: "Clients", href: "#clients" }, { label: "Fernando Dias" }, { label: "Orders" }],
  },
};

/**
 * The prop "linkComponent" names the component that renders each link.
 * A Next.js app gives the Link of next/link. This story gives a small component of its own.
 */
export const WithLinkComponent: Story = {
  args: { linkComponent: AppLink },
};
