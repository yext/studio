import { StudioNpmComponentPlugin } from '../../studio/shared/StudioNpmComponentPlugin';

export const searchUiReactStudioPlugin: StudioNpmComponentPlugin = {
  packagePath: '../../../node_modules/@yext/search-ui-react',
  exports: ['SearchBar'],
  additionalImports: ['../../../node_modules/@yext/search-ui-react/lib/bundle.css'],
  nonEsmDeps: ['recent-searches', 'hashlru', 'lodash/isEqual', 'prop-types', 'react-dom', 'raf', 'cross-fetch']
}