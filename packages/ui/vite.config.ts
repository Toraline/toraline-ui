import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      // One entry for each entry of the package: "@toraline/ui" and "@toraline/ui/theme".
      entry: {
        index: "src/index.ts",
        "theme/index": "src/theme/index.ts",
      },
      formats: ["es"],
    },
    rolldownOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "@toraline/tokens"],
      // The build warns that a "use client" line may be lost when files are joined.
      // Files are not joined here (preserveModules), so the line is kept.
      onLog(level, log, defaultHandler) {
        if (log.code !== "MODULE_LEVEL_DIRECTIVE") {
          defaultHandler(level, log);
        }
      },
      output: {
        // One built file for each source file, in the same folders. A file that
        // starts with "use client" keeps that line, so only the components that
        // need the browser are Client Components in a Next.js app.
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
      },
    },
  },
});
