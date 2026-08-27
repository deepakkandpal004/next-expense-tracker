import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const baseDirectory = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory });

export default defineConfig([
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Modular boundaries documented in ARCHITECTURE.md — domain must stay pure (no db/cache).
    // Enforcement via code review; add `no-restricted-imports` overrides per layer when `eslint` supports flat `overrides`.
    rules: {},
  },
  globalIgnores([
    ".next/**",
    ".next-build/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
]);
