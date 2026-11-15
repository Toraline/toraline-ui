import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";
import { classNames } from "../shared/class-names.js";
import { focusRingClass } from "../shared/focus-ring.js";

export type InputProps = ComponentProps<"input"> & {
  /**
   * The visible name of the field, shown above it and linked to it.
   * A field with no label needs "aria-label", so a screen reader can name it.
   */
  label?: ReactNode;
  /**
   * The error message, shown under the field. When it is given, the field is
   * marked as not valid for a screen reader, and the message is read with the field.
   */
  error?: ReactNode;
};

/**
 * The classes of the field. The states are selected by the attribute a screen
 * reader reads: "aria-invalid:" for an error, "disabled:" for a disabled field.
 * With an error the border has the color of an invalid field, also while the field has the focus.
 * The colors of each part are the ones of the text field of the app Intraweb.
 */
const fieldClass = classNames(
  "w-full rounded border border-default bg-surface p-3 font-body text-base/normal text-primary",
  "placeholder:text-tertiary placeholder:opacity-100",
  "hover:border-hover focus-visible:border-focus",
  "aria-invalid:enabled:border-invalid",
  "disabled:cursor-not-allowed disabled:border-default disabled:bg-subtle disabled:text-tertiary",
  "motion-safe:transition-[border-color] motion-safe:ease-[ease]",
  focusRingClass,
);

/** The icon of the error message: a circle with a cross. It is decoration, so a screen reader skips it. */
function ErrorIcon() {
  return (
    <svg
      className="size-[1em] flex-none"
      data-slot="error-icon"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M10 20C4.477 20 0 15.523 0 10S4.477 0 10 0s10 4.477 10 10-4.477 10-10 10Zm0-2a8 8 0 1 0 0-16.001A8 8 0 0 0 10 18Zm0-9.414 2.828-2.829 1.415 1.415L11.414 10l2.829 2.828-1.415 1.415L10 11.414l-2.828 2.829-1.415-1.415L8.586 10 5.757 7.172l1.415-1.415L10 8.586Z" />
    </svg>
  );
}

/**
 * A text field with a label and an error message.
 *
 * - "id" is optional: the component makes one when it is missing.
 * - "disabled" is the HTML attribute.
 * - "className" goes to the outermost element, which holds the label, the field and the message.
 * - Every other prop goes to the <input>, and "ref" points to it.
 */
export function Input({
  label,
  error,
  id,
  className,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  ...inputProps
}: InputProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  const hasLabel = label !== undefined && label !== null && label !== false && label !== "";
  const hasError = error !== undefined && error !== null && error !== false && error !== "";
  // The ids of the elements that describe the field: the app's own, then the error message.
  const describedByIds = [describedBy, hasError ? errorId : undefined].filter(
    (describedById) => describedById !== undefined && describedById !== "",
  );

  return (
    <div className={classNames("flex flex-col gap-1 font-body", className)}>
      {hasLabel ? (
        <label
          className="text-sm/normal font-medium text-strong"
          data-slot="label"
          htmlFor={fieldId}
        >
          {label}
        </label>
      ) : null}
      <input
        {...inputProps}
        id={fieldId}
        className={fieldClass}
        data-slot="field"
        aria-invalid={hasError ? true : invalid}
        aria-describedby={describedByIds.length > 0 ? describedByIds.join(" ") : undefined}
      />
      {hasError ? (
        <p
          className="m-0 flex items-center gap-1 text-sm/normal text-danger"
          data-slot="error"
          id={errorId}
        >
          <ErrorIcon />
          {error}
        </p>
      ) : null}
    </div>
  );
}
