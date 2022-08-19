import { TemplateConfig } from '@yext/pages/*'
import { ComponentState } from '../../shared/models'
import { v1 } from 'uuid'
import { STREAMS_TEMPLATE_REGEX } from '../../client/utils/getPreviewProps'
import { PropTypes } from '../../types'

const INFRA_STREAM_PROPERTIES = [
  '__',
  'businessId',
  'id',
  'key',
  'locale',
  'meta',
  'siteDomain',
  'siteId',
  'siteInternalHostName',
  'uid'
]

export default function getUpdatedStreamConfig(
  componentsState: ComponentState[],
  currentConfig: TemplateConfig = {}
): TemplateConfig {
  const streamPropValues = getStreamPropValues(componentsState)
  const usedDocumentPaths = getUsedDocumentPaths(streamPropValues)
  const fields = [...usedDocumentPaths].filter(d => !INFRA_STREAM_PROPERTIES.includes(d))

  return {
    ...currentConfig,
    stream: {
      $id: 'studio-stream-id_' + v1(),
      filter: {},
      localization: {
        locales: ['en'],
        primary: false,
      },
      ...currentConfig.stream,
      fields
    }
  }
}

type DocumentPath = `document${string}`

export function getUsedDocumentPaths(
  streamPropValues: StreamPropValues
): Set<DocumentPath> {
  const usedPaths = streamPropValues.StreamsData.map(d => d.split('[')[0]) as DocumentPath[]
  streamPropValues.StreamsString.forEach(val => {
    const streamPaths = [...val.matchAll(STREAMS_TEMPLATE_REGEX)].map(m => m[1]) as DocumentPath[]
    streamPaths.forEach(streamPath => {
      // Streams configs fields do not allow specifying an index of a field.
      // Cutting off at the first left bracket also lets use sidestep bracket object property notation,
      // which we don't support.
      const streamPathTruncatedAtBracket = streamPath.split('[')[0] as DocumentPath
      usedPaths.push(streamPathTruncatedAtBracket)
    })
  })
  return new Set(usedPaths)
}

type StreamPropValues = Record<'StreamsData' | 'StreamsString', string[]>

export function getStreamPropValues(
  componentsState: ComponentState[]
): StreamPropValues {
  const propValuesAccumulator = {
    StreamsData: [],
    StreamsString: []
  }

  componentsState.forEach(({ props, moduleName }) => {
    if (moduleName === 'builtIn') {
      return
    }
    Object.keys(props).forEach(propName => {
      const propType = props[propName].type
      if (![PropTypes.StreamsData, PropTypes.StreamsString].includes(propType)) {
        return
      }
      const propValue = props[propName].value
      if (typeof propValue !== 'string') {
        throw new Error(`Streams prop value must be a string, received a(n) "${typeof propValue}" instead.`)
      }
      propValuesAccumulator[propType].push(propValue)
    })
  })
  return propValuesAccumulator
}
