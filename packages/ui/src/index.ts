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

export { TextInput } from "./text-input/index.js";
export type { TextInputProps } from "./text-input/index.js";

export { controlSizes } from "./shared/control.js";
export type { ControlSize } from "./shared/control.js";

export { Toggle } from "./toggle/index.js";
export type { ToggleProps } from "./toggle/index.js";

export { TabNav, tabNavVariants } from "./tab-nav/index.js";
export type { TabNavItem, TabNavProps, TabNavVariant } from "./tab-nav/index.js";

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

// Phase 8: forms and feedback
export { Select } from "./select/index.js";
export type { SelectProps } from "./select/index.js";

export { Textarea } from "./textarea/index.js";
export type { TextareaProps } from "./textarea/index.js";

export { DecimalInput, decimalToInput, parseDecimalInput } from "./decimal-input/index.js";
export type { DecimalInputProps } from "./decimal-input/index.js";

export { Checkbox, CheckboxControl } from "./checkbox/index.js";
export type { CheckboxControlProps, CheckboxProps } from "./checkbox/index.js";

export { StatusBadge, statusBadgeVariants } from "./status-badge/index.js";
export type { StatusBadgeProps, StatusBadgeVariant } from "./status-badge/index.js";

export { CountBadge, countBadgeVariants } from "./count-badge/index.js";
export type { CountBadgeProps, CountBadgeVariant } from "./count-badge/index.js";

export { Panel } from "./panel/index.js";
export type { PanelProps } from "./panel/index.js";

export { EmptyState } from "./empty-state/index.js";
export type { EmptyStateProps } from "./empty-state/index.js";

export { StatCard, statCardTones } from "./stat-card/index.js";
export type {
  StatCardProgress,
  StatCardProps,
  StatCardTone,
  StatCardTrend,
} from "./stat-card/index.js";

export { ProgressBar, ProgressRing, progressRingSizes, progressTones } from "./progress/index.js";
export type {
  ProgressBarProps,
  ProgressRingProps,
  ProgressRingSize,
  ProgressTone,
} from "./progress/index.js";

// Phase 9: overlays
export {
  anchoredAligns,
  anchoredSides,
  computeAnchoredPosition,
  useAnchoredPanel,
} from "./anchored-panel/index.js";
export type {
  AnchoredAlign,
  AnchoredBox,
  AnchoredPanel,
  AnchoredPosition,
  AnchoredPositionOptions,
  AnchoredSide,
  AnchoredSize,
  AnchoredStyle,
  UseAnchoredPanelOptions,
} from "./anchored-panel/index.js";

export { CloseButton } from "./close-button/index.js";
export type { CloseButtonProps } from "./close-button/index.js";

export { Modal, modalSizes } from "./modal/index.js";
export type { ModalProps, ModalSize } from "./modal/index.js";

export { Drawer } from "./drawer/index.js";
export type { DrawerProps } from "./drawer/index.js";

export { DiscardConfirmation } from "./discard-confirmation/index.js";
export type {
  DiscardConfirmationProps,
  DiscardConfirmationTexts,
} from "./discard-confirmation/index.js";

export { DeleteOverlay } from "./delete-overlay/index.js";
export type { DeleteOverlayProps } from "./delete-overlay/index.js";

export { ActionMenu, actionMenuTriggers } from "./action-menu/index.js";
export type { ActionMenuItem, ActionMenuProps, ActionMenuTrigger } from "./action-menu/index.js";

export { Popover, popoverAligns } from "./popover/index.js";
export type { PopoverAlign, PopoverProps } from "./popover/index.js";

export { Tooltip, tooltipSides } from "./tooltip/index.js";
export type { TooltipProps, TooltipSide } from "./tooltip/index.js";

// Phase 10: data
export {
  ActionsTh,
  DataTable,
  DataTableMessage,
  Td,
  Th,
  Tr,
  tableCellAlignments,
} from "./data-table/index.js";
export type {
  ActionsThProps,
  DataTableMessageProps,
  DataTableProps,
  TableCellAlignment,
  TdProps,
  ThProps,
  TrProps,
} from "./data-table/index.js";
export { DataGrid, dataGridPageSizes } from "./data-grid/index.js";
export type {
  DataGridCheckboxProps,
  DataGridColumn,
  DataGridGroup,
  DataGridLabels,
  DataGridProps,
  DataGridSelectProps,
  DataGridSort,
  DataGridState,
} from "./data-grid/index.js";
export { ListItem } from "./list-item/index.js";
export type { ListItemProps } from "./list-item/index.js";
export { DetailPanel } from "./detail-panel/index.js";
export type { DetailField, DetailPanelProps } from "./detail-panel/index.js";
