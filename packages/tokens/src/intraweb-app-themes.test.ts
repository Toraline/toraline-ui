import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import tailwind from "@tailwindcss/postcss";
import postcss from "postcss";
import { describe, expect, test } from "vitest";
import { createTheme } from "./create-theme";
import type { ThemeInput } from "./create-theme";
import { createTailwindTheme } from "./tailwind";
import { colorTokenNames, darkTheme, lightTheme } from "./themes";

/**
 * The app Intraweb has 3 themes of its own, next to light and dark:
 * - "cozy": cream and pink, softer corners, warm shadows.
 * - "old": dark stone, bronze and gold, almost square corners, its own heading font.
 * - "glass": a gradient behind translucent, blurred cards.
 *
 * The proposal of TOR-1137 is that these 3 stay in Intraweb, as themes that the
 * app builds with the theme function of this package. These tests check that
 * the theme function can build them: each test takes the values from a copy of
 * Intraweb's theme file (src/intraweb-fixtures/) and gives them to createTheme.
 *
 * What the theme function cannot express is at the end of this file, and in
 * docs/decisions.md (TOR-1137).
 */

const readFixture = (fileName: string) =>
  readFileSync(new URL(`./intraweb-fixtures/${fileName}`, import.meta.url), "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );

/** Reads every "--name: value;" line of a CSS text into an object, without the two dashes. */
const readCssVariables = (css: string) => {
  const variables: Record<string, string> = {};
  for (const match of css.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) {
    variables[match[1] as string] = (match[2] as string).trim().replace(/\s+/g, " ");
  }
  return variables;
};

/** The text between "{" and "}" of the first block of a CSS file that has this selector. */
const readBlock = (css: string, selector: string) => {
  const start = css.indexOf(`${selector} {`);
  expect(start, `the selector ${selector}`).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf("}", start));
};

/**
 * Intraweb changes a shadow with one CSS rule for each shadow class:
 * [data-theme="cozy"] .shadow-card { --tw-shadow: ...; }
 * This reads those rules into an object: { card: "..." }.
 */
const readShadows = (css: string) => {
  const shadows: Record<string, string> = {};
  for (const rule of css.matchAll(/([^{}]+)\{\s*--tw-shadow:\s*([^;]+);\s*\}/g)) {
    for (const selector of (rule[1] as string).matchAll(/\.shadow-([a-z0-9]+)/g)) {
      shadows[selector[1] as string] = (rule[2] as string).trim().replace(/\s+/g, " ");
    }
  }
  return shadows;
};

const isColorToken = (name: string) => (colorTokenNames as readonly string[]).includes(name);

const pick = (variables: Record<string, string>, includes: (name: string) => boolean) =>
  Object.fromEntries(Object.entries(variables).filter(([name]) => includes(name)));

/** The radius sizes of a block, as the field "radius" of the theme function: { md: "0.625rem" }. */
const readRadius = (variables: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(pick(variables, (name) => name.startsWith("radius-"))).map(([name, value]) => [
      name.slice("radius-".length),
      value,
    ]),
  );

/** Builds the input of the theme function for one theme of Intraweb, from the copy of its file. */
const readThemeInput = (name: "cozy" | "old" | "glass", base: "light" | "dark"): ThemeInput => {
  const css = readFixture(`${name}.css`);
  const variables = readCssVariables(readBlock(css, `[data-theme="${name}"]`));
  return {
    name,
    base,
    colors: pick(variables, isColorToken),
    radius: readRadius(variables),
    shadows: readShadows(css),
  };
};

const cozyInput = readThemeInput("cozy", "light");
const oldInput: ThemeInput = {
  ...readThemeInput("old", "dark"),
  // Intraweb: ":root[data-theme="old"] { --font-display: var(--font-pixelify); }".
  // The font of headings is the field "fonts.heading" of the theme function.
  fonts: { heading: "var(--font-pixelify), ui-sans-serif, system-ui, sans-serif" },
};
const glassInput = readThemeInput("glass", "light");

const presetPath = fileURLToPath(new URL("../css/tailwind.css", import.meta.url));

/** Runs Tailwind CSS the way an app does, with the CSS of the app's themes after the preset. */
const buildCss = async (classNames: string[], appCss: string) => {
  const input = [
    '@import "tailwindcss" source(none);',
    `@import "${presetPath}";`,
    appCss,
    `@source inline("${classNames.join(" ")}");`,
  ].join("\n");
  const result = await postcss([tailwind()]).process(input, {
    from: fileURLToPath(new URL("../css/app.css", import.meta.url)),
  });
  return result.css.replace(/\s+/g, " ");
};

describe("the copies of Intraweb's 3 app themes have what the tests expect", () => {
  test("cozy gives every color token, the 4 radius sizes and the 5 shadows", () => {
    expect(Object.keys(cozyInput.colors ?? {})).toEqual([...colorTokenNames]);
    expect(Object.keys(cozyInput.radius ?? {})).toEqual(["md", "lg", "xl", "2xl"]);
    expect(Object.keys(cozyInput.shadows ?? {})).toEqual(["sm", "card", "lg", "xl", "2xl"]);
  });

  test("old gives every color token, the 4 radius sizes and the 5 shadows", () => {
    expect(Object.keys(oldInput.colors ?? {})).toEqual([...colorTokenNames]);
    expect(Object.keys(oldInput.radius ?? {})).toEqual(["md", "lg", "xl", "2xl"]);
    expect(Object.keys(oldInput.shadows ?? {}).sort()).toEqual(["2xl", "card", "lg", "sm", "xl"]);
  });

  test("glass gives 16 color tokens, 2 radius sizes and 2 shadows, and takes the rest from the light theme", () => {
    expect(Object.keys(glassInput.colors ?? {})).toHaveLength(16);
    expect(Object.keys(glassInput.radius ?? {})).toEqual(["lg", "xl"]);
    expect(Object.keys(glassInput.shadows ?? {})).toEqual(["card", "lg"]);
  });
});

describe("the theme function builds Intraweb's 3 app themes", () => {
  test.each([
    ["cozy", cozyInput, lightTheme],
    ["old", oldInput, darkTheme],
    ["glass", glassInput, lightTheme],
  ])("%s: every token has the value of Intraweb's file, or of its base theme", (name, input, baseTheme) => {
    const css = createTheme(input);
    const variables = readCssVariables(css);

    const expected: Record<string, string> = { ...baseTheme.tokens, ...input.colors };
    for (const [radiusName, value] of Object.entries(input.radius ?? {})) {
      expected[`radius-${radiusName}`] = value as string;
    }
    for (const [shadowName, value] of Object.entries(input.shadows ?? {})) {
      expected[`shadow-${shadowName}`] = value as string;
    }
    if (input.fonts?.heading !== undefined) {
      expected["font-heading"] = input.fonts.heading;
    }

    expect(variables).toEqual(expected);
    // No token was added: every name of Intraweb's themes is a token of the library.
    expect(Object.keys(variables)).toEqual(Object.keys(baseTheme.tokens));
    expect(css.startsWith(`[data-theme="${name}"] {\n  color-scheme: ${baseTheme.colorScheme};`)).toBe(true);
  });

  test("the values that are special in each theme", () => {
    const cozy = readCssVariables(createTheme(cozyInput));
    expect(cozy["bg-page"]).toBe("#f6ede3");
    expect(cozy["bg-primary"]).toBe("#9a5f50");
    expect(cozy["bg-error"]).toBe("var(--color-red-50)");
    expect(cozy["radius-md"]).toBe("0.625rem");
    expect(cozy["shadow-card"]).toBe("0 1px 2px rgb(94 70 54 / 0.05), 0 6px 20px rgb(94 70 54 / 0.07)");

    const old = readCssVariables(createTheme(oldInput));
    expect(old["bg-primary"]).toBe("#c9a24a");
    expect(old["radius-md"]).toBe("0.125rem");
    expect(old["font-heading"]).toBe("var(--font-pixelify), ui-sans-serif, system-ui, sans-serif");
    // A shadow with 4 parts, 2 of them inside the box.
    expect(old["shadow-card"]).toBe(
      "inset 1px 1px 0 rgb(255 240 200 / 0.08), inset -1px -1px 0 rgb(0 0 0 / 0.45), 0 0 0 1px #4a3d2b, 0 2px 6px rgb(0 0 0 / 0.5)",
    );
    // Intraweb gives "old" one rule for the two shadows lg and xl.
    expect(old["shadow-lg"]).toBe(old["shadow-xl"]);

    const glass = readCssVariables(createTheme(glassInput));
    // A transparent color is a value like any other.
    expect(glass["bg-surface"]).toBe("rgb(255 255 255 / 0.68)");
    expect(glass["border-default"]).toBe("rgb(100 116 139 / 0.22)");
    // What glass does not give comes from the light theme, as in Intraweb.
    expect(glass["bg-primary"]).toBe(lightTheme.tokens["bg-primary"]);
    expect(glass["radius-md"]).toBe(lightTheme.tokens["radius-md"]);
  });

  test("an app with the 5 themes: Tailwind builds the classes once, and each theme gives them its values", async () => {
    const themeInputs: ThemeInput[] = [
      { name: "light", base: "light", isDefault: true },
      { name: "dark", base: "dark" },
      cozyInput,
      oldInput,
      glassInput,
    ];
    // No theme adds a color, so there is nothing to tell Tailwind.
    expect(createTailwindTheme(themeInputs)).toBe("");

    const appCss = themeInputs.map(createTheme).join("\n");
    const css = await buildCss(
      ["bg-surface", "text-primary", "border-default", "rounded-lg", "shadow-card", "font-heading"],
      appCss,
    );

    // The classes are the same for every theme. They read the tokens.
    expect(css).toContain(".bg-surface { background-color: var(--bg-surface); }");
    expect(css).toContain(".rounded-lg { border-radius: var(--radius-lg); }");
    expect(css).toContain(".shadow-card { --tw-shadow: var(--shadow-card);");
    expect(css).toContain(".font-heading { font-family: var(--font-heading); }");

    const blockOf = (name: string) => new RegExp(`\\[data-theme="?${name}"?\\] \\{([^}]*)\\}`, "g");
    const lastBlock = (name: string) => [...css.matchAll(blockOf(name))].at(-1)?.[1] ?? "";
    expect(lastBlock("cozy")).toContain("--bg-surface: #fffaf5;");
    expect(lastBlock("cozy")).toContain("--radius-lg: 1rem;");
    expect(lastBlock("cozy")).toContain(
      "--shadow-card: 0 1px 2px rgb(94 70 54 / 0.05), 0 6px 20px rgb(94 70 54 / 0.07);",
    );
    expect(lastBlock("old")).toContain("--bg-surface: #2a2520;");
    expect(lastBlock("old")).toContain("--radius-lg: 0.1875rem;");
    expect(lastBlock("old")).toContain("--font-heading: var(--font-pixelify), ui-sans-serif, system-ui, sans-serif;");
    expect(lastBlock("glass")).toContain("--bg-surface: rgb(255 255 255 / 0.68);");
    expect(lastBlock("glass")).toContain("--radius-lg: 0.875rem;");
  });
});

describe("what the theme function cannot express", () => {
  const glassCss = readFixture("glass.css");

  test("glass has 4 CSS rules that are not token values: the page gradient, the blur, the floating parts and a fallback", () => {
    // 1. The gradient behind the page: a background image on <body>. The token
    //    --bg-page is a color, used as "background-color".
    expect(glassCss).toMatch(/\[data-theme="glass"\] body \{\s*background:\s*radial-gradient/);
    // 2. The blur behind a card: the property "backdrop-filter", on every element with the class bg-surface.
    expect(glassCss).toContain("backdrop-filter: blur(18px) saturate(1.5);");
    // 3. A menu, a popover and a dialog are less transparent than a card: one more background, chosen by a selector.
    expect(glassCss).toMatch(/\.bg-surface:is\([^)]*\) \{\s*background-color: rgb\(255 255 255 \/ 0\.86\);/);
    // 4. A browser with no blur gets an almost opaque card: a token value inside a condition.
    expect(glassCss).toMatch(/@supports not \(backdrop-filter: blur\(1px\)\) \{/);
  });

  test("a gradient is accepted as a value but is not a background color, and a CSS rule is refused", () => {
    // A gradient is a valid CSS value, so createTheme accepts it. But --bg-page is
    // used as a background color, where a gradient does nothing.
    expect(() => createTheme({ name: "glass", colors: { "bg-page": "radial-gradient(red, blue)" } })).not.toThrow();
    // A CSS rule cannot go through the theme function: "{" and "}" are refused.
    expect(() =>
      createTheme({ name: "glass", colors: { "bg-surface": "red } .bg-surface { backdrop-filter: blur(18px)" } }),
    ).toThrow(/the color "bg-surface"/);
  });

  test("those 4 rules still work next to the theme function: the app keeps them in its own CSS", async () => {
    // The rules of Intraweb's glass.css that come after its block of tokens, unchanged.
    const start = glassCss.indexOf('[data-theme="glass"] body');
    const glassRules = glassCss
      .slice(start)
      // The shadows are tokens now, so the two shadow rules are not needed.
      .replace(/\[data-theme="glass"\] \.shadow-[a-z]+ \{[^}]*\}/g, "");
    const appCss = [createTheme({ name: "light", isDefault: true }), createTheme(glassInput), glassRules].join("\n");

    const css = await buildCss(["bg-surface", "shadow-lg"], appCss);

    // The selectors of Intraweb name the class "bg-surface". The library has the same class.
    expect(css).toContain(".bg-surface { background-color: var(--bg-surface); }");
    expect(css).toMatch(/\[data-theme="?glass"?\] \.bg-surface:not\(input, select, textarea\) \{[^}]*backdrop-filter: blur\(18px\) saturate\(1\.5\);/);
    expect(css).toMatch(/\[data-theme="?glass"?\] body \{ background: radial-gradient/);
    expect(css).toMatch(/@supports not \(backdrop-filter: blur\(1px\)\) \{ \[data-theme="?glass"?\] \{ --bg-surface: rgb\(255 255 255 \/ 0\.92\); \} \}/);
  });

  test("old and dark also change Tailwind's own colors for old screens of Intraweb, which is not a theme of tokens", () => {
    const oldCss = readFixture("old.css");
    const otherNames = Object.keys(
      pick(readCssVariables(readBlock(oldCss, '[data-theme="old"]')), (name) => !isColorToken(name) && !name.startsWith("radius-")),
    );
    expect(otherNames.length).toBeGreaterThan(0);
    for (const name of otherNames) {
      expect(name).toMatch(/^color-(white|zinc-\d+)$/);
    }
  });
});
