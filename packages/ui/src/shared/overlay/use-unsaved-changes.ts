"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { OVERLAY_PANEL_ATTRIBUTE, isTopmostOverlay } from "./use-overlay-layer.js";

/*
 * The question "discard the changes?" of Modal and Drawer. The rules are the
 * ones of the app Intraweb (components/ui/overlay.tsx).
 */

/** A field with this attribute, or inside an element with it, does not count as a change. It is the attribute of Intraweb. */
export const OVERLAY_IGNORE_DIRTY_ATTRIBUTE = "data-overlay-ignore-dirty";

/** true while a click that the person already agreed to lose their changes for is repeated. */
let isReplayingClick = false;

export type UnsavedChangesOptions = {
  /** false: the overlay never asks. The hook then only passes "onClose" on. */
  enabled: boolean;
  /** The panel of the overlay. */
  panelRef: RefObject<HTMLElement | null>;
  /** The token of the overlay, from useOverlayLayer. */
  token: symbol;
  /** Closes the overlay. */
  onClose: () => void;
};

export type UnsavedChanges = {
  /** Closes the overlay, or asks first when something was typed and not saved. */
  requestClose: () => void;
  /** true while the question is open. */
  isAsking: boolean;
  /** The person chose to lose the changes: does what was asked for (close, or the click behind the panel). */
  discard: () => void;
  /** The person chose to go on editing: closes the question. */
  keepEditing: () => void;
};

/**
 * Any "input" or "change" event inside the panel marks unsaved changes; a
 * "submit" event clears the mark. With unsaved changes:
 * - closing the overlay asks first;
 * - a click on the page behind the panel is stopped and asks first; after
 *   "discard", the same click is done again;
 * - the browser asks before the page is left or loaded again.
 */
export function useUnsavedChanges({ enabled, panelRef, token, onClose }: UnsavedChangesOptions): UnsavedChanges {
  const isDirty = useRef(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requestClose = useCallback(() => {
    if (enabled && isDirty.current) {
      setPendingAction(() => onClose);
    } else {
      onClose();
    }
  }, [enabled, onClose]);

  const discard = useCallback(() => {
    isDirty.current = false;
    const action = pendingAction;
    setPendingAction(null);
    action?.();
  }, [pendingAction]);

  const keepEditing = useCallback(() => setPendingAction(null), []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!enabled || panel === null) {
      return;
    }
    const markDirty = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest(`[${OVERLAY_IGNORE_DIRTY_ATTRIBUTE}]`) !== null) {
        return;
      }
      // Events of an overlay that is open above this one do not come here: it is rendered next to it, not inside.
      isDirty.current = true;
    };
    const markSaved = () => {
      isDirty.current = false;
    };
    panel.addEventListener("input", markDirty);
    panel.addEventListener("change", markDirty);
    panel.addEventListener("submit", markSaved);
    return () => {
      panel.removeEventListener("input", markDirty);
      panel.removeEventListener("change", markDirty);
      panel.removeEventListener("submit", markSaved);
    };
  }, [enabled, panelRef]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const handleOutsideClick = (event: MouseEvent) => {
      if (isReplayingClick || !isDirty.current || !isTopmostOverlay(token)) {
        return;
      }
      const target = event.target;
      if (!(target instanceof HTMLElement) || target.closest(`[${OVERLAY_PANEL_ATTRIBUTE}]`) !== null) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setPendingAction(() => () => {
        isReplayingClick = true;
        try {
          target.click();
        } finally {
          isReplayingClick = false;
        }
      });
    };
    // "true": before the click reaches the element, so the element does not act on it.
    document.addEventListener("click", handleOutsideClick, true);
    return () => document.removeEventListener("click", handleOutsideClick, true);
  }, [enabled, token]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty.current) {
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enabled]);

  return { requestClose, isAsking: pendingAction !== null, discard, keepEditing };
}
