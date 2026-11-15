#!/usr/bin/env node
// Lists every line of the repository that still has a token name or a token class
// from before phase 6 (TOR-1122), when the tokens got the names of the app Intraweb.
//
//   node scripts/find-old-token-names.mjs
//
// It prints each line it finds, then the number of lines. "0 lines" means no old
// name is left. It reads every file that git tracks, except:
// - legacy/, the old library;
// - docs/decisions.md, which has the table old name -> new name;
// - package-lock.json, and font and image files.
// The old names are listed in docs/decisions.md, in the entries of TOR-1131 and TOR-1134.
// This script is not part of "make check". It exits with code 1 when it finds a line.
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

// The names of the old color tokens that are not the end of a new class.
const oldColors =
  "surface-raised|surface-muted|text-muted|border-strong|primary-foreground|danger-foreground|danger-hover|success-foreground|focus-ring|brand-foreground";
const patterns = [
  // The old level 2 tokens.
  /--color-(surface|surface-raised|surface-muted|text|text-muted|border|border-strong|primary|primary-hover|primary-foreground|danger|danger-hover|danger-foreground|success|success-foreground|focus-ring|overlay)(?![\w-])/,
  /--(radius|shadow)(?![\w-])/,
  // The old level 1 tokens.
  /--(purple|grey|red|green)-\d/,
  /--(black|white)(?![\w-])/,
  /--(radius|shadow)-size-/,
  // The old classes whose name no longer exists.
  new RegExp(`(?<![\\w-])(bg|text|border|border-[trblxyse]|outline|ring|fill|stroke)-(${oldColors}|text|border)(?![\\w-])`),
  /(?<![\w-])bg-(danger|brand)(?![\w-])/,
  /(?<![\w-])(border|border-[trblxyse]|outline|ring)-primary(?![\w-])/,
  /(?<![\w-])(text|border|outline)-surface(?![\w-])/,
  // The old classes "rounded" and "shadow", written as a class:
  // in a text of classes (a quoted text that also has a class with a dash),
  /["'`](?=[^"'`]*[a-z]-[a-z])([\w:/[\].-]+ )*(rounded|rounded-[trbl]|shadow)( [\w:/[\].-]+)*["'`]/,
  // alone in a class attribute,
  /class(Name)?=["'{`]+(rounded|rounded-[trbl]|shadow)["'}`]/,
  // or alone in backticks, as documentation writes a class.
  /`(rounded|rounded-[trbl]|shadow)`/,
];

const files = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split("\n")
  .filter((path) => path !== "" && statSync(path).isFile() && !path.startsWith("legacy/") && path !== "docs/decisions.md" && path !== "package-lock.json" && !/\.(woff2|png|ico)$/.test(path));

let count = 0;
for (const path of files) {
  const lines = readFileSync(path, "utf8").split("\n");
  lines.forEach((line, index) => {
    if (patterns.some((pattern) => pattern.test(line))) {
      count += 1;
      console.log(`${path}:${index + 1}: ${line.trim().slice(0, 180)}`);
    }
  });
}
console.log(`${count} lines in ${files.length} files`);
process.exit(count === 0 ? 0 : 1);
