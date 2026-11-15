"use client";

import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";
import { useAnchoredPanel } from "../anchored-panel/use-anchored-panel.js";
import { Button } from "../button/Button.js";
import { classNames } from "../shared/class-names.js";
import { mergeRefs } from "../shared/merge-refs.js";
import type { PopoverAlign } from "./popover-options.js";

/*
 * The classes are the ones of the Popover of the app Intraweb
 * (components/ui/popover.tsx). The panel stays inside the element around the
 * button, right after the button, so the Tab key goes from the button into
 * the panel.
 */

/** The element around the button and the panel. The position of the panel is measured from it. */
const rootClass = "relative";

/** The panel: above the page content, 8 pixels from the button. */
const panelClass = "absolute z-30 rounded-lg border border-subtle bg-surface p-4 shadow-lg";

/** The space between the button and the panel, in pixels: the "mt-2" of Intraweb. */
const PANEL_GAP = 8;

export type PopoverProps = Omit<ComponentProps<"button">, "children"> & {
  /** The text of the button that opens the panel. */
  label: ReactNode;
  /**
   * The content of the panel: elements, or a function that receives "close"
   * and returns elements, for a panel with a button that closes it.
   */
  children: ReactNode | ((close: () => void) => ReactNode);
  /** Which edges of the button and the panel line up. When missing: "left". */
  align?: PopoverAlign;
  /** Classes for the panel, for example its width. They come after the library's classes. */
  panelClassName?: string;
};

/**
 * A button with a floating panel under it, for example the list of columns of
 * a table or its filters.
 *
 * - A press on the button opens the panel, and a second press closes it.
 * - Escape, with the focus on the button or inside the panel, closes the panel
 *   and gives the focus to the button. It does not reach a dialog under it.
 * - A press outside the button and the panel closes the panel.
 * - The panel opens under the button, above it when there is no room below,
 *   and stays inside the window.
 * - "aria-label" is the name of the button when "label" is not plain text.
 * - "className" goes to the outermost element, which holds the button and the
 *   panel. Every other prop and "ref" go to the <button>.
 */
export function Popover({
  label,
  children,
  align = "left",
  panelClassName,
  className,
  onClick,
  ref,
  ...buttonProps
}: PopoverProps) {
  const { open, toggle, close, triggerRef, panelRef, panelStyle, placed, side, handleEscape } =
    useAnchoredPanel({ align, gap: PANEL_GAP, strategy: "absolute" });
  const panelId = useId();

  return (
    <div
      className={classNames(rootClass, className)}
      data-align={align}
      onKeyDown={open ? handleEscape : undefined}
    >
      <Button
        {...buttonProps}
        ref={mergeRefs(triggerRef, ref)}
        variant="secondary"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        data-slot="trigger"
        onClick={(event) => {
          onClick?.(event);
          toggle();
        }}
      >
        {label}
      </Button>
      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          style={panelStyle}
          className={classNames(panelClass, !placed && "invisible", panelClassName)}
          data-slot="panel"
          data-side={side}
        >
          {typeof children === "function" ? children(() => close()) : children}
        </div>
      ) : null}
    </div>
  );
}
