// import getRootPath from '../getRootPath';
import parseImports from './parseImports';

jest.mock('../getRootPath')

it('works for ColorProp use case', () => {
  const imports = parseImports('components/Banner.tsx')
  expect(imports).toEqual({
    './SpecialProps': ['ColorProp']
  })
});

it('can handle multiple exports, named + default exports, and renamed exports', () => {
  const imports = parseImports('testPage.tsx')
  expect(imports).toEqual({
    './components/Banner': ['BannerProps', 'RenamedImportedClassNames', 'Banner'],
    './components/SpecialProps': ['ColorProp']
  })
});