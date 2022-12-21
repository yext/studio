module.exports = {
  root: true,
  extends: ["@yext/eslint-config/typescript-react"],
  overrides: [
    {
      files: ["**/*.{test,stories}.*"],
      rules: {
        "react-perf/jsx-no-new-array-as-prop": "off",
        "react-perf/jsx-no-new-function-as-prop": "off",
        "react-perf/jsx-no-new-object-as-prop": "off",
      },
    },
  ],
};
