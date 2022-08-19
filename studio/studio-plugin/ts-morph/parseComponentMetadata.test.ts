import getRootPath from '../getRootPath'
import { getSourceFile } from '../common/common'
import parseComponentMetadata from './parseComponentMetadata'

jest.spyOn(console, 'error').mockImplementation(jest.fn())
jest.mock('../getRootPath')

it('updates correctly', () => {
  const componentMetadata = parseComponentMetadata(
    getSourceFile(getRootPath('components/Banner.tsx')),
    getRootPath('components/Banner.tsx'),
    'BannerProps'
  )
  expect(componentMetadata).toEqual({
    importIdentifier: expect.stringContaining('components/Banner.tsx'),
    initialProps: {
      title: 'Title',
      randomNum: 42,
      someBool: true,
      backgroundColor: '#ffff00'
    },
    propShape: {
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
    },
    editable: true
  })
  expect(console.error).toBeCalledWith('Prop type ColorProp is not one of the recognized PropTypes. Skipping.')
})
