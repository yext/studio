module.exports = {
  root: true,
  extends: ["@yext/eslint-config"],
  ignorePatterns: [
    "**/lib",
    "**/build",
    "packages/studio-plugin/tests/__fixtures__/**/*.tsx",
    ".eslintrc.cjs",
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
      files: ["**/*.test.*"],
      rules: {
        "@typescript-eslint/require-await": "off",
        "@typescript-eslint/no-floating-promises": "off",
      },
    },
  ],
};
