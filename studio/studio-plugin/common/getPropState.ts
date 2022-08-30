import { ObjectLiteralExpression } from 'ts-morph'
import { PropShape, PropState } from '../../shared/models'
import { parseObjectLiteralExpression } from './parseObjectLiteralExpression'
import { validatePropState } from './validatePropState'

export function getPropsState(
  propsExpression: ObjectLiteralExpression,
  propShape: PropShape
): PropState {
  const propValues: Record<string, unknown> = parseObjectLiteralExpression(propsExpression)
  const propsState: PropState = {}
  Object.entries(propValues).forEach(([propName, propValue]) => {
    const propState = {
      type: propShape[propName].type,
      value: propValue
    }
    if (validatePropState(propState)) {
      propsState[propName] = propState
    }
  })

  return propsState
}
