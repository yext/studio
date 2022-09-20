import path from 'path'

const mockGetRootPath = jest.fn().mockImplementation((pathToFixture: string) => {
  return path.resolve(__dirname, '../__fixtures__', pathToFixture)
})

export default mockGetRootPath