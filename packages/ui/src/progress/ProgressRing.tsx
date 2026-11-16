import type { ComponentProps } from "react";
import { classNames } from "../shared/class-names.js";
import { clampValue, percentOf } from "./progress-value.js";
import type { ProgressTone } from "./progress-value.js";

/** The sizes of the ring. The first one is the default. */
export const progressRingSizes = ["md", "sm"] as const;
export type ProgressRingSize = (typeof progressRingSizes)[number];

/*
 * The classes of the progress ring. They are the ones of the ProgressRing of
 * the app Intraweb (components/ui/progress.tsx): a circle whose line is filled
 * from the top, clockwise, with the percentage in the middle.
 */
const rootClass = "relative inline-flex shrink-0 items-center justify-center";

/** The width and the height of the ring in each size: 64 and 40 pixels. */
const sizeClass: Record<ProgressRingSize, string> = {
  md: "size-16",
  sm: "size-10",
};

/** The drawing has the size of the ring. It is turned a quarter back, so the line starts at the top. */
const drawingClass = "size-full -rotate-90";

const trackClass = "stroke-data-track";

/** The color of the filled line in each tone: the colors of charts. */
const fillToneClass: Record<ProgressTone, string> = {
  brand: "stroke-data-1",
  success: "stroke-data-success",
  warning: "stroke-data-warning",
  danger: "stroke-data-danger",
};

/** The percentage in the middle of the ring: 12 pixels in the medium weight of the heading font (Intraweb's text style "label-sm"). */
const percentClass = "absolute font-heading text-xs/4 font-medium text-primary tabular-nums";

/**
 * The measures of the drawing of each size, in pixels: the side of its square
 * and the width of its line. They are numbers of the <svg>, not CSS: the
 * drawing is scaled to the size of the ring.
 */
const drawingMeasures: Record<ProgressRingSize, { box: number; strokeWidth: number }> = {
  md: { box: 64, strokeWidth: 6 },
  sm: { box: 40, strokeWidth: 4 },
};

export type ProgressRingProps = Omit<ComponentProps<"div">, "children"> & {
  /** How much is done, from 0 to "max". A value outside is shown as 0 or as "max". */
  value: number;
  /** The value that means "all done". When missing: 100. */
  max?: number;
  /** What the ring measures: "Ideal stock". It is not shown. It is the name a screen reader says. */
  label: string;
  /**
   * The color of the filled line. "brand": a plain measure. "success": good.
   * "warning": needs attention. "danger": bad. When missing: "brand".
   */
  tone?: ProgressTone;
  /**
   * The size. "md": 64 pixels, with the percentage in the middle. "sm": 40
   * pixels, with no text, for a row of a list or a table. When missing: "md".
   */
  size?: ProgressRingSize;
};

/**
 * A progress ring: how much of a whole is done, as a filled part of a circle.
 *
 * - Screen reader: the ring has role="progressbar", the label as its name,
 *   and the value as number ("aria-valuenow", between 0 and "max") and as
 *   text ("aria-valuetext", the percentage). It says, for example, "Ideal
 *   stock, 25%". The drawing and the text in the middle are skipped.
 * - It has no behaviour: it cannot get the focus, and it does not move by itself.
 * - "className" is added after the library's classes. Every other prop goes
 *   to the outermost element, and "ref" points to it.
 */
export function ProgressRing({
  value,
  max = 100,
  label,
  tone = "brand",
  size = "md",
  className,
  ...divProps
}: ProgressRingProps) {
  const percent = percentOf(value, max);
  const { box, strokeWidth } = drawingMeasures[size];
  const radius = (box - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      {...divProps}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clampValue(value, max)}
      aria-valuetext={`${percent}%`}
      className={classNames(rootClass, sizeClass[size], className)}
      data-size={size}
      data-tone={tone}
    >
      <svg className={drawingClass} data-slot="drawing" viewBox={`0 0 ${box} ${box}`} aria-hidden="true">
        <circle
          className={trackClass}
          data-slot="track"
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
        />
        <circle
          className={fillToneClass[tone]}
          data-slot="fill"
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
        />
      </svg>
      {size === "md" ? (
        <span aria-hidden="true" className={percentClass} data-slot="percent">
          {percent}%
        </span>
      ) : null}
    </div>
  );
}
