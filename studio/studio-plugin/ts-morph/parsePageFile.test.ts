import { ComponentState } from 'react'
import parsePageFile from './parsePageFile'

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
it('correctly parse page with React.Fragment layout', () => {
  const result = parsePageFile('reactFragmentLayoutPage.tsx')

  expect(result).toEqual({
    layoutState: {
      name: 'React.Fragment',
      props: {},
      uuid: 'mock-uuid'
    },
    componentsState
  })
})

it('correctly parse page with Fragment layout', () => {
  const result = parsePageFile('fragmentLayoutPage.tsx')

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
  const result = parsePageFile('shortFragmentSyntaxLayoutPage.tsx')

  expect(result).toEqual({
    layoutState: {
      name: '',
      props: {},
      uuid: 'mock-uuid'
    },
    componentsState
  })
})

it('correctly parse page with div layout component', () => {
  const result = parsePageFile('divLayoutPage.tsx')

  expect(result).toEqual({
    layoutState: {
      name: 'div',
      props: {},
      uuid: 'mock-uuid',
    },
    componentsState
  })
})

it('correctly parse page with custom layout component', () => {
  const result = parsePageFile('customLayoutPage.tsx')

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
