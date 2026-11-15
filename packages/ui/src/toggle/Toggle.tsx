import type { ComponentProps, ReactNode } from "react";
import { classNames } from "../shared/class-names";

export type ToggleProps = Omit<ComponentProps<"input">, "type"> & {
  /**
   * The visible name of the switch, shown next to it. It says what the switch
   * controls, and stays the same when the switch is on and when it is off.
   * A switch with no label needs "aria-label", so a screen reader can name it.
   */
  label?: ReactNode;
};

/**
 * A switch: a control that is on or off.
 *
 * - It is a real checkbox with the role "switch", so the Space key changes it
 *   and a screen reader says "on" or "off".
 * - "checked" with "onChange" controls it from the app. "defaultChecked" sets
 *   only how it starts.
 * - "disabled" is the HTML attribute.
 * - "className" goes to the outermost element, a <label> that holds the switch and its text.
 * - Every other prop goes to the <input>, and "ref" points to it.
 */
export function Toggle({ label, className, ...inputProps }: ToggleProps) {
  const hasLabel = label !== undefined && label !== null && label !== false && label !== "";

  return (
    <label className={classNames("tui-toggle", className)}>
      <input {...inputProps} type="checkbox" role="switch" className="tui-toggle__input" />
      <span className="tui-toggle__track" aria-hidden="true">
        <span className="tui-toggle__thumb">
          <svg className="tui-toggle__check" viewBox="0 0 16 16" fill="none">
            <path
              d="M3.5 8.5 6.5 11.5 12.5 4.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
      {hasLabel ? <span className="tui-toggle__label">{label}</span> : null}
    </label>
  );
}
