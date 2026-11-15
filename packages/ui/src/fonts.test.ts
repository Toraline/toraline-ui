import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import { darkTheme, lightTheme, primitives } from "@toraline.tech/tokens";

/**
 * The rule of TOR-1007: no library file names a font outside the tokens.
 * The only place with font names is the level 1 file of the tokens package
 * (css/primitives.css and src/primitives.ts). Everything else uses
 * --font-body, --font-heading and --font-mono.
 *
 * Since TOR-1135 the default fonts are Inter (normal text) and Poppins
 * (headings and buttons). The library names them and downloads no font file.
 */

const packagesFolder = fileURLToPath(new URL("../../", import.meta.url));

const listFiles = (folder: string): string[] =>
  readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });

const isTestFile = (path: string) => /\.test\.tsx?$/.test(path);
const isPrimitivesFile = (path: string) => /primitives\.(css|ts)$/.test(path);
// The copies of Intraweb's CSS files, which the tests of the tokens compare with. They are not library code.
const isFixtureFile = (path: string) => path.includes("intraweb-fixtures");

const libraryFiles = ["tokens/css", "tokens/src", "ui/css", "ui/src"]
  .flatMap((folder) => listFiles(join(packagesFolder, folder)))
  .filter((path) => !isTestFile(path) && !isPrimitivesFile(path) && !isFixtureFile(path));

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
      expect(theme.tokens[tokenName]).toMatch(/^var\(--font-stack-(sans|display|mono)\)$/);
    }
  }
});

test("no library code sets a font by itself", () => {
  for (const path of codeFiles) {
    const code = withoutComments(readFileSync(path, "utf8"));
    expect(code, path).not.toMatch(/font-family\s*:|fontFamily/);
  }
});

test("the default fonts are Inter for normal text and Poppins for headings, each with fonts of the device after it", () => {
  expect(primitives["font-stack-sans"]).toMatch(/^var\(--font-inter, "Inter"\), .+, sans-serif$/);
  expect(primitives["font-stack-display"]).toMatch(/^var\(--font-poppins, "Poppins"\), .+, sans-serif$/);
  expect(primitives["font-stack-mono"]).toMatch(/, monospace$/);
});

test("the library ships no font file and has no code that downloads one", () => {
  const everyFile = ["tokens/css", "tokens/src", "ui/css", "ui/src"].flatMap((folder) =>
    listFiles(join(packagesFolder, folder)),
  );
  expect(everyFile.filter((path) => /\.(woff2?|ttf|otf|eot)$/.test(path))).toEqual([]);
  for (const path of libraryFiles) {
    const text = withoutComments(readFileSync(path, "utf8"));
    expect(text, path).not.toMatch(/@font-face|next\/font|fonts\.googleapis|fonts\.gstatic/);
  }
});

test("the font names of the level 1 font stacks are in no other library file", () => {
  // The names with a capital letter are fonts: "Inter", "Poppins", "Menlo".
  // The others are words of CSS: "var(--font-inter", "ui-sans-serif", "system-ui", "monospace".
  const fontNames = [
    primitives["font-stack-sans"],
    primitives["font-stack-display"],
    primitives["font-stack-mono"],
  ]
    .flatMap((stack) => stack.split(","))
    .map((name) => name.trim().replace(/["()]/g, ""))
    .filter((name) => /^[A-Z]/.test(name));
  expect(fontNames).toContain("Inter");
  expect(fontNames).toContain("Poppins");
  expect(fontNames).toContain("Liberation Mono");

  for (const path of libraryFiles) {
    const text = withoutComments(readFileSync(path, "utf8"));
    for (const fontName of fontNames) {
      // A whole word: "Inter" is not found inside "Interval".
      const isNamed = new RegExp(`\\b${fontName}\\b`).test(text);
      expect(isNamed, `${fontName} in ${path}`).toBe(false);
    }
  }
});
