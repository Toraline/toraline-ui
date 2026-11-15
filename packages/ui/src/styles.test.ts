import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import tailwind from "@tailwindcss/postcss";
import postcss from "postcss";
import { describe, expect, test } from "vitest";
import { themeTokenNames } from "@toraline/tokens";

/**
 * The rules every CSS file of a component follows (TOR-1009):
 * 1. Every rule is inside the cascade layer "components".
 * 2. Every class name starts with "tui-".
 * 3. Every CSS variable is a level 2 token.
 * 4. No color is written as a raw value.
 * 5. No length is written in rem: a font size is a --text-* token, and a
 *    padding, margin or gap is a multiple of --spacing.
 * 6. css/styles.css imports every file of the folder.
 */

const cssFolder = fileURLToPath(new URL("../css/", import.meta.url));
const templateCssPath = fileURLToPath(new URL("./template/example.css", import.meta.url));
const stylesPath = `${cssFolder}styles.css`;

const withoutComments = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

const componentFileNames = readdirSync(cssFolder).filter(
  (fileName) => fileName.endsWith(".css") && fileName !== "styles.css",
);
const componentFiles = [
  ...componentFileNames.map((fileName) => [fileName, `${cssFolder}${fileName}`] as const),
  ["template/example.css", templateCssPath] as const,
].map(([name, path]) => ({ name, css: withoutComments(readFileSync(path, "utf8")).trim() }));

describe.each(componentFiles)("$name", ({ css }) => {
  test('every rule is inside the cascade layer "components"', () => {
    expect(css.startsWith("@layer components {")).toBe(true);
    // The file has one block: the layer. Its closing brace is the only one at the start of a line.
    expect(css.match(/^\}/gm)).toHaveLength(1);
    expect(css.endsWith("\n}")).toBe(true);
  });

  test('every class name starts with "tui-"', () => {
    const classNames = [...css.matchAll(/\.(-?[a-zA-Z_][\w-]*)/g)].map((match) => match[1]);
    expect(classNames.length).toBeGreaterThan(0);
    for (const className of classNames) {
      expect(className).toMatch(/^tui-/);
    }
  });

  test("every CSS variable is a level 2 token", () => {
    const tokenNames: readonly string[] = themeTokenNames;
    const variableNames = [...css.matchAll(/var\(--([a-z0-9-]+)/g)].map((match) => match[1]);
    expect(variableNames.length).toBeGreaterThan(0);
    for (const variableName of variableNames) {
      expect(tokenNames, `--${variableName}`).toContain(variableName);
    }
    // A component does not define a CSS variable of its own.
    expect(css).not.toMatch(/(^|[\s;{])--[a-z0-9-]+\s*:/);
  });

  test("no color is written as a raw value", () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(css).not.toMatch(/\b(rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color-mix)\(/);
  });

  test("no length is written in rem", () => {
    expect(css).not.toMatch(/\d(\.\d+)?rem\b/);
  });
});

test("css/styles.css gives the layers their order and imports every component file", () => {
  const styles = withoutComments(readFileSync(stylesPath, "utf8"));
  expect(styles.trim().startsWith("@layer theme, base, components, utilities;")).toBe(true);
  const imported = [...styles.matchAll(/@import "\.\/([a-z0-9-]+\.css)";/g)].map(
    (match) => match[1],
  );
  expect(imported.sort()).toEqual([...componentFileNames].sort());
  expect(componentFileNames.length).toBeGreaterThan(0);
});

test("in an app with Tailwind CSS, a class of the app wins over the library's styles", async () => {
  const tokensPreset = fileURLToPath(
    new URL("../../tokens/css/tailwind.css", import.meta.url),
  );
  const input = [
    '@import "tailwindcss" source(none);',
    `@import "${tokensPreset}";`,
    `@import "${stylesPath}";`,
    '@source inline("rounded-full");',
  ].join("\n");
  const result = await postcss([tailwind()]).process(input, { from: `${cssFolder}app.css` });
  const css = result.css;

  // The files that styles.css imports are in the built CSS, inside the layer "components".
  const libraryRule = css.indexOf(".tui-theme-toggle");
  const appClass = css.indexOf(".rounded-full");
  expect(libraryRule).toBeGreaterThan(-1);
  expect(appClass).toBeGreaterThan(-1);
  expect(css.lastIndexOf("@layer components", libraryRule)).toBeGreaterThan(-1);
  expect(css.lastIndexOf("@layer utilities", appClass)).toBeGreaterThan(
    css.lastIndexOf("@layer components", appClass),
  );
  // The order of the layers: "utilities" comes after "components", so it has the higher priority.
  expect(css).toMatch(/@layer [^;{]*components, utilities;/);
});
