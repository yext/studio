import { PropTypes, StudioNpmModulePlugin } from 'studio'

export const searchUiReactStudioPlugin: StudioNpmModulePlugin = {
  moduleName: '@yext/search-ui-react',
  exports: [
    {
      exportIdentifier: 'SearchBar',
      initialProps: {
        placeholder: {
          type: PropTypes.string,
          value: 'place holder text...'
        }
      }
    }, 
    'ApplyFiltersButton'
  ],
  cssImports: ['@yext/search-ui-react/bundle.css'],
  nonEsmDeps: ['recent-searches', 'hashlru', 'lodash/isEqual', 'prop-types', 'react-dom', 'raf', 'cross-fetch']
}