import type { ComponentType } from "react";

/**
 * An icon that an app gives to a component: a React component that draws one
 * icon as an <svg>.
 *
 * The library draws the icon itself, so it gives the icon 2 props: "className"
 * (the size of the icon) and aria-hidden="true" (the icon is decoration, so a
 * screen reader skips it). The icon takes its color from the text color
 * ("currentColor").
 *
 * An icon of the package "lucide-react" has this shape: <Button icon={Plus}>.
 * The library does not depend on "lucide-react". Any component that accepts
 * the 2 props works.
 */
export type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;
