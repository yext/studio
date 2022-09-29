import { TemplateConfig } from '@yext/pages'
import { RegularComponentState } from '../../shared/models'
import { v4 } from 'uuid'
import { TEMPLATE_STRING_EXPRESSION_REGEX } from '../../shared/constants'
import { StreamsDataExpression } from '../../types'
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
  componentsState: RegularComponentState[],
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
  streamValues: StreamsDataExpression[]
): Set<StreamsDataExpression> {
  // Streams configs fields do not allow specifying an index of a field.
  // Cutting off at the first left bracket also lets us sidestep bracket object property notation,
  // which we don't support.
  const usedPaths: StreamsDataExpression[] = streamValues.map(d => d.split('[')[0] as StreamsDataExpression)
  return new Set(usedPaths)
}

export function getStreamValues(
  componentsState: RegularComponentState[]
): StreamsDataExpression[] {
  const valuesAccumulator: StreamsDataExpression[] = []

  componentsState.forEach(({ props, moduleName }) => {
    if (moduleName === 'builtIn') {
      return
    }
    Object.keys(props).forEach(propName => {
      const propState = props[propName]
      if (!propState.isExpression) {
        return
      }
      const { value } = propState
      if (isTemplateString(value)) {
        [...value.matchAll(TEMPLATE_STRING_EXPRESSION_REGEX)].forEach(m => {
          if (isStreamsDataExpression(m[1])) {
            valuesAccumulator.push(m[1])
          }
        })
      } else if (isStreamsDataExpression(value)) {
        valuesAccumulator.push(value)
      }
    })
  })
  return valuesAccumulator
}
