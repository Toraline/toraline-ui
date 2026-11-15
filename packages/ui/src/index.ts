/**
 * @toraline.tech/ui
 *
 * The styled components of the Toraline component library.
 * Each component has its own folder in src/ and is exported here.
 * The parts of the theme (provider, hook, toggle) are in "@toraline.tech/ui/theme".
 */
export const packageName = "@toraline.tech/ui";

export type { IconComponent } from "./shared/icon.js";

export { Button, ButtonLink, buttonSizes, buttonVariants } from "./button/index.js";
export type { ButtonLinkProps, ButtonProps, ButtonSize, ButtonVariant } from "./button/index.js";

export { Field } from "./field/index.js";
export type { FieldControlProps, FieldProps } from "./field/index.js";

export { IconButton, iconButtonSizes, iconButtonVariants } from "./icon-button/index.js";
export type {
  IconButtonProps,
  IconButtonSize,
  IconButtonVariant,
} from "./icon-button/index.js";

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
