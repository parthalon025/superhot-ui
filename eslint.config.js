import js from "@eslint/js";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";

/**
 * ESLint config for superhot-ui (vanilla JS browser library + esbuild).
 * No JSX — plain ES6 modules.
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  js.configs.recommended,
  prettierConfig,
  {
    files: ["js/**/*.js", "preact/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        h: "readonly", // Preact JSX factory for preact/ adapters
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-console": "off",
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
    },
  },
  {
    files: ["esbuild.config.mjs", "scripts/**/*.js"],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "prefer-const": "error",
    },
  },
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "prefer-const": "error",
    },
  },
  {
    ignores: ["node_modules/", "dist/", "examples/", ".worktrees/"],
  },
];
