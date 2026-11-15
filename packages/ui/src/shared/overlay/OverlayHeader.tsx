import type { ReactNode } from "react";
import { CloseButton } from "../../close-button/CloseButton.js";

/*
 * The header that Modal and Drawer share: the title, the actions of the app
 * and the button that closes the overlay. The classes are the ones of the app
 * Intraweb (components/ui/overlay.tsx).
 */

const headerClass =
  "flex items-center justify-between gap-3 border-b border-default py-3 pr-3 pl-4 md:pl-6";

/** The title has the values of Intraweb's text style "heading-section": the font of headings, 18 pixels, a line of 28 pixels, medium. */
const titleClass = "min-w-0 font-heading text-lg/7 font-medium text-primary";

const actionsClass = "flex shrink-0 items-center gap-1";

export type OverlayHeaderProps = {
  /** The id of the title. The panel names it in aria-labelledby. */
  id: string;
  /** The title of the overlay. */
  title: ReactNode;
  /** Buttons or links next to the title, before the button that closes the overlay. */
  actions?: ReactNode;
  /** The name of the button that closes the overlay, for a screen reader. */
  closeLabel: string;
  /** Called when a person presses the button that closes the overlay. */
  onClose: () => void;
};

/** This component is not exported from the package. */
export function OverlayHeader({ id, title, actions, closeLabel, onClose }: OverlayHeaderProps) {
  return (
    <div className={headerClass} data-slot="header">
      <h2 id={id} className={titleClass} data-slot="title">
        {title}
      </h2>
      <div className={actionsClass} data-slot="actions">
        {actions}
        <CloseButton aria-label={closeLabel} onClick={onClose} />
      </div>
    </div>
  );
}
