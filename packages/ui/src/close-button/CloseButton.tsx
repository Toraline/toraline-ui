import { IconButton } from "../icon-button/IconButton.js";
import type { IconButtonProps } from "../icon-button/IconButton.js";
import type { IconComponent } from "../shared/icon.js";

/** The cross. The shape is the icon "x" of Lucide (https://lucide.dev, ISC license), the icon Intraweb shows. */
const CloseIcon: IconComponent = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export type CloseButtonProps = Omit<IconButtonProps, "icon" | "aria-label"> & {
  /** The name of the button for a screen reader. When missing: "Close". An app in another language gives its own word. */
  "aria-label"?: string;
};

/**
 * The button with a cross that closes a dialog, a side panel or a message.
 * It is an IconButton with the cross as its icon: the variant "ghost" and the
 * size "md" (40 pixels) unless the app gives others.
 *
 * - "onClick" is what the press does.
 * - Every other prop goes to the <button>, and "ref" points to it.
 */
export function CloseButton({ "aria-label": ariaLabel = "Close", ...buttonProps }: CloseButtonProps) {
  return <IconButton {...buttonProps} icon={CloseIcon} aria-label={ariaLabel} />;
}
