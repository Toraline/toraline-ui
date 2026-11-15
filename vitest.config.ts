import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // The tests of packages/ui read the source of the tokens package, not its built files.
    alias: {
      "@toraline/tokens": fileURLToPath(new URL("./packages/tokens/src/index.ts", import.meta.url)),
    },
  },
  test: {
    // A test file that needs a browser-like page starts with the line
    // "// @vitest-environment jsdom".
    include: ["packages/*/src/**/*.test.ts", "packages/*/src/**/*.test.tsx"],
  },
});
