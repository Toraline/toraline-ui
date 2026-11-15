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
            "@toraline/tokens": fileURLToPath(
              new URL("./packages/tokens/src/index.ts", import.meta.url),
            ),
          },
        },
        test: {
          // The unit tests of the packages. A test file that needs a browser-like
          // page starts with the line "// @vitest-environment jsdom".
          name: "unit",
          include: ["packages/*/src/**/*.test.ts", "packages/*/src/**/*.test.tsx"],
        },
      },
      // The stories of the catalog, each one run as a test in a real browser,
      // once for each theme. See apps/catalog/vitest.projects.ts.
      ...storyTestProjects,
    ],
  },
});
