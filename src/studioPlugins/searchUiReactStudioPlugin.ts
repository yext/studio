import { StudioNpmModulePlugin } from '../../studio/shared/StudioNpmModulePlugin';

export const searchUiReactStudioPlugin: StudioNpmModulePlugin = {
  moduleName: '@yext/search-ui-react',
  exports: ['SearchBar'],
  cssImports: ['./node_modules/@yext/search-ui-react/lib/bundle.css'],
  nonEsmDeps: ['recent-searches', 'hashlru', 'lodash/isEqual', 'prop-types', 'react-dom', 'raf', 'cross-fetch']
}