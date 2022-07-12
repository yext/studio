import parsePropInterface from './parsePropInterface'

jest.mock('../getRootPath')

it('updates correctly', () => {
  const propShape = parsePropInterface('components/Banner.tsx', 'BannerProps')
  expect(propShape).toEqual({
    title: 'string',
    randomNum: 'number',
    someBool: 'boolean',
    backgroundColor: 'ColorProp'
  })
})
