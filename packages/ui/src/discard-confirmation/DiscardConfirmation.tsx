"use client";

import { useId, useRef } from "react";
import type { ComponentProps, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "../button/Button.js";
import { classNames } from "../shared/class-names.js";
import { mergeRefs } from "../shared/merge-refs.js";
import { useIsClient } from "../shared/overlay/use-is-client.js";
import {
  OVERLAY_AUTOFOCUS_ATTRIBUTE,
  OVERLAY_PANEL_ATTRIBUTE,
  useOverlayLayer,
  useOverlayToken,
} from "../shared/overlay/use-overlay-layer.js";

/*
 * The classes are the ones of the DiscardConfirmation of the app Intraweb
 * (components/ui/overlay.tsx). It sits above a Modal (z-50) and a Drawer (z-40).
 */

const backdropClass = "fixed inset-0 z-[60] flex items-center justify-center bg-overlay p-4";

const panelClass = "w-full max-w-sm rounded-xl bg-surface p-6 shadow-2xl focus:outline-none";

/** The title has the values of Intraweb's text style "heading-section". */
const titleClass = "font-heading text-lg/7 font-medium text-primary";

const descriptionClass = "mt-2 text-sm text-secondary";

/** On a narrow screen the buttons are one above the other, with "keep editing" first. */
const buttonsClass = "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end";

/** The 4 texts of the question. The library has no text of its own: the app gives each one, in its language. */
export type DiscardConfirmationTexts = {
  /** The question, for example "Discard the changes?". It is the name of the dialog for a screen reader. */
  title: ReactNode;
  /** What happens, for example "You typed something that is not saved yet. If you leave now, it is lost." */
  description: ReactNode;
  /** The text of the button that loses the changes, for example "Discard". */
  discardLabel: ReactNode;
  /** The text of the button that goes back to the form, for example "Keep editing". */
  keepEditingLabel: ReactNode;
};

export type DiscardConfirmationProps = Omit<ComponentProps<"div">, "title" | "children"> &
  DiscardConfirmationTexts & {
    /** Called when the person chooses to lose the changes. */
    onDiscard: () => void;
    /** Called when the person chooses to go on editing, with the button or with the Escape key. */
    onKeepEditing: () => void;
  };

/**
 * The question a person gets before something they typed is lost: "discard",
 * or "keep editing". Modal and Drawer show it by themselves when the app gives
 * them the prop "discardConfirmation". An app renders it itself for another
 * case, for example before a page with a form is left.
 *
 * - The focus goes to the button "keep editing", the safe choice.
 * - Tab and Shift+Tab stay inside the question.
 * - Escape means "keep editing".
 * - When it closes, the focus goes back to the element that had it before.
 * - A click on the dark layer does nothing: the person must choose.
 * - "className", every other prop and "ref" go to the element with role="alertdialog".
 */
export function DiscardConfirmation(props: DiscardConfirmationProps) {
  // The question is rendered into <body>, which the server does not have.
  return useIsClient() ? <DiscardConfirmationDialog {...props} /> : null;
}

function DiscardConfirmationDialog({
  title,
  description,
  discardLabel,
  keepEditingLabel,
  onDiscard,
  onKeepEditing,
  className,
  ref,
  ...panelProps
}: DiscardConfirmationProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const token = useOverlayToken();
  useOverlayLayer({ token, panelRef, onEscape: onKeepEditing, containFocus: true });

  return createPortal(
    <div className={backdropClass} data-slot="backdrop" {...{ [OVERLAY_PANEL_ATTRIBUTE]: "" }}>
      <div
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        {...panelProps}
        ref={mergeRefs(panelRef, ref)}
        role="alertdialog"
        aria-modal="true"
        tabIndex={-1}
        className={classNames(panelClass, className)}
      >
        <h2 id={titleId} className={titleClass} data-slot="title">
          {title}
        </h2>
        <p id={descriptionId} className={descriptionClass} data-slot="description">
          {description}
        </p>
        <div className={buttonsClass} data-slot="buttons">
          <Button variant="danger" onClick={onDiscard}>
            {discardLabel}
          </Button>
          <Button onClick={onKeepEditing} {...{ [OVERLAY_AUTOFOCUS_ATTRIBUTE]: "" }}>
            {keepEditingLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
