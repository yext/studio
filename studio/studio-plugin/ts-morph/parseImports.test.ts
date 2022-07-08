// import getRootPath from '../getRootPath';
import parseImports from './parseImports';

jest.mock('../getRootPath', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(pathToFixture => {
      return require('path').resolve(__dirname, '__fixtures__', pathToFixture)
    })
  }
})

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