import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { TabNav, tabNavVariants } from "@toraline.tech/ui";
import type { TabNavProps } from "@toraline.tech/ui";
import { optionList } from "./shared/option-list";

const salesItems = [
  { href: "/sales", label: "Overview", exact: true },
  { href: "/sales/orders", label: "Orders" },
  { href: "/sales/clients", label: "Clients" },
  { href: "/sales/reports", label: "Reports" },
];

const manyItems = [
  "Overview",
  "Orders",
  "Clients",
  "Products",
  "Stock",
  "Suppliers",
  "Invoices",
  "Reports",
  "Settings",
].map((label) => ({ href: `/sales/${label.toLowerCase()}`, label }));

/**
 * The catalog has no routes. This wrapper stands for the app: it holds the
 * current path, and its link component changes that path on a press, in the
 * place of a real navigation. A Next.js app gives usePathname() and the Link
 * of "next/link".
 */
function TabNavWithRoutes({ currentPath: firstPath, ...tabNavProps }: TabNavProps) {
  const [currentPath, setCurrentPath] = useState(firstPath);

  const RouteLink = ({ href, ...anchorProps }: ComponentProps<"a">) => (
    <a
      {...anchorProps}
      href={href}
      onClick={(event) => {
        event.preventDefault();
        setCurrentPath(href ?? "");
      }}
    />
  );

  return (
    <div className="grid gap-4">
      <TabNav {...tabNavProps} currentPath={currentPath} linkComponent={RouteLink} />
      <p className="text-sm/5 text-secondary">The current path: {currentPath}</p>
    </div>
  );
}

/**
 * Tabs where each tab is a link to a route of the app. The current tab has
 * aria-current="page". The story "Variants" reads the list tabNavVariants of the library.
 */
const meta = {
  title: "Components/TabNav",
  component: TabNav,
  args: {
    items: salesItems,
    currentPath: "/sales",
    "aria-label": "Sales",
  },
  argTypes: {
    variant: optionList(tabNavVariants, "inline-radio"),
    // A component cannot be edited in the panel "Controls".
    linkComponent: { control: false },
  },
  render: (args) => <TabNavWithRoutes {...args} />,
} satisfies Meta<typeof TabNav>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The look "primary": a row with a line under it, and a line in the brand color under the current tab. */
export const Primary: Story = {};

/** The look "secondary": the segmented control. The current tab is a raised white piece. */
export const Secondary: Story = {
  args: { variant: "secondary" },
};

/** Every variant. */
export const Variants: Story = {
  render: (args) => (
    <div className="grid gap-8">
      {tabNavVariants.map((variant) => (
        <TabNavWithRoutes {...args} key={variant} variant={variant} aria-label={`Sales, ${variant}`} />
      ))}
    </div>
  ),
};

/**
 * A press on a tab goes to its route, and that tab becomes the current one.
 * The story presses the tab "Clients" by itself.
 */
export const AfterAPress: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
    await userEvent.click(canvas.getByRole("link", { name: "Clients" }));
    await expect(canvas.getByRole("link", { name: "Clients" })).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByRole("link", { name: "Overview" })).not.toHaveAttribute("aria-current");
  },
};

/** A tab is also the current one on a route under its own: here the path is the page of one order. */
export const OnARouteUnderATab: Story = {
  args: { currentPath: "/sales/orders/12" },
};

/** The state with the keyboard focus on a tab. The focus ring of "primary" is drawn inside the tab. */
export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: "Orders" });
    link.focus();
    await expect(link).toHaveFocus();
  },
};

/**
 * Many tabs in a narrow container, in both looks. "primary": below the
 * breakpoint "md" the row scrolls sideways and its right edge fades out; from
 * "md" the tabs go to a second line. "secondary": the track scrolls sideways.
 */
export const ManyTabs: Story = {
  args: { items: manyItems, currentPath: "/sales/orders" },
  render: (args) => (
    <div className="grid max-w-sm gap-8">
      {tabNavVariants.map((variant) => (
        <TabNavWithRoutes {...args} key={variant} variant={variant} aria-label={`Sales, ${variant}`} />
      ))}
    </div>
  ),
};
