import { ExpressionSourceType, TemplateStringExpression } from '../types'
import { TEMPLATE_STRING_EXPRESSION_REGEX } from './constants'
import { isTemplateString } from './isTemplateString'

export function getExpressionSources(value: unknown): ExpressionSourceType[] {
  if (typeof value !== 'string') {
    throw Error(`Unable to get the expression source from value: ${value}.\nExpression value must be of type string.`)
  }
  if (value.startsWith('siteSettings.')) {
    return [ExpressionSourceType.SiteSettings]
  }
  if (value.startsWith('document.')) {
    return [ExpressionSourceType.Stream]
  }
  if (isTemplateString(value)) {
    return getExpressionSourcesInTemplateString(value)
  }
  return [ExpressionSourceType.Unknown]
}

function getExpressionSourcesInTemplateString(val: TemplateStringExpression): ExpressionSourceType[] {
  const paths = [...val.matchAll(TEMPLATE_STRING_EXPRESSION_REGEX)].map(m => m[1])
  return paths.map(p => {
    const sources = getExpressionSources(p)
    if (sources.length > 1) {
      throw Error('Studio currently does not support nested expression', val)
    }
    return sources[0]
  })
}
