import { ExpressionState, PropStateTypes } from '../types'

export function isExpressionState(propState: PropStateTypes): propState is ExpressionState {
  return typeof propState.value === 'string'
    && !!propState.expressionSources
    && Array.isArray(propState.expressionSources)
}