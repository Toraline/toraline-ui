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
 * Disabled, off or on: quiet colors. The place of the thumb still shows the state.
 *
 * The app Intraweb has no switch. The colors are the ones of its checkbox:
 * a strong border when off, the color of the main action when on.
 * "bg-current" gives the thumb the color of its own text class ("text-icon",
 * the color of an icon), because no background token has that grey.
 */

const rootClass =
  "group/toggle relative inline-flex cursor-pointer items-center gap-2 font-body text-base/normal text-body has-disabled:cursor-not-allowed has-disabled:text-tertiary";

/** The checkbox is not shown, but it stays on the page: it gets the focus and the keys. */
const inputClass = "peer absolute m-0 size-px opacity-0";

const trackClass = classNames(
  "box-border inline-flex h-[1.5em] w-[2.75em] flex-none items-center rounded-[1em] border-[0.125em] border-strong bg-surface p-[0.125em]",
  "peer-checked:border-brand peer-checked:bg-primary",
  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus",
  "peer-disabled:border-default peer-disabled:bg-subtle",
  "motion-safe:transition-[background-color,border-color] motion-safe:ease-[ease]",
);

const thumbClass = classNames(
  "inline-flex size-[1em] items-center justify-center rounded-[50%] bg-current text-icon",
  "group-has-checked/toggle:translate-x-[1.25em] group-has-checked/toggle:bg-surface",
  "group-has-disabled/toggle:bg-current group-has-disabled/toggle:text-muted",
  "motion-safe:transition-[translate,background-color,color] motion-safe:ease-[ease]",
);

/** The check mark: the brand color on the thumb of a switch that is on. */
const checkClass =
  "size-[0.75em] text-brand opacity-0 group-has-checked/toggle:opacity-100 group-has-disabled/toggle:text-inverse";

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
