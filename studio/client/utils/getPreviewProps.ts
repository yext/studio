import { PropState } from '../../shared/models'
import lodashGet from 'lodash/get.js'
import { ExpressionSourceType, PropTypes } from '../../types'
import { isTemplateString } from '../../shared/isTemplateString'
import { TEMPLATE_STRING_EXPRESSION_REGEX } from '../../shared/constants'
import { validatePropState } from '../../shared/validatePropState'
import { getExpressionSources } from '../../shared/getExpressionSources'

export default function getPreviewProps(
  props: PropState,
  expressionSourcesValues: Record<string, Record<string, unknown>>
): Record<string, unknown> {
  const transformedProps: Record<string, unknown> = {}

  Object.keys(props).forEach(propName => {
    const propData = props[propName]
    if (propData.value === null || propData.value === undefined) {
      return
    }
    if (propData.isExpression) {
      const expression = propData.value
      const expressionSources = getExpressionSources(expression)
      if (isTemplateString(expression)) {
        transformedProps[propName] = getTemplateStringValue(
          expression, expressionSources, propData.type, expressionSourcesValues)
      } else {
        transformedProps[propName] = getExpressionValue(
          expression, expressionSources[0], propData.type, expressionSourcesValues) ?? expression
      }
    } else {
      transformedProps[propName] = propData.value
    }
  })
  return transformedProps
}

function getTemplateStringValue(
  expression: string,
  expressionSources: ExpressionSourceType[],
  propType: PropTypes,
  expressionSourcesValues: Record<string, Record<string, unknown>>,
): string {
  const templateStringWithoutBacktiks = expression.substring(1, expression.length - 1)
  let expressionCount = -1
  return templateStringWithoutBacktiks.replaceAll(TEMPLATE_STRING_EXPRESSION_REGEX, (...args) => {
    expressionCount++
    const expressionVal = getExpressionValue(
      args[1], expressionSources[expressionCount], propType, expressionSourcesValues)
    if (expressionVal !== null && typeof expressionVal === 'string') {
      return expressionVal
    }
    return args[0]
  })
}

function getExpressionValue(
  expression: string,
  expressionSource: ExpressionSourceType,
  propType: PropTypes,
  expressionSourcesValues: Record<string, Record<string, unknown>>,
): unknown | null {
  function getValueFromPath(path: string, parentPath: string) {
    const sourceObject = expressionSourcesValues[parentPath]
    if (!sourceObject) {
      console.warn(`Invalid expression source type: ${parentPath}.\nUnable to extract the desired data from path: ${path}`)
      return null
    }
    const newPropValue = lodashGet({ [parentPath]: sourceObject }, path) as unknown ?? path
    if (validatePropState({ type: propType, value: newPropValue })) {
      return newPropValue
    } else {
      console.warn(`The value extracted from the expression ${path} does not match with the expected propType ${propType}:`, newPropValue)
      return null
    }
  }

  switch (expressionSource) {
    case ExpressionSourceType.SiteSettings:
      return getValueFromPath(expression, 'siteSettings')
    case ExpressionSourceType.Stream:
      return getValueFromPath(expression, 'document')
    default:
      console.warn(`Unable to extract data for expression: ${expression}.\nUnknown expression source type: ${expressionSource}.`)
      return null
  }
}
