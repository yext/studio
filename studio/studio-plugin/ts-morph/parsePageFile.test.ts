import { ComponentState } from 'react'
import parsePageFile from './parsePageFile'
import getRootPath from '../getRootPath'

jest.mock('../getRootPath')
jest.mock('uuid', () => ({ v1: () => 'mock-uuid' }))

const componentsState: ComponentState[] = [
  {
    name: 'Banner',
    props: {
      randomNum: 1,
      title: 'first!'
    },
    uuid: 'mock-uuid',
    moduleName: 'localComponents'
  },
  {
    name: 'Banner',
    props: {},
    uuid: 'mock-uuid',
    moduleName: 'localComponents'
  },
  {
    name: 'Banner',
    props: {
      randomNum: 3,
      title: 'three',
      someBool: false
    },
    uuid: 'mock-uuid',
    moduleName: 'localComponents'
  }
]

it('correctly parses page with React.Fragment layout', () => {
  const result = parsePageFile(getRootPath('reactFragmentLayoutPage.tsx'))

  expect(result).toEqual({
    layoutState: {
      name: 'React.Fragment',
      props: {},
      uuid: 'mock-uuid'
    },
    componentsState
  })
})

it('correctly parses page with Fragment layout', () => {
  const result = parsePageFile(getRootPath('fragmentLayoutPage.tsx'))

  expect(result).toEqual({
    layoutState: {
      name: 'Fragment',
      props: {},
      uuid: 'mock-uuid'
    },
    componentsState
  })
})

it('correctly parse page with Fragment layout in short syntax', () => {
  const result = parsePageFile(getRootPath('shortFragmentSyntaxLayoutPage.tsx'))

  expect(result).toEqual({
    layoutState: {
      name: '',
      props: {},
      uuid: 'mock-uuid'
    },
    componentsState
  })
})

it('correctly parses page with div layout component', () => {
  const result = parsePageFile(getRootPath('divLayoutPage.tsx'))

  expect(result).toEqual({
    layoutState: {
      name: 'div',
      props: {},
      uuid: 'mock-uuid',
    },
    componentsState
  })
})

it('correctly parses page with custom layout component', () => {
  const result = parsePageFile(getRootPath('customLayoutPage.tsx'))

  expect(result).toEqual({
    layoutState: {
      name: 'TestLayout',
      props: {},
      uuid: 'mock-uuid',
      moduleName: 'localComponents'
    },
    componentsState
  })
})

it('correctly parses page using streams paths', () => {
  const result = parsePageFile(getRootPath('streamsPage.tsx'))

  expect(result).toEqual({
    layoutState: {
      name: 'TestLayout',
      props: {},
      uuid: 'mock-uuid',
      moduleName: 'localComponents'
    },
    componentsState: [
      {
        name: 'Banner',
        props: {
          randomNum: 'document.address.city',
          // eslint-disable-next-line no-template-curly-in-string
          subtitleUsingStreams: '`my prefix ${document.id} my suffix`'
        },
        uuid: 'mock-uuid',
        moduleName: 'localComponents'
      }
    ]
  })
})
