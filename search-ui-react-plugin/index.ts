import { StudioNpmModulePlugin } from 'studio'

export const searchUiReactStudioPlugin: StudioNpmModulePlugin = {
  moduleName: '@yext/search-ui-react',
  exports: ['SearchBar'],
  cssImports: ['@yext/search-ui-react/lib/bundle.css'],
  nonEsmDeps: ['recent-searches', 'hashlru', 'lodash/isEqual', 'prop-types', 'react-dom', 'raf', 'cross-fetch']
}