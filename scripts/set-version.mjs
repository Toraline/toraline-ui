#!/usr/bin/env node
// Sets one version on the two published packages, and on the dependency of
// @toraline.tech/ui on @toraline.tech/tokens. Run it through make: make version VERSION=0.1.1
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const version = process.argv[2] ?? "";

// The format of a version: 0.1.1, or 0.2.0-beta.0 for a pre-release.
if (!/^\d+\.\d+\.\d+(-[a-z]+\.\d+)?$/.test(version)) {
  console.error(`set-version: "${version}" is not a version. Examples: 0.1.1, 0.2.0, 0.2.0-beta.0`);
  process.exit(1);
}

for (const folder of ["packages/tokens", "packages/ui"]) {
  const path = join(root, folder, "package.json");
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  manifest.version = version;
  for (const name of Object.keys(manifest.dependencies ?? {})) {
    if (name.startsWith("@toraline.tech/")) {
      manifest.dependencies[name] = version;
    }
  }
  writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`set-version: ${manifest.name} is now ${version}`);
}
