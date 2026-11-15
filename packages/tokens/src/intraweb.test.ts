import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { primitives } from "./primitives";
import { getTailwindColorMapping } from "./tailwind-variables";
import { colorTokenNames, darkTheme, lightTheme } from "./themes";
import type { ThemeDefinition } from "./themes";

/**
 * The default look of this library is the look of the app Intraweb.
 * These tests compare the tokens of this package with a copy of Intraweb's CSS
 * files. The copies are in src/intraweb-fixtures/. The comment at the top of
 * each copy says which file it came from, at which commit and on which date.
 */

const readFixture = (fileName: string) =>
  readFileSync(new URL(`./intraweb-fixtures/${fileName}`, import.meta.url), "utf8");

const withoutComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Reads every "--name: value;" line of a CSS text into an object, without the two dashes. */
const readCssVariables = (css: string) => {
  const variables: Record<string, string> = {};
  for (const match of withoutComments(css).matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) {
    variables[match[1] as string] = (match[2] as string).trim().replace(/\s+/g, " ");
  }
  return variables;
};

const pickByName = (variables: Record<string, string>, includes: (name: string) => boolean) =>
  Object.fromEntries(Object.entries(variables).filter(([name]) => includes(name)));

describe("level 1 colors", () => {
  const intrawebTheme = readCssVariables(readFixture("globals-theme.css"));

  /**
   * Intraweb also has a scale named "zinc". It is a copy of "slate" for old
   * screens of Intraweb that still use the Tailwind color zinc. The library does not have it.
   */
  const isScaleColor = (name: string) => name.startsWith("color-") && !name.startsWith("color-zinc-");

  test("the color scales have the names and the values of Intraweb", () => {
    const intrawebColors = pickByName(intrawebTheme, isScaleColor);
    expect(Object.keys(intrawebColors)).toHaveLength(37);
    expect(pickByName(primitives, (name) => name.startsWith("color-"))).toEqual(intrawebColors);
  });

  test("the scales are slate and brand from 50 to 900, pink, cream, green, orange and red", () => {
    const steps = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
    for (const scale of ["slate", "brand"]) {
      for (const step of steps) {
        expect(Object.keys(primitives)).toContain(`color-${scale}-${step}`);
      }
    }
    const scaleNames = new Set(
      Object.keys(primitives)
        .filter((name) => name.startsWith("color-"))
        .map((name) => name.split("-")[1]),
    );
    expect([...scaleNames]).toEqual(["slate", "brand", "pink", "cream", "green", "orange", "red"]);
  });
});

describe("the Tailwind classes of the color tokens", () => {
  test("each color token becomes the same Tailwind class as in Intraweb", () => {
    const intrawebInlineBlock = /@theme inline \{([\s\S]*?)\}/.exec(
      withoutComments(readFixture("globals-utilities.css")),
    )?.[1];
    const intrawebMapping = readCssVariables(intrawebInlineBlock ?? "");
    // Intraweb's two font lines are compared in the test of the fonts.
    const { "font-sans": fontSans, "font-heading": fontHeading, ...intrawebColorMapping } = intrawebMapping;
    expect(fontSans).toBeDefined();
    expect(fontHeading).toBeDefined();

    const libraryMapping = Object.fromEntries(
      Object.entries(getTailwindColorMapping()).map(([name, value]) => [name.slice(2), value]),
    );
    expect(libraryMapping).toEqual(intrawebColorMapping);
  });
});

describe("the light theme and the dark theme", () => {
  /** The first parts of the names of Intraweb's semantic tokens: the level 2 color tokens. */
  const isSemanticToken = (name: string) => /^(bg|text|border|icon|data)-/.test(name);

  /** The text between "{" and "}" of the first block of a CSS file that has this selector. */
  const readBlock = (css: string, selector: string) => {
    const clean = withoutComments(css);
    const start = clean.indexOf(`${selector} {`);
    expect(start, `the selector ${selector}`).toBeGreaterThan(-1);
    return clean.slice(start, clean.indexOf("}", start));
  };

  const colorTokensOf = (theme: ThemeDefinition) =>
    pickByName(theme.tokens, (name) => (colorTokenNames as readonly string[]).includes(name));

  test.each([
    ["light.css", ':root,\n[data-theme="light"]', lightTheme],
    ["dark.css", '[data-theme="dark"]', darkTheme],
  ])("every color token has the value of Intraweb's %s", (fileName, selector, theme) => {
    const block = readBlock(readFixture(fileName), selector);
    const intrawebTokens = pickByName(readCssVariables(block), isSemanticToken);

    expect(Object.keys(intrawebTokens)).toHaveLength(59);
    expect(colorTokensOf(theme)).toEqual(intrawebTokens);
    // The same order, so the two files can be read side by side.
    expect(Object.keys(colorTokensOf(theme))).toEqual(Object.keys(intrawebTokens));
    expect(block).toContain(`color-scheme: ${theme.colorScheme};`);
  });

  test("the light block of Intraweb has only semantic tokens", () => {
    const block = readBlock(readFixture("light.css"), ':root,\n[data-theme="light"]');
    expect(Object.keys(pickByName(readCssVariables(block), (name) => !isSemanticToken(name)))).toEqual([]);
  });

  test("the dark block of Intraweb also changes level 1 colors for its old screens, and the library does not copy that", () => {
    // Old screens of Intraweb use Tailwind colors directly ("bg-white", "text-zinc-700").
    // Its dark theme gives those colors dark values. The library has no such screen:
    // its level 1 colors are the same in every theme.
    const block = readBlock(readFixture("dark.css"), '[data-theme="dark"]');
    const otherNames = Object.keys(pickByName(readCssVariables(block), (name) => !isSemanticToken(name)));
    expect(otherNames.length).toBeGreaterThan(0);
    for (const name of otherNames) {
      expect(name).toMatch(/^color-(white|zinc-\d+)$/);
    }
  });

  test("a level 1 color that a theme points to has the value Intraweb gives it", () => {
    // Follows "var(--color-slate-100)" in both places, and compares the raw values.
    const intrawebScales = readCssVariables(readFixture("globals-theme.css"));
    const block = readBlock(readFixture("light.css"), ':root,\n[data-theme="light"]');
    const intrawebTokens = pickByName(readCssVariables(block), isSemanticToken);
    const resolve = (value: string, scales: Record<string, string>) => {
      const reference = /^var\(--([a-z0-9-]+)\)$/.exec(value)?.[1];
      return reference === undefined ? value : scales[reference];
    };
    for (const [name, value] of Object.entries(intrawebTokens)) {
      const libraryValue = (lightTheme.tokens as Record<string, string>)[name] as string;
      expect(resolve(libraryValue, primitives), name).toBe(resolve(value, intrawebScales));
      expect(resolve(libraryValue, primitives), name).toMatch(/^(#[0-9a-f]{6}|rgb\(.+\))$/);
    }
  });
});
