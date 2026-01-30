import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "@typescript-eslint/eslint-plugin";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // TypeScript rules enhancement
  {
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "react-hooks/static-components": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
    },
  },
  // Design System: Block hardcoded colors in className
  // Exceptions: chart configs, tenant customization, design-system demos
  {
    files: ["**/*.tsx", "**/*.ts"],
    ignores: [
      "**/dev/design-system/**",
      "**/components/analytics/charts/**",
      "**/components/TenantProvider.tsx",
    ],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "Literal[value=/text-\\[#[0-9a-fA-F]/]",
          message: "🎨 Hardcoded color detected! Use design tokens (text-primary-500, text-gray-700, etc.) instead of text-[#...]",
        },
        {
          selector: "Literal[value=/bg-\\[#[0-9a-fA-F]/]",
          message: "🎨 Hardcoded color detected! Use design tokens (bg-primary-500, bg-gray-100, etc.) instead of bg-[#...]",
        },
        {
          selector: "Literal[value=/border-\\[#[0-9a-fA-F]/]",
          message: "🎨 Hardcoded color detected! Use design tokens (border-primary-500, border-gray-200, etc.) instead of border-[#...]",
        },
      ],
    },
  },
]);

export default eslintConfig;
