"use client";

import { useId, useState } from "react";
import type { ComponentProps, KeyboardEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useAnchoredPanel } from "../anchored-panel/use-anchored-panel.js";
import { Button } from "../button/Button.js";
import { IconButton } from "../icon-button/IconButton.js";
import { classNames } from "../shared/class-names.js";
import type { IconComponent } from "../shared/icon.js";
import { Menu, menuFocusTargetOfKey } from "../shared/menu/Menu.js";
import type { MenuFocusTarget } from "../shared/menu/Menu.js";
import { mergeRefs } from "../shared/merge-refs.js";
import { OVERLAY_PANEL_ATTRIBUTE } from "../shared/overlay/use-overlay-layer.js";
import type { ActionMenuTrigger } from "./action-menu-options.js";

/*
 * The classes are the ones of the ActionMenu of the app Intraweb
 * (components/ui/action-menu.tsx). The look of the menu and of an action, and
 * the keyboard, are in the menu that SplitButton and ActionMenu share
 * (shared/menu/Menu.tsx).
 */

/** The menu is rendered in <body> with a fixed position, so a table or a side panel that scrolls does not cut it. */
const menuPlaceClass = "fixed z-50 min-w-48";

/** The icon of an action: 16 pixels, in the color of an icon. */
const itemIconClass = "size-4 shrink-0 text-icon";

/** The arrow of the trigger "button": the size of the icon of a small Button. */
const arrowClass = "size-4";

/** The 3 dots. The shape is the icon "ellipsis" of Lucide (https://lucide.dev, ISC license), the icon Intraweb shows. */
const DotsIcon: IconComponent = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

/** One action of the menu. */
export type ActionMenuItem = {
  /** A value that is different for each action of one menu. */
  key: string;
  /** The text of the action. */
  label: ReactNode;
  /** An icon shown before the text: a component that draws an <svg>. It is decoration: a screen reader skips it. */
  icon?: IconComponent;
  /** Called when a person chooses the action. */
  onSelect: () => void;
  /** true: the action is shown and cannot be chosen. */
  disabled?: boolean;
  /** Why the action cannot be chosen. A screen reader says it, and the pointer over the action shows it. */
  hint?: string;
};

export type ActionMenuProps = Omit<ComponentProps<"button">, "aria-label" | "children"> & {
  /** The actions, in the order they are shown. With no action, the component renders nothing. */
  items: readonly ActionMenuItem[];
  /**
   * The name of the button and of the menu for a screen reader, for example
   * "Actions of Ana". It is required: the button "icon" has no text. For the
   * button "button", start it with the text the button shows.
   */
  "aria-label": string;
  /** The button that opens the menu. "icon": 3 dots. "button": a text and an arrow. When missing: "icon". */
  trigger?: ActionMenuTrigger;
  /** The text of the button, for the trigger "button", for example "Actions". */
  children?: ReactNode;
};

/**
 * A button that opens a menu of actions, for example the actions of one row of a table.
 *
 * - The menu opens under the button, lined up to its right edge. It opens
 *   above when there is no room below, and stays inside the window.
 * - Keyboard, on the button: Enter, Space and Down arrow open the menu with
 *   the focus on the first action; Up arrow opens it with the focus on the last.
 * - Keyboard, in the menu: the arrows move between actions and go around, Home
 *   and End go to the first and the last, a letter goes to the next action
 *   that starts with it, Enter and Space choose the action, Escape closes the
 *   menu and gives the focus back to the button, Tab closes the menu.
 * - A press outside the menu closes it.
 * - "disabled" disables the button. "className", every other prop and "ref" go to the button.
 */
export function ActionMenu({
  items,
  "aria-label": ariaLabel,
  trigger = "icon",
  children,
  onClick,
  onKeyDown,
  ref,
  ...buttonProps
}: ActionMenuProps) {
  const { open, toggle, show, close, triggerRef, panelRef, panelStyle, placed } = useAnchoredPanel();
  const menuId = useId();
  // Which action gets the focus when the menu opens.
  const [focusOnOpen, setFocusOnOpen] = useState<MenuFocusTarget>("first");

  if (items.length === 0) {
    return null;
  }

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    const focusTarget = menuFocusTargetOfKey(event.key);
    if (focusTarget !== undefined) {
      event.preventDefault();
      setFocusOnOpen(focusTarget);
      show();
    }
  };

  const triggerProps = {
    ...buttonProps,
    ref: mergeRefs(triggerRef, ref),
    "aria-label": ariaLabel,
    "aria-haspopup": "menu" as const,
    "aria-expanded": open,
    "aria-controls": open ? menuId : undefined,
    "data-slot": "trigger",
    onClick: (event: Parameters<NonNullable<typeof onClick>>[0]) => {
      onClick?.(event);
      setFocusOnOpen("first");
      toggle();
    },
    onKeyDown: handleTriggerKeyDown,
  };

  return (
    <>
      {trigger === "icon" ? (
        <IconButton {...triggerProps} icon={DotsIcon} size="sm" />
      ) : (
        <Button {...triggerProps} variant="secondary" size="sm">
          {children}
          {/* The shape is the icon "chevron-down" of Lucide (https://lucide.dev, ISC license). */}
          <svg
            className={arrowClass}
            data-slot="arrow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </Button>
      )}
      {open
        ? createPortal(
            <Menu
              ref={panelRef}
              id={menuId}
              aria-label={ariaLabel}
              style={panelStyle}
              className={classNames(menuPlaceClass, !placed && "invisible")}
              // A click in the menu is not a click behind a Modal or a Drawer, and the focus may be in it.
              {...{ [OVERLAY_PANEL_ATTRIBUTE]: "" }}
              focusOnOpen={focusOnOpen}
              ready={placed}
              onClose={({ restoreFocus }) => close({ restoreFocus })}
              entries={items.map((item) => {
                const Icon = item.icon;
                return {
                  key: item.key,
                  label: item.label,
                  onSelect: item.onSelect,
                  disabled: item.disabled,
                  hint: item.hint,
                  icon: Icon === undefined ? undefined : <Icon aria-hidden="true" className={itemIconClass} />,
                };
              })}
            />,
            document.body,
          )
        : null}
    </>
  );
}
