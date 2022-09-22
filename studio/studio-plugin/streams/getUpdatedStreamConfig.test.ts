import { ComponentState } from '../../shared/models'
import { PropTypes } from '../../types'
import updateStreamConfig, { getStreamValues, getUsedDocumentPaths } from './getUpdatedStreamConfig'

const COMPONENTS_STATE: ComponentState[] = [
  {
    name: 'Banner',
    props: {
      streamTemplateString: {
        type: PropTypes.string,
        // eslint-disable-next-line no-template-curly-in-string
        value: '`${document.id}: ${document.address.line1}`',
        isExpression: true
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
        type: PropTypes.string,
        value: 'document.id',
        isExpression: true
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
        'address.line1'
      ],
      filter: {},
      localization: {
        locales: ['en'],
        primary: false
      }
    }
  })
})

describe('getStreamValues', () => {
  it('parses out props that use streams', () => {
    const streamPropValues = getStreamValues(COMPONENTS_STATE)
    expect(streamPropValues).toEqual(['document.id', 'document.address.line1', 'document.id'])
  })
})

describe('getUsedDocumentPaths', () => {
  it('can parse document paths', () => {
    const usedPaths = getUsedDocumentPaths(['document.id', 'document.address.line1', 'document.id', 'document.emails[0]'])
    expect(usedPaths).toEqual(new Set(['document.id', 'document.address.line1', 'document.emails']))
  })
})