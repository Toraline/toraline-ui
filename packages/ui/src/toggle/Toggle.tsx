import type { ComponentProps, ReactNode } from "react";
import { classNames } from "../shared/class-names.js";

/*
 * The classes of the switch. The track is the long rounded part. The thumb is
 * the circle that moves inside it. Off: the thumb is on the left. On: the
 * thumb is on the right and shows a check mark.
 *
 * Every state is selected by the state of the checkbox, which a screen reader
 * reads. "peer-checked:" styles the element after the checkbox. The thumb and
 * the check mark are inside that element, so they use "group-has-checked/toggle:",
 * which looks for a checked checkbox inside the outermost element.
 *
 * The app Intraweb has no switch. The looks are the ones of its checkbox
 * (components/ui/form-controls.tsx): 20 pixels high, a border of 1.5 pixels in
 * the strong border color when off, the color of the main action when on, the
 * label in the small text size, and half of the opacity when disabled.
 * "bg-current" gives the thumb the color of its own text class ("text-icon",
 * the color of an icon), because no background token has that grey.
 */

const rootClass =
  "group/toggle relative inline-flex cursor-pointer items-center gap-2 font-body text-sm/5 text-body has-disabled:cursor-not-allowed";

/** The checkbox is not shown, but it stays on the page: it gets the focus and the keys. */
const inputClass = "peer absolute m-0 size-px opacity-0";

/**
 * The track: 36 by 20 pixels. Its border and its padding are 1.5 pixels each,
 * so the thumb of 14 pixels has the same space on every side.
 */
const trackClass = classNames(
  "box-border inline-flex h-5 w-9 flex-none items-center rounded-full border-[1.5px] border-strong bg-surface p-[1.5px]",
  "peer-checked:border-brand peer-checked:bg-primary",
  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus",
  "peer-disabled:opacity-50",
  "motion-safe:transition-colors",
);

/** The thumb: a circle of 14 pixels. On: it moves 16 pixels to the right. */
const thumbClass = classNames(
  "inline-flex size-3.5 items-center justify-center rounded-full bg-current text-icon",
  "group-has-checked/toggle:translate-x-4 group-has-checked/toggle:bg-surface",
  "motion-safe:transition-[translate,background-color,color] motion-safe:ease-[ease]",
);

/** The check mark: the brand color on the thumb of a switch that is on. */
const checkClass = "size-2.5 text-brand opacity-0 group-has-checked/toggle:opacity-100";

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
    <label className={classNames(rootClass, className)}>
      <input
        {...inputProps}
        type="checkbox"
        role="switch"
        className={inputClass}
        data-slot="input"
      />
      <span className={trackClass} data-slot="track" aria-hidden="true">
        <span className={thumbClass} data-slot="thumb">
          <svg className={checkClass} data-slot="check" viewBox="0 0 16 16" fill="none">
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
      {hasLabel ? <span data-slot="label">{label}</span> : null}
    </label>
  );
}
