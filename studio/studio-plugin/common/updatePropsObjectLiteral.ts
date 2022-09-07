import { ObjectLiteralExpression, PropertyAssignment, ts } from 'ts-morph'
import { PropState } from '../../shared/models'
import { PropTypes } from '../../types'

export function updatePropsObjectLiteral(node: ObjectLiteralExpression, updatedState: PropState) {
  node
    .getProperties()
    .filter((p): p is PropertyAssignment => p.isKind(ts.SyntaxKind.PropertyAssignment))
    .forEach(p => {
      const propName = p.getName()
      const { type, value } = updatedState[propName]
      node.addPropertyAssignment({
        name: propName,
        initializer: type === PropTypes.string ? `'${value}'` : JSON.stringify(value)
      })
      p.remove()
    })
}
