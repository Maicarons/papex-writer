import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@shared": resolve(__dirname, "packages/shared/src"),
      "@latex-core": resolve(__dirname, "packages/latex-core/src"),
      "@ai-core": resolve(__dirname, "packages/ai-core/src"),
      "@md-to-latex": resolve(__dirname, "packages/md-to-latex/src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["packages/**/*.test.ts", "src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["packages/**/src/**"],
    },
  },
});
