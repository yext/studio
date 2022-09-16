import { ExpressionSourceType } from '../types'

export function getExpressionSource(value: unknown): ExpressionSourceType {
  if (typeof value !== 'string') {
    throw Error(`Unable to get the expression source from value: ${value}.\nExpression value must be of type string.`)
  }
  if (value.startsWith('siteSettings.')) {
    return ExpressionSourceType.SiteSettings
  }
  if (value.startsWith('document.')) {
    return ExpressionSourceType.Stream
  }
  return ExpressionSourceType.Unknown
}