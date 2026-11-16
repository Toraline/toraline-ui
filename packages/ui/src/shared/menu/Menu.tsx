"use client";

import { useEffect, useRef } from "react";
import type { ComponentProps, KeyboardEvent, ReactNode } from "react";
import { classNames } from "../class-names.js";
import { focusRingClass } from "../focus-ring.js";
import { mergeRefs } from "../merge-refs.js";

/*
 * The menu that SplitButton and ActionMenu share: the list of actions, its
 * look, and its keyboard. It follows the menu pattern of the WAI-ARIA
 * Authoring Practices Guide (https://www.w3.org/WAI/ARIA/apg/patterns/menubar/).
 *
 * The component that uses it keeps whether the menu is open, renders the
 * button that opens it, and places the menu.
 */

/**
 * The look of the menu: the one of the menu of actions of the app Intraweb
 * (components/ui/action-menu.tsx). The component adds the classes that place it.
 */
export const menuClass = "rounded-lg border border-subtle bg-surface py-1 shadow-lg";

/**
 * One action. The action under the pointer and the action that has the
 * keyboard focus have a quiet background. The focus ring is drawn inside the
 * action, because the actions touch each other. An action that cannot be
 * chosen (aria-disabled) has half of its opacity and no background.
 */
const itemClass = classNames(
  "flex w-full items-center gap-2 px-3 py-2 text-start font-body text-sm text-body",
  "hover:bg-subtle focus:bg-subtle",
  focusRingClass,
  "focus-visible:-outline-offset-2",
  "aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-transparent",
);

/** One action of the menu, as the shared menu needs it. */
export type MenuEntry = {
  /** A value that is different for each action of one menu. */
  key: string | number;
  /** The text of the action. */
  label: ReactNode;
  /** The icon, already drawn. It is decoration: the component that gives it hides it from a screen reader. */
  icon?: ReactNode;
  /** Called when a person chooses the action. */
  onSelect: () => void;
  /** true: the action is shown and can get the focus, and cannot be chosen. */
  disabled?: boolean;
  /** Why the action cannot be chosen. A screen reader says it, and the pointer over the action shows it. */
  hint?: string;
};

/** Which action gets the focus when the menu opens. */
export type MenuFocusTarget = "first" | "last";

/**
 * The key of the button that opens a menu, as the pattern asks: the Down arrow
 * opens the menu with the focus on the first action, the Up arrow on the last.
 * Enter and Space are a click of the button, which the browser does.
 */
export function menuFocusTargetOfKey(key: string): MenuFocusTarget | undefined {
  const targets: Record<string, MenuFocusTarget> = { ArrowDown: "first", ArrowUp: "last" };
  return targets[key];
}

export type MenuProps = Omit<ComponentProps<"div">, "children"> & {
  /** The actions, in the order they are shown. */
  entries: readonly MenuEntry[];
  /** Which action gets the focus when the menu opens. */
  focusOnOpen: MenuFocusTarget;
  /** false while the menu is not placed yet: the focus waits. When missing: true. */
  ready?: boolean;
  /** Called when the menu must close. With restoreFocus, the button that opened it gets the focus first. */
  onClose: (options: { restoreFocus: boolean }) => void;
};

/**
 * The list of actions (role="menu").
 *
 * Keyboard: the Up and Down arrows move between actions and go around, Home
 * and End go to the first and the last action, a letter goes to the next
 * action that starts with it, Enter and Space choose the action, Escape closes
 * the menu and gives the focus back to the button that opened it (and does not
 * reach a dialog under the menu), and Tab closes the menu and moves on from
 * that button.
 *
 * This component is not exported from the package.
 */
export function Menu({
  entries,
  focusOnOpen,
  ready = true,
  onClose,
  className,
  ref,
  onKeyDown,
  ...menuProps
}: MenuProps) {
  const menuElement = useRef<HTMLDivElement>(null);

  const getItems = () =>
    Array.from(menuElement.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  const focusItem = (index: number) => {
    const items = getItems();
    if (items.length > 0) {
      // The index goes around: after the last action comes the first.
      items[(index + items.length) % items.length]?.focus();
    }
  };

  // After the menu is on the page and placed, move the focus into it.
  useEffect(() => {
    if (ready) {
      focusItem(focusOnOpen === "first" ? 0 : -1);
    }
    // Runs only when the menu becomes ready.
  }, [ready]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const items = getItems();
    const currentIndex = items.findIndex((element) => element === document.activeElement);
    const targets: Record<string, number> = {
      ArrowDown: currentIndex + 1,
      ArrowUp: currentIndex - 1,
      Home: 0,
      End: -1,
    };
    const targetIndex = targets[event.key];
    if (targetIndex !== undefined) {
      event.preventDefault();
      focusItem(targetIndex);
    } else if (event.key === "Escape") {
      event.preventDefault();
      // The key does not reach a Modal or a Drawer that the menu is in.
      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();
      onClose({ restoreFocus: true });
    } else if (event.key === "Tab") {
      // The focus goes back to the button first. The browser then moves it
      // to the element after or before that button.
      onClose({ restoreFocus: true });
    } else if (event.key.length === 1 && event.key !== " " && !event.ctrlKey && !event.metaKey) {
      // A letter: go to the next action whose text starts with it.
      const letter = event.key.toLowerCase();
      for (let step = 1; step <= items.length; step += 1) {
        const index = (currentIndex + step) % items.length;
        const text = items[index]?.textContent ?? "";
        if (text.trim().toLowerCase().startsWith(letter)) {
          focusItem(index);
          break;
        }
      }
    }
  };

  const handleSelect = (entry: MenuEntry) => {
    if (entry.disabled === true) {
      return;
    }
    onClose({ restoreFocus: true });
    entry.onSelect();
  };

  return (
    <div
      {...menuProps}
      ref={mergeRefs(menuElement, ref)}
      role="menu"
      className={classNames(menuClass, className)}
      data-slot="menu"
      onKeyDown={handleKeyDown}
    >
      {entries.map((entry) => (
        <button
          key={entry.key}
          type="button"
          role="menuitem"
          tabIndex={-1}
          aria-disabled={entry.disabled === true ? true : undefined}
          title={entry.disabled === true ? entry.hint : undefined}
          className={itemClass}
          data-slot="item"
          onClick={() => handleSelect(entry)}
        >
          {entry.icon}
          {entry.label}
        </button>
      ))}
    </div>
  );
}
