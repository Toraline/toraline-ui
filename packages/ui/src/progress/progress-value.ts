/*
 * What ProgressBar and ProgressRing share: the tones, and how a value becomes
 * a percentage. As in the app Intraweb (components/ui/progress.tsx).
 */

/** The tones of a progress bar and a progress ring. The first one is the default. */
export const progressTones = ["brand", "success", "warning", "danger"] as const;
export type ProgressTone = (typeof progressTones)[number];

/**
 * The part of "max" that "value" is, as a whole number from 0 to 100.
 * A value below 0 is 0, a value above "max" is 100, and a "max" of 0 or less is 0.
 */
export function percentOf(value: number, max: number): number {
  if (max <= 0) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round((value / max) * 100)));
}

/** The value a screen reader gets as "aria-valuenow": "value", kept between 0 and "max". */
export function clampValue(value: number, max: number): number {
  return Math.min(Math.max(value, 0), max);
}
