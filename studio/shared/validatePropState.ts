import { PropTypes, PropStateTypes, ExpressionSourceType } from '../types'
import { TEMPLATE_STRING_EXPRESSION_REGEX } from './constants'
import { isTemplateString } from './isTemplateString'

export function validatePropState(propState: {
  type: PropTypes,
  value: unknown,
  expressionSources?: ExpressionSourceType[]
}): propState is PropStateTypes {
  const { type, value, expressionSources } = propState
  if (expressionSources) {
    if (isTemplateString(value)) {
      const paths = [...value.matchAll(TEMPLATE_STRING_EXPRESSION_REGEX)].map(m => m[1])
      return paths.every((p, i) => validateExpressionValue(p, expressionSources[i]))
    }
    if (expressionSources.length === 1) {
      return validateExpressionValue(value, expressionSources[0])
    } else {
      throw new Error(`Invalid expression sources and value pair for the following propState:\n ${JSON.stringify(propState)}`)
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
    default:
      throw new Error(`Unknown PropTypes with type: "${type}"`)
  }
}

function validateExpressionValue(value: unknown, source: ExpressionSourceType) {
  switch (source) {
    case ExpressionSourceType.SiteSettings:
      return typeof value === 'string' && value.startsWith('siteSettings.')
    case ExpressionSourceType.Stream:
      return typeof value === 'string' && value.startsWith('document.')
    case ExpressionSourceType.Unknown:
      return typeof value === 'string'
    default:
      throw new Error(`Invalid value with expressionSource "${source}":\n ${JSON.stringify(value)}`)
  }
}
