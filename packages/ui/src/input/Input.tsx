import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";
import { classNames } from "../shared/class-names.js";

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

/** The icon of the error message: a circle with a cross. It is decoration, so a screen reader skips it. */
function ErrorIcon() {
  return (
    <svg
      className="tui-input__error-icon"
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

  return (
    <div className={classNames("tui-input", className)}>
      {hasLabel ? (
        <label className="tui-input__label" htmlFor={fieldId}>
          {label}
        </label>
      ) : null}
      <input
        {...inputProps}
        id={fieldId}
        className="tui-input__field"
        aria-invalid={hasError ? true : invalid}
        aria-describedby={classNames(describedBy, hasError && errorId) || undefined}
      />
      {hasError ? (
        <p className="tui-input__error" id={errorId}>
          <ErrorIcon />
          {error}
        </p>
      ) : null}
    </div>
  );
}
