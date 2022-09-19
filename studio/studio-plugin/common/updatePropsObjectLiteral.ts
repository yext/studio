import { ObjectLiteralExpression } from 'ts-morph'
import { isExpressionState } from '../../shared/isExpressionState'
import { PropState } from '../../shared/models'
import { PropTypes } from '../../types'

export function updatePropsObjectLiteral(node: ObjectLiteralExpression, updatedState: PropState) {
  Object.entries(updatedState).forEach(([propName, propState]) => {
    const { type, value } = propState
    let nodeValue: string | number | boolean
    if (type === PropTypes.string && !isExpressionState(propState)) {
      nodeValue = `'${value}'`
    } else {
      nodeValue = value.toString()
    }
    node.getProperty(propName)?.remove()
    node.addPropertyAssignment({
      name: propName,
      initializer: nodeValue
    })
  })
}
