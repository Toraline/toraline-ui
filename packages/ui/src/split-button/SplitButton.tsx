"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ComponentProps, FocusEvent, KeyboardEvent, ReactNode } from "react";
import { classNames } from "../shared/class-names.js";
import { focusRingClass } from "../shared/focus-ring.js";

/*
 * The classes of SplitButton: the main button, the button that opens the menu
 * (the trigger), and the menu with its actions (the items).
 *
 * "group-data-[placement=top]/split-button:" selects by the attribute
 * data-placement of the outermost element. "group-aria-expanded/trigger:"
 * selects by aria-expanded of the trigger, the attribute a screen reader reads.
 */

const rootClass = "group/split-button relative inline-flex gap-1 font-body";

/** What the main button and the trigger share. */
const buttonClass = classNames(
  "inline-flex cursor-pointer items-center justify-center border border-transparent bg-primary font-body text-base/normal font-bold text-inverse",
  "hover:bg-primary-hover",
  "disabled:cursor-not-allowed disabled:border-default disabled:bg-subtle disabled:text-tertiary",
  "motion-safe:transition-[background-color] motion-safe:ease-[ease]",
  focusRingClass,
);

const mainClass = classNames(buttonClass, "rounded-l rounded-r-none px-4 py-2");

const triggerClass = classNames(
  buttonClass,
  "group/trigger rounded-l-none rounded-r px-3 py-2 enabled:aria-expanded:bg-primary-hover",
);

/** The arrow points to where the menu opens, and turns over while the menu is open. */
const arrowClass = classNames(
  "size-[0.875em]",
  "group-data-[placement=top]/split-button:rotate-180",
  "group-data-[placement=bottom]/split-button:group-aria-expanded/trigger:rotate-180",
  "group-data-[placement=top]/split-button:group-aria-expanded/trigger:rotate-none",
  "motion-safe:transition-[rotate] motion-safe:ease-[ease]",
);

/**
 * The menu sits above the page and does not move the content around it.
 * Its colors, and the colors of an action, are the ones of the menu of actions of the app Intraweb.
 */
const menuClass = classNames(
  "absolute top-full left-0 z-10 mx-0 my-2 box-border flex min-w-full flex-col rounded border border-subtle bg-surface p-1 shadow",
  "group-data-[placement=top]/split-button:top-auto group-data-[placement=top]/split-button:bottom-full",
);

/** One action. The action under the pointer and the action that has the keyboard focus have a quiet background. */
const itemClass = classNames(
  "flex cursor-pointer items-center gap-3 rounded border-0 bg-transparent px-4 py-3 text-start font-body text-sm/normal font-bold whitespace-nowrap text-body",
  "hover:bg-subtle focus:bg-subtle",
  focusRingClass,
);

const itemIconClass = "inline-flex size-[1em] flex-none";
import type { SplitButtonMenuPlacement } from "./split-button-options.js";

/** One action of the menu. */
export type SplitButtonItem = {
  /** The text of the action. */
  label: ReactNode;
  /** Called when a person chooses the action. */
  onSelect: () => void;
  /** An icon shown before the text. It is decoration: a screen reader skips it. */
  icon?: ReactNode;
};

export type SplitButtonProps = ComponentProps<"button"> & {
  /** The actions of the menu, in the order they are shown. */
  items: readonly SplitButtonItem[];
  /** Where the menu opens. "bottom": under the buttons. "top": above them. When missing: "bottom". */
  menuPlacement?: SplitButtonMenuPlacement;
  /** The name a screen reader says for the button that opens the menu. When missing: "More options". */
  menuLabel?: string;
};

/**
 * A split button: a main button for the main action, and next to it a small
 * button that opens a menu with more actions.
 *
 * - "children" is the text of the main button, and "onClick" is its action.
 * - "disabled" disables both buttons.
 * - "className" goes to the outermost element, which holds the two buttons and the menu.
 * - Every other prop goes to the main <button>, and "ref" points to it.
 *
 * Keyboard, on the button that opens the menu: Enter, Space and Down arrow
 * open the menu with the focus on the first action; Up arrow opens it with the
 * focus on the last action. In the menu: the Up and Down arrows move between
 * actions and go around, Home and End go to the first and the last action, a
 * letter goes to the next action that starts with it, Enter and Space choose
 * the action, Escape closes the menu and gives the focus back to the button
 * that opened it, and Tab closes the menu.
 */
export function SplitButton({
  items,
  menuPlacement = "bottom",
  menuLabel = "More options",
  type = "button",
  disabled,
  className,
  children,
  ...buttonProps
}: SplitButtonProps) {
  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const menuId = `${baseId}-menu`;

  const [isOpen, setIsOpen] = useState(false);
  const rootElement = useRef<HTMLDivElement>(null);
  const triggerElement = useRef<HTMLButtonElement>(null);
  const itemElements = useRef<(HTMLButtonElement | null)[]>([]);
  // Which action gets the focus when the menu opens.
  const focusOnOpen = useRef<"first" | "last">("first");

  const focusItem = (index: number) => {
    const count = items.length;
    if (count === 0) {
      return;
    }
    // The index goes around: after the last action comes the first.
    itemElements.current[(index + count) % count]?.focus();
  };

  const openMenu = (focusTarget: "first" | "last") => {
    focusOnOpen.current = focusTarget;
    setIsOpen(true);
  };

  const closeMenu = (returnFocus: boolean) => {
    if (returnFocus) {
      triggerElement.current?.focus();
    }
    setIsOpen(false);
  };

  // After the menu is on the page, move the focus into it.
  useEffect(() => {
    if (isOpen) {
      focusItem(focusOnOpen.current === "first" ? 0 : -1);
    }
    // Runs only when the menu opens or closes.
  }, [isOpen]);

  // While the menu is open, a press anywhere outside the component closes it.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootElement.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(event.key === "ArrowDown" ? "first" : "last");
    }
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = itemElements.current.findIndex(
      (element) => element === document.activeElement,
    );
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
      closeMenu(true);
    } else if (event.key === "Tab") {
      // The focus goes back to the button first. The browser then moves it
      // to the element after or before that button.
      closeMenu(true);
    } else if (event.key.length === 1 && event.key !== " " && !event.ctrlKey && !event.metaKey) {
      // A letter: go to the next action whose text starts with it.
      const letter = event.key.toLowerCase();
      const count = items.length;
      for (let step = 1; step <= count; step += 1) {
        const index = (currentIndex + step) % count;
        const text = itemElements.current[index]?.textContent ?? "";
        if (text.trim().toLowerCase().startsWith(letter)) {
          focusItem(index);
          break;
        }
      }
    }
  };

  // The focus left the component, for example with a click on another field.
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextElement = event.relatedTarget;
    if (isOpen && nextElement instanceof Node && !event.currentTarget.contains(nextElement)) {
      setIsOpen(false);
    }
  };

  const handleSelect = (item: SplitButtonItem) => {
    closeMenu(true);
    item.onSelect();
  };

  return (
    <div
      ref={rootElement}
      className={classNames(rootClass, className)}
      data-placement={menuPlacement}
      onBlur={handleBlur}
    >
      <button
        {...buttonProps}
        type={type}
        disabled={disabled}
        className={mainClass}
        data-slot="main"
      >
        {children}
      </button>
      <button
        ref={triggerElement}
        type="button"
        id={triggerId}
        disabled={disabled}
        className={triggerClass}
        data-slot="trigger"
        aria-label={menuLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => (isOpen ? closeMenu(false) : openMenu("first"))}
        onKeyDown={handleTriggerKeyDown}
      >
        <svg
          className={arrowClass}
          data-slot="arrow"
          viewBox="0 0 20 13"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 8.273 17.778 0 20 2.363 10 13 0 2.363 2.222 0 10 8.273Z" />
        </svg>
      </button>
      {isOpen ? (
        <div
          role="menu"
          id={menuId}
          className={menuClass}
          data-slot="menu"
          aria-labelledby={triggerId}
          onKeyDown={handleMenuKeyDown}
        >
          {items.map((item, index) => (
            <button
              key={index}
              ref={(element) => {
                itemElements.current[index] = element;
              }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              className={itemClass}
              data-slot="item"
              onClick={() => handleSelect(item)}
            >
              {item.icon === undefined ? null : (
                <span className={itemIconClass} data-slot="item-icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
