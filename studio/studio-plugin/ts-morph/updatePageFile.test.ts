import fs from 'fs'
import { ComponentState } from '../../shared/models'
import { PropTypes } from '../../types'
import getRootPath from '../getRootPath'
import updatePageFile from './updatePageFile'

jest.mock('uuid', () => ({ v1: () => 'mock-uuid' }))
jest.mock('../getRootPath')

beforeEach(() => {
  jest.spyOn(fs, 'writeFileSync').mockImplementation()
  jest.clearAllMocks()
})

const layoutState: ComponentState = {
  name: '',
  props: {},
  uuid: '0',
  moduleName: 'localComponents'
}

const BannerOne: ComponentState = {
  name: 'Banner',
  props: {
    title: {
      type: PropTypes.string,
      value: 'first!'
    },
    randomNum: {
      type: PropTypes.number,
      value: 1,
    }
  },
  uuid: '1',
  moduleName: 'localComponents'
}

const BannerTwo: ComponentState = {
  name: 'Banner',
  props: {
    title: {
      type: PropTypes.string,
      value: 'two'
    },
    randomNum: {
      type: PropTypes.number,
      value: 2,
    },
    someBool: {
      type: PropTypes.boolean,
      value: true
    },
  },
  uuid: '2',
  moduleName: 'localComponents'
}

it('can update props and add additional props', () => {
  updatePageFile(
    {
      layoutState,
      componentsState: [
        BannerOne,
        BannerTwo
      ]
    }
    , getRootPath('testPage.tsx'))
  expect(fs.writeFileSync).toHaveBeenCalledWith(
    expect.stringContaining('testPage.tsx'),
    fs.readFileSync(getRootPath('testPageAfterUpdate.tsx'), 'utf-8')
  )
})

it('can add additional components', () => {
  updatePageFile({
    layoutState,
    componentsState: [ BannerOne ]
  }, getRootPath('emptyPage.tsx'))
  expect(fs.writeFileSync).toHaveBeenCalledWith(
    expect.stringContaining('emptyPage.tsx'),
    fs.readFileSync(getRootPath('emptyPageAfterUpdate.tsx'), 'utf-8')
  )
})
