"use client";

import { cloneElement, isValidElement, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, ComponentProps, ReactElement, ReactNode } from "react";
import { computeAnchoredPosition } from "../anchored-panel/anchored-position.js";
import type { AnchoredSide } from "../anchored-panel/anchored-position.js";
import { classNames } from "../shared/class-names.js";
import { mergeRefs } from "../shared/merge-refs.js";
import type { TooltipSide } from "./tooltip-options.js";

/*
 * The classes are the ones of the Tooltip of the app Intraweb
 * (components/ui/tooltip.tsx): a small dark label next to an element.
 *
 * The tooltip is shown by CSS: while the pointer is over the element or over
 * the tooltip ("group-hover"), and while an element inside has the keyboard
 * focus ("group-has-focus-visible"). So it also works before the page's
 * JavaScript runs. The JavaScript of this file adds 2 things: Escape hides
 * the tooltip, and a tooltip that would leave the window is moved.
 */

/** The element around the child and the tooltip. The tooltip is placed from it. */
const rootClass = "group/tooltip relative inline-flex";

/**
 * The tooltip, hidden. "invisible" also takes it away from the pointer and
 * from a screen reader that reads the page in order; the element it describes
 * still gets its text. "before:" is an invisible strip between the element
 * and the tooltip, so the pointer can move onto the tooltip without leaving.
 */
const tooltipClass = classNames(
  "absolute z-50 rounded-md bg-tooltip px-2 py-1 font-body text-xs font-medium whitespace-nowrap text-inverse shadow-lg",
  "invisible opacity-0",
  "before:absolute before:content-['']",
  "motion-safe:transition-[opacity,visibility]",
);

/** The tooltip, shown: the pointer is over the group, or an element of the group has the keyboard focus. */
const shownClass = classNames(
  "group-hover/tooltip:visible group-hover/tooltip:opacity-100",
  "group-has-focus-visible/tooltip:visible group-has-focus-visible/tooltip:opacity-100",
);

/**
 * Where the tooltip is, for each side: 12 pixels to the side of the element,
 * or 8 pixels above or below it, centered. "left" and "bottom" are used only
 * when the side asked for has no room in the window.
 */
const sideClass: Record<AnchoredSide, string> = {
  right: "top-1/2 left-full ml-3 -translate-y-1/2 before:inset-y-0 before:-left-3 before:w-3",
  left: "top-1/2 right-full mr-3 -translate-y-1/2 before:inset-y-0 before:-right-3 before:w-3",
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2 before:inset-x-0 before:-bottom-2 before:h-2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2 before:inset-x-0 before:-top-2 before:h-2",
};

/** The space between the element and the tooltip, in pixels: "ml-3" and "mb-2". */
const sideGap: Record<AnchoredSide, number> = { right: 12, left: 12, top: 8, bottom: 8 };

/** Where the tooltip is after it was measured. */
type Placement = {
  /** The side that was asked for when it was measured. */
  askedSide: TooltipSide;
  /** The side it is on: the side asked for, or the opposite one. */
  side: AnchoredSide;
  /** The inline style that moves it along the element, when the centered place would leave the window. */
  style: CSSProperties | undefined;
};

export type TooltipProps = Omit<ComponentProps<"span">, "children"> & {
  /** The text of the tooltip. */
  label: ReactNode;
  /** The side of the element where the tooltip is shown. When there is no room there, it is shown on the opposite side. When missing: "right". */
  side?: TooltipSide;
  /** The element the tooltip belongs to: one element that can get the focus, for example a button or a link. */
  children: ReactNode;
};

/**
 * A small label that is shown next to an element while the pointer is over it
 * and while it has the keyboard focus.
 *
 * - A screen reader says the text: the element gets aria-describedby with the
 *   id of the tooltip. When the element already has the same text as its
 *   aria-label, the tooltip is not linked, so the text is not said twice.
 * - Escape hides the tooltip until the pointer or the focus leaves and comes back.
 * - The pointer can move from the element onto the tooltip.
 * - A tooltip that would leave the window is shown on the opposite side, or moved along the element.
 * - "className", every other prop and "ref" go to the outermost element, a <span> around the element and the tooltip.
 */
export function Tooltip({
  label,
  side = "right",
  className,
  children,
  ref,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...rootProps
}: TooltipProps) {
  const tooltipId = useId();
  const rootElement = useRef<HTMLSpanElement>(null);
  const tooltipElement = useRef<HTMLSpanElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [placement, setPlacement] = useState<Placement>();

  // What was measured counts only for the side it was measured for.
  const measured = placement?.askedSide === side ? placement : undefined;
  const shownSide = measured?.side ?? side;

  /** Measures the element and the tooltip, and keeps the tooltip inside the window. */
  const place = () => {
    const root = rootElement.current;
    const tooltip = tooltipElement.current;
    if (root === null || tooltip === null) {
      return;
    }
    const rect = root.getBoundingClientRect();
    const position = computeAnchoredPosition({
      anchor: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      panel: { width: tooltip.offsetWidth, height: tooltip.offsetHeight },
      viewport: { width: window.innerWidth, height: window.innerHeight },
      side,
      align: "center",
      gap: sideGap[side],
    });
    const isBeside = position.side === "right" || position.side === "left";
    // The classes center the tooltip on the element. When that place leaves the window, the style replaces the centering.
    const centered = isBeside
      ? rect.top + rect.height / 2 - tooltip.offsetHeight / 2
      : rect.left + rect.width / 2 - tooltip.offsetWidth / 2;
    const wanted = isBeside ? position.top : position.left;
    const along = isBeside ? { top: position.top - rect.top } : { left: position.left - rect.left };
    setPlacement({
      askedSide: side,
      side: position.side,
      style: wanted === centered ? undefined : { ...along, translate: "none" },
    });
  };

  const isActive = isHovered || hasFocus;

  // Escape hides the tooltip. The key stops here only when the tooltip was really shown.
  useEffect(() => {
    if (!isActive || isDismissed) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      const tooltip = tooltipElement.current;
      if (event.key !== "Escape" || tooltip === null) {
        return;
      }
      if (window.getComputedStyle(tooltip).visibility !== "hidden") {
        // The key does not also close a Modal or a Drawer that the element is in.
        event.stopPropagation();
        setIsDismissed(true);
      }
    };
    // "true": before any other element gets the key.
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [isActive, isDismissed]);

  const linkedChild = linkToTooltip(children, label, tooltipId);

  return (
    <span
      {...rootProps}
      ref={mergeRefs(rootElement, ref)}
      className={classNames(rootClass, className)}
      data-side={shownSide}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        setIsHovered(true);
        place();
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        setIsHovered(false);
        setIsDismissed(false);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        setHasFocus(true);
        place();
      }}
      onBlur={(event) => {
        onBlur?.(event);
        setHasFocus(false);
        setIsDismissed(false);
      }}
    >
      {linkedChild}
      <span
        ref={tooltipElement}
        role="tooltip"
        id={tooltipId}
        style={measured?.style}
        className={classNames(tooltipClass, sideClass[shownSide], !isDismissed && shownClass)}
        data-slot="tooltip"
      >
        {label}
      </span>
    </span>
  );
}

/**
 * Gives the child aria-describedby with the id of the tooltip, so a screen
 * reader says the text of the tooltip after the name of the element.
 * A child whose aria-label is the same text is left as it is.
 */
function linkToTooltip(children: ReactNode, label: ReactNode, tooltipId: string): ReactNode {
  if (!isValidElement(children)) {
    return children;
  }
  const child = children as ReactElement<{ "aria-label"?: string; "aria-describedby"?: string }>;
  if (typeof label === "string" && child.props["aria-label"] === label) {
    return child;
  }
  const describedBy = [child.props["aria-describedby"], tooltipId].filter(Boolean).join(" ");
  return cloneElement(child, { "aria-describedby": describedBy });
}
