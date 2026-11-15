import { describe, expect, test } from "vitest";
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
    ["a token color and a token color", "bg-primary px-4", "bg-danger", "px-4 bg-danger"],
    ["a token color and a Tailwind color", "bg-primary px-4", "bg-red-500", "px-4 bg-red-500"],
    ["a token color and a color the app added", "bg-primary", "bg-brand", "bg-brand"],
    ["a Tailwind color and a token color", "bg-red-500", "bg-primary", "bg-primary"],
    ["token text colors", "text-text-muted", "text-text", "text-text"],
    ["a token text color and a Tailwind text color", "text-primary-foreground", "text-white", "text-white"],
    ["token border colors", "border border-border-strong", "border-danger", "border border-danger"],
    ["a token border color and a Tailwind border color", "border border-border", "border-red-500", "border border-red-500"],
    ["the border color of one side", "border-b-4 border-b-transparent", "border-b-primary", "border-b-4 border-b-primary"],
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
    expect(classNames("text-sm/normal text-text", "text-lg")).toBe("text-text text-lg");
    expect(classNames("text-sm/normal text-text", "text-danger")).toBe("text-sm/normal text-danger");
  });

  test("a font weight class does not remove a font class", () => {
    expect(classNames("font-body font-bold", "font-normal")).toBe("font-body font-normal");
  });

  test("a border width class does not remove a border color class", () => {
    expect(classNames("border border-border-strong", "border-2")).toBe("border-border-strong border-2");
  });

  test("classes are compared only when they have the same variants", () => {
    expect(
      classNames("bg-primary hover:bg-primary-hover disabled:bg-surface", "hover:bg-danger-hover"),
    ).toBe("bg-primary disabled:bg-surface hover:bg-danger-hover");
    expect(classNames("bg-primary hover:bg-primary-hover disabled:bg-surface", "bg-danger")).toBe(
      "hover:bg-primary-hover disabled:bg-surface bg-danger",
    );
    expect(
      classNames(
        "focus-visible:outline-2 focus-visible:outline-focus-ring",
        "focus-visible:outline-danger",
      ),
    ).toBe("focus-visible:outline-2 focus-visible:outline-danger");
  });
});
