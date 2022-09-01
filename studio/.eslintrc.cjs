module.exports = {
  extends: [
    '@yext/slapshot/typescript-react'
  ],
  ignorePatterns: ['*.js', '__fixtures__'],
  overrides: [
    {
      files: ['**'],
      rules: {
        'react-perf/jsx-no-new-array-as-prop': 'off',
        'react-perf/jsx-no-new-function-as-prop': 'off',
        'react-perf/jsx-no-new-object-as-prop': 'off',
        '@typescript-eslint/semi': ['warn', 'never']
      }
    }
  ]
};