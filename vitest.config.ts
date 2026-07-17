import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const isCI = process.env.CI === "true";

process.env.TZ = "UTC";

export default defineConfig({
  oxc: {
    jsx: {
      runtime: "automatic",
    },
  },
  resolve: {
    alias: { "@": rootDirectory },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup/vitest.setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["tests/e2e/**", "node_modules/**", ".next/**"],
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    isolate: true,
    fileParallelism: false,
    maxWorkers: 1,
    sequence: { shuffle: false },
    reporters: isCI ? ["default", "junit"] : ["default"],
    outputFile: isCI
      ? { junit: "test-results/vitest/junit.xml" }
      : undefined,
  },
});
