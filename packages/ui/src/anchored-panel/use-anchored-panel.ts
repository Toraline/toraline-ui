"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, RefObject } from "react";
import { computeAnchoredPosition, toAnchoredStyle } from "./anchored-position.js";
import type { AnchoredAlign, AnchoredBox, AnchoredSide, AnchoredStyle } from "./anchored-position.js";

export type UseAnchoredPanelOptions = {
  /** The side of the button where the panel opens. When there is no room there, it opens on the other side. When missing: "bottom". */
  side?: Extract<AnchoredSide, "bottom" | "top">;
  /** Which edge of the button the panel lines up with. When missing: "right". */
  align?: AnchoredAlign;
  /** The space between the button and the panel, in pixels. When missing: 4. */
  gap?: number;
  /**
   * How the panel is positioned. "fixed": the panel has "position: fixed" and
   * is measured from the window; use it for a panel rendered in <body> (a
   * portal). "absolute": the panel has "position: absolute" and is measured
   * from the positioned element around it. When missing: "fixed".
   */
  strategy?: "fixed" | "absolute";
};

export type AnchoredPanel<TriggerElement extends HTMLElement, PanelElement extends HTMLElement> = {
  /** true while the panel is open. */
  open: boolean;
  /** Opens the panel when it is closed, and closes it when it is open. */
  toggle: () => void;
  /** Opens the panel. */
  show: () => void;
  /** Closes the panel. With restoreFocus, the button that opened it gets the focus. */
  close: (options?: { restoreFocus?: boolean }) => void;
  /** Give it to the button that opens the panel. */
  triggerRef: RefObject<TriggerElement | null>;
  /** Give it to the panel. */
  panelRef: RefObject<PanelElement | null>;
  /** The CSS position of the panel. Before the panel is measured, it is the top left corner. */
  panelStyle: AnchoredStyle;
  /** false until the panel is measured and placed. Hide the panel (the class "invisible") while it is false. */
  placed: boolean;
  /** The side the panel is on, after it is placed. */
  side: AnchoredSide;
  /** Give it to onKeyDown of the panel: Escape closes the panel, gives the focus back, and does not reach a dialog under it. */
  handleEscape: (event: KeyboardEvent<HTMLElement>) => void;
};

type Placement = { style: AnchoredStyle; side: AnchoredSide };

/** The box that the CSS position of the panel is measured from. */
function containerBox(panel: HTMLElement, strategy: "fixed" | "absolute"): AnchoredBox {
  const container = strategy === "absolute" ? panel.offsetParent : null;
  if (container === null) {
    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
  }
  // "position: absolute" is measured from inside the border of the container.
  const rect = container.getBoundingClientRect();
  return {
    top: rect.top + container.clientTop,
    left: rect.left + container.clientLeft,
    width: container.clientWidth,
    height: container.clientHeight,
  };
}

/**
 * A floating panel that belongs to a button: a menu of actions, a popover, a
 * filter. This hook is the one of the app Intraweb
 * (components/ui/use-anchored-panel.ts).
 *
 * - It keeps whether the panel is open.
 * - It places the panel next to the button: on the side asked for, on the
 *   other side when there is no room, and never closer than 8 pixels to the
 *   left and right edges of the window.
 * - It places the panel again when the page scrolls, when the window changes
 *   its size and when the panel changes its size.
 * - A press outside the panel and the button closes the panel.
 * - Escape closes the panel and gives the focus back to the button.
 */
export function useAnchoredPanel<
  TriggerElement extends HTMLElement = HTMLButtonElement,
  PanelElement extends HTMLElement = HTMLDivElement,
>({
  side = "bottom",
  align = "right",
  gap,
  strategy = "fixed",
}: UseAnchoredPanelOptions = {}): AnchoredPanel<TriggerElement, PanelElement> {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<Placement>();
  const triggerRef = useRef<TriggerElement>(null);
  const panelRef = useRef<PanelElement>(null);

  const close = ({ restoreFocus = false } = {}) => {
    setOpen(false);
    setPlacement(undefined);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  };

  const place = () => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (trigger === null || panel === null) {
      return;
    }
    const rect = trigger.getBoundingClientRect();
    const panelSize = { width: panel.offsetWidth, height: panel.offsetHeight };
    const position = computeAnchoredPosition({
      anchor: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      panel: panelSize,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      side,
      align,
      gap,
    });
    const style = toAnchoredStyle(position, panelSize, align, containerBox(panel, strategy));
    setPlacement((current) => {
      const isSame =
        current !== undefined &&
        current.side === position.side &&
        current.style.top === style.top &&
        current.style.bottom === style.bottom &&
        current.style.left === style.left &&
        current.style.right === style.right;
      return isSame ? current : { style, side: position.side };
    });
  };

  // Measures and places the panel before the browser paints it.
  useLayoutEffect(() => {
    if (open) {
      place();
    }
    // "place" reads only refs and the options. Placing on every render would
    // move the panel while a person types in it.
  }, [open, side, align, gap, strategy]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        !panelRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        close();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    // "true": also the scroll of an element inside the page, for example a table.
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    // A panel whose content changes (a list that is filtered) is placed again.
    const resizeObserver = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(place);
    if (panelRef.current !== null) {
      resizeObserver?.observe(panelRef.current);
    }
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      resizeObserver?.disconnect();
    };
  }, [open, side, align, gap, strategy]);

  const handleEscape = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      // The key does not reach a Modal or a Drawer that is open under the panel.
      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();
      close({ restoreFocus: true });
    }
  };

  return {
    open,
    toggle: () => (open ? close() : setOpen(true)),
    show: () => setOpen(true),
    close,
    triggerRef,
    panelRef,
    panelStyle: placement?.style ?? { top: 0, left: 0 },
    placed: placement !== undefined,
    side: placement?.side ?? side,
    handleEscape,
  };
}
