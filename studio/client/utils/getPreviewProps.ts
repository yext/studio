import { PropState } from '../../shared/models'
import lodashGet from 'lodash/get.js'
import { TemplateProps } from '@yext/pages'
import { PropTypes } from '../../types'

export const STREAMS_TEMPLATE_REGEX = /\${(.*?)}/g

export default function getPreviewProps(
  props: PropState,
  streamDocument: TemplateProps['document']
): Record<string, unknown> {
  const transformedProps: Record<string, unknown> = { ...props }

  Object.keys(props).forEach(propName => {
    const propData = props[propName]
    if (propData.type === PropTypes.StreamsString) {
      const templateString = propData.value
      transformedProps[propName] =
      templateString.replaceAll(STREAMS_TEMPLATE_REGEX, (...args) => {
        return lodashGet({ document: streamDocument }, args[1]) ?? args[0]
      })
    } else if (propData.type === 'StreamsData') {
      const documentPath = propData.value
      transformedProps[propName] = lodashGet({ document: streamDocument }, documentPath) ?? documentPath
    }
  })
  return transformedProps
}
