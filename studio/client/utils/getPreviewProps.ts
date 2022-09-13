import { PropState } from '../../shared/models'
import lodashGet from 'lodash/get.js'
import { TemplateProps } from '@yext/pages'
import { ExpressionSourceType, PropTypes } from '../../types'
import { isTemplateString } from '../../shared/isTemplateString'
import { STREAMS_TEMPLATE_REGEX } from '../../shared/constants'
import { isExpressionState } from '../../shared/isExpressionState'
import { validatePropState } from '../../shared/validatePropState'
import { isStreamsDataExpression } from '../../shared/isStreamsDataExpression'

export default function getPreviewProps(
  props: PropState,
  streamDocument: TemplateProps['document'],
  siteSettings: Record<string, any>
): Record<string, unknown> {
  const transformedProps: Record<string, unknown> = {}

  Object.keys(props).forEach(propName => {
    const propData = props[propName]
    if (propData.value === null || propData.value === undefined) {
      return
    }
    if (propData.type === PropTypes.StreamsString) {
      const stringExpression: string = propData.value
      if (isTemplateString(stringExpression)) {
        const templateStringWithoutBacktiks = stringExpression.substring(1, stringExpression.length - 1)
        transformedProps[propName] =
          templateStringWithoutBacktiks.replaceAll(STREAMS_TEMPLATE_REGEX, (...args) => {
            return lodashGet({ document: streamDocument }, args[1]) ?? args[0]
          })
      } else if (isStreamsDataExpression(stringExpression)) {
        transformedProps[propName] = lodashGet({
          document: streamDocument
        }, stringExpression) ?? stringExpression
      } else {
        console.error('Unrecognized value type for PropTypes.StreamsString:', stringExpression)
      }
    } else if (propData.type === PropTypes.StreamsData) {
      const documentPath = propData.value
      transformedProps[propName] = lodashGet({ document: streamDocument }, documentPath) ?? documentPath
    } else if (isExpressionState(propData)) {
      switch (propData.expressionSource) {
        case ExpressionSourceType.SiteSettings:
          const siteSettingsPath = propData.value
          const newPropValue = lodashGet({ siteSettings }, siteSettingsPath) ?? siteSettingsPath
          if (validatePropState({ type: propData.type, value: newPropValue })) {
            transformedProps[propName] = newPropValue
          } else {
            console.warn(`The value extracted from the expression ${siteSettingsPath} does not match with the expected propType ${propData.type}:`, newPropValue)
            transformedProps[propName] = siteSettingsPath
          }
          break
        default:
          console.warn('Failed to extract value from unknown expression source type in the following prop state:', propData)
          transformedProps[propName] = propData.value
          break
      }
    } else {
      transformedProps[propName] = propData.value
    }
  })
  return transformedProps
}
