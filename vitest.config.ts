import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    // Enable coverage configuration. Running vitest with --coverage will
    // produce coverage reports according to these defaults.
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",
      // include source files under src for coverage measurement
      include: ["src/**/*.ts"],
      // ignore test files, fixtures and dist
      exclude: ["**/*.test.ts", "**/__tests__/**", "dist/**", "node_modules/**"],
    },
  },
});
