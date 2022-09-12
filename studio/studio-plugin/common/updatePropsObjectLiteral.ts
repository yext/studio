import { ObjectLiteralExpression, PropertyAssignment, ts } from 'ts-morph'
import { PropState } from '../../shared/models'
import { PropTypes } from '../../types'

export function updatePropsObjectLiteral(node: ObjectLiteralExpression, updatedState: PropState) {
  node
    .getProperties()
    .filter((p): p is PropertyAssignment => p.isKind(ts.SyntaxKind.PropertyAssignment))
    .forEach(p => {
      const propName = p.getName()
      const { type, value, expressionSource } = updatedState[propName]
      let nodeValue: string | number | boolean
      if (expressionSource !== undefined) {
        nodeValue = value
      } else if (type === PropTypes.string) {
        nodeValue = `'${value}'`
      } else {
        nodeValue = JSON.stringify(value)
      }
      node.addPropertyAssignment({
        name: propName,
        initializer: nodeValue
      })
      p.remove()
    })
}
