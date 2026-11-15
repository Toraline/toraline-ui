import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import tailwind from "@tailwindcss/postcss";
import postcss from "postcss";
import { describe, expect, test } from "vitest";
import { createTheme } from "./create-theme";
import { createTailwindTheme } from "./tailwind";
import { lightTheme, themeTokenNames } from "./themes";

const presetPath = fileURLToPath(new URL("../css/tailwind.css", import.meta.url));

/**
 * Runs Tailwind CSS the way an app does: a CSS file that imports "tailwindcss"
 * and the preset. "classNames" stands for the classes Tailwind finds in the app's files.
 */
const buildCss = async (classNames: string[], extraCss = "") => {
  const input = [
    '@import "tailwindcss" source(none);',
    `@import "${presetPath}";`,
    extraCss,
    `@source inline("${classNames.join(" ")}");`,
  ].join("\n");
  const result = await postcss([tailwind()]).process(input, {
    from: fileURLToPath(new URL("../css/app.css", import.meta.url)),
  });
  return result.css.replace(/\s+/g, " ");
};

describe("css/tailwind.css, the Tailwind preset", () => {
  test("its @theme blocks have exactly the level 2 tokens, with the values of the light theme", () => {
    const preset = readFileSync(presetPath, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const themeBlock = /@theme \{([\s\S]*?)\}/.exec(preset)?.[1] ?? "";
    const variables: Record<string, string> = {};
    for (const match of themeBlock.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) {
      variables[match[1] as string] = (match[2] as string).trim();
    }
    const {
      "default-font-family": defaultFont,
      "default-mono-font-family": defaultMonoFont,
      ...tokens
    } = variables;
    const { shadow, ...lightTokensWithoutShadow } = lightTheme.tokens;
    expect(tokens).toEqual(lightTokensWithoutShadow);
    expect(shadow).toBe("var(--shadow-size-sm)");
    expect(preset).toContain("@theme inline {\n  --shadow: var(--shadow);\n}");
    expect(defaultFont).toBe("var(--font-body)");
    expect(defaultMonoFont).toBe("var(--font-mono)");
  });

  test("every level 2 token is a Tailwind class that reads the CSS variable", async () => {
    const colorNames = themeTokenNames
      .filter((tokenName) => tokenName.startsWith("color-"))
      .map((tokenName) => tokenName.slice("color-".length));
    const css = await buildCss([
      ...colorNames.map((colorName) => `bg-${colorName}`),
      "text-surface",
      "border-border",
      "outline-focus-ring",
      "font-body",
      "font-heading",
      "font-mono",
      "rounded",
      "shadow",
      "text-sm",
      "text-base",
      "text-lg",
      "p-4",
    ]);

    for (const colorName of colorNames) {
      expect(css).toContain(`.bg-${colorName} { background-color: var(--color-${colorName}); }`);
    }
    expect(css).toContain(".text-surface { color: var(--color-surface); }");
    expect(css).toContain(".border-border { border-color: var(--color-border); }");
    expect(css).toContain(".outline-focus-ring { outline-color: var(--color-focus-ring); }");
    expect(css).toContain(".font-body { font-family: var(--font-body); }");
    expect(css).toContain(".font-heading { font-family: var(--font-heading); }");
    expect(css).toContain(".font-mono { font-family: var(--font-mono); }");
    expect(css).toContain(".rounded { border-radius: var(--radius); }");
    expect(css).toContain("--tw-shadow: var(--shadow);");
    for (const sizeName of ["sm", "base", "lg"]) {
      expect(css).toContain(`.text-${sizeName} { font-size: var(--text-${sizeName});`);
    }
    expect(css).toContain(".p-4 { padding: calc(var(--spacing) * 4); }");
    expect(css).toContain("--spacing: var(--space-1);");
  });

  test("the built CSS has both themes, so data-theme changes what the classes show", async () => {
    const css = await buildCss(["bg-primary"]);
    expect(css).toMatch(/:root, \[data-theme="?light"?\] \{[^}]*--color-primary: var\(--purple-500\);/);
    expect(css).toMatch(/\[data-theme="?dark"?\] \{[^}]*--color-primary: var\(--purple-200\);/);
    expect(css).toContain("--purple-500: #5e00a1;");
    expect(css).toContain("--purple-200: #b593ea;");
  });

  test("the font of the page is --font-body", async () => {
    const css = await buildCss(["font-body"]);
    expect(css).toContain("--default-font-family: var(--font-body);");
  });

  test('the variant "dark:" follows data-theme="dark"', async () => {
    const css = await buildCss(["dark:underline"]);
    expect(css).toContain(
      '.dark\\:underline:where([data-theme="dark"], [data-theme="dark"] *) { text-decoration-line: underline; }',
    );
  });
});

describe("createTailwindTheme", () => {
  const themeInputs = [
    { name: "light", colors: { primary: "#0055aa", brand: "#b34700" } },
    { name: "dark", base: "dark" as const, colors: { brand: "#ffb37a", accent: "#00c2a8" } },
  ];

  test("returns an @theme block with the added colors only", () => {
    expect(createTailwindTheme(themeInputs)).toBe(
      "@theme {\n  --color-brand: #b34700;\n  --color-accent: #00c2a8;\n}\n",
    );
  });

  test("returns an empty text when no theme adds a color", () => {
    expect(createTailwindTheme([{ name: "light", colors: { primary: "#0055aa" } }])).toBe("");
  });

  test("refuses the same bad values createTheme refuses", () => {
    expect(() => createTailwindTheme([{ name: "light", colors: { brand: "red; }" } }])).toThrow(
      /the color "brand"/,
    );
  });

  test("a color an app added is a Tailwind class, and each theme gives it its own value", async () => {
    const appCss = [createTailwindTheme(themeInputs), ...themeInputs.map(createTheme)].join("\n");
    const css = await buildCss(["bg-brand", "text-brand", "border-accent"], appCss);

    expect(css).toContain(".bg-brand { background-color: var(--color-brand); }");
    expect(css).toContain(".text-brand { color: var(--color-brand); }");
    expect(css).toContain(".border-accent { border-color: var(--color-accent); }");
    expect(css).toMatch(/\[data-theme="?light"?\] \{[^}]*--color-brand: #b34700;/);
    expect(css).toMatch(/\[data-theme="?dark"?\] \{[^}]*--color-brand: #ffb37a;/);
  });
});
