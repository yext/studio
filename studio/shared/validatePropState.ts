import { PropTypes, PropStateTypes, ExpressionSourceType } from '../types'

export function validatePropState(propState: {
  type: PropTypes,
  value: unknown,
  expressionSource?: ExpressionSourceType
}): propState is PropStateTypes {
  const { type, value, expressionSource } = propState
  if (expressionSource) {
    switch (expressionSource) {
      case ExpressionSourceType.SiteSettings:
        return typeof value === 'string' && value.startsWith('siteSettings.')
      case ExpressionSourceType.Unknown:
        return typeof value === 'string'
      default:
        throw new Error(`Unknown PropTypes with expressionSource: "${expressionSource}"`)
    }
  }
  switch (type) {
    case PropTypes.string:
      return typeof value === 'string'
    case PropTypes.number:
      return typeof value === 'number'
    case PropTypes.boolean:
      return typeof value === 'boolean'
    case PropTypes.HexColor:
      return typeof value === 'string' && value.startsWith('#')
    case PropTypes.StreamsData:
      return typeof value === 'string' && value.startsWith('document.')
    case PropTypes.StreamsString:
      if (typeof value !== 'string') return false
      if (value.startsWith('document.')) return true
      return value.length > 1 && value.startsWith('`') && value.endsWith('`')
    default:
      throw new Error(`Unknown PropTypes with type: "${type}"`)
  }
}