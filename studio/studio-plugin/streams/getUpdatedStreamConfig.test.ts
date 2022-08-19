import { ComponentState } from '../../shared/models'
import { PropTypes } from '../../types'
import updateStreamConfig, { getStreamPropValues, getUsedDocumentPaths } from './getUpdatedStreamConfig'

jest.mock('../componentMetadata', () => {
  const moduleNameToComponentMetadata = {
    localComponents: {
      Banner: {
        propShape: {
          streamTemplateString: {
            type: 'StreamsString'
          },
          notStreams: {
            type: 'number'
          },
          streamPath: {
            type: 'StreamsData'
          }
        }
      }
    }
  }
  return { moduleNameToComponentMetadata }
})

const COMPONENTS_STATE: ComponentState[] = [
  {
    name: 'Banner',
    props: {
      streamTemplateString: {
        type: PropTypes.StreamsString,
        // eslint-disable-next-line no-template-curly-in-string
        value: '`${document.id}: ${document.address.line1}`',
      },
      notStreams: {
        type: PropTypes.number,
        value: 123
      }
    },
    moduleName: 'localComponents',
    uuid: 'mock-uuid'
  },
  {
    name: 'Banner',
    props: {
      streamPath: {
        type: PropTypes.StreamsData,
        value: 'document.id',
      }
    },
    moduleName: 'localComponents',
    uuid: 'mock-uuid'
  }
]

it('works with no current config', () => {
  const updatedConfig = updateStreamConfig(COMPONENTS_STATE, undefined)
  expect(updatedConfig).toEqual({
    stream: {
      $id: expect.any(String),
      fields: [
        'document.id',
        'document.address.line1'
      ],
      filter: {},
      localization: {
        locales: ['en'],
        primary: false
      }
    }
  })
})

describe('getStreamPropValues', () => {
  it('parses out props that use streams', () => {
    const streamPropValues = getStreamPropValues(COMPONENTS_STATE)
    expect(streamPropValues).toEqual({
      // eslint-disable-next-line no-template-curly-in-string
      StreamsString: ['`${document.id}: ${document.address.line1}`'],
      StreamsData: [ 'document.id' ]
    })
  })
})

describe('getUsedDocumentPaths', () => {
  it('can parse document paths', () => {
    const usedPaths = getUsedDocumentPaths({
      // eslint-disable-next-line no-template-curly-in-string
      StreamsString: ['`${document.id}: ${document.address.line1}`'],
      StreamsData: [ 'document.id', 'document.emails[0]' ]
    })
    expect(usedPaths).toEqual(new Set(['document.id', 'document.address.line1', 'document.emails']))
  })
})