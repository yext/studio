import path from 'path'

const mockGetRootPath = jest.fn().mockImplementation((pathToFixture: string) => {
  if (pathToFixture.startsWith('src/')) {
    pathToFixture = '.' + pathToFixture.substring(3)
  }
  return path.resolve(__dirname, '../__fixtures__', pathToFixture)
})

export default mockGetRootPath