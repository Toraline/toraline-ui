"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { tabbableElements } from "./focusable.js";

/*
 * What every overlay that takes the focus shares (Modal, Drawer,
 * DiscardConfirmation). The rules are the ones of the app Intraweb
 * (components/ui/overlay.tsx), plus the Tab key that stays inside.
 */

/**
 * An element with this attribute counts as part of the open overlays: a click
 * on it is not a click "behind" an overlay, and the focus may be on it while a
 * Modal is open. The panel of every overlay has it, and so does a menu that is
 * rendered in <body>. It is the attribute of Intraweb.
 */
export const OVERLAY_PANEL_ATTRIBUTE = "data-overlay-panel";

/** The element with this attribute gets the focus when the overlay opens, in the place of the panel. It is the attribute of Intraweb. */
export const OVERLAY_AUTOFOCUS_ATTRIBUTE = "data-overlay-autofocus";

/** The open overlays, from the oldest to the newest. One list for the whole page. */
const openOverlays: symbol[] = [];

/** true when this overlay is the newest open one: the one a key press belongs to. */
export function isTopmostOverlay(token: symbol): boolean {
  return openOverlays.at(-1) === token;
}

/** The token of one overlay: what the list of open overlays holds for it. It stays the same while the overlay is on the page. */
export function useOverlayToken(): symbol {
  const tokenRef = useRef<symbol | null>(null);
  if (tokenRef.current === null) {
    tokenRef.current = Symbol("overlay");
  }
  return tokenRef.current;
}

export type OverlayLayerOptions = {
  /** The token of the overlay, from useOverlayToken. */
  token: symbol;
  /** The panel of the overlay: the element with the role "dialog". */
  panelRef: RefObject<HTMLElement | null>;
  /** Called when a person presses Escape while this overlay is the newest open one. */
  onEscape: () => void;
  /**
   * true for an overlay that covers the page (Modal, DiscardConfirmation): the
   * focus is brought back when it lands outside. false for an overlay that
   * leaves the page usable (Drawer): the Tab key stays inside while the focus
   * is inside, and a person can still click the page.
   */
  containFocus: boolean;
};

/**
 * 1. Puts the overlay on the list of open overlays while it is on the page.
 * 2. When it opens, the focus goes to the element with data-overlay-autofocus,
 *    or to the panel. When it closes, the focus goes back to where it was.
 * 3. Escape reaches only the newest overlay.
 * 4. Tab and Shift+Tab stay inside the panel: after the last element comes the first.
 */
export function useOverlayLayer({ token, panelRef, onEscape, containFocus }: OverlayLayerOptions): void {
  useEffect(() => {
    openOverlays.push(token);
    return () => {
      openOverlays.splice(openOverlays.indexOf(token), 1);
    };
  }, [token]);

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = panelRef.current;
    (panel?.querySelector<HTMLElement>(`[${OVERLAY_AUTOFOCUS_ATTRIBUTE}]`) ?? panel)?.focus();
    return () => previous?.focus();
  }, [panelRef]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isTopmostOverlay(token)) {
        return;
      }
      if (event.key === "Escape") {
        onEscape();
        return;
      }
      const panel = panelRef.current;
      if (event.key !== "Tab" || panel === null) {
        return;
      }
      const active = document.activeElement;
      const tabbable = tabbableElements(panel);
      const first = tabbable[0];
      const last = tabbable[tabbable.length - 1];
      const isInside = active instanceof Node && panel.contains(active);
      if (!isInside) {
        // The focus is on the page (after a click on the backdrop) or in a menu that the overlay opened.
        const isInFloatingPanel = active instanceof Element && active.closest(`[${OVERLAY_PANEL_ATTRIBUTE}]`) !== null;
        if (containFocus && !isInFloatingPanel) {
          event.preventDefault();
          (first ?? panel).focus();
        }
        return;
      }
      if (first === undefined || last === undefined) {
        // Nothing to stop at: the focus stays on the panel.
        event.preventDefault();
        panel.focus();
      } else if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [token, panelRef, onEscape, containFocus]);

  useEffect(() => {
    if (!containFocus) {
      return;
    }
    // The focus landed outside by another way than the Tab key, for example a script of the app.
    const handleFocusIn = (event: FocusEvent) => {
      const panel = panelRef.current;
      const target = event.target;
      if (!isTopmostOverlay(token) || panel === null || !(target instanceof Element)) {
        return;
      }
      if (!panel.contains(target) && target.closest(`[${OVERLAY_PANEL_ATTRIBUTE}]`) === null) {
        panel.focus();
      }
    };
    document.addEventListener("focusin", handleFocusIn);
    return () => document.removeEventListener("focusin", handleFocusIn);
  }, [token, panelRef, containFocus]);
}
