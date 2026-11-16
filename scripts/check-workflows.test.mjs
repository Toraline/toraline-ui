import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { checkWorkflow, checkWorkflows, workflowsFolder } from "./check-workflows.mjs";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const script = join(repositoryRoot, "scripts/check-workflows.mjs");
const temporaryFolders = [];

// An invented commit id: 40 characters, each one a digit or a letter from a to f.
const commitId = "0123456789abcdef0123456789abcdef01234567";

/** A workflow with no problem. A test changes one part of it. */
const goodWorkflow = `name: Sample

on:
  workflow_dispatch:
    inputs:
      version:
        type: string

permissions:
  # Only reading.
  contents: read

jobs:
  sample:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    env:
      VERSION: \${{ inputs.version }}
    steps:
      - uses: actions/checkout@${commitId} # v4.4.0
      - name: One line
        run: echo "\${VERSION}"
      - name: Several lines
        env:
          TOKEN: \${{ secrets.SAMPLE }}
        run: |
          echo "\${VERSION}"

          echo "\${GITHUB_REF}"
      - uses: ./.github/actions/local
`;

/** A temporary repository folder with one workflow file. */
function folderWithWorkflow(text) {
  const folder = mkdtempSync(join(tmpdir(), "toraline-workflows-"));
  temporaryFolders.push(folder);
  mkdirSync(join(folder, workflowsFolder), { recursive: true });
  writeFileSync(join(folder, workflowsFolder, "sample.yml"), text);
  return folder;
}

afterEach(() => {
  for (const folder of temporaryFolders.splice(0)) {
    rmSync(folder, { recursive: true, force: true });
  }
});

describe("the workflows of this repository", () => {
  it("have no problem", () => {
    expect(checkWorkflows(repositoryRoot)).toEqual([]);
  });
});

describe("checkWorkflow", () => {
  it("accepts a workflow with pinned actions, a permissions block and values in env", () => {
    expect(checkWorkflow("sample.yml", goodWorkflow)).toEqual([]);
  });

  it.each([
    ["a tag", "actions/checkout@v4"],
    ["a full version", "actions/checkout@v4.4.0"],
    ["a branch", "actions/checkout@main"],
    ["a short commit id", "actions/checkout@0123456 # v4.4.0"],
    ["a commit id with no version in a comment", `actions/checkout@${commitId}`],
  ])("refuses an action named by %s", (_name, action) => {
    const text = goodWorkflow.replace(`actions/checkout@${commitId} # v4.4.0`, action);
    const problems = checkWorkflow("sample.yml", text);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("sample.yml:20");
    expect(problems[0]).toContain("full id of a commit");
  });

  it("refuses a workflow with no permissions block", () => {
    const text = goodWorkflow.replace("permissions:\n  # Only reading.\n  contents: read\n", "");
    const problems = checkWorkflow("sample.yml", text);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('no "permissions:" block');
  });

  it("does not count a permissions block of a job as the block of the file", () => {
    const text = goodWorkflow
      .replace("permissions:\n  # Only reading.\n  contents: read\n", "")
      .replace("    runs-on: ubuntu-latest\n", "    runs-on: ubuntu-latest\n    permissions:\n      contents: read\n");
    expect(checkWorkflow("sample.yml", text)).toHaveLength(1);
  });

  it("refuses a permissions block that gives every permission, and an empty one", () => {
    const all = goodWorkflow.replace("permissions:\n  # Only reading.\n  contents: read\n", "permissions: write-all\n");
    expect(checkWorkflow("sample.yml", all)[0]).toContain("write-all");
    const empty = goodWorkflow.replace("permissions:\n  # Only reading.\n  contents: read\n", "permissions:\n");
    expect(checkWorkflow("sample.yml", empty)[0]).toContain("empty or not readable");
  });

  it("accepts a permissions block that gives no permission", () => {
    const text = goodWorkflow.replace("permissions:\n  # Only reading.\n  contents: read\n", "permissions: {}\n");
    expect(checkWorkflow("sample.yml", text)).toEqual([]);
  });

  it("refuses a value inside a script of one line", () => {
    const text = goodWorkflow.replace('run: echo "${VERSION}"', 'run: echo "${{ inputs.version }}"');
    const problems = checkWorkflow("sample.yml", text);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("sample.yml:22");
    expect(problems[0]).toContain('"run:" step');
  });

  it("refuses a value inside a script of several lines, also after an empty line", () => {
    const text = goodWorkflow.replace('echo "${GITHUB_REF}"', 'echo "${{ github.head_ref }}"');
    const problems = checkWorkflow("sample.yml", text);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("sample.yml:29");
  });
});

describe("the command", () => {
  it("ends with 0 for a good workflow and with 1 for a bad one, and names the file and the line", () => {
    const good = spawnSync("node", [script, "--root", folderWithWorkflow(goodWorkflow)], { encoding: "utf8" });
    expect(good.status).toBe(0);

    const badText = goodWorkflow.replace(`actions/checkout@${commitId} # v4.4.0`, "actions/checkout@v4");
    const bad = spawnSync("node", [script, "--root", folderWithWorkflow(badText)], { encoding: "utf8" });
    expect(bad.status).toBe(1);
    expect(bad.stderr).toContain(".github/workflows/sample.yml:20");
  });
});
