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
      // The soft button, at rest and with the pointer over it.
      ["text-brand", "bg-primary-subtle"],
      ["text-brand", "bg-primary-muted"],
      // The ghost button with the pointer over it.
      ["text-primary", "bg-muted"],
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
      // Phase 9: the text of a tooltip.
      ["text-inverse", "bg-tooltip"],
      // Phase 10: data. The selected row of a table and the selected item of a list.
      ["text-primary", "bg-subtle"],
      ["text-primary", "bg-selected"],
      ["text-body", "bg-selected"],
      ["text-tertiary", "bg-selected"],
      ["text-secondary", "bg-selected"],
      ["text-secondary", "bg-subtle"],
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
      // The icon of an icon button: ghost, secondary and soft, at rest and with the pointer over it.
      ["icon-default", "bg-page"],
      ["icon-strong", "bg-muted"],
      ["icon-strong", "bg-surface"],
      ["icon-strong", "bg-subtle"],
      ["icon-brand", "bg-primary-subtle"],
      ["icon-brand", "bg-primary-muted"],
      // Phase 10: data. The line on the left of the selected row and of the selected item.
      ["border-brand", "bg-selected"],
      ["bg-primary", "bg-selected"],
      ["icon-default", "bg-subtle"],
      ["icon-default", "bg-selected"],
    ];
    for (const [foreground, background] of pairs) {
      expect(
        contrastRatio(theme, foreground, background),
        `${foreground} on ${background}`,
      ).toBeGreaterThanOrEqual(3);
    }
  },
);

/**
 * The pairs of Intraweb's values that are below the limit. The values are not
 * changed in the library: they are Intraweb's. This test is the record of them.
 * It fails when a value changes, so the record cannot go out of date.
 * The components of @toraline.tech/ui do not put text on these backgrounds.
 * The list is also in docs/decisions.md (TOR-1133).
 */
test.each<[themeName: "light" | "dark", foreground: ThemeTokenName, background: ThemeTokenName, limit: number, contrast: number]>([
  // Text. The limit is 4.5.
  ["light", "text-tertiary", "bg-page", 4.5, 4.48],
  ["light", "text-tertiary", "bg-muted", 4.5, 4.48],
  ["dark", "text-tertiary", "bg-muted", 4.5, 4.27],
  // Intraweb uses --text-muted for decoration only.
  ["light", "text-muted", "bg-surface", 4.5, 2.58],
  ["dark", "text-muted", "bg-surface", 4.5, 2.91],
  // The border of a field, a button or a switch. The limit is 3.
  ["light", "border-default", "bg-surface", 3, 1.24],
  ["dark", "border-default", "bg-surface", 3, 1.45],
  ["light", "border-strong", "bg-surface", 3, 1.47],
  ["dark", "border-strong", "bg-surface", 3, 1.82],
  ["light", "border-hover", "bg-surface", 3, 2.58],
  ["dark", "border-hover", "bg-surface", 3, 2.91],
  ["light", "border-danger", "bg-surface", 3, 1.42],
  ["dark", "border-danger", "bg-surface", 3, 1.75],
])(
  "known, in the %s theme: %s on %s is below %s (contrast %s)",
  (themeName, foreground, background, limit, contrast) => {
    const theme = themeName === "light" ? lightTheme : darkTheme;
    const ratio = contrastRatio(theme, foreground, background);
    expect(ratio).toBeLessThan(limit);
    expect(Number(ratio.toFixed(2))).toBe(contrast);
  },
);

test("packages/tokens/README.md documents every level 2 token", () => {
  const readme = readPackageFile("README.md");
  for (const name of themeTokenNames) {
    expect(readme).toContain(`\`--${name}\``);
  }
});

/*
 * Phase 8 (TOR-1124): the pairs of the form controls and the feedback
 * components. The pairs of each later component are added at the end of these lists.
 */

test.each([lightTheme, darkTheme])(
  "phase 8, in the $name theme: the text of a badge, a card and a progress bar can be read on its background (contrast of 4.5 or more)",
  (theme) => {
    const pairs: [ThemeTokenName, ThemeTokenName][] = [
      // StatusBadge: the text of each variant on its own background.
      ["text-secondary", "bg-muted"],
      ["text-success", "bg-success"],
      ["text-warning", "bg-warning"],
      ["text-error", "bg-error"],
      ["text-info", "bg-info"],
      // StatCard in the tone "tinted": the label, the number, the change and what it is compared with.
      ["text-secondary", "bg-primary-subtle"],
      ["text-primary", "bg-primary-subtle"],
      ["text-success", "bg-primary-subtle"],
      ["text-danger", "bg-primary-subtle"],
      ["text-tertiary", "bg-primary-subtle"],
      // StatCard in the tone "default": a change that is good.
      ["text-success", "bg-surface"],
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
  "phase 8, in the $name theme: the filled part of a progress bar can be seen on its track and on a card (contrast of 3 or more)",
  (theme) => {
    const pairs: [ThemeTokenName, ThemeTokenName][] = [
      // ProgressBar and ProgressRing: the tones "brand" and "danger".
      ["data-1", "data-track"],
      ["data-1", "bg-surface"],
      ["data-danger", "data-track"],
      ["data-danger", "bg-surface"],
    ];
    for (const [foreground, background] of pairs) {
      expect(
        contrastRatio(theme, foreground, background),
        `${foreground} on ${background}`,
      ).toBeGreaterThanOrEqual(3);
    }
  },
);

/**
 * Phase 8: the pairs of Intraweb's values that are below the limit of 3 for a
 * part of a graphic. The values are not changed in the library: they are
 * Intraweb's. In the dark theme the same pairs are 3 or more. A progress bar
 * also says its value as text, so the color is not the only way to read it.
 * The list is also in docs/decisions.md (TOR-1124).
 */
test.each<[themeName: "light" | "dark", foreground: ThemeTokenName, background: ThemeTokenName, limit: number, contrast: number]>([
  // ProgressBar and ProgressRing: the tones "success" and "warning" in the light theme.
  ["light", "data-success", "data-track", 3, 2.23],
  ["light", "data-success", "bg-surface", 3, 2.76],
  ["light", "data-warning", "data-track", 3, 1.48],
  ["light", "data-warning", "bg-surface", 3, 1.84],
  // The track, the empty part of the bar, on a card.
  ["light", "data-track", "bg-surface", 3, 1.24],
  ["dark", "data-track", "bg-surface", 3, 1.45],
])(
  "phase 8, known, in the %s theme: %s on %s is below %s (contrast %s)",
  (themeName, foreground, background, limit, contrast) => {
    const theme = themeName === "light" ? lightTheme : darkTheme;
    const ratio = contrastRatio(theme, foreground, background);
    expect(ratio).toBeLessThan(limit);
    expect(Number(ratio.toFixed(2))).toBe(contrast);
  },
);

test.each([
  ["data-success", "data-track"],
  ["data-success", "bg-surface"],
  ["data-warning", "data-track"],
  ["data-warning", "bg-surface"],
] as [ThemeTokenName, ThemeTokenName][])(
  "phase 8, in the dark theme: %s on %s can be seen (contrast of 3 or more)",
  (foreground, background) => {
    expect(contrastRatio(darkTheme, foreground, background)).toBeGreaterThanOrEqual(3);
  },
);

/*
 * TOR-1209: the parts of the DataGrid. Each text is on the background of a
 * row at rest, of a row under the pointer and of a checked row.
 */

test.each([lightTheme, darkTheme])(
  "TOR-1209, in the $name theme: the texts of the filter, of the menu of the columns and of a cell that is edited can be read (contrast of 4.5 or more)",
  (theme) => {
    const pairs: [ThemeTokenName, ThemeTokenName][] = [
      // The name of the column on the labelled button of a filter that is on, at rest and under the pointer.
      ["text-primary", "bg-primary-subtle"],
      ["text-primary", "bg-primary-muted"],
      // The 2 small buttons of the panel of a filter, and the title of the list of columns.
      ["text-brand", "bg-surface"],
      ["text-secondary", "bg-surface"],
      ["text-tertiary", "bg-surface"],
      // The error text of a cell, and "Saving…".
      ["text-danger", "bg-surface"],
      ["text-danger", "bg-subtle"],
      ["text-danger", "bg-selected"],
      ["text-secondary", "bg-subtle"],
      ["text-secondary", "bg-selected"],
      // The text a person types in a field with a changed value.
      ["text-primary", "bg-warning"],
      // The mode "Edit table": the cells of a changed row, and the error of a refused row.
      ["text-body", "bg-warning"],
      ["text-danger", "bg-error"],
      // The content of a cell that can be edited, under the pointer.
      ["text-body", "bg-muted"],
      ["text-primary", "bg-muted"],
    ];
    for (const [foreground, background] of pairs) {
      expect(
        contrastRatio(theme, foreground, background),
        `${foreground} on ${background}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  },
);
