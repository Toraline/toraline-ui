import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import { darkTheme, lightTheme, primitives } from "@toraline/tokens";

/**
 * The rule of TOR-1007: no library file names a font outside the tokens.
 * The only place with font names is the level 1 file of the tokens package
 * (css/primitives.css and src/primitives.ts). Everything else uses
 * --font-body, --font-heading and --font-mono.
 */

const packagesFolder = fileURLToPath(new URL("../../", import.meta.url));

const listFiles = (folder: string): string[] =>
  readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });

const isTestFile = (path: string) => /\.test\.tsx?$/.test(path);
const isPrimitivesFile = (path: string) => /primitives\.(css|ts)$/.test(path);

const libraryFiles = ["tokens/css", "tokens/src", "ui/css", "ui/src"]
  .flatMap((folder) => listFiles(join(packagesFolder, folder)))
  .filter((path) => !isTestFile(path) && !isPrimitivesFile(path));

const cssFiles = libraryFiles.filter((path) => path.endsWith(".css"));
const codeFiles = libraryFiles.filter((path) => /\.tsx?$/.test(path));

const withoutComments = (text: string) =>
  text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

test("the test looks at the library's files", () => {
  expect(cssFiles.length).toBeGreaterThanOrEqual(4);
  expect(codeFiles.length).toBeGreaterThanOrEqual(6);
});

test("every font-family in the library's CSS is a level 2 font token", () => {
  for (const path of cssFiles) {
    const css = withoutComments(readFileSync(path, "utf8"));
    for (const match of css.matchAll(/font-family:\s*([^;]+);/g)) {
      expect(match[1], path).toMatch(/^var\(--font-(body|heading|mono)\)$/);
    }
  }
});

test("the level 2 font tokens of the default themes point to level 1 font stacks", () => {
  for (const theme of [lightTheme, darkTheme]) {
    for (const tokenName of ["font-body", "font-heading", "font-mono"] as const) {
      expect(theme.tokens[tokenName]).toMatch(/^var\(--font-stack-(sans|mono)\)$/);
    }
  }
});

test("no library code sets a font by itself", () => {
  for (const path of codeFiles) {
    const code = withoutComments(readFileSync(path, "utf8"));
    expect(code, path).not.toMatch(/font-family\s*:|fontFamily/);
  }
});

test("the font names of the level 1 font stacks are in no other library file", () => {
  const genericNames = ["system-ui", "-apple-system", "ui-monospace", "sans-serif", "monospace"];
  const fontNames = [primitives["font-stack-sans"], primitives["font-stack-mono"]]
    .flatMap((stack) => stack.split(","))
    .map((name) => name.trim().replaceAll('"', ""))
    .filter((name) => !genericNames.includes(name));
  expect(fontNames).toContain("Segoe UI");

  for (const path of libraryFiles) {
    const text = withoutComments(readFileSync(path, "utf8"));
    for (const fontName of fontNames) {
      expect(text.includes(fontName), `${fontName} in ${path}`).toBe(false);
    }
  }
});
