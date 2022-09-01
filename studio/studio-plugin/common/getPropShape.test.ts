import getRootPath from '../getRootPath'
import { PropTypes } from '../../types'
import { getPropShape } from './getPropShape'
import { getSourceFile } from './getSourceFile'
import { PropShape } from '../../shared/models'

jest.spyOn(console, 'error').mockImplementation(jest.fn())
jest.mock('../getRootPath')

it('gets prop interface defined in the provided file path correctly', () => {
  const propShape = getPropShape(
    getSourceFile(getRootPath('components/Banner.tsx')),
    getRootPath('components/Banner.tsx'),
    'BannerProps'
  )
  const expectedPropShape: PropShape = {
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
  }
  expect(propShape).toEqual(expectedPropShape)
})

it('gets prop interface from an import correctly', () => {
  const propShape = getPropShape(
    getSourceFile(getRootPath('components/SpecificHeader.global.tsx')),
    getRootPath('components/SpecificHeader.global.tsx'),
    'SpecificHeaderProps'
  )
  const expectedPropShape: PropShape = {
    prop1: {
      type: PropTypes.HexColor,
      doc: 'this is prop1'
    },
    prop2: {
      type: PropTypes.number,
      doc: 'this is prop2'
    }
  }
  expect(propShape).toEqual(expectedPropShape)
})
