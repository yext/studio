import getRootPath from '../getRootPath'
import parseInitialProps from './parseInitialProps'

jest.spyOn(console, 'error').mockImplementation(jest.fn())
jest.mock('../getRootPath')

it('parses intial props correctly', () => {
  const initialProps = parseInitialProps(getRootPath('components/Banner.tsx'))
  expect(initialProps).toEqual({
    title: 'Title',
    randomNum: 42,
    someBool: true,
    backgroundColor: '#ffff00'
  })
})
