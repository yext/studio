import { PropState } from '../../shared/models'
import lodashGet from 'lodash/get.js'
import { TemplateProps } from '@yext/pages'
import { PropTypes, StreamsStringExpression } from '../../types'

export const STREAMS_TEMPLATE_REGEX = /\${(.*?)}/g

export default function getPreviewProps(
  props: PropState,
  streamDocument: TemplateProps['document']
): Record<string, unknown> {
  const transformedProps: Record<string, unknown> = {}

  Object.keys(props).forEach(propName => {
    const propData = props[propName]
    if (propData.type === PropTypes.StreamsString) {
      const stringExpression: StreamsStringExpression = propData.value
      if (stringExpression.length > 1 && stringExpression.startsWith('`') && stringExpression.endsWith('`')) {
        const templateStringWithoutBacktiks = stringExpression.substring(1, stringExpression.length - 1)
        transformedProps[propName] =
          templateStringWithoutBacktiks.replaceAll(STREAMS_TEMPLATE_REGEX, (...args) => {
            return lodashGet({ document: streamDocument }, args[1]) ?? args[0]
          })
      } else {
        transformedProps[propName] = lodashGet({
          document: streamDocument
        }, stringExpression) ?? stringExpression
      }
    } else if (propData.type === PropTypes.StreamsData) {
      const documentPath = propData.value
      transformedProps[propName] = lodashGet({ document: streamDocument }, documentPath) ?? documentPath
    } else {
      transformedProps[propName] = propData.value
    }
  })
  return transformedProps
}
