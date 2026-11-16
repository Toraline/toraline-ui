import { describe, expect, test } from "vitest";
import { createTheme, getAddedColorNames, getColorVariableName } from "./create-theme";
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
      colors: { "bg-primary": "#0055aa", "bg-promo": "#ff6600" },
      fonts: { heading: "var(--font-fraunces), Georgia, serif" },
    });

    expect(css.startsWith('[data-theme="ocean"] {\n')).toBe(true);
    expect(css).toContain("  color-scheme: light;\n");

    const variables = readCssVariables(css);
    expect(variables["bg-primary"]).toBe("#0055aa");
    expect(variables["font-heading"]).toBe("var(--font-fraunces), Georgia, serif");

    const { "bg-promo": addedColor, ...libraryTokens } = variables;
    expect(addedColor).toBe("#ff6600");
    expect(libraryTokens).toEqual({
      ...lightTheme.tokens,
      "bg-primary": "#0055aa",
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
    expect(readCssVariables(css)).toEqual({ ...darkTheme.tokens, "radius-md": "0" });
  });

  test("a changed text size and a changed spacing unit", () => {
    const css = createTheme({
      name: "compact",
      textSizes: { xs: "0.6875rem", base: "0.9375rem", "3xl": "2.25rem" },
      spacing: "0.2rem",
    });
    expect(readCssVariables(css)).toEqual({
      ...lightTheme.tokens,
      "text-xs": "0.6875rem",
      "text-base": "0.9375rem",
      "text-3xl": "2.25rem",
      spacing: "0.2rem",
    });
    expect(() =>
      createTheme({ name: "compact", textSizes: { huge: "3rem" } as { base: string } }),
    ).toThrow(/not a text size/);
    expect(() => createTheme({ name: "compact", spacing: "1px; }" })).toThrow(/the spacing/);
  });

  test("one radius value changes --radius-md, and an object changes each size it names", () => {
    expect(readCssVariables(createTheme({ name: "square", radius: "0.125rem" }))).toEqual({
      ...lightTheme.tokens,
      "radius-md": "0.125rem",
    });
    expect(
      readCssVariables(
        createTheme({ name: "soft", radius: { md: "0.625rem", lg: "1rem", xl: "1.25rem", "2xl": "1.5rem" } }),
      ),
    ).toEqual({
      ...lightTheme.tokens,
      "radius-md": "0.625rem",
      "radius-lg": "1rem",
      "radius-xl": "1.25rem",
      "radius-2xl": "1.5rem",
    });
    expect(() => createTheme({ name: "soft", radius: { full: "9999px" } as { md: string } })).toThrow(
      /not a radius size/,
    );
    expect(() => createTheme({ name: "soft", radius: { lg: "1rem; }" } })).toThrow(/the radius "lg"/);
  });

  test("changed shadows", () => {
    const css = createTheme({
      name: "warm",
      shadows: { sm: "0 1px 2px rgb(94 70 54 / 0.06)", card: "0 1px 2px rgb(94 70 54 / 0.05), 0 6px 20px rgb(94 70 54 / 0.07)" },
    });
    expect(readCssVariables(css)).toEqual({
      ...lightTheme.tokens,
      "shadow-sm": "0 1px 2px rgb(94 70 54 / 0.06)",
      "shadow-card": "0 1px 2px rgb(94 70 54 / 0.05), 0 6px 20px rgb(94 70 54 / 0.07)",
    });
    expect(() => createTheme({ name: "warm", shadows: { md: "none" } as { sm: string } })).toThrow(
      /not a shadow/,
    );
    expect(() => createTheme({ name: "warm", shadows: { sm: "none; }" } })).toThrow(/the shadow "sm"/);
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
    expect(() =>
      createTheme({ name: "ocean", colors: { "bg-promo": "red; } body { display: none" } }),
    ).toThrow(/the color "bg-promo"/);
    expect(() => createTheme({ name: "ocean", fonts: { body: "</style>" } })).toThrow(
      /the font "body"/,
    );
    expect(() => createTheme({ name: "ocean", radius: "" })).toThrow(/the radius/);
  });
});

describe("the keys of colors", () => {
  test("the name of a token of the library changes that token, in every group", () => {
    const variables = readCssVariables(
      createTheme({
        name: "ocean",
        colors: {
          "bg-page": "#001122",
          "text-primary": "#ffffff",
          "border-default": "#334455",
          "icon-default": "#8899aa",
          "data-1": "#00c2a8",
        },
      }),
    );
    expect(Object.keys(variables)).toEqual(Object.keys(lightTheme.tokens));
    expect(variables["bg-page"]).toBe("#001122");
    expect(variables["text-primary"]).toBe("#ffffff");
    expect(variables["border-default"]).toBe("#334455");
    expect(variables["icon-default"]).toBe("#8899aa");
    expect(variables["data-1"]).toBe("#00c2a8");
  });

  test.each([
    ["bg-promo", "bg-promo"],
    ["text-on-promo", "text-on-promo"],
    ["border-promo", "border-promo"],
    ["icon-promo", "icon-promo"],
    ["data-4", "data-4"],
  ])('"%s", a new name of a group, adds the token --%s', (colorName, variableName) => {
    expect(getColorVariableName(colorName)).toBe(variableName);
    const variables = readCssVariables(createTheme({ name: "ocean", colors: { [colorName]: "#ff6600" } }));
    expect(variables[variableName]).toBe("#ff6600");
  });

  test('"promo", a name with no group, adds the token --color-promo', () => {
    expect(getColorVariableName("promo")).toBe("color-promo");
    const variables = readCssVariables(createTheme({ name: "ocean", colors: { promo: "#ff6600" } }));
    expect(variables["color-promo"]).toBe("#ff6600");
  });

  test.each(["primary", "surface", "default", "brand", "danger", "icon", "focus", "info"])(
    '"%s" is refused: a class with this name already belongs to the library',
    (colorName) => {
      expect(() => createTheme({ name: "ocean", colors: { [colorName]: "#ff6600" } })).toThrow(
        /already belongs to the library/,
      );
    },
  );

  test('the error for "primary" names a token to use', () => {
    expect(() => createTheme({ name: "ocean", colors: { primary: "#ff6600" } })).toThrow(
      /for example "bg-primary"/,
    );
    expect(() => createTheme({ name: "ocean", colors: { icon: "#ff6600" } })).toThrow(
      /for example "icon-default"/,
    );
  });

  test.each(["text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-9xl", "text-shadow-sm"])(
    '"%s" is refused: the variable belongs to Tailwind CSS',
    (colorName) => {
      expect(() => createTheme({ name: "ocean", colors: { [colorName]: "#ff6600" } })).toThrow(
        /belongs to Tailwind CSS/,
      );
    },
  );
});

describe("getAddedColorNames", () => {
  test("lists only the colors the library does not have", () => {
    expect(
      getAddedColorNames({
        name: "ocean",
        colors: { "bg-primary": "#000", "bg-promo": "#f60", promo: "#f60", "text-muted": "#555" },
      }),
    ).toEqual(["bg-promo", "promo"]);
    expect(getAddedColorNames({ name: "ocean" })).toEqual([]);
  });
});
