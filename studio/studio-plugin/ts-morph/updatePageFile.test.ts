import fs from 'fs'
import getRootPath from '../getRootPath'
import updatePageFile from './updatePageFile'

jest.mock('../getRootPath')

beforeEach(() => {
  jest.spyOn(fs, 'writeFileSync').mockImplementation()
  jest.clearAllMocks()
})

it('can update props and add additional props', () => {
  updatePageFile(
    [
      {
        'name': 'Banner',
        'props': {
          'title': 'first!',
          'randomNum': 1,
        },
        'uuid': '1'
      },
      {
        'name': 'Banner',
        'props': {
          'title': 'two',
          'randomNum': 2,
          'someBool': true
        },
        'uuid': '2'
      },
      {
        'name': 'Banner',
        'props': {
          'title': 'three',
          'randomNum': 3,
          'someBool': false
        },
        'uuid': '3'
      }
    ]
    , 'testPage.tsx')
  expect(fs.writeFileSync).toHaveBeenCalledWith(
    expect.stringContaining('testPage.tsx'),
    fs.readFileSync(getRootPath('testPageAfterUpdate.tsx'), 'utf-8')
  )
})

it('can add additional components', () => {
  updatePageFile([{
    'name': 'Banner',
    'props': {
      'title': 'first!',
      'randomNum': 1,
    },
    'uuid': '1'
  }], 'emptyPage.tsx')
  expect(fs.writeFileSync).toHaveBeenCalledWith(
    expect.stringContaining('emptyPage.tsx'),
    fs.readFileSync(getRootPath('emptyPageAfterUpdate.tsx'), 'utf-8')
  )
})
