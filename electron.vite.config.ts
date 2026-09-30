import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/main/index.ts"),
        },
      },
    },
    resolve: {
      alias: {
        "@shared": resolve(__dirname, "packages/shared/src"),
        "@latex-core": resolve(__dirname, "packages/latex-core/src"),
        "@ai-core": resolve(__dirname, "packages/ai-core/src"),
        "@md-to-latex": resolve(__dirname, "packages/md-to-latex/src"),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/preload/index.ts"),
        },
        output: {
          format: "cjs",
          entryFileNames: "[name].js",
        },
      },
    },
  },
  renderer: {
    resolve: {
      alias: {
        "@": resolve(__dirname, "src/renderer"),
        "@shared": resolve(__dirname, "packages/shared/src"),
        "@latex-core": resolve(__dirname, "packages/latex-core/src"),
        "@ai-core": resolve(__dirname, "packages/ai-core/src"),
        "@md-to-latex": resolve(__dirname, "packages/md-to-latex/src"),
      },
    },
    plugins: [react()],
  },
});
