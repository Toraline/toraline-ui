import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import tailwind from "@tailwindcss/postcss";
import postcss from "postcss";
import { describe, expect, test } from "vitest";
import { createTheme } from "./create-theme";
import { createTailwindTheme } from "./tailwind";
import { primitives } from "./primitives";
import { getTailwindColorMapping } from "./tailwind-variables";
import { textStyleNames, textStyles } from "./text-styles";
import { colorTokenNames, lightTheme, themeTokenNames } from "./themes";

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

/** The text of the preset without its comments. */
const readPreset = () => readFileSync(presetPath, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

/** Reads every "--name: value;" line of a CSS block into an object, with the two dashes. */
const readVariables = (block: string) => {
  const variables: Record<string, string> = {};
  for (const match of block.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)) {
    variables[match[1] as string] = (match[2] as string).trim();
  }
  return variables;
};

/** The Tailwind class of a color token, with the CSS property it sets. */
const colorClasses: [prefix: string, className: (name: string) => string, property: string][] = [
  ["bg-", (name) => `bg-${name}`, "background-color"],
  ["text-", (name) => `text-${name}`, "color"],
  ["border-", (name) => `border-${name}`, "border-color"],
  ["icon-", (name) => (name === "default" ? "text-icon" : `text-icon-${name}`), "color"],
  ["data-", (name) => `bg-data-${name}`, "background-color"],
];

const classOfColorToken = (tokenName: string) => {
  const found = colorClasses.find(([prefix]) => tokenName.startsWith(prefix));
  if (found === undefined) {
    throw new Error(`The color token ${tokenName} has no group.`);
  }
  const [prefix, className, property] = found;
  return { className: className(tokenName.slice(prefix.length)), property };
};

describe("css/tailwind.css, the Tailwind preset", () => {
  test("its @theme inline block maps every color token to the class of its group", () => {
    const inlineBlock = /@theme inline \{([\s\S]*?)\}/.exec(readPreset())?.[1] ?? "";
    expect(readVariables(inlineBlock)).toEqual(getTailwindColorMapping());
    expect(Object.keys(getTailwindColorMapping())).toHaveLength(colorTokenNames.length + 2);
  });

  test("its block of the other tokens has the values of the light theme", () => {
    const blocks = [...readPreset().matchAll(/@theme \{([\s\S]*?)\}/g)].map((match) => match[1] as string);
    // The first "@theme {" block has the level 1 colors. The second has the other level 2 tokens.
    const {
      "--default-font-family": defaultFont,
      "--default-mono-font-family": defaultMonoFont,
      ...tokens
    } = readVariables(blocks[1] ?? "");
    const colorNames: readonly string[] = colorTokenNames;
    const otherLightTokens = Object.fromEntries(
      Object.entries(lightTheme.tokens)
        .filter(([tokenName]) => !colorNames.includes(tokenName) && !tokenName.startsWith("shadow-"))
        .map(([tokenName, value]) => [`--${tokenName}`, value]),
    );
    expect(tokens).toEqual(otherLightTokens);
    // The shadows are in a block "@theme inline": each class reads the token itself.
    const shadowBlock = [...readPreset().matchAll(/@theme inline \{([\s\S]*?)\}/g)][1]?.[1] ?? "";
    const shadowNames = themeTokenNames.filter((tokenName) => tokenName.startsWith("shadow-"));
    expect(shadowNames).toEqual(["shadow-sm", "shadow-card", "shadow-lg", "shadow-xl", "shadow-2xl"]);
    expect(readVariables(shadowBlock)).toEqual(
      Object.fromEntries(shadowNames.map((shadowName) => [`--${shadowName}`, `var(--${shadowName})`])),
    );
    expect(defaultFont).toBe("var(--font-body)");
    expect(defaultMonoFont).toBe("var(--font-mono)");
  });

  test("every color token is a Tailwind class that reads the CSS variable, for one property only", async () => {
    const classes = colorTokenNames.map((tokenName) => ({ tokenName, ...classOfColorToken(tokenName) }));
    const css = await buildCss(classes.map(({ className }) => className));

    for (const { tokenName, className, property } of classes) {
      expect(css).toContain(`.${className} { ${property}: var(--${tokenName}); }`);
    }
  });

  test('"bg-primary" and "text-primary" are two different tokens', async () => {
    const css = await buildCss(["bg-primary", "text-primary", "border-default", "border-b-brand"]);
    expect(css).toContain(".bg-primary { background-color: var(--bg-primary); }");
    expect(css).toContain(".text-primary { color: var(--text-primary); }");
    expect(css).toContain(".border-default { border-color: var(--border-default); }");
    expect(css).toContain(".border-b-brand { border-bottom-color: var(--border-brand); }");
  });

  test("a token of one group is not a class of another group", async () => {
    // --bg-page, --text-strong and --border-default exist. These classes do not.
    const css = await buildCss(["text-page", "bg-strong", "bg-default", "border-page"]);
    for (const className of ["text-page", "bg-strong", "bg-default", "border-page"]) {
      expect(css).not.toContain(`.${className}`);
    }
  });

  test('"outline-focus" and "ring-info" read border tokens, and a data color is a class for every property', async () => {
    const css = await buildCss(["outline-focus", "ring-info", "text-data-1", "fill-data-success", "bg-data-track"]);
    expect(css).toContain(".outline-focus { outline-color: var(--border-focus); }");
    expect(css).toContain("--tw-ring-color: var(--border-info);");
    expect(css).toContain(".text-data-1 { color: var(--data-1); }");
    expect(css).toContain(".fill-data-success { fill: var(--data-success); }");
    expect(css).toContain(".bg-data-track { background-color: var(--data-track); }");
  });

  test("a text color class and a font size class are two classes", async () => {
    const css = await buildCss(["text-primary", "text-sm"]);
    expect(css).toContain(".text-primary { color: var(--text-primary); }");
    expect(css).toContain(".text-sm { font-size: var(--text-sm);");
  });

  test("the other level 2 tokens are Tailwind classes that read the CSS variable", async () => {
    const css = await buildCss([
      "font-body",
      "font-sans",
      "font-heading",
      "font-mono",
      "rounded-md",
      "rounded-lg",
      "rounded-xl",
      "rounded-2xl",
      "rounded-t-md",
      "shadow-sm",
      "shadow-card",
      "shadow-lg",
      "shadow-xl",
      "shadow-2xl",
      "text-xs",
      "text-sm",
      "text-base",
      "text-lg",
      "p-4",
    ]);

    expect(css).toContain(".font-body { font-family: var(--font-body); }");
    // "font-sans" is the class of Intraweb for the font of normal text.
    expect(css).toContain(".font-sans { font-family: var(--font-body); }");
    expect(css).toContain(".font-heading { font-family: var(--font-heading); }");
    expect(css).toContain(".font-mono { font-family: var(--font-mono); }");
    for (const sizeName of ["md", "lg", "xl", "2xl"]) {
      expect(css).toContain(`.rounded-${sizeName} { border-radius: var(--radius-${sizeName}); }`);
    }
    expect(css).toContain(
      ".rounded-t-md { border-top-left-radius: var(--radius-md); border-top-right-radius: var(--radius-md); }",
    );
    for (const shadowName of ["sm", "card", "lg", "xl", "2xl"]) {
      expect(css).toMatch(
        new RegExp(`\\.shadow-${shadowName} \\{ --tw-shadow: var\\(--shadow-${shadowName}\\); box-shadow:`),
      );
    }
    for (const sizeName of ["xs", "sm", "base", "lg"]) {
      expect(css).toContain(`.text-${sizeName} { font-size: var(--text-${sizeName});`);
    }
    expect(css).toContain(".p-4 { padding: calc(var(--spacing) * 4); }");
    expect(css).toContain("--spacing: var(--space-1);");
  });

  test("the radius sizes and the shadows of Tailwind that are not tokens stay as Tailwind defines them", async () => {
    const css = await buildCss(["rounded-full", "rounded-sm", "shadow-md"]);
    expect(css).toContain(".rounded-full { border-radius: calc(infinity * 1px); }");
    expect(css).toContain(".rounded-sm { border-radius: var(--radius-sm); }");
    expect(css).toContain(".shadow-md { --tw-shadow: 0 4px 6px -1px");
  });

  test("a shadow class follows the theme: a theme that changes the token changes the class", async () => {
    const appCss = createTheme({ name: "warm", shadows: { card: "0 6px 20px rgb(94 70 54 / 0.07)" } });
    const css = await buildCss(["shadow-card"], appCss);
    expect(css).toContain(".shadow-card { --tw-shadow: var(--shadow-card);");
    expect(css).toMatch(/\[data-theme="?warm"?\] \{[^}]*--shadow-card: 0 6px 20px rgb\(94 70 54 \/ 0\.07\);/);
  });

  test("its text styles have exactly the declarations of text-styles.ts", () => {
    const utilities = [...readPreset().matchAll(/@utility ([a-z-]+) \{([\s\S]*?)\}/g)];
    const presetStyles = Object.fromEntries(
      utilities.map((match) => [
        match[1],
        Object.fromEntries(
          [...(match[2] as string).matchAll(/([a-z-]+):\s*([^;]+);/g)].map((declaration) => [
            declaration[1],
            (declaration[2] as string).trim(),
          ]),
        ),
      ]),
    );
    expect(presetStyles).toEqual(textStyles);
    expect(Object.keys(presetStyles)).toEqual(textStyleNames);
  });

  test("every text style is a Tailwind class", async () => {
    const css = await buildCss([...textStyleNames]);
    for (const [name, declarations] of Object.entries(textStyles)) {
      const body = Object.entries(declarations)
        .map(([property, value]) => `${property}: ${value};`)
        .join(" ");
      expect(css).toContain(`.${name} { ${body} }`);
    }
    expect(css).toContain(".heading-page { font-family: var(--font-heading); font-size: 1.5rem; line-height: 2rem; font-weight: 600; }");
  });

  test("the built CSS has both themes, so data-theme changes what the classes show", async () => {
    const css = await buildCss(["bg-primary"]);
    expect(css).toMatch(/:root, \[data-theme="?light"?\] \{[^}]*--bg-primary: var\(--color-brand-700\);/);
    expect(css).toMatch(/\[data-theme="?dark"?\] \{[^}]*--bg-primary: #8eaec5;/);
    expect(css).toContain("--color-brand-700: #42637c;");
  });

  test("its block of level 1 colors has exactly the colors of primitives.ts", () => {
    // The first "@theme {" block of the preset has the level 1 colors.
    const colorBlock = /@theme \{([\s\S]*?)\}/.exec(readPreset())?.[1] ?? "";
    const scaleColors = Object.fromEntries(
      Object.entries(readVariables(colorBlock)).map(([name, value]) => [name.slice(2), value]),
    );
    const primitiveColors = Object.fromEntries(
      Object.entries(primitives).filter(([name]) => name.startsWith("color-")),
    );
    expect(scaleColors).toEqual(primitiveColors);
  });

  test("a level 1 color is a Tailwind color class with the value of Intraweb", async () => {
    const css = await buildCss(["bg-brand-700", "text-slate-500", "border-red-600"]);
    expect(css).toContain(".bg-brand-700 { background-color: var(--color-brand-700); }");
    expect(css).toContain(".text-slate-500 { color: var(--color-slate-500); }");
    expect(css).toContain(".border-red-600 { border-color: var(--color-red-600); }");
    expect(css).toContain("--color-brand-700: #42637c;");
    // Tailwind has its own red-600. The value of Intraweb replaces it.
    expect(css).toContain("--color-red-600: #d92d20;");
    expect(css).not.toMatch(/--color-red-600: oklch/);
  });

  test("the font of the page is --font-body, which is Inter, and --font-heading is Poppins", async () => {
    const css = await buildCss(["font-body", "font-heading"]);
    expect(css).toContain("--default-font-family: var(--font-body);");
    expect(css).toContain("--font-body: var(--font-stack-sans);");
    expect(css).toContain("--font-heading: var(--font-stack-display);");
    expect(css).toContain('--font-stack-sans: var(--font-inter, "Inter"), ui-sans-serif, system-ui, sans-serif;');
    expect(css).toContain(
      '--font-stack-display: var(--font-poppins, "Poppins"), ui-sans-serif, system-ui, sans-serif;',
    );
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
    {
      name: "light",
      colors: { "bg-primary": "#0055aa", "bg-promo": "#b34700", "text-on-promo": "#ffffff" },
    },
    {
      name: "dark",
      base: "dark" as const,
      colors: {
        "bg-promo": "#ffb37a",
        "text-on-promo": "#0c111d",
        "border-promo": "#ffb37a",
        "icon-promo": "#ffb37a",
        "data-4": "#00c2a8",
        ink: "#00c2a8",
      },
    },
  ];

  test("returns the added colors only: a color of one group with the variable of its class, another color as --color-<name>", () => {
    expect(createTailwindTheme(themeInputs)).toBe(
      [
        "@theme {",
        "  --color-ink: #00c2a8;",
        "}",
        "@theme inline {",
        "  --background-color-promo: var(--bg-promo, #b34700);",
        "  --text-color-on-promo: var(--text-on-promo, #ffffff);",
        "  --border-color-promo: var(--border-promo, #ffb37a);",
        "  --text-color-icon-promo: var(--icon-promo, #ffb37a);",
        "  --color-data-4: var(--data-4, #00c2a8);",
        "}",
        "",
      ].join("\n"),
    );
  });

  test("returns an empty text when no theme adds a color", () => {
    expect(createTailwindTheme([{ name: "light", colors: { "bg-primary": "#0055aa" } }])).toBe("");
  });

  test("refuses the same bad values createTheme refuses", () => {
    expect(() => createTailwindTheme([{ name: "light", colors: { "bg-promo": "red; }" } }])).toThrow(
      /the color "bg-promo"/,
    );
    expect(() => createTailwindTheme([{ name: "light", colors: { primary: "#0055aa" } }])).toThrow(
      /already belongs to the library/,
    );
  });

  test("a color an app added is a Tailwind class, and each theme gives it its own value", async () => {
    const appCss = [createTailwindTheme(themeInputs), ...themeInputs.map(createTheme)].join("\n");
    const css = await buildCss(
      ["bg-promo", "text-on-promo", "border-promo", "text-icon-promo", "fill-data-4", "bg-ink", "text-ink"],
      appCss,
    );

    expect(css).toContain(".bg-promo { background-color: var(--bg-promo, #b34700); }");
    expect(css).toContain(".text-on-promo { color: var(--text-on-promo, #ffffff); }");
    expect(css).toContain(".border-promo { border-color: var(--border-promo, #ffb37a); }");
    expect(css).toContain(".text-icon-promo { color: var(--icon-promo, #ffb37a); }");
    expect(css).toContain(".fill-data-4 { fill: var(--data-4, #00c2a8); }");
    expect(css).toContain(".bg-ink { background-color: var(--color-ink); }");
    expect(css).toMatch(/\[data-theme="?light"?\] \{[^}]*--bg-promo: #b34700;/);
    expect(css).toMatch(/\[data-theme="?dark"?\] \{[^}]*--bg-promo: #ffb37a;/);
    expect(css).toMatch(/\[data-theme="?dark"?\] \{[^}]*--color-ink: #00c2a8;/);
  });

  test("a color of one group that an app added is a class of that group only", async () => {
    const appCss = [createTailwindTheme(themeInputs), ...themeInputs.map(createTheme)].join("\n");
    const css = await buildCss(["text-promo", "bg-on-promo"], appCss);
    expect(css).not.toContain(".text-promo");
    expect(css).not.toContain(".bg-on-promo");
  });
});
