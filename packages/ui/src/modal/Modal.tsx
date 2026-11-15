"use client";

import { useEffect, useId, useRef } from "react";
import type { ComponentProps, ReactNode } from "react";
import { createPortal } from "react-dom";
import { DiscardConfirmation } from "../discard-confirmation/DiscardConfirmation.js";
import type { DiscardConfirmationTexts } from "../discard-confirmation/DiscardConfirmation.js";
import { classNames } from "../shared/class-names.js";
import { mergeRefs } from "../shared/merge-refs.js";
import { OverlayHeader } from "../shared/overlay/OverlayHeader.js";
import { useIsClient } from "../shared/overlay/use-is-client.js";
import {
  OVERLAY_PANEL_ATTRIBUTE,
  useOverlayLayer,
  useOverlayToken,
} from "../shared/overlay/use-overlay-layer.js";
import { useUnsavedChanges } from "../shared/overlay/use-unsaved-changes.js";
import type { ModalSize } from "./modal-options.js";

/*
 * The classes of Modal are the ones of the Modal of the app Intraweb
 * (components/ui/overlay.tsx). On a narrow screen the dialog is a sheet at the
 * bottom of the screen; from the breakpoint "md" of Tailwind CSS (a screen 768
 * pixels wide or more) it is a box at the top, with space around it.
 */

/** The dark layer over the page. It scrolls when the dialog is taller than the screen. */
const backdropClass =
  "fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-overlay md:items-start md:p-8";

/** The dialog. It shows no outline when it has the focus itself: the focus is on it only right after it opens. */
const panelClass =
  "max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-surface shadow-2xl focus:outline-none md:max-h-none md:overflow-visible md:rounded-xl";

/** The widest the dialog gets, for each size. */
const sizeClass: Record<ModalSize, string> = {
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-6xl",
};

/** The small bar at the top of the sheet on a narrow screen. Its color is the token of a strong border. */
const handleClass = "mx-auto mt-2 h-1 w-10 rounded-full bg-(--border-strong) md:hidden";

const bodyClass = "p-4 md:p-6";

export type ModalProps = Omit<ComponentProps<"div">, "title"> & {
  /** The title of the dialog. It is also its name for a screen reader. */
  title: ReactNode;
  /**
   * Called when a person closes the dialog: the button with the cross, the
   * Escape key, or a click on the dark layer around it. The app then stops
   * rendering the Modal.
   */
  onClose: () => void;
  /** Buttons or links next to the title, before the button that closes the dialog. */
  actions?: ReactNode;
  /** The widest the dialog gets. When missing: "lg". */
  size?: ModalSize;
  /** The name of the button that closes the dialog, for a screen reader. When missing: "Close". */
  closeLabel?: string;
  /**
   * The 4 texts of the question "discard the changes?". When the app gives
   * them, the dialog asks before it closes with something typed and not saved.
   * When missing: the dialog closes with no question.
   */
  discardConfirmation?: DiscardConfirmationTexts;
};

/**
 * A dialog above the page, for a task that needs the whole attention, for
 * example a form that creates something.
 *
 * The app renders it while it is open, and stops rendering it in "onClose":
 * {isOpen ? <Modal title="New client" onClose={close}>...</Modal> : null}
 *
 * - The focus goes into the dialog when it opens: to the element with the
 *   attribute data-overlay-autofocus, or to the dialog itself.
 * - Tab and Shift+Tab stay inside the dialog.
 * - Escape closes the dialog. With several overlays open, only the newest.
 * - When it closes, the focus goes back to the element that had it before.
 * - A click on the dark layer closes it. The page behind does not scroll.
 * - With "discardConfirmation": a person who typed in a field inside the
 *   dialog and did not send the form is asked before the dialog closes. A field
 *   with the attribute data-overlay-ignore-dirty does not count.
 * - "className", every other prop and "ref" go to the dialog, the element with role="dialog".
 */
export function Modal(props: ModalProps) {
  // The dialog is rendered into <body>, which the server does not have.
  return useIsClient() ? <ModalDialog {...props} /> : null;
}

function ModalDialog({
  title,
  onClose,
  actions,
  size = "lg",
  closeLabel = "Close",
  discardConfirmation,
  className,
  children,
  ref,
  ...panelProps
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  /** The click closes only when the press started on the dark layer: selecting text and letting go outside does not close. */
  const pressedBackdrop = useRef(false);

  const token = useOverlayToken();
  const { requestClose, isAsking, discard, keepEditing } = useUnsavedChanges({
    enabled: discardConfirmation !== undefined,
    panelRef,
    token,
    onClose,
  });
  useOverlayLayer({ token, panelRef, onEscape: requestClose, containFocus: true });

  // The page behind does not scroll while the dialog is open.
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  return createPortal(
    <div
      className={backdropClass}
      data-slot="backdrop"
      // The dark layer is part of the overlay: a click on it is handled here, not as a click behind a panel.
      {...{ [OVERLAY_PANEL_ATTRIBUTE]: "" }}
      onMouseDown={(event) => {
        pressedBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (pressedBackdrop.current && event.target === event.currentTarget) {
          requestClose();
        }
        pressedBackdrop.current = false;
      }}
    >
      <div
        aria-labelledby={titleId}
        {...panelProps}
        ref={mergeRefs(panelRef, ref)}
        {...{ [OVERLAY_PANEL_ATTRIBUTE]: "" }}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={classNames(panelClass, sizeClass[size], className)}
        data-size={size}
      >
        <div aria-hidden="true" className={handleClass} data-slot="handle" />
        <OverlayHeader
          id={titleId}
          title={title}
          actions={actions}
          closeLabel={closeLabel}
          onClose={requestClose}
        />
        <div className={bodyClass} data-slot="body">
          {children}
        </div>
      </div>
      {isAsking && discardConfirmation !== undefined ? (
        <DiscardConfirmation {...discardConfirmation} onDiscard={discard} onKeepEditing={keepEditing} />
      ) : null}
    </div>,
    document.body,
  );
}
