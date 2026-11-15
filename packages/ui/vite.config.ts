import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      // One file per entry of the package: "@toraline/ui" and "@toraline/ui/theme".
      entry: {
        index: "src/index.ts",
        theme: "src/theme/index.ts",
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "@toraline/tokens"],
    },
  },
});
