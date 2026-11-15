import { expect, test } from "vitest";
import { classNames } from "./class-names";

test("joins the library's class and the app's class, in that order", () => {
  expect(classNames("tui-button", "mt-4 rounded-full")).toBe("tui-button mt-4 rounded-full");
});

test("skips a value that is missing, false or empty", () => {
  const isOpen = false;
  expect(classNames("tui-button", undefined, null, isOpen && "is-open", "")).toBe("tui-button");
});
