import js from "@eslint/js";
import storybook from "eslint-plugin-storybook";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "legacy/**",
      "**/dist/**",
      "**/node_modules/**",
      "local-docs/**",
      "**/.next/**",
      "**/next-env.d.ts",
      "**/storybook-static/**",
      // ESLint skips a folder whose name starts with a dot. This line makes it
      // read the configuration of Storybook in apps/catalog/.storybook.
      "!**/.storybook",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // The rules of Storybook for story files and for .storybook/main.ts.
  ...storybook.configs["flat/recommended"],
);
