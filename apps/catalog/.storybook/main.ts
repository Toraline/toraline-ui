import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

/** The full path of a file of the repository, from a path that starts at the repository root. */
const fromRepositoryRoot = (path: string) =>
  fileURLToPath(new URL(`../../../${path}`, import.meta.url));

/**
 * The main configuration of Storybook: which files are stories, which addons
 * are on, and how Vite builds the catalog.
 */
const config: StorybookConfig = {
  framework: "@storybook/react-vite",

  // A story file shows one component. An MDX file is a documentation page.
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.tsx"],

  // An addon is a plugin of Storybook.
  // addon-docs builds the documentation pages and the table of props of each component.
  // addon-a11y checks each story for accessibility problems, with the tool axe-core.
  // addon-vitest runs each story as a test.
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],

  // The catalog has its own theme control in the toolbar (see preview.tsx).
  // Storybook's own background control would only change the color behind a
  // story, not the theme, so it is off.
  features: {
    backgrounds: false,
  },

  core: {
    // Storybook sends no usage data, and does not ask the network for news.
    disableTelemetry: true,
    disableWhatsNewNotifications: true,
  },

  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      build: {
        rollupOptions: {
          // The build warns that a "use client" line may be lost when files are
          // joined. The line is for Next.js. The catalog runs only in the
          // browser, so it does not need the line.
          onLog(
            level: "info" | "debug" | "warn",
            log: { code?: string },
            defaultHandler: (level: "info" | "debug" | "warn", log: { code?: string }) => void,
          ) {
            if (log.code !== "MODULE_LEVEL_DIRECTIVE") {
              defaultHandler(level, log);
            }
          },
        },
      },
      resolve: {
        // The catalog reads the source of the two packages, not their built
        // files. So the catalog opens with no build before it, a change in a
        // component shows at once, and the table of props reads the comments
        // of the source. The CSS imports ("@toraline/tokens/css",
        // "@toraline/ui/styles.css") are not in this list: they already
        // point to files that need no build.
        alias: [
          {
            find: /^@toraline\/tokens$/,
            replacement: fromRepositoryRoot("packages/tokens/src/index.ts"),
          },
          {
            find: /^@toraline\/ui$/,
            replacement: fromRepositoryRoot("packages/ui/src/index.ts"),
          },
          {
            find: /^@toraline\/ui\/theme$/,
            replacement: fromRepositoryRoot("packages/ui/src/theme/index.ts"),
          },
        ],
      },
    }),
};

export default config;
