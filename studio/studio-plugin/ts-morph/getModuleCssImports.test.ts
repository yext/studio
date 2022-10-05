import { CssImport } from '../../shared/models'
import getModuleCssImports from './getModuleCssImports'
import { resolve } from 'path'

it('can get relative path of css imports from npm module component', () => {
  const expectedCssImports: CssImport[] = [{
    moduleExportPath: 'test-module/index.css',
    relativePath: '../../studio-plugin/__fixtures__/mock_modules/test-module/index.css'
  }]
  expect(getModuleCssImports(
    ['test-module/index.css'],
    resolve(__dirname, '../__fixtures__/mock_modules')
  )).toEqual(expectedCssImports)
})
