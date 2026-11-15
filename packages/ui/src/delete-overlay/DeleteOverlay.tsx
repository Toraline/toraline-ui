"use client";

import type { ReactNode } from "react";
import { Button } from "../button/Button.js";
import { Modal } from "../modal/Modal.js";
import type { ModalProps } from "../modal/Modal.js";
import { OVERLAY_AUTOFOCUS_ATTRIBUTE } from "../shared/overlay/use-overlay-layer.js";

/*
 * The classes are the ones of the delete confirmation of the app Intraweb
 * (components/ui/delete-overlay.tsx).
 */

const contentClass = "space-y-4 text-sm/5";
const questionClass = "text-body";
const consequenceClass = "text-tertiary";
const errorClass = "text-danger";
const buttonsClass = "flex justify-end gap-2";

export type DeleteOverlayProps = Omit<ModalProps, "title" | "size" | "actions" | "closeLabel"> & {
  /** The title of the dialog, for example "Delete". */
  title: ReactNode;
  /** The question, with the name of what is deleted: 'Delete the product "Brownie"? This cannot be undone.' It is the children. */
  children: ReactNode;
  /** What else is deleted with it, for example "Its prices are deleted too." */
  consequence?: ReactNode;
  /** The message when the delete failed. A screen reader says it as soon as it is shown. */
  error?: ReactNode;
  /** The text of the button that goes back, for example "Cancel". */
  cancelLabel: ReactNode;
  /** The text of the button that deletes, for example "Delete". */
  deleteLabel: ReactNode;
  /** The text of the button that deletes while "pending" is true, for example "Deleting…". When missing: deleteLabel. */
  pendingLabel?: ReactNode;
  /** true while the delete is running: the button that deletes shows a spinner, and a press does nothing. */
  pending?: boolean;
  /**
   * The name of the button with the cross, for a screen reader, for example
   * "Close". It is also the text of the only button of the "blocked" view.
   */
  closeLabel: string;
  /** Called when the person presses the button that deletes. The app deletes, and sets "pending" and "error". */
  onDelete: () => void;
  /**
   * Give it when the record cannot be deleted, for example because other
   * records use it: the explanation, with what must be done first. The dialog
   * then shows this in the place of the question, with one button that closes.
   */
  blocked?: ReactNode;
  /** The title of the dialog while "blocked" is given, for example "It cannot be deleted". When missing: title. */
  blockedTitle?: ReactNode;
};

/**
 * The dialog that asks before something is deleted. It is a Modal in the size
 * "md", so it has the focus rules of Modal.
 *
 * - The focus goes to the button that cancels, the safe choice.
 * - The library has no text of its own: every text is a prop.
 * - The app does the delete. It gives "pending" while the delete runs, "error"
 *   when it failed, and "blocked" when the record cannot be deleted.
 * - "className", every other prop and "ref" go to the dialog, as in Modal.
 */
export function DeleteOverlay({
  title,
  children,
  consequence,
  error,
  cancelLabel,
  deleteLabel,
  pendingLabel,
  pending = false,
  closeLabel,
  onDelete,
  onClose,
  blocked,
  blockedTitle,
  ...modalProps
}: DeleteOverlayProps) {
  const hasValue = (value: ReactNode) => value !== undefined && value !== null && value !== false;

  if (hasValue(blocked)) {
    return (
      <Modal {...modalProps} title={blockedTitle ?? title} size="md" closeLabel={closeLabel} onClose={onClose}>
        <div className={contentClass} data-slot="content">
          {blocked}
          <div className={buttonsClass} data-slot="buttons">
            <Button variant="secondary" onClick={onClose}>
              {closeLabel}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal {...modalProps} title={title} size="md" closeLabel={closeLabel} onClose={onClose}>
      <div className={contentClass} data-slot="content">
        <p className={questionClass} data-slot="question">
          {children}
        </p>
        {hasValue(consequence) ? (
          <p className={consequenceClass} data-slot="consequence">
            {consequence}
          </p>
        ) : null}
        {hasValue(error) ? (
          <p role="alert" className={errorClass} data-slot="error">
            {error}
          </p>
        ) : null}
        <div className={buttonsClass} data-slot="buttons">
          <Button variant="ghost" onClick={onClose} {...{ [OVERLAY_AUTOFOCUS_ATTRIBUTE]: "" }}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onDelete} loading={pending}>
            {pending ? (pendingLabel ?? deleteLabel) : deleteLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
