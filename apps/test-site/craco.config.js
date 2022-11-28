module.exports = {
  webpack: {
    configure: webpackConfig => {
      /**
       * CRA's usage of ModuleScopePlugin enforces a restriction that relative imports from
       * app's source directory shouldn't reach outside of it. This caused errors with the
       * monorepo structure using npm, with react related packages hoist to the root of the
       * repo. A solution, without ejecting, is to use craco to remove ModuleScopePlugin from
       * CRA's webpack config.
       */
      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) => constructor && constructor.name === 'ModuleScopePlugin'
      );
      webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
      return webpackConfig;
    }
  }
};