/**
 * @toraline/ui
 *
 * The styled components of the Toraline component library.
 * Each component has its own folder in src/ and is exported here.
 * The parts of the theme (provider, hook, toggle) are in "@toraline/ui/theme".
 */
export const packageName = "@toraline/ui";

export { Button, buttonSizes, buttonVariants } from "./button";
export type { ButtonProps, ButtonSize, ButtonVariant } from "./button";

export { Input } from "./input";
export type { InputProps } from "./input";

export { Toggle } from "./toggle";
export type { ToggleProps } from "./toggle";

export { Tabs } from "./tabs";
export type { TabItem, TabsProps } from "./tabs";

export { BreadCrumbs } from "./breadcrumbs";
export type { BreadCrumbsProps, Crumb } from "./breadcrumbs";

export { SplitButton, splitButtonMenuPlacements } from "./split-button";
export type {
  SplitButtonItem,
  SplitButtonMenuPlacement,
  SplitButtonProps,
} from "./split-button";
