import { cloneElement, createElement, Fragment, isValidElement, useId } from "react";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import { classNames } from "../shared/class-names.js";

/*
 * The classes of Field. They are the ones of the Field of the app Intraweb
 * (components/ui/form-controls.tsx): the space between the parts, the label in
 * the medium weight, the small hint, and the error message with its icon.
 */

const rootClass = "space-y-1.5 font-body";

const labelClass = "block text-sm font-medium text-strong";

/** The mark of a field that a person may leave empty, after the label. The space before its text is inside it. */
const optionalClass = "font-normal text-tertiary";

/** The hint: a small quiet text under the control. */
const hintClass = "text-xs text-tertiary";

const errorClass = "flex items-start gap-1.5 text-sm text-danger";

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
   * "aria-describedby" and "aria-invalid". When the control is inside another
   * element, for example a <div> with the control and a button, give the
   * control the id of Field: Field finds it by that id. Or give a function:
   * it receives the 3 props and returns the content.
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

/**
 * The native elements that a <label> can point to. A <div>, a <span> and every
 * other native element are not in this list: such a child is an element around
 * the control, not the control.
 */
const nativeControlNames = new Set(["input", "select", "textarea", "button", "meter", "output", "progress"]);

/** What Field reads from an element: the 3 props of a control, and what is inside the element. */
type ElementProps = Partial<FieldControlProps> & { children?: ReactNode };

/**
 * true when the child is the control itself: a component (TextInput, a
 * component of the app) or a native control. Field gives it the 3 props. A
 * component decides which of its elements gets them.
 */
const isControlElement = (child: unknown): child is ReactElement<ElementProps> =>
  isValidElement(child) &&
  child.type !== Fragment &&
  (typeof child.type !== "string" || nativeControlNames.has(child.type));

/** true when a prop holds something to show. */
const hasContent = (value: ReactNode) =>
  value !== undefined && value !== null && value !== false && value !== "";

/**
 * A field of a form: a label, one control, and under it a hint or an error message.
 *
 * - The control is any form control: TextInput, a native <select>, a <textarea>.
 *   Field gives "id", "aria-describedby" and "aria-invalid" to a child that is
 *   a component or a native control. A child that is another element (a <div>
 *   around the control) does not get them: the control inside it does, when it
 *   has the id of Field.
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
  const ownControlProps = isControlElement(children) ? children.props : undefined;
  const controlId = id ?? ownControlProps?.id ?? generatedId;
  const hintId = `${controlId}-hint`;
  const errorId = `${controlId}-error`;
  const hasError = hasContent(error);
  // As in Intraweb, the error message takes the place of the hint.
  const hasHint = hasContent(hint) && !hasError;

  /** The 3 props for a control, joined with the "aria-describedby" and the "aria-invalid" it already has. */
  const linkProps = (ownProps?: Partial<FieldControlProps>): FieldControlProps => {
    // The ids of the elements that describe the control: the app's own, then the hint or the error message.
    const describedByIds = [
      ownProps?.["aria-describedby"],
      hasHint ? hintId : undefined,
      hasError ? errorId : undefined,
    ].filter((describedById) => describedById !== undefined && describedById !== "");
    return {
      id: controlId,
      "aria-describedby": describedByIds.length > 0 ? describedByIds.join(" ") : undefined,
      "aria-invalid": hasError ? true : ownProps?.["aria-invalid"],
    };
  };

  /**
   * For a child that is not the control (a <div> around the control, a
   * fragment, text): looks inside the native elements and the fragments for
   * the element that has the id of the control, and gives the 3 props to that
   * element only. Every other element stays as it is, so no second element
   * gets the id. It does not look inside a component.
   */
  const linkControlById = (node: ReactNode): ReactNode => {
    if (!isValidElement<ElementProps>(node)) {
      return node;
    }
    if (node.props.id === controlId) {
      return cloneElement(node, linkProps(node.props));
    }
    const innerNodes = node.props.children;
    const isSearched = typeof node.type === "string" || node.type === Fragment;
    if (!isSearched || innerNodes === undefined || innerNodes === null) {
      return node;
    }
    const innerList: ReactNode[] = Array.isArray(innerNodes) ? innerNodes : [innerNodes];
    const linkedList = innerList.map(linkControlById);
    const hasLinkedControl = linkedList.some((linkedNode, index) => linkedNode !== innerList[index]);
    return hasLinkedControl ? cloneElement(node, undefined, ...linkedList) : node;
  };

  // As in Intraweb, the space before the mark is inside the mark, in the weight of the mark, and a
  // text is one piece with its space ("Name" + " (optional)"). A space outside the mark has the
  // weight of the label, which is wider, and moves the mark by a part of a pixel.
  const optionalMark = typeof optionalText === "string" ? ` ${optionalText}` : <>{" "}{optionalText}</>;

  let control: ReactNode;
  if (typeof children === "function") {
    control = children(linkProps());
  } else if (isControlElement(children)) {
    control = cloneElement(children, linkProps(children.props));
  } else if (Array.isArray(children)) {
    // Several children: the same search, in each of them.
    control = createElement(Fragment, null, ...children.map(linkControlById));
  } else {
    control = linkControlById(children);
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
