import { ts, JsxAttribute } from 'ts-morph'

export function getJsxAttributeValue(n: JsxAttribute): string | number | boolean {
  const initializer = n.getInitializerOrThrow()
  if (initializer.isKind(ts.SyntaxKind.StringLiteral)) {
    return initializer.compilerNode.text
  }
  const expression = initializer.getExpressionOrThrow()
  if (
    expression.isKind(ts.SyntaxKind.PropertyAccessExpression) ||
    expression.isKind(ts.SyntaxKind.TemplateExpression) ||
    expression.isKind(ts.SyntaxKind.ElementAccessExpression) ||
    expression.isKind(ts.SyntaxKind.Identifier)
  ) {
    return expression.getText()
  } else if (
    expression.isKind(ts.SyntaxKind.NumericLiteral) ||
    expression.isKind(ts.SyntaxKind.FalseKeyword) ||
    expression.isKind(ts.SyntaxKind.TrueKeyword)
  ) {
    return expression.getLiteralValue()
  } else {
    throw new Error('Unrecognized Expression kind: ' + expression.getKindName())
  }
}