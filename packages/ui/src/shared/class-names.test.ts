import { describe, expect, test } from "vitest";
import { colorTokenNames } from "@toraline.tech/tokens";
import { classNames } from "./class-names";

describe("classNames joins classes", () => {
  test("joins the library's classes and the app's classes, in that order", () => {
    expect(classNames("inline-flex px-4", "mt-4 w-64")).toBe("inline-flex px-4 mt-4 w-64");
  });

  test("skips a value that is missing, false or empty", () => {
    const isOpen = false;
    expect(classNames("inline-flex", undefined, null, isOpen && "is-open", "")).toBe("inline-flex");
  });

  test("keeps a class that is not a Tailwind class", () => {
    expect(classNames("group/toggle peer inline-flex", "my-class search")).toBe(
      "group/toggle peer inline-flex my-class search",
    );
  });
});

/**
 * "Style on top": a class of the app replaces the class of the library that
 * sets the same CSS property. A token class is a class that the Tailwind preset
 * of @toraline.tech/tokens makes from a token, for example "bg-primary".
 */
describe("a class of the app replaces the library's class for the same property", () => {
  test.each([
    // [what is compared, the library's classes, the app's classes, the result]
    ["a token background and a token background", "bg-primary px-4", "bg-surface", "px-4 bg-surface"],
    ["a token background and a Tailwind color", "bg-primary px-4", "bg-red-500", "px-4 bg-red-500"],
    ["a token background and a level 1 color", "bg-primary", "bg-brand-500", "bg-brand-500"],
    ["a token background and a background the app added", "bg-primary", "bg-promo", "bg-promo"],
    ["a Tailwind color and a token background", "bg-red-500", "bg-primary", "bg-primary"],
    ["a token background and a data color", "bg-surface", "bg-data-1", "bg-data-1"],
    ["token text colors", "text-tertiary", "text-primary", "text-primary"],
    ["a token text color and an icon color", "text-primary", "text-icon-strong", "text-icon-strong"],
    ["a token text color and a Tailwind text color", "text-inverse", "text-white", "text-white"],
    ["a token text color and a text color the app added", "text-inverse", "text-on-promo", "text-on-promo"],
    ["token border colors", "border border-default", "border-danger", "border border-danger"],
    ["a token border color and a Tailwind border color", "border border-default", "border-red-500", "border border-red-500"],
    ["the border color of one side", "border-b-4 border-b-transparent", "border-b-brand", "border-b-4 border-b-brand"],
    ["token outline colors", "outline-2 outline-focus", "outline-red-500", "outline-2 outline-red-500"],
    ["token ring colors", "ring-3 ring-info", "ring-red-500", "ring-3 ring-red-500"],
    ["the token radius and a Tailwind radius", "rounded px-4", "rounded-full", "px-4 rounded-full"],
    ["the radius of one side and a Tailwind radius", "rounded-l rounded-r-none", "rounded-full", "rounded-full"],
    ["the token shadow and a Tailwind shadow", "shadow", "shadow-lg", "shadow-lg"],
    ["token font sizes", "text-base/normal", "text-sm", "text-sm"],
    ["a token font size and a Tailwind font size", "text-base/normal", "text-xl", "text-xl"],
    ["token fonts", "font-body font-bold", "font-heading", "font-bold font-heading"],
    ["a token font and a Tailwind font", "font-body font-bold", "font-serif", "font-bold font-serif"],
    ["a padding", "px-4 py-2", "p-0", "p-0"],
    ["a size", "size-[1em]", "size-4", "size-4"],
  ])("%s", (_what, libraryClasses, appClasses, result) => {
    expect(classNames(libraryClasses, appClasses)).toBe(result);
  });

  test("a font size class does not remove a text color class, and the other way round", () => {
    expect(classNames("text-sm/normal text-primary", "text-lg")).toBe("text-primary text-lg");
    expect(classNames("text-sm/normal text-primary", "text-danger")).toBe("text-sm/normal text-danger");
    // Every text color token, after a font size and before one: both classes stay.
    const textColorNames = colorTokenNames.filter((tokenName) => tokenName.startsWith("text-"));
    expect(textColorNames).toHaveLength(15);
    for (const textColorName of textColorNames) {
      expect(classNames("text-sm", textColorName)).toBe(`text-sm ${textColorName}`);
      expect(classNames(textColorName, "text-base/normal")).toBe(`${textColorName} text-base/normal`);
    }
  });

  test("a background token is never read as a background size, position or image", () => {
    // Every background token, after the classes Tailwind has for the other background properties.
    const backgroundNames = colorTokenNames.filter((tokenName) => tokenName.startsWith("bg-"));
    expect(backgroundNames).toHaveLength(20);
    for (const backgroundName of backgroundNames) {
      expect(classNames("bg-cover bg-center bg-no-repeat bg-fixed", backgroundName)).toBe(
        `bg-cover bg-center bg-no-repeat bg-fixed ${backgroundName}`,
      );
      expect(classNames(backgroundName, "bg-surface")).toBe("bg-surface");
      expect(classNames("bg-surface", backgroundName)).toBe(backgroundName);
    }
  });

  test("a font weight class does not remove a font class", () => {
    expect(classNames("font-body font-bold", "font-normal")).toBe("font-body font-normal");
  });

  test("a border width class does not remove a border color class", () => {
    expect(classNames("border border-strong", "border-2")).toBe("border-strong border-2");
    // Every border color token, after a border width and a border style: the three classes stay.
    const borderColorNames = colorTokenNames.filter((tokenName) => tokenName.startsWith("border-"));
    expect(borderColorNames).toHaveLength(14);
    for (const borderColorName of borderColorNames) {
      expect(classNames("border border-solid", borderColorName)).toBe(`border border-solid ${borderColorName}`);
      expect(classNames(borderColorName, "border-default")).toBe("border-default");
    }
  });

  test("classes are compared only when they have the same variants", () => {
    expect(
      classNames("bg-primary hover:bg-primary-hover disabled:bg-subtle", "hover:bg-danger-subtle"),
    ).toBe("bg-primary disabled:bg-subtle hover:bg-danger-subtle");
    expect(classNames("bg-primary hover:bg-primary-hover disabled:bg-subtle", "bg-surface")).toBe(
      "hover:bg-primary-hover disabled:bg-subtle bg-surface",
    );
    expect(
      classNames(
        "focus-visible:outline-2 focus-visible:outline-focus",
        "focus-visible:outline-red-500",
      ),
    ).toBe("focus-visible:outline-2 focus-visible:outline-red-500");
  });
});
