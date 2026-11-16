#!/usr/bin/env node
// Checks the workflows of GitHub in .github/workflows/.
//
//   node scripts/check-workflows.mjs                  the check of "make check"
//   node scripts/check-workflows.mjs --root <folder>  the same check on another folder (used by the test)
//
// A workflow is a list of steps that GitHub runs on its own machines. The workflow
// "Release" holds the npm token that publishes the packages. The decision is in
// docs/decisions.md (TOR-1232). For each workflow file the check fails when:
//   1. a step names an action by a tag or a branch (uses: actions/checkout@v4).
//      The owner of the action can move a tag to other code. The full id of a commit
//      (40 characters) cannot be moved. The version is written in a comment after it:
//        uses: actions/checkout@<40 characters> # v4.4.0
//   2. the file has no "permissions:" block at its first level, or the block gives
//      every permission ("write-all"). Without the block, the token of the run gets
//      the default of the repository settings, which can be "read and write".
//   3. a "run:" step has a "${{ ... }}" value inside its script. GitHub pastes such a
//      value into the script before the shell reads it, so a value that a person
//      types (an input, the name of a branch, the title of a pull request) can run a
//      command. The value belongs in "env:", and the script reads the variable.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/** The folder of the workflows. The path starts at the repository root. */
export const workflowsFolder = ".github/workflows";

/** An action named by the full id of a commit, with its version in a comment. */
const pinnedAction = /^[\w.-]+\/[\w./-]+@[0-9a-f]{40} # v\d+\.\d+\.\d+$/;

/** The number of spaces at the start of a line. */
function indentationOf(line) {
  return line.length - line.trimStart().length;
}

/**
 * Checks the text of one workflow file.
 * Gives the list of problems, each one as a sentence. An empty list means: no problem.
 */
export function checkWorkflow(fileName, text) {
  const problems = [];
  const lines = text.split("\n");

  // 1. Every action is named by the full id of a commit.
  lines.forEach((line, index) => {
    const action = /^\s*(?:- )?uses:\s*(.*)$/.exec(line)?.[1].trim();
    if (action === undefined) {
      return;
    }
    // An action in a folder of this repository has no version: it is the code of the same commit.
    if (action.startsWith("./")) {
      return;
    }
    if (!pinnedAction.test(action)) {
      problems.push(
        `${fileName}:${index + 1}: the action is not named by the full id of a commit with its version in a comment. ` +
          `Write it as "uses: owner/name@<40 characters> # v1.2.3". Found: "${action}".`,
      );
    }
  });

  // 2. The file says what the token of the run may do.
  const permissionsIndex = lines.findIndex((line) => /^permissions:/.test(line));
  if (permissionsIndex === -1) {
    problems.push(
      `${fileName}: no "permissions:" block at the first level of the file. ` +
        `Add one, for example "permissions:" with the line "  contents: read" under it.`,
    );
  } else {
    const value = lines[permissionsIndex].replace(/^permissions:/, "").replace(/#.*$/, "").trim();
    const nextLine = lines.slice(permissionsIndex + 1).find((line) => line.trim() !== "" && !line.trim().startsWith("#"));
    const hasEntries = nextLine !== undefined && /^ +[a-z-]+: (read|write|none)\b/.test(nextLine);
    if (value === "write-all") {
      problems.push(`${fileName}:${permissionsIndex + 1}: "permissions: write-all" gives every permission. Name each permission the workflow needs.`);
    } else if (value !== "{}" && value !== "read-all" && !(value === "" && hasEntries)) {
      problems.push(
        `${fileName}:${permissionsIndex + 1}: the "permissions:" block is empty or not readable. ` +
          `Write each permission on its own line, for example "  contents: read".`,
      );
    }
  }

  // 3. No "${{ }}" value inside the script of a "run:" step.
  let runIndentation;
  lines.forEach((line, index) => {
    const report = () =>
      problems.push(
        `${fileName}:${index + 1}: a "\${{ }}" value is inside the script of a "run:" step. ` +
          `Move the value to "env:" of the step and read the variable in the script, in double quotes.`,
      );
    if (runIndentation !== undefined) {
      // The script goes on while the lines are empty or further to the right than "run:".
      if (line.trim() === "" || indentationOf(line) > runIndentation) {
        if (line.includes("${{")) {
          report();
        }
        return;
      }
      runIndentation = undefined;
    }
    const run = /^(\s*(?:- )?)run:\s*(.*)$/.exec(line);
    if (run === null) {
      return;
    }
    const [, before, script] = run;
    // "run: |" and "run: >" start a script of several lines. Anything else is a script of one line.
    if (/^[|>][+-]?\d*\s*(#.*)?$/.test(script)) {
      runIndentation = before.length;
    } else if (script.includes("${{")) {
      report();
    }
  });

  return problems;
}

/** Checks every workflow file of a repository. Gives the list of problems. */
export function checkWorkflows(root) {
  const folder = join(root, workflowsFolder);
  if (!existsSync(folder)) {
    return [];
  }
  return readdirSync(folder)
    .filter((fileName) => /\.ya?ml$/.test(fileName))
    .sort()
    .flatMap((fileName) =>
      checkWorkflow(`${workflowsFolder}/${fileName}`, readFileSync(join(folder, fileName), "utf8")),
    );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rootOption = process.argv.indexOf("--root");
  const root = rootOption === -1 ? join(fileURLToPath(import.meta.url), "../..") : process.argv[rootOption + 1];
  const problems = checkWorkflows(root);
  if (problems.length > 0) {
    console.error(`The workflows of GitHub have ${problems.length} problem(s):`);
    for (const problem of problems) {
      console.error(`  - ${problem}`);
    }
    console.error("The rules and their reasons: the first lines of scripts/check-workflows.mjs.");
    process.exit(1);
  }
  console.log("The workflows of GitHub name every action by a commit id, have a permissions block and paste no value into a script.");
}
