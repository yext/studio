import parsePropInterface from './parsePropInterface'

jest.mock('../getRootPath')

it('updates correctly', () => {
  const propShape = parsePropInterface('components/Banner.tsx', 'BannerProps')
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
      type: 'ColorProp'
    }
  })
})
