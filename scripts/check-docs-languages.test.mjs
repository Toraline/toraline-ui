import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import {
  checkDocsLanguages,
  coveredCatalogPages,
  coveredFiles,
  portuguesePath,
  readMarkdown,
} from "./check-docs-languages.mjs";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const script = join(repositoryRoot, "scripts/check-docs-languages.mjs");
const temporaryFolders = [];

/** A temporary folder with a copy of every covered file of the repository, in both languages. */
function copyOfTheDocs() {
  const folder = mkdtempSync(join(tmpdir(), "toraline-docs-"));
  temporaryFolders.push(folder);
  const paths = [...coveredFiles, ...coveredFiles.map(portuguesePath), ...coveredCatalogPages];
  for (const path of paths) {
    mkdirSync(dirname(join(folder, path)), { recursive: true });
    cpSync(join(repositoryRoot, path), join(folder, path));
  }
  return folder;
}

afterEach(() => {
  for (const folder of temporaryFolders.splice(0)) {
    rmSync(folder, { recursive: true, force: true });
  }
});

describe("check-docs-languages", () => {
  it("passes on the files of the repository", () => {
    expect(checkDocsLanguages(repositoryRoot)).toEqual([]);
  });

  it("fails when a covered file has no Portuguese version", () => {
    const folder = copyOfTheDocs();
    rmSync(join(folder, "docs/guide.pt-BR.md"));

    expect(checkDocsLanguages(folder)).toEqual([
      "docs/guide.pt-BR.md does not exist. docs/guide.md must have a version in the other language.",
    ]);
  });

  it("the command ends with an error when one file is missing, and names the file", () => {
    const folder = copyOfTheDocs();
    rmSync(join(folder, "packages/ui/README.pt-BR.md"));

    const result = spawnSync(process.execPath, [script, "--root", folder], { encoding: "utf8" });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("packages/ui/README.pt-BR.md does not exist");
  });

  it("the command ends with no error on a full copy", () => {
    const result = spawnSync(process.execPath, [script, "--root", copyOfTheDocs()], { encoding: "utf8" });

    expect(result.status).toBe(0);
  });

  it("fails when a Portuguese file has no English version", () => {
    const folder = copyOfTheDocs();
    rmSync(join(folder, "docs/releasing.md"));

    expect(checkDocsLanguages(folder)).toEqual([
      "docs/releasing.md does not exist. docs/releasing.pt-BR.md must have a version in the other language.",
    ]);
  });

  it("fails when one version gets a heading that the other does not have", () => {
    const folder = copyOfTheDocs();
    const path = join(folder, "docs/guide.md");
    writeFileSync(path, `${readFileSync(path, "utf8")}\n## A new section\n\nText.\n`);

    const failures = checkDocsLanguages(folder);

    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("docs/guide.md and docs/guide.pt-BR.md do not have the same number of headings");
    expect(failures[0]).toMatch(/level 2: \d+ in English, \d+ in Portuguese/);
  });

  it("fails when a code block differs between the two versions", () => {
    const folder = copyOfTheDocs();
    const path = join(folder, "docs/guide.pt-BR.md");
    writeFileSync(path, readFileSync(path, "utf8").replace("<Button>Save</Button>", "<Button>Salvar</Button>"));

    const failures = checkDocsLanguages(folder);

    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("is not the same in the two files");
  });

  it("fails when line 3 does not link to the other language", () => {
    const folder = copyOfTheDocs();
    const path = join(folder, "README.md");
    writeFileSync(path, readFileSync(path, "utf8").replace("**English** | [Português](README.pt-BR.md)", "English"));

    expect(checkDocsLanguages(folder)).toEqual([
      "README.md: line 3 must link to README.pt-BR.md, the version in the other language.",
    ]);
  });

  it("fails when a catalog page gets a heading in one language only", () => {
    const folder = copyOfTheDocs();
    const path = join(folder, "apps/catalog/stories/Tokens.mdx");
    writeFileSync(path, readFileSync(path, "utf8").replace("## Tokens de nível 1", "### Tokens de nível 1"));

    const failures = checkDocsLanguages(folder);

    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("apps/catalog/stories/Tokens.mdx: the two languages do not have the same number of headings");
  });

  it("does not count a line that starts with # inside a code block as a heading", () => {
    const { headingCounts, codeBlocks } = readMarkdown("# Title\n\n```bash\n# a comment\nmake check\n```\n\n## Section\n");

    expect(headingCounts).toEqual({ 1: 1, 2: 1 });
    expect(codeBlocks).toEqual(["# a comment\nmake check"]);
  });
});
