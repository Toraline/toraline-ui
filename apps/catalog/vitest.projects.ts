import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import type { TestProjectConfiguration } from "vitest/config";
import { catalogThemes } from "./.storybook/themes.ts";

const catalogDirectory = fileURLToPath(new URL(".", import.meta.url));

/**
 * The story tests: one Vitest project for each theme of the catalog.
 * A Vitest project is a group of tests with its own settings.
 *
 * Each project runs every story of the catalog as one test, in a real browser
 * (Chromium, with no window). A test fails when the story cannot render, when
 * its "play" function fails, or when the accessibility check (axe-core) finds
 * a problem. The project "stories-dark" shows every story in the dark theme.
 *
 * The root vitest.config.ts adds these projects to the unit tests.
 */
export const storyTestProjects: TestProjectConfiguration[] = catalogThemes.map((theme) => ({
  root: catalogDirectory,
  plugins: [
    storybookTest({
      configDir: fileURLToPath(new URL(".storybook", import.meta.url)),
      // The same as the control "Theme" of the toolbar, for the whole run.
      initialGlobals: { theme },
    }),
  ],
  test: {
    name: `stories-${theme}`,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
}));
