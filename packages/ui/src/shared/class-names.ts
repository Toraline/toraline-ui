import { twMerge } from "tailwind-merge";

/** A value that classNames accepts. A value that is not a text is skipped. */
export type ClassNameValue = string | false | null | undefined;

/**
 * Joins Tailwind CSS classes into one text for the attribute "class".
 *
 * Every component gives its own classes first and the app's className last:
 * classNames(buttonClass, className). When two classes set the same CSS
 * property, the later one stays and the earlier one is removed. So a class of
 * the app replaces the class of the library for the same property:
 * classNames("bg-primary px-4", "bg-surface") is "px-4 bg-surface".
 *
 * Two classes are compared only when they have the same Tailwind variants.
 * "hover:bg-subtle" replaces "hover:bg-primary-hover", and does not
 * replace "bg-primary" or "disabled:bg-subtle".
 *
 * The comparison is done by the library "tailwind-merge". It knows the token
 * classes of @toraline.tech/tokens with no configuration: it reads any name
 * after the prefix of a color class as a color, so a token color and a color
 * the app added are colors too. The other token classes (font sizes, fonts,
 * radius, shadow) have the names Tailwind CSS already uses. The tests of this
 * file check each kind.
 *
 * A class that is not a Tailwind class is kept as it is.
 *
 * The examples in this comment use only classes that the components use.
 * Tailwind reads the built files of this package as text, comments of the
 * type files included, and builds the CSS of every class name it finds there.
 */
export function classNames(...values: ClassNameValue[]): string {
  return twMerge(...values);
}
