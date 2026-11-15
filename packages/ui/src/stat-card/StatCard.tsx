import type { ComponentProps, ReactNode } from "react";
import { classNames } from "../shared/class-names.js";
import type { IconComponent } from "../shared/icon.js";

/** The tones of the card. The first one is the default. */
export const statCardTones = ["default", "tinted"] as const;
export type StatCardTone = (typeof statCardTones)[number];

/*
 * The classes of the card. They are the ones of the StatCard of the app
 * Intraweb (components/ui/stat-card.tsx): a card with a small label, one
 * large number, and under it how the number changed.
 */
const rootClass = "flex flex-col gap-3 rounded-lg p-4 shadow-card md:rounded-xl md:p-5";

/** The background of the card in each tone. "tinted" is the quiet brand color, for the number that matters most. */
const toneClass: Record<StatCardTone, string> = {
  default: "bg-surface",
  tinted: "bg-primary-subtle",
};

const headerClass = "flex items-center gap-3";

/** The box of 40 pixels around the icon. Its corner of 10 pixels is the value of Intraweb; no radius token has it. */
const iconBoxClass = "flex size-10 shrink-0 items-center justify-center rounded-[10px]";

/** The background of the box of the icon: the quiet brand color on a white card, and white on a tinted card. */
const iconBoxToneClass: Record<StatCardTone, string> = {
  default: "bg-primary-subtle",
  tinted: "bg-surface",
};

const iconClass = "size-5 text-icon-brand";

const labelClass = "text-sm/5 font-medium text-secondary";

/**
 * The number: 24 pixels, and 32 pixels from the breakpoint "md" of Tailwind
 * CSS, in the semibold weight of the heading font, with digits of the same
 * width. The values of Intraweb's text styles "display-number-sm" and "display-number".
 */
const valueClass = "font-heading text-2xl/8 font-semibold text-primary tabular-nums md:text-3xl/10";

const trendClass = "flex flex-wrap items-center gap-1 text-sm/5";

const trendValueClass = "inline-flex items-center gap-1 font-medium";

/** The color of the change: green when it is good for the business, red when it is bad. */
const trendMeaningClass: Record<"good" | "bad", string> = {
  good: "text-success",
  bad: "text-danger",
};

const trendIconClass = "size-4";

const comparisonClass = "text-tertiary";

/** How the number changed since an earlier period. */
export type StatCardTrend = {
  /** "up": the number grew. "down": it fell. It gives the arrow and the sign before the value. */
  direction: "up" | "down";
  /** How much it changed, already written as text, with no sign: "12%", "3 h". */
  value: string;
  /** What it is compared with: "vs. last month". */
  comparison?: string;
  /**
   * true when a number that grows is good (sales), false when it is bad
   * (costs). It gives the color: green for good, red for bad. When missing: true.
   */
  upIsGood?: boolean;
};

export type StatCardProps = Omit<ComponentProps<"section">, "children"> & {
  /** What the number is, shown as a heading of level 3: "Sales of the month". */
  label: ReactNode;
  /** The number, already written as the app wants it shown: "R$ 1.200", 42. */
  value: ReactNode;
  /**
   * An icon in a small box before the label: a component that draws an <svg>,
   * for example an icon of "lucide-react" (icon={ShoppingCart}). It is
   * decoration: a screen reader skips it.
   */
  icon?: IconComponent;
  /** The tone. "default": a white card. "tinted": the quiet brand color, for the number that matters most. When missing: "default". */
  tone?: StatCardTone;
  /** How the number changed since an earlier period, shown under the number. */
  trend?: StatCardTrend;
};

/** The arrow of the change. The shapes are the icons "trending-up" and "trending-down" of Lucide (https://lucide.dev, ISC license), the icons Intraweb shows here. */
function TrendIcon({ direction }: { direction: StatCardTrend["direction"] }) {
  return (
    <svg
      className={trendIconClass}
      data-slot="trend-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {direction === "up" ? (
        <>
          <path d="M16 7h6v6" />
          <path d="m22 7-8.5 8.5-5-5L2 17" />
        </>
      ) : (
        <>
          <path d="M16 17h6v-6" />
          <path d="m22 17-8.5-8.5-5 5L2 7" />
        </>
      )}
    </svg>
  );
}

/**
 * A card with one number: a label, the number, and how it changed.
 *
 * - It is a <section>. The label is an <h3>, and the number a <p>.
 * - The app writes every text: the label, the number, the change and what it
 *   is compared with. The card adds only the sign: "+" for up, "−" for down.
 * - The color of the change says good or bad. The sign and the text say the
 *   direction, so the color is not the only way to read it.
 * - "className" is added after the library's classes. Every other prop goes
 *   to the <section>, and "ref" points to it.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  trend,
  className,
  ...sectionProps
}: StatCardProps) {
  const isGood = trend !== undefined && (trend.direction === "up") === (trend.upIsGood ?? true);
  const trendMeaning = isGood ? "good" : "bad";

  return (
    <section
      {...sectionProps}
      className={classNames(rootClass, toneClass[tone], className)}
      data-tone={tone}
    >
      <div className={headerClass} data-slot="header">
        {Icon !== undefined ? (
          <span className={classNames(iconBoxClass, iconBoxToneClass[tone])} data-slot="icon">
            <Icon aria-hidden="true" className={iconClass} />
          </span>
        ) : null}
        <h3 className={labelClass} data-slot="label">
          {label}
        </h3>
      </div>
      <p className={valueClass} data-slot="value">
        {value}
      </p>
      {trend !== undefined ? (
        <p className={trendClass} data-slot="trend">
          <span
            className={classNames(trendValueClass, trendMeaningClass[trendMeaning])}
            data-slot="trend-value"
            data-direction={trend.direction}
            data-meaning={trendMeaning}
          >
            <TrendIcon direction={trend.direction} />
            {trend.direction === "up" ? "+" : "−"}
            {trend.value}
          </span>
          {trend.comparison !== undefined && trend.comparison !== "" ? (
            <span className={comparisonClass} data-slot="trend-comparison">
              {trend.comparison}
            </span>
          ) : null}
        </p>
      ) : null}
    </section>
  );
}
