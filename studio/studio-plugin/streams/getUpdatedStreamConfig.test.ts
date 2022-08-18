import { ComponentState } from '../../shared/models'
import updateStreamConfig, { getStreamPropValues, getUsedDocumentPaths } from './getUpdatedStreamConfig'

jest.mock('../componentMetadata', () => {
  const moduleNameToComponentMetadata = {
    localComponents: {
      Banner: {
        propShape: {
          streamTemplateString: {
            type: 'StreamsTemplateString'
          },
          notStreams: {
            type: 'number'
          },
          streamPath: {
            type: 'StreamsDataPath'
          }
        }
      }
    }
  }
  return { moduleNameToComponentMetadata }
})

const COMPONENTS_STATE = [
  {
    name: 'Banner',
    props: {
      // eslint-disable-next-line no-template-curly-in-string
      streamTemplateString: '`${document.id}: ${document.address.line1}`',
      notStreams: 123
    },
    moduleName: 'localComponents',
    uuid: 'mock-uuid'
  },
  {
    name: 'Banner',
    props: {
      streamPath: 'document.id',
    },
    moduleName: 'localComponents',
    uuid: 'mock-uuid'
  }
] as ComponentState[]

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
      StreamsTemplateString: ['`${document.id}: ${document.address.line1}`'],
      StreamsDataPath: [ 'document.id' ]
    })
  })
})

describe('getUsedDocumentPaths', () => {
  it('can parse document paths', () => {
    const usedPaths = getUsedDocumentPaths({
      // eslint-disable-next-line no-template-curly-in-string
      StreamsTemplateString: ['`${document.id}: ${document.address.line1}`'],
      StreamsDataPath: [ 'document.id', 'document.emails[0]' ]
    })
    expect(usedPaths).toEqual(new Set(['document.id', 'document.address.line1', 'document.emails']))
  })
})