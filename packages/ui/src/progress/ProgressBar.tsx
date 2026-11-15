import type { ComponentProps } from "react";
import { classNames } from "../shared/class-names.js";
import { clampValue, percentOf } from "./progress-value.js";
import type { ProgressTone } from "./progress-value.js";

/*
 * The classes of the progress bar. They are the ones of the ProgressBar of
 * the app Intraweb (components/ui/progress.tsx): a row with the label and the
 * value, and under it a track 8 pixels high with the filled part.
 */
const rootClass = "space-y-1.5";

const headerClass = "flex items-center justify-between gap-3 text-sm/5";

const labelClass = "text-secondary";

/** The value: the medium weight of the heading font (Intraweb's text style "label"), with digits of the same width. */
const valueTextClass = "font-heading text-sm/5 font-medium text-primary tabular-nums";

/** The track: the empty part of the bar. It cuts the filled part at its round ends. */
const trackClass = "h-2 overflow-hidden rounded-full bg-data-track";

const fillClass = "h-full rounded-full";

/** The color of the filled part in each tone: the colors of charts. */
const fillToneClass: Record<ProgressTone, string> = {
  brand: "bg-data-1",
  success: "bg-data-success",
  warning: "bg-data-warning",
  danger: "bg-data-danger",
};

export type ProgressBarProps = Omit<ComponentProps<"div">, "children"> & {
  /** How much is done, from 0 to "max". A value outside is shown as 0 or as "max". */
  value: number;
  /** The value that means "all done". When missing: 100. */
  max?: number;
  /** What the bar measures: "Hours of the month". It is shown above the bar, and it is the name a screen reader says. */
  label: string;
  /**
   * The color of the filled part. "brand": a plain measure. "success": good.
   * "warning": needs attention. "danger": bad. When missing: "brand".
   */
  tone?: ProgressTone;
  /** The text of the value, shown on the right and read by a screen reader: "30 of 40 h". When missing: the percentage, "75%". */
  valueText?: string;
  /** true hides the label and the value, and shows only the bar. A screen reader still says both. When missing: false. */
  hideLabel?: boolean;
};

/**
 * A progress bar: how much of a whole is done, as a filled part of a line.
 *
 * - Screen reader: the track has role="progressbar", the label as its name,
 *   and the value as number ("aria-valuenow", between 0 and "max") and as
 *   text ("aria-valuetext"). It says, for example, "Hours of the month, 75%".
 * - It has no behaviour: it cannot get the focus, and it does not move by itself.
 * - "className" is added after the library's classes, on the outermost
 *   element. Every other prop goes to that element, and "ref" points to it.
 */
export function ProgressBar({
  value,
  max = 100,
  label,
  tone = "brand",
  valueText,
  hideLabel = false,
  className,
  ...divProps
}: ProgressBarProps) {
  const percent = percentOf(value, max);
  const text = valueText ?? `${percent}%`;

  return (
    <div {...divProps} className={classNames(rootClass, className)} data-tone={tone}>
      {hideLabel ? null : (
        <div className={headerClass} data-slot="header">
          <span className={labelClass} data-slot="label">
            {label}
          </span>
          <span className={valueTextClass} data-slot="value">
            {text}
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={clampValue(value, max)}
        aria-valuetext={text}
        className={trackClass}
        data-slot="track"
      >
        <div
          className={classNames(fillClass, fillToneClass[tone])}
          data-slot="fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
