module.exports = {
  root: true,
  extends: ["@yext/eslint-config"],
  ignorePatterns: [
    "**/lib",
    "**/build",
    "packages/studio-plugin/tests/__fixtures__/**/*.tsx",
    ".eslintrc.cjs",
    "**/coverage",
  ],
  parserOptions: {
    project: ["tsconfig.json"],
  },
  rules: {
    "@typescript-eslint/require-await": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/await-thenable": "error",
  },
  overrides: [
    {
      files: ["**/*.{test,stories}.*"],
      rules: {
        "react-perf/jsx-no-new-array-as-prop": "off",
        "react-perf/jsx-no-new-function-as-prop": "off",
        "react-perf/jsx-no-new-object-as-prop": "off",
      },
    },
    {
      files: ["**/modules/*.tsx"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
  ],
};
