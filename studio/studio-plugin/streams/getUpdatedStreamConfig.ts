import { TemplateConfig } from '@yext/pages'
import { ComponentState } from '../../shared/models'
import { v4 } from 'uuid'
import { STREAMS_TEMPLATE_REGEX } from '../../shared/constants'
import { ExpressionSourceType, PropTypes, StreamsDataExpression, StreamsStringExpression } from '../../types'
import { isStreamsDataExpression } from '../../shared/isStreamsDataExpression'
import { isTemplateString } from '../../shared/isTemplateString'

/**
 * These are stream properties that will throw an error if specified within a {@link Stream.fields}, with
 * the exception of `id` (at the time of writing), and should always be present in localData even
 * if not specifically asked for.
 */
const NON_CONFIGURABLE_PROPERTIES = [
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
    .map(documentPath => documentPath.split('document.')[1])
    .filter(documentPath => !NON_CONFIGURABLE_PROPERTIES.includes(documentPath))

  return {
    ...currentConfig,
    stream: {
      $id: 'studio-stream-id_' + v4(),
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
      const { type, value, expressionSource } = props[propName]
      if (expressionSource === ExpressionSourceType.Stream) {
        valuesAccumulator.documentPaths.push(value)
      } else if (type === PropTypes.StreamsString) {
        if (isStreamsDataExpression(value)) {
          valuesAccumulator.documentPaths.push(value)
        } else if (isTemplateString(value)) {
          valuesAccumulator.templateStrings.push(value)
        } else {
          console.error(`Invalid string format for "value" field of type ${type}:`, value)
        }
      }
    })
  })
  return valuesAccumulator
}
