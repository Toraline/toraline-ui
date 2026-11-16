import { cloneElement, isValidElement, useId } from "react";
import type { ComponentProps, ReactNode } from "react";
import { classNames } from "../shared/class-names.js";

/*
 * The classes of Field. They are the ones of the Field of the app Intraweb
 * (components/ui/form-controls.tsx): the space between the parts, the label in
 * the medium weight, the small hint, and the error message with its icon.
 */

const rootClass = "space-y-1.5 font-body";

const labelClass = "block text-sm/5 font-medium text-strong";

/** The mark of a field that a person may leave empty, after the label. The space before its text is inside it. */
const optionalClass = "font-normal text-tertiary";

/** The hint: a small quiet text under the control. "/4" is a line of 16 pixels. */
const hintClass = "text-xs/4 text-tertiary";

const errorClass = "flex items-start gap-1.5 text-sm/5 text-danger";

const errorIconClass = "mt-0.5 size-4 shrink-0";

/** What Field gives to its control, so that the label, the hint and the error message are linked to it. */
export type FieldControlProps = {
  /** The id of the control. The label points to it. */
  id: string;
  /** The ids of the hint or the error message that is shown. A screen reader reads them with the control. */
  "aria-describedby"?: string;
  /** true when the field has an error message. */
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling";
};

export type FieldProps = Omit<ComponentProps<"div">, "children" | "id"> & {
  /** The visible name of the field, shown above the control and linked to it. */
  label: ReactNode;
  /**
   * The id of the control. When missing: the id the control already has, or
   * one that the component makes. The ids of the hint and of the error message
   * are this id followed by "-hint" and "-error".
   */
  id?: string;
  /** A short help text, shown under the control while the field has no error. */
  hint?: ReactNode;
  /**
   * The error message, shown under the control with an icon, in the place of
   * the hint. When it is given, the control is marked as not valid for a screen reader.
   */
  error?: ReactNode;
  /** true for a field that a person may leave empty. The label then shows the text of "optionalText". */
  optional?: boolean;
  /** The text shown after the label of an optional field. When missing: "(optional)". */
  optionalText?: ReactNode;
  /**
   * The control: one element, for example <TextInput />. Field gives it "id",
   * "aria-describedby" and "aria-invalid". When the control is not the direct
   * child, give a function: it receives these 3 props and returns the content.
   */
  children: ReactNode | ((controlProps: FieldControlProps) => ReactNode);
};

/** The icon of the error message: a triangle with an exclamation mark. It is decoration, so a screen reader skips it. */
function ErrorIcon() {
  // The shape is the icon "triangle-alert" of Lucide (https://lucide.dev, ISC license), the icon Intraweb shows here.
  return (
    <svg
      className={errorIconClass}
      data-slot="error-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

/** true when a prop holds something to show. */
const hasContent = (value: ReactNode) =>
  value !== undefined && value !== null && value !== false && value !== "";

/**
 * A field of a form: a label, one control, and under it a hint or an error message.
 *
 * - The control is any form control: TextInput, a native <select>, a <textarea>.
 * - Screen reader: the label is a <label> linked to the control. The hint or
 *   the error message that is shown is read with the control
 *   ("aria-describedby"), and a field with an error has aria-invalid="true".
 * - "className", every other prop and "ref" go to the outermost <div>. "id" is
 *   the exception: it is the id of the control.
 */
export function Field({
  label,
  id,
  hint,
  error,
  optional = false,
  optionalText = "(optional)",
  className,
  children,
  ...divProps
}: FieldProps) {
  const generatedId = useId();
  // The props the control already has, when the control is the direct child.
  const ownControlProps = isValidElement<Partial<FieldControlProps>>(children)
    ? children.props
    : undefined;
  const controlId = id ?? ownControlProps?.id ?? generatedId;
  const hintId = `${controlId}-hint`;
  const errorId = `${controlId}-error`;
  const hasError = hasContent(error);
  // As in Intraweb, the error message takes the place of the hint.
  const hasHint = hasContent(hint) && !hasError;

  // The ids of the elements that describe the control: the app's own, then the hint or the error message.
  const describedByIds = [
    ownControlProps?.["aria-describedby"],
    hasHint ? hintId : undefined,
    hasError ? errorId : undefined,
  ].filter((describedById) => describedById !== undefined && describedById !== "");

  const controlProps: FieldControlProps = {
    id: controlId,
    "aria-describedby": describedByIds.length > 0 ? describedByIds.join(" ") : undefined,
    "aria-invalid": hasError ? true : ownControlProps?.["aria-invalid"],
  };

  // As in Intraweb, the space before the mark is inside the mark, in the weight of the mark, and a
  // text is one piece with its space ("Name" + " (optional)"). A space outside the mark has the
  // weight of the label, which is wider, and moves the mark by a part of a pixel.
  const optionalMark = typeof optionalText === "string" ? ` ${optionalText}` : <>{" "}{optionalText}</>;

  let control: ReactNode;
  if (typeof children === "function") {
    control = children(controlProps);
  } else if (isValidElement<Partial<FieldControlProps>>(children)) {
    control = cloneElement(children, controlProps);
  } else {
    control = children;
  }

  return (
    <div {...divProps} className={classNames(rootClass, className)}>
      <label className={labelClass} data-slot="label" htmlFor={controlId}>
        {label}
        {optional ? (
          <span className={optionalClass} data-slot="optional">
            {optionalMark}
          </span>
        ) : null}
      </label>
      {control}
      {hasHint ? (
        <p className={hintClass} data-slot="hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {hasError ? (
        <p className={errorClass} data-slot="error" id={errorId}>
          <ErrorIcon />
          {error}
        </p>
      ) : null}
    </div>
  );
}
