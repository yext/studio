import getRootPath from '../getRootPath'
import parsePropInterface from './parsePropInterface'

jest.spyOn(console, 'error').mockImplementation(jest.fn())
jest.mock('../getRootPath')

it('updates correctly', () => {
  const propShape = parsePropInterface(getRootPath('components/Banner.tsx'), 'BannerProps')
  expect(propShape).toEqual({
    title: {
      type: 'string'
    },
    randomNum: {
      type: 'number',
      doc: 'jsdoc single line'
    },
    someBool: {
      type: 'boolean',
      doc: '\nthis is a jsdoc\nmulti-line comments!'
    },
    backgroundColor: {
      type: 'HexColor'
    }
  })
  expect(console.error).toBeCalledWith('Prop type ColorProp is not recognized. Skipping gracefully.')
})
