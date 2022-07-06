module.exports = {
  extends: [
    '@yext/slapshot/typescript-react'
  ],
  ignorePatterns: ['lib', 'tests/setup/responses', 'storybook-static', '!.storybook', '*.js'],
  overrides: [
    {
      files: ['**'],
      rules: {
        'react-perf/jsx-no-new-array-as-prop': 'off',
        'react-perf/jsx-no-new-function-as-prop': 'off',
        'react-perf/jsx-no-new-object-as-prop': 'off',
        "@typescript-eslint/semi": ['warn', 'never']
      }
    }
  ]
};