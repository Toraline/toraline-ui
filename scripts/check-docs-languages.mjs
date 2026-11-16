#!/usr/bin/env node
// Checks that the documentation exists in both languages: English and Brazilian Portuguese.
//
//   node scripts/check-docs-languages.mjs                  the check of "make check"
//   node scripts/check-docs-languages.mjs --root <folder>  the same check on another folder (used by the test)
//
// The Portuguese version of <name>.md is <name>.pt-BR.md, in the same folder.
// The decision is in docs/decisions.md (TOR-1179). For each covered file the check fails when:
//   1. one of the two versions does not exist;
//   2. line 3 of a version does not link to the other version;
//   3. the two versions do not have the same number of headings of each level
//      (a cheap sign that one was changed without the other);
//   4. the two versions do not have the same code blocks, byte for byte
//      (code is not translated).
// The two documentation pages of the catalog have both languages in one MDX file,
// each inside <InLanguage language="...">. The check compares their headings too.
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** The English files that must have a Portuguese version. Paths start at the repository root. */
export const coveredFiles = [
  "README.md",
  "docs/guide.md",
  "docs/releasing.md",
  "packages/ui/README.md",
  "packages/tokens/README.md",
];

/** The MDX pages of the catalog that have both languages in one file. */
export const coveredCatalogPages = [
  "apps/catalog/stories/Guide.mdx",
  "apps/catalog/stories/Tokens.mdx",
];

/** The path of the Portuguese version of an English file: "docs/guide.md" gives "docs/guide.pt-BR.md". */
export function portuguesePath(englishPath) {
  return englishPath.replace(/\.md$/, ".pt-BR.md");
}

/**
 * Reads a Markdown text and gives its headings and its code blocks.
 * A code block starts and ends with a line of 3 or more backticks or tildes.
 * A line that starts with "#" inside a code block is not a heading.
 */
export function readMarkdown(text) {
  const headingCounts = {};
  const codeBlocks = [];
  let openFence;
  let currentBlock = [];

  for (const line of text.split("\n")) {
    const fence = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (openFence === undefined) {
      if (fence !== undefined) {
        openFence = fence;
        currentBlock = [];
        continue;
      }
      const level = /^(#{1,6}) /.exec(line)?.[1].length;
      if (level !== undefined) {
        headingCounts[level] = (headingCounts[level] ?? 0) + 1;
      }
    } else if (fence !== undefined && fence[0] === openFence[0] && fence.length >= openFence.length) {
      codeBlocks.push(currentBlock.join("\n"));
      openFence = undefined;
    } else {
      currentBlock.push(line);
    }
  }
  return { headingCounts, codeBlocks };
}

/** The differences between the heading counts of two texts, as sentences. An empty list means they are the same. */
function headingDifferences(englishCounts, portugueseCounts) {
  const differences = [];
  for (let level = 1; level <= 6; level += 1) {
    const english = englishCounts[level] ?? 0;
    const portuguese = portugueseCounts[level] ?? 0;
    if (english !== portuguese) {
      differences.push(`level ${level}: ${english} in English, ${portuguese} in Portuguese`);
    }
  }
  return differences;
}

/** Runs the check on the repository in "root". Returns the list of problems; an empty list means the check passes. */
export function checkDocsLanguages(root) {
  const failures = [];
  const sameCommitRule = "A change in one language is made in the other in the same commit.";

  for (const englishPath of coveredFiles) {
    const paths = [englishPath, portuguesePath(englishPath)];
    const missing = paths.filter((path) => !existsSync(join(root, path)));
    if (missing.length > 0) {
      for (const path of missing) {
        const other = paths.find((candidate) => candidate !== path);
        failures.push(`${path} does not exist. ${other} must have a version in the other language.`);
      }
      continue;
    }

    const [englishText, portugueseText] = paths.map((path) => readFileSync(join(root, path), "utf8"));
    const [english, portuguese] = [englishText, portugueseText].map(readMarkdown);

    // Line 3 of each version links to the other one.
    for (const [path, text, otherPath] of [
      [paths[0], englishText, paths[1]],
      [paths[1], portugueseText, paths[0]],
    ]) {
      const thirdLine = text.split("\n")[2] ?? "";
      if (!thirdLine.includes(`${basename(otherPath)})`)) {
        failures.push(`${path}: line 3 must link to ${basename(otherPath)}, the version in the other language.`);
      }
    }

    const differences = headingDifferences(english.headingCounts, portuguese.headingCounts);
    if (differences.length > 0) {
      failures.push(`${paths[0]} and ${paths[1]} do not have the same number of headings (${differences.join("; ")}). ${sameCommitRule}`);
    }

    if (english.codeBlocks.length !== portuguese.codeBlocks.length) {
      failures.push(`${paths[0]} has ${english.codeBlocks.length} code blocks and ${paths[1]} has ${portuguese.codeBlocks.length}. ${sameCommitRule}`);
    } else {
      const firstDifferent = english.codeBlocks.findIndex((block, index) => block !== portuguese.codeBlocks[index]);
      if (firstDifferent !== -1) {
        failures.push(`${paths[0]} and ${paths[1]}: code block ${firstDifferent + 1} is not the same in the two files. Code is not translated. It starts with: ${english.codeBlocks[firstDifferent].split("\n")[0]}`);
      }
    }
  }

  for (const pagePath of coveredCatalogPages) {
    if (!existsSync(join(root, pagePath))) {
      failures.push(`${pagePath} does not exist.`);
      continue;
    }
    const text = readFileSync(join(root, pagePath), "utf8");
    const partOf = (language) =>
      new RegExp(`<InLanguage language="${language}"[^>]*>\\n(.*?)\\n</InLanguage>`, "s").exec(text)?.[1];
    const [englishPart, portuguesePart] = [partOf("en"), partOf("pt-BR")];
    if (englishPart === undefined || portuguesePart === undefined) {
      failures.push(`${pagePath} must have its text once for each language: inside <InLanguage language="en"> and inside <InLanguage language="pt-BR">.`);
      continue;
    }
    const differences = headingDifferences(
      readMarkdown(englishPart).headingCounts,
      readMarkdown(portuguesePart).headingCounts,
    );
    if (differences.length > 0) {
      failures.push(`${pagePath}: the two languages do not have the same number of headings (${differences.join("; ")}). ${sameCommitRule}`);
    }
  }

  return failures;
}

// Runs the check when this file is the command, not when a test imports it.
if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]) {
  const rootIndex = process.argv.indexOf("--root");
  const root = rootIndex === -1 ? join(dirname(fileURLToPath(import.meta.url)), "..") : process.argv[rootIndex + 1];
  const failures = checkDocsLanguages(root);
  if (failures.length > 0) {
    console.error(`check-docs-languages: ${failures.length} problem(s):`);
    for (const [index, message] of failures.entries()) {
      console.error(`  ${index + 1}. ${message}`);
    }
    process.exit(1);
  }
  console.log(`check-docs-languages: ${coveredFiles.length} files and ${coveredCatalogPages.length} catalog pages exist in English and in Portuguese, with the same headings and code blocks.`);
}
