import { ts, Node } from 'ts-morph'

export function getPropValue(n: Node): string | number | boolean {
  const stringNode = n.getFirstDescendantByKind(ts.SyntaxKind.StringLiteral)
  if (stringNode) {
    return stringNode.compilerNode.text
  }
  if (n.getFirstDescendantByKind(ts.SyntaxKind.TrueKeyword)) return true
  if (n.getFirstDescendantByKind(ts.SyntaxKind.FalseKeyword)) return false
  const numberNode = n.getFirstDescendantByKind(ts.SyntaxKind.NumericLiteral)
  if (numberNode) {
    return parseFloat(numberNode.compilerNode.text)
  }
  const templateExpression = n.getFirstDescendantByKind(ts.SyntaxKind.TemplateExpression)
  if (templateExpression) {
    const templateStringIncludingBacktiks = templateExpression.getFullText()
    // remove the backtiks which should be the first and last characters
    return templateStringIncludingBacktiks.substring(1, templateStringIncludingBacktiks.length - 1)
  }
  throw new Error('unhandled prop value for node: ' + n.getFullText() + ' with kind: ' + n.getKindName())
}
