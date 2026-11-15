import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { primitives } from "./primitives";
import type { PrimitiveName } from "./primitives";
import { darkTheme, lightTheme, themeTokenNames } from "./themes";
import type { ThemeDefinition, ThemeTokenName } from "./themes";

const readPackageFile = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

/** Reads every "--name: value;" line of a CSS file into an object, without the two dashes. */
const readCssVariables = (css: string) => {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const variables: Record<string, string> = {};
  for (const match of withoutComments.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) {
    variables[match[1] as string] = (match[2] as string).trim();
  }
  return variables;
};

/** Follows "var(--name)" to the raw level 1 value. */
const resolveValue = (value: string) => {
  const reference = /^var\(--([a-z0-9-]+)\)$/.exec(value);
  return reference ? primitives[reference[1] as PrimitiveName] : value;
};

const relativeLuminance = (hexColor: string) => {
  const channels = [1, 3, 5].map((start) => {
    const channel = parseInt(hexColor.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return (
    0.2126 * (channels[0] as number) +
    0.7152 * (channels[1] as number) +
    0.0722 * (channels[2] as number)
  );
};

/** The WCAG contrast ratio of two colors: 1 is no contrast, 21 is black on white. */
const contrastRatio = (theme: ThemeDefinition, first: ThemeTokenName, second: ThemeTokenName) => {
  const firstLuminance = relativeLuminance(resolveValue(theme.tokens[first]));
  const secondLuminance = relativeLuminance(resolveValue(theme.tokens[second]));
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
};

test("css/primitives.css has exactly the level 1 tokens of primitives.ts", () => {
  expect(readCssVariables(readPackageFile("css/primitives.css"))).toEqual(primitives);
});

test.each([
  ["css/themes/light.css", lightTheme, ':root,\n[data-theme="light"] {'],
  ["css/themes/dark.css", darkTheme, '\n[data-theme="dark"] {'],
])("%s has exactly the level 2 tokens of its theme", (path, theme, selector) => {
  const css = readPackageFile(path);
  expect(readCssVariables(css)).toEqual(theme.tokens);
  expect(css).toContain(selector);
  expect(css).toContain(`color-scheme: ${theme.colorScheme};`);
});

test.each([lightTheme, darkTheme])("the $name theme gives a value to every level 2 token", (theme) => {
  expect(Object.keys(theme.tokens)).toEqual([...themeTokenNames]);
});

test.each([lightTheme, darkTheme])(
  "the $name theme only points to level 1 tokens that exist",
  (theme) => {
    for (const value of Object.values(theme.tokens)) {
      for (const reference of value.matchAll(/var\(--([a-z0-9-]+)\)/g)) {
        expect(Object.keys(primitives)).toContain(reference[1]);
      }
    }
  },
);

test.each([lightTheme, darkTheme])(
  "in the $name theme, the text of the components can be read on its background (contrast of 4.5 or more)",
  (theme) => {
    // The pairs the components of @toraline.tech/ui use: [text, background].
    const pairs: [ThemeTokenName, ThemeTokenName][] = [
      // Text on the page and on a card.
      ["text-primary", "bg-page"],
      ["text-primary", "bg-surface"],
      ["text-strong", "bg-page"],
      ["text-strong", "bg-surface"],
      ["text-strong", "bg-subtle"],
      ["text-body", "bg-page"],
      ["text-body", "bg-surface"],
      ["text-body", "bg-subtle"],
      ["text-secondary", "bg-page"],
      ["text-secondary", "bg-surface"],
      // The primary button, at rest and with the pointer over it.
      ["text-inverse", "bg-primary"],
      ["text-inverse", "bg-primary-hover"],
      // The danger button and the error message of a field.
      ["text-danger", "bg-page"],
      ["text-danger", "bg-surface"],
      ["text-danger", "bg-danger-subtle"],
      // A link, and the selected tab.
      ["text-brand", "bg-page"],
      ["text-brand", "bg-surface"],
      // A placeholder, and the text of a disabled button or field.
      ["text-tertiary", "bg-surface"],
      ["text-tertiary", "bg-subtle"],
    ];
    for (const [foreground, background] of pairs) {
      expect(
        contrastRatio(theme, foreground, background),
        `${foreground} on ${background}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  },
);

test.each([lightTheme, darkTheme])(
  "in the $name theme, the focus outline and the colors that mark a state can be seen (contrast of 3 or more)",
  (theme) => {
    const pairs: [ThemeTokenName, ThemeTokenName][] = [
      // The outline of the element that has the keyboard focus.
      ["border-focus", "bg-page"],
      ["border-focus", "bg-surface"],
      // The border of a field with an error.
      ["border-invalid", "bg-surface"],
      // The track of a switch that is on, and the line under the selected tab.
      ["bg-primary", "bg-page"],
      ["bg-primary", "bg-surface"],
      ["border-brand", "bg-page"],
      ["border-brand", "bg-surface"],
      // The thumb of a switch that is off.
      ["icon-default", "bg-surface"],
    ];
    for (const [foreground, background] of pairs) {
      expect(
        contrastRatio(theme, foreground, background),
        `${foreground} on ${background}`,
      ).toBeGreaterThanOrEqual(3);
    }
  },
);

test("packages/tokens/README.md documents every level 2 token", () => {
  const readme = readPackageFile("README.md");
  for (const name of themeTokenNames) {
    expect(readme).toContain(`\`--${name}\``);
  }
});
