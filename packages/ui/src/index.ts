/**
 * @toraline.tech/ui
 *
 * The styled components of the Toraline component library.
 * Each component has its own folder in src/ and is exported here.
 * The parts of the theme (provider, hook, toggle) are in "@toraline.tech/ui/theme".
 */
export const packageName = "@toraline.tech/ui";

export { Button, buttonSizes, buttonVariants } from "./button/index.js";
export type { ButtonProps, ButtonSize, ButtonVariant } from "./button/index.js";

export { Input } from "./input/index.js";
export type { InputProps } from "./input/index.js";

export { Toggle } from "./toggle/index.js";
export type { ToggleProps } from "./toggle/index.js";

export { Tabs } from "./tabs/index.js";
export type { TabItem, TabsProps } from "./tabs/index.js";

export { BreadCrumbs } from "./breadcrumbs/index.js";
export type { BreadCrumbsProps, Crumb } from "./breadcrumbs/index.js";

export { SplitButton, splitButtonMenuPlacements } from "./split-button/index.js";
export type {
  SplitButtonItem,
  SplitButtonMenuPlacement,
  SplitButtonProps,
} from "./split-button/index.js";
