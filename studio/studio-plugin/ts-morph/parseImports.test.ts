import parseImports from './parseImports'
import getRootPath from '../getRootPath'

jest.mock('../getRootPath')

it('works for ColorProp use case', () => {
  const imports = parseImports(getRootPath('components/Banner.tsx'))
  expect(imports).toEqual({
    './SpecialProps': ['ColorProp'],
    '../../../types': ['HexColor']
  })
})

it('can handle multiple exports, named + default exports, and renamed exports', () => {
  const imports = parseImports(getRootPath('testPage.tsx'))
  expect(imports).toEqual({
    './components/Banner': ['BannerProps', 'RenamedImportedClassNames', 'Banner'],
    './components/SpecialProps': ['ColorProp']
  })
})