module.exports = {
  root: true,
  extends: ["@yext/eslint-config"],
  ignorePatterns: [
    "**/lib",
    "**/build",
    "packages/studio-plugin/tests/__fixtures__/**/*.tsx",
  ],
};
