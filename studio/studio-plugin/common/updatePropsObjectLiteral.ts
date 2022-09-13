import { ObjectLiteralExpression } from 'ts-morph'
import { PropState } from '../../shared/models'
import { PropTypes } from '../../types'

export function updatePropsObjectLiteral(node: ObjectLiteralExpression, updatedState: PropState) {
  Object.entries(updatedState).forEach(([propName, propState]) => {
    const { type, value, expressionSource } = propState
    let nodeValue: string | number | boolean
    if (expressionSource !== undefined) {
      nodeValue = value
    } else if (type === PropTypes.string) {
      nodeValue = `'${value}'`
    } else {
      nodeValue = JSON.stringify(value)
    }
    node.getProperty(propName)?.remove()
    node.addPropertyAssignment({
      name: propName,
      initializer: nodeValue
    })
  })
}
