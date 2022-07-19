import path from 'path'

const mockGetRootPath = jest.fn().mockImplementation(pathToFixture => {
  return path.resolve(__dirname, '../__fixtures__', pathToFixture)
})

export default mockGetRootPath