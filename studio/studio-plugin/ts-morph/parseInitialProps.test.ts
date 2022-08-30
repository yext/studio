import getRootPath from '../getRootPath'
import { getSourceFile } from '../common'
import { parseInitialProps } from './parseInitialProps'
import { PropShape } from '../../shared/models'
import { PropTypes } from '../../types'

jest.spyOn(console, 'error').mockImplementation(jest.fn())
jest.mock('../getRootPath')

it('parses intial props correctly', () => {
  const sourceFile = getSourceFile(getRootPath('components/Banner.tsx'))
  const propShape: PropShape = {
    title: {
      type: PropTypes.string,
    },
    randomNum: {
      type: PropTypes.number,
    },
    someBool: {
      type: PropTypes.boolean,
    },
    backgroundColor: {
      type: PropTypes.HexColor,
    }
  }
  const initialProps = parseInitialProps(sourceFile, propShape)
  expect(initialProps).toEqual({
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
  })
})
