import type { ComponentProps } from "react";
import { classNames } from "../shared/class-names.js";

/** The looks of the component. The first one is the default. */
export const exampleVariants = ["neutral", "primary"] as const;
export type ExampleVariant = (typeof exampleVariants)[number];

/** The sizes of the component. */
export const exampleSizes = ["sm", "md"] as const;
export type ExampleSize = (typeof exampleSizes)[number];

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
 * - "className" is added after the library's class, and its styles win.
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
      className={classNames("tui-example", className)}
      data-variant={variant}
      data-size={size}
    />
  );
}
