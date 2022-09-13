import { ExpressionSourceType, ExpressionState, PropStateTypes } from '../types'

export function isExpressionState(propState: PropStateTypes): propState is ExpressionState {
  return typeof propState.value === 'string'
    && !!propState.expressionSource
    && Object.values(ExpressionSourceType).includes(propState.expressionSource)
}