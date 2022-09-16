import { ObjectLiteralExpression, PropertyAssignment, ts } from 'ts-morph'
import { PropShape, PropState } from '../../shared/models'
import { validatePropState } from '../../shared/validatePropState'
import { getExpressionSource } from '../../shared/getExpressionSource'
import { getPropValue } from './getPropValue'

export function getPropsState(
  propsExpression: ObjectLiteralExpression,
  propShape: PropShape
): PropState {
  const propsState: PropState = {}
  propsExpression.getProperties()
    .filter((p): p is PropertyAssignment => p.isKind(ts.SyntaxKind.PropertyAssignment))
    .forEach(p => {
      const propName = p.getName()
      const { value, isExpressionType } = getPropValue(p.getInitializerOrThrow())
      const propState = {
        type: propShape[propName].type,
        value,
        ...(isExpressionType && { expressionSource: getExpressionSource(value) })
      }
      if (!validatePropState(propState)) {
        throw new Error(`Could not validate propState ${JSON.stringify(propState, null, 2)}`)
      }
      propsState[propName] = propState
    })
  return propsState
}
