import { ts, Expression, StringLiteral, JsxExpression } from 'ts-morph'

export function getPropValue(initializer: StringLiteral | Expression | JsxExpression): {
  value: string | number | boolean,
  isExpression?: boolean
} {
  if (initializer.isKind(ts.SyntaxKind.StringLiteral)) {
    return { value: initializer.compilerNode.text }
  }
  const expression = initializer.isKind(ts.SyntaxKind.JsxExpression)
    ? initializer.getExpressionOrThrow()
    : initializer
  if (
    expression.isKind(ts.SyntaxKind.PropertyAccessExpression) ||
    expression.isKind(ts.SyntaxKind.TemplateExpression) ||
    expression.isKind(ts.SyntaxKind.ElementAccessExpression) ||
    expression.isKind(ts.SyntaxKind.Identifier)
  ) {
    return { value: expression.getText(), isExpression: true }
  } else if (
    expression.isKind(ts.SyntaxKind.NumericLiteral) ||
    expression.isKind(ts.SyntaxKind.FalseKeyword) ||
    expression.isKind(ts.SyntaxKind.TrueKeyword)
  ) {
    return { value: expression.getLiteralValue() }
  } else {
    throw new Error('Unrecognized Expression kind: ' + expression.getKindName())
  }
}