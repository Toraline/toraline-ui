import type { ComponentProps } from "react";
import { classNames } from "../shared/class-names.js";

/** The looks of the component. The first one is the default. */
export const exampleVariants = ["neutral", "primary"] as const;
export type ExampleVariant = (typeof exampleVariants)[number];

/** The sizes of the component. */
export const exampleSizes = ["sm", "md"] as const;
export type ExampleSize = (typeof exampleSizes)[number];

/** The classes every Example has. */
const baseClass = "inline-flex items-center rounded border font-body";

/** The padding and the font size of each size. "/normal" is the line height. */
const sizeClass: Record<ExampleSize, string> = {
  sm: "px-2 py-0 text-sm/normal",
  md: "px-3 py-1 text-base/normal",
};

/** The colors of each variant. Every color is a token class. */
const variantClass: Record<ExampleVariant, string> = {
  neutral: "border-default bg-muted text-primary",
  primary: "border-brand bg-primary text-inverse",
};

export type ExampleProps = ComponentProps<"span"> & {
  /** The look. When missing: "neutral". */
  variant?: ExampleVariant;
  /** The size. When missing: "md". */
  size?: ExampleSize;
};

/**
 * A small label. This file is the template of a component: copy the folder,
 * rename "Example", and follow the steps in README.md of this folder.
 *
 * - Every other prop goes to the <span>, and "ref" points to it.
 * - "className" is added after the library's classes. A class of the app
 *   replaces the class of the library that sets the same CSS property.
 */
export function Example({
  variant = "neutral",
  size = "md",
  className,
  ...spanProps
}: ExampleProps) {
  return (
    <span
      {...spanProps}
      className={classNames(baseClass, sizeClass[size], variantClass[variant], className)}
      data-variant={variant}
      data-size={size}
    />
  );
}
