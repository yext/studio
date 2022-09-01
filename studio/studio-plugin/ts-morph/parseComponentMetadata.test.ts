import getRootPath from '../getRootPath'
import { getSourceFile } from '../common'
import parseComponentMetadata from './parseComponentMetadata'
import { PropTypes } from '../../types'

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
      title: {
        type: PropTypes.string,
        value: 'Title'
      },
      randomNum: {
        type: PropTypes.number,
        value: 42
      },
      someBool: {
        type: PropTypes.boolean,
        value: true
      },
      backgroundColor: {
        type: PropTypes.HexColor,
        value: '#ffff00'
      }
    },
    propShape: {
      title: {
        type: PropTypes.string
      },
      randomNum: {
        type: PropTypes.number,
        doc: 'jsdoc single line'
      },
      someBool: {
        type: PropTypes.boolean,
        doc: '\nthis is a jsdoc\nmulti-line comments!'
      },
      backgroundColor: {
        type: PropTypes.HexColor
      }
    },
    editable: true,
    global: false
  })
  expect(console.error).toBeCalledWith('Prop type ColorProp is not one of the recognized PropTypes. Skipping.')
})
