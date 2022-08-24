import getRootPath from '../getRootPath'
import { getSourceFile } from '../common'
import parseInitialProps from './parseInitialProps'

jest.spyOn(console, 'error').mockImplementation(jest.fn())
jest.mock('../getRootPath')

it('parses intial props correctly', () => {
  const sourceFile = getSourceFile(getRootPath('components/Banner.tsx'))

  const initialProps = parseInitialProps(sourceFile)
  expect(initialProps).toEqual({
    title: 'Title',
    randomNum: 42,
    someBool: true,
    backgroundColor: '#ffff00'
  })
})
