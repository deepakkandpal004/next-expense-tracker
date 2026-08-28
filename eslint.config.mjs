import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const baseDirectory = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory });

export default defineConfig([
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["src/modules/**/*.{ts,tsx}", "src/common/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          {
            group: ["@/lib/**"],
            message: "Import from @/src/modules/* or @/src/common/* instead.",
          },
          {
            group: ["@/components/**"],
            message: "Import from @/src/common/ui instead.",
          },
        ],
      }],
    },
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
