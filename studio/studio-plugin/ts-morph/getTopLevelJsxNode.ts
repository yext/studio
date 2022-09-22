import { SourceFile, JsxElement, JsxFragment, ts, VariableDeclaration, FunctionDeclaration, SyntaxKind } from 'ts-morph'

export default function getTopLevelJsxNode(
  declaration: VariableDeclaration | FunctionDeclaration
): JsxElement | JsxFragment {
  const returnStatement = declaration.getFirstDescendantByKindOrThrow(ts.SyntaxKind.ReturnStatement)
  const returnStatementWrapper = returnStatement.getFirstChildByKind(ts.SyntaxKind.ParenthesizedExpression)
    ?? returnStatement
  const topLevelJsxNode = returnStatementWrapper.getChildren().find(isJsx)
  if (!topLevelJsxNode) {
    throw new Error('Unable to find top level JSX element or JsxFragment type from file.')
  }
  return topLevelJsxNode
}

function isJsx(n): n is JsxElement | JsxFragment {
  return n.isKind(ts.SyntaxKind.JsxElement) || n.isKind(ts.SyntaxKind.JsxFragment)
}
