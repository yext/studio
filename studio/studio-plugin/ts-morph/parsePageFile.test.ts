import { ComponentState } from 'react'
import parsePageFile from './parsePageFile'
import getRootPath from '../getRootPath'
import { ExpressionSourceType, PropTypes } from '../../types'

jest.mock('../componentMetadata')
jest.mock('../getRootPath')
jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }))

const componentsState: ComponentState[] = [
  {
    name: 'Banner',
    props: {
      randomNum: {
        type: PropTypes.number,
        value: 1
      },
      title: {
        type: PropTypes.string,
        value: 'first!'
      }
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
      randomNum: {
        type: PropTypes.number,
        value: 3
      },
      title: {
        type: PropTypes.string,
        value: 'three'
      },
      someBool: {
        type: PropTypes.boolean,
        value: false
      }
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
      uuid: 'mock-uuid',
      moduleName: 'builtIn'
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
      uuid: 'mock-uuid',
      moduleName: 'builtIn'
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
      uuid: 'mock-uuid',
      moduleName: 'builtIn'
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
      moduleName: 'builtIn'
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
      moduleName: 'localLayouts'
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
      moduleName: 'localLayouts'
    },
    componentsState: [
      {
        name: 'Banner',
        props: {
          streamsData: {
            type: PropTypes.StreamsData,
            value: 'document.address.city',
            expressionSource: ExpressionSourceType.Unknown,
          },
          subtitleUsingStreams: {
            type: PropTypes.StreamsString,
            // eslint-disable-next-line no-template-curly-in-string
            value: '`my prefix ${document.id} my suffix`',
            expressionSource: ExpressionSourceType.Unknown,
          }
        },
        uuid: 'mock-uuid',
        moduleName: 'localComponents'
      }
    ]
  })
})

it('parses nested components props and children correctly', () => {
  const result = parsePageFile(getRootPath('nestedComponents.tsx'))
  expect(result.componentsState).toHaveLength(2)
  expect(result.componentsState[0]).toEqual(expect.objectContaining({
    props: {
      bgColor: {
        type: PropTypes.HexColor,
        value: '#453d0d'
      }
    }
  }))
  expect(result.componentsState[1]).toEqual(expect.objectContaining({
    props: {},
    parentUUID: 'mock-uuid'
  }))
})