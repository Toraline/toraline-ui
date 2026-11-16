import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { storyTestProjects } from "./apps/catalog/vitest.projects.ts";

export default defineConfig({
  test: {
    // A project is a group of tests with its own settings.
    projects: [
      {
        resolve: {
          // The tests of packages/ui read the source of the tokens package, not its built files.
          alias: {
            "@toraline.tech/tokens": fileURLToPath(
              new URL("./packages/tokens/src/index.ts", import.meta.url),
            ),
          },
        },
        test: {
          // The unit tests of the packages and of the scripts. A test file that needs a browser-like
          // page starts with the line "// @vitest-environment jsdom".
          name: "unit",
          // scripts/ has the tests of the checks that "make check" runs.
          include: [
            "packages/*/src/**/*.test.ts",
            "packages/*/src/**/*.test.tsx",
            "scripts/**/*.test.mjs",
          ],
        },
      },
      // The stories of the catalog, each one run as a test in a real browser,
      // once for each theme. See apps/catalog/vitest.projects.ts.
      ...storyTestProjects,
    ],
  },
});
