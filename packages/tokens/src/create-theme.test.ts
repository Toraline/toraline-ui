import { describe, expect, test } from "vitest";
import { createTheme, getAddedColorNames } from "./create-theme";
import { darkTheme, lightTheme } from "./themes";

/** Reads every "--name: value;" line of a CSS text into an object, without the two dashes. */
const readCssVariables = (css: string) => {
  const variables: Record<string, string> = {};
  for (const match of css.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) {
    variables[match[1] as string] = (match[2] as string).trim();
  }
  return variables;
};

describe("createTheme", () => {
  test("1 changed color, 1 added color and 1 changed font; the rest is equal to the default theme", () => {
    const css = createTheme({
      name: "ocean",
      colors: { primary: "#0055aa", brand: "#ff6600" },
      fonts: { heading: "var(--font-fraunces), Georgia, serif" },
    });

    expect(css.startsWith('[data-theme="ocean"] {\n')).toBe(true);
    expect(css).toContain("  color-scheme: light;\n");

    const variables = readCssVariables(css);
    expect(variables["color-primary"]).toBe("#0055aa");
    expect(variables["color-brand"]).toBe("#ff6600");
    expect(variables["font-heading"]).toBe("var(--font-fraunces), Georgia, serif");

    const { "color-brand": addedColor, ...libraryTokens } = variables;
    expect(addedColor).toBe("#ff6600");
    expect(libraryTokens).toEqual({
      ...lightTheme.tokens,
      "color-primary": "#0055aa",
      "font-heading": "var(--font-fraunces), Georgia, serif",
    });
  });

  test("with only a name, the theme is equal to the light theme", () => {
    const css = createTheme({ name: "plain" });
    expect(readCssVariables(css)).toEqual(lightTheme.tokens);
  });

  test('with base "dark", the values the app does not give come from the dark theme', () => {
    const css = createTheme({ name: "night", base: "dark", radius: "0" });
    expect(css).toContain("  color-scheme: dark;\n");
    expect(readCssVariables(css)).toEqual({ ...darkTheme.tokens, radius: "0" });
  });

  test("a changed text size and a changed spacing unit", () => {
    const css = createTheme({ name: "compact", textSizes: { base: "0.9375rem" }, spacing: "0.2rem" });
    expect(readCssVariables(css)).toEqual({
      ...lightTheme.tokens,
      "text-base": "0.9375rem",
      spacing: "0.2rem",
    });
    expect(() =>
      createTheme({ name: "compact", textSizes: { huge: "3rem" } as { base: string } }),
    ).toThrow(/not a text size/);
    expect(() => createTheme({ name: "compact", spacing: "1px; }" })).toThrow(/the spacing/);
  });

  test("with isDefault, the theme also applies to a page with no data-theme", () => {
    const css = createTheme({ name: "light", isDefault: true });
    expect(css.startsWith(':root,\n[data-theme="light"] {\n')).toBe(true);
  });

  test("a theme name or a color name with other characters is refused", () => {
    expect(() => createTheme({ name: 'x"] { } body' })).toThrow(/theme name/);
    expect(() => createTheme({ name: "ocean", colors: { "Brand Color": "#fff" } })).toThrow(
      /color name/,
    );
  });

  test("a value that could close the CSS block is refused", () => {
    expect(() => createTheme({ name: "ocean", colors: { brand: "red; } body { display: none" } })).toThrow(
      /the color "brand"/,
    );
    expect(() => createTheme({ name: "ocean", fonts: { body: "</style>" } })).toThrow(
      /the font "body"/,
    );
    expect(() => createTheme({ name: "ocean", radius: "" })).toThrow(/the radius/);
  });
});

describe("getAddedColorNames", () => {
  test("lists only the colors the library does not have", () => {
    expect(
      getAddedColorNames({ name: "ocean", colors: { primary: "#000", brand: "#f60", "text-muted": "#555" } }),
    ).toEqual(["brand"]);
    expect(getAddedColorNames({ name: "ocean" })).toEqual([]);
  });
});
