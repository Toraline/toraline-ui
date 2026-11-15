#!/usr/bin/env node
// Checks the two packages that are published to npm: @toraline.tech/tokens and @toraline.tech/ui.
//
//   node scripts/check-packages.mjs            the checks of "make check" (run after a build)
//   node scripts/check-packages.mjs --publish  the same checks, and the checks that guard "npm publish"
//
// "npm publish" runs this file with --publish through the script "prepublishOnly" of each
// package. A failed check stops the publish. The release steps are in docs/releasing.md.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageFolders = ["packages/tokens", "packages/ui"];
const releaseBranch = "v2";
const isPublish = process.argv.includes("--publish");
const failures = [];

function fail(message) {
  failures.push(message);
}

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

function listFiles(folder) {
  return readdirSync(join(root, folder), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(root, join(entry.parentPath, entry.name)));
}

/** Every file path that the "exports" field of a package.json points to. */
function exportTargets(exportsField) {
  return typeof exportsField === "string"
    ? [exportsField]
    : Object.values(exportsField).flatMap(exportTargets);
}

function startsWithUseClient(path) {
  return /^\s*["']use client["']/.test(readFileSync(join(root, path), "utf8"));
}

const manifests = packageFolders.map((folder) => ({
  folder,
  manifest: readJson(`${folder}/package.json`),
}));
const version = manifests[0].manifest.version;

// 1. The packages have the same version, and @toraline.tech/ui asks for exactly that version of @toraline.tech/tokens.
for (const { folder, manifest } of manifests) {
  if (manifest.version !== version) {
    fail(`${folder}/package.json has version ${manifest.version}. Every published package must have the same version (${version}). Run: make version VERSION=<version>`);
  }
  if (manifest.private) {
    fail(`${folder}/package.json has "private": true. A published package must not have it.`);
  }
  if (manifest.publishConfig?.access !== "public") {
    fail(`${folder}/package.json must have "publishConfig": { "access": "public" }.`);
  }
  if (!manifest.scripts?.prepublishOnly?.includes("check-packages.mjs --publish")) {
    fail(`${folder}/package.json must run "check-packages.mjs --publish" in the script "prepublishOnly". It is the guard against a publish by accident.`);
  }
  for (const [name, range] of Object.entries(manifest.dependencies ?? {})) {
    if (name.startsWith("@toraline/") && range !== version) {
      fail(`${folder}/package.json depends on ${name} "${range}". It must be exactly "${version}". Run: make version VERSION=<version>`);
    }
  }
}

// 2. The change list has a section for this version.
const changelog = readFileSync(join(root, "CHANGELOG.md"), "utf8");
if (!changelog.split("\n").some((line) => line.startsWith(`## ${version} `) || line === `## ${version}`)) {
  fail(`CHANGELOG.md has no section "## ${version}". Write what changed in this version.`);
}

// 3. Every file that "exports" names exists. This needs a build.
for (const { folder, manifest } of manifests) {
  for (const target of exportTargets(manifest.exports)) {
    if (!existsSync(join(root, folder, target))) {
      fail(`${folder}: "exports" names ${target}, and that file does not exist. Run: npm run build`);
    }
  }
}

// 4. A source file that starts with "use client" keeps that line in its built file.
//    Next.js needs the line to know that a component runs in the browser.
for (const { folder } of manifests) {
  const sourceFiles = listFiles(`${folder}/src`).filter(
    (path) => /\.tsx?$/.test(path) && !/\.test\.tsx?$/.test(path) && !path.includes("/template/"),
  );
  for (const sourceFile of sourceFiles.filter(startsWithUseClient)) {
    const builtFile = sourceFile.replace("/src/", "/dist/").replace(/\.tsx?$/, ".js");
    if (!existsSync(join(root, builtFile))) {
      fail(`${sourceFile} starts with "use client", and its built file ${builtFile} does not exist.`);
    } else if (!startsWithUseClient(builtFile)) {
      fail(`${builtFile} lost the line "use client" that ${sourceFile} has.`);
    }
  }
}

// 5. A relative import in a built type file names the file with ".js". TypeScript in an app
//    that uses the Node module rules ("moduleResolution": "node16") needs the full file name.
for (const { folder } of manifests) {
  const typeFiles = listFiles(`${folder}/dist`).filter((path) => path.endsWith(".d.ts"));
  for (const typeFile of typeFiles) {
    const text = readFileSync(join(root, typeFile), "utf8");
    for (const [, specifier] of text.matchAll(/from\s+["'](\.\.?\/[^"']+)["']/g)) {
      if (!specifier.endsWith(".js")) {
        fail(`${typeFile} imports "${specifier}". Write the import in the source file with the file name and ".js", for example "./Button.js" or "./button/index.js".`);
      }
    }
  }
}

// 6. The files npm would put in each package: no test, no template, no source file, no source map.
for (const { folder, manifest } of manifests) {
  const output = execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
    cwd: join(root, folder),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  const packedFiles = JSON.parse(output)[0].files.map((file) => file.path);
  const unwanted = packedFiles.filter(
    (path) =>
      /\.test\./.test(path) || path.includes("template") || path.startsWith("src/") || path.endsWith(".map") || path.endsWith(".tsbuildinfo"),
  );
  if (unwanted.length > 0) {
    fail(`${manifest.name}: these files must not be in the package: ${unwanted.join(", ")}`);
  }
  for (const needed of ["package.json", "README.md"]) {
    if (!packedFiles.includes(needed)) {
      fail(`${manifest.name}: ${needed} is missing from the package.`);
    }
  }
}

// 7. Only for "npm publish": the person asked for this version, on the release branch, with nothing uncommitted.
if (isPublish) {
  const asked = process.env.TORALINE_RELEASE;
  if (asked !== version) {
    fail(`Publishing is blocked. Set TORALINE_RELEASE to the version you mean to publish (${version}); it is ${asked ? `"${asked}"` : "not set"}. Follow docs/releasing.md.`);
  }
  const tag = process.env.npm_config_tag ?? "latest";
  const isPreRelease = version.includes("-");
  if (isPreRelease && tag === "latest") {
    fail(`${version} is a pre-release. Publish it with "--tag next", so that "npm install" without a version does not get it.`);
  }
  if (!isPreRelease && tag !== "latest") {
    fail(`${version} is a full release. Publish it with "--tag latest", not "--tag ${tag}".`);
  }
  const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  const branch = git("rev-parse", "--abbrev-ref", "HEAD");
  if (branch !== releaseBranch) {
    fail(`Publishing is only allowed from the branch ${releaseBranch}. This is ${branch}.`);
  }
  if (git("status", "--porcelain") !== "") {
    fail("There are changes that are not committed. Commit or remove them, then publish.");
  }
}

if (failures.length > 0) {
  console.error(`check-packages: ${failures.length} problem(s):`);
  for (const [index, message] of failures.entries()) {
    console.error(`  ${index + 1}. ${message}`);
  }
  process.exit(1);
}
console.log(`check-packages: ${manifests.map(({ manifest }) => `${manifest.name}@${manifest.version}`).join(" and ")} are consistent${isPublish ? ", and the publish checks pass" : ""}.`);
