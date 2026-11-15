"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { createPortal } from "react-dom";
import { classNames } from "../shared/class-names.js";
import { focusRingClass } from "../shared/focus-ring.js";
import { mergeRefs } from "../shared/merge-refs.js";
import { tabbableElements } from "../shared/overlay/focusable.js";
import { OverlayHeader } from "../shared/overlay/OverlayHeader.js";
import { useIsClient } from "../shared/overlay/use-is-client.js";
import { OVERLAY_PANEL_ATTRIBUTE, useOverlayLayer } from "../shared/overlay/use-overlay-layer.js";

/*
 * The classes of Drawer are the ones of the Drawer of the app Intraweb
 * (components/ui/overlay.tsx). On a narrow screen the panel covers the screen;
 * from the breakpoint "md" of Tailwind CSS (768 pixels) it is a panel on the
 * right side with round corners on its left.
 */

/** The panel: the full height of the window, on the right. It shows no outline when it has the focus itself. */
const panelClass =
  "fixed inset-y-0 right-0 z-40 flex w-full flex-col bg-surface shadow-2xl focus:outline-none md:rounded-l-2xl";

/** The widest the panel gets from the breakpoint "md": 512 pixels, or 896 pixels for a wide panel. */
const narrowClass = "md:max-w-lg";
const wideClass = "md:max-w-4xl";

/**
 * The content. It scrolls; the header and the footer stay in place. When it
 * can get the focus (see below), the focus ring is drawn inside it.
 */
const bodyClass = classNames(
  "flex-1 overflow-y-auto p-4 md:p-6",
  focusRingClass,
  "focus-visible:-outline-offset-2",
);

/** The footer: its buttons are on the right. */
const footerClass = "flex flex-wrap justify-end gap-2 border-t border-default px-4 py-3 md:px-6";

export type DrawerProps = Omit<ComponentProps<"div">, "title"> & {
  /** The title of the panel. It is also its name for a screen reader. */
  title: ReactNode;
  /**
   * Called when a person closes the panel: the button with the cross or the
   * Escape key. The app then stops rendering the Drawer.
   */
  onClose: () => void;
  /** Buttons or links next to the title, before the button that closes the panel. */
  actions?: ReactNode;
  /**
   * Stays at the bottom of the panel, outside the part that scrolls, for
   * example the button "Save" of a form (a button with form="the id of the form").
   */
  footer?: ReactNode;
  /** true for a wide panel (896 pixels), for a form with a table. When missing: false (512 pixels). */
  wide?: boolean;
  /** The name of the button that closes the panel, for a screen reader. When missing: "Close". */
  closeLabel?: string;
};

/**
 * A panel on the right side of the screen that leaves the page next to it
 * visible and usable, for example the details of the row a person chose in a list.
 *
 * The app renders it while it is open, and stops rendering it in "onClose":
 * {isOpen ? <Drawer title="Order 12" onClose={close}>...</Drawer> : null}
 *
 * - The focus goes into the panel when it opens: to the element with the
 *   attribute data-overlay-autofocus, or to the panel itself.
 * - Tab and Shift+Tab stay inside the panel while the focus is in it.
 * - Escape closes the panel. With several overlays open, only the newest.
 * - When it closes, the focus goes back to the element that had it before.
 * - The page next to the panel can still be clicked: the panel has no dark layer.
 * - While it is open, <body> has the attribute data-drawer-open ("narrow" or
 *   "wide"), so the CSS of the app can make room for the panel.
 * - "className", every other prop and "ref" go to the panel, the element with role="dialog".
 */
export function Drawer(props: DrawerProps) {
  // The panel is rendered into <body>, which the server does not have.
  return useIsClient() ? <DrawerPanel {...props} /> : null;
}

function DrawerPanel({
  title,
  onClose,
  actions,
  footer,
  wide = false,
  closeLabel = "Close",
  className,
  children,
  ref,
  ...panelProps
}: DrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [isBodyInTabOrder, setIsBodyInTabOrder] = useState(false);

  useOverlayLayer({ panelRef, onEscape: onClose, containFocus: false });

  // Content with nothing to stop at (only text) is put in the Tab order itself,
  // so a person who uses the keyboard can scroll it with the arrow keys.
  useEffect(() => {
    const body = bodyRef.current;
    if (body !== null) {
      setIsBodyInTabOrder(tabbableElements(body).length === 0);
    }
  });

  // The CSS of the app can make room for the panel: body[data-drawer-open="narrow"] main { ... }
  useEffect(() => {
    document.body.dataset.drawerOpen = wide ? "wide" : "narrow";
    return () => {
      delete document.body.dataset.drawerOpen;
    };
  }, [wide]);

  return createPortal(
    <div
      aria-labelledby={titleId}
      {...panelProps}
      ref={mergeRefs(panelRef, ref)}
      {...{ [OVERLAY_PANEL_ATTRIBUTE]: "" }}
      role="dialog"
      aria-modal="false"
      tabIndex={-1}
      className={classNames(panelClass, wide ? wideClass : narrowClass, className)}
      data-wide={wide}
    >
      <OverlayHeader id={titleId} title={title} actions={actions} closeLabel={closeLabel} onClose={onClose} />
      <div ref={bodyRef} className={bodyClass} data-slot="body" tabIndex={isBodyInTabOrder ? 0 : undefined}>
        {children}
      </div>
      {footer === undefined || footer === null || footer === false ? null : (
        <div className={footerClass} data-slot="footer">
          {footer}
        </div>
      )}
    </div>,
    document.body,
  );
}
