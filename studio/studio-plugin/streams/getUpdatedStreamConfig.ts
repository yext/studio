import { TemplateConfig } from '@yext/pages'
import { ComponentState } from '../../shared/models'
import { v1 } from 'uuid'
import { STREAMS_TEMPLATE_REGEX } from '../../client/utils/getPreviewProps'
import { PropTypes, StreamsDataExpression, StreamsStringExpression } from '../../types'

/**
 * These are stream properties that will throw an error if specified within a {@link Stream.fields}, with
 * the exception of `id` (at the time of writing), and should always be present in localData even
 * if not specifically asked for.
 */
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
  const streamValues = getStreamValues(componentsState)
  const usedDocumentPaths = getUsedDocumentPaths(streamValues)
  const fields = [...usedDocumentPaths]
    .filter(documentPath => !INFRA_STREAM_PROPERTIES.includes(documentPath))
    .map(documentPath => documentPath.split('document.')[1])

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

export function getUsedDocumentPaths(
  streamValues: StreamValues
): Set<StreamsDataExpression> {
  const usedPaths: StreamsDataExpression[] = streamValues.documentPaths.map(d => d.split('[')[0] as StreamsDataExpression)
  streamValues.templateStrings.forEach(val => {
    const streamPaths = [...val.matchAll(STREAMS_TEMPLATE_REGEX)].map(m => m[1])
    streamPaths.forEach(streamPath => {
      // Streams configs fields do not allow specifying an index of a field.
      // Cutting off at the first left bracket also lets use sidestep bracket object property notation,
      // which we don't support.
      const streamPathTruncatedAtBracket = streamPath.split('[')[0]
      if (!isStreamsDataExpression(streamPathTruncatedAtBracket)) {
        throw new Error(
          `Error when parsing stream config, document path "${streamPath}" does not start with a "document." prefix`)
      }
      usedPaths.push(streamPathTruncatedAtBracket)
    })
  })
  return new Set(usedPaths)
}

type StreamValues = {
  documentPaths: StreamsDataExpression[],
  templateStrings: Exclude<StreamsStringExpression, StreamsDataExpression>[]
}

export function getStreamValues(
  componentsState: ComponentState[]
): StreamValues {
  const valuesAccumulator: StreamValues = {
    documentPaths: [],
    templateStrings: []
  }

  componentsState.forEach(({ props, moduleName }) => {
    if (moduleName === 'builtIn') {
      return
    }
    Object.keys(props).forEach(propName => {
      const { type, value } = props[propName]
      if (type === PropTypes.StreamsData) {
        valuesAccumulator.documentPaths.push(value)
      } else if (type === PropTypes.StreamsString) {
        if (isStreamsDataExpression(value)) {
          valuesAccumulator.documentPaths.push(value)
        } else {
          valuesAccumulator.templateStrings.push(value)
        }
      }
    })
  })
  return valuesAccumulator
}

function isStreamsDataExpression(
  value: string
): value is StreamsDataExpression {
  return value.startsWith('document.')
}