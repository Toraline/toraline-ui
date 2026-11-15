import { extendTailwindMerge } from "tailwind-merge";
import { textStyleNames } from "@toraline.tech/tokens";

/**
 * "tailwind-merge" is the library that removes a class when a later class sets
 * the same CSS property. It knows the classes of Tailwind CSS. It needs to be
 * told about 2 kinds of class of the Tailwind preset of @toraline.tech/tokens:
 *
 * 1. The shadow of a card. Its name is not one of the shadow sizes of Tailwind,
 *    so without this line the class is read as a shadow color, and it would
 *    stay next to another shadow.
 * 2. The text styles. A text style is one class that sets the font, the size,
 *    the line height and the weight of a text together. Only one text style
 *    stays, the last one. A text style also removes an earlier class for the
 *    font, the font size, the line height, the font weight, the letter spacing,
 *    the capital letters or the width of digits, because it sets them itself.
 *    A class for one of these that comes after a text style stays, and wins:
 *    Tailwind writes the text styles before those classes in the built CSS.
 *
 * The color classes of the tokens need no line here: any name after the first
 * part of a color class is read as a color. The tests of this file check it for
 * every color token.
 */
const mergeClasses = extendTailwindMerge<"text-style">({
  extend: {
    theme: {
      shadow: ["card"],
    },
    classGroups: {
      "text-style": [...textStyleNames],
    },
    conflictingClassGroups: {
      "text-style": [
        "font-family",
        "font-size",
        "leading",
        "font-weight",
        "tracking",
        "text-transform",
        "fvn-spacing",
      ],
    },
  },
});

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
 * A class replaces only a class for the same CSS property. A text color does
 * not replace a font size, a border color does not replace a border width,
 * and a background color does not replace a background size.
 *
 * The comparison is done by the library "tailwind-merge", set up above for the
 * token classes of @toraline.tech/tokens. A color the app added is a color
 * too. The tests of this file check each kind.
 *
 * A class that is not a Tailwind class is kept as it is.
 *
 * The examples in this comment use only classes that the components use.
 * Tailwind reads the built files of this package as text, comments of the
 * type files included, and builds the CSS of every class name it finds there.
 */
export function classNames(...values: ClassNameValue[]): string {
  return mergeClasses(...values);
}
