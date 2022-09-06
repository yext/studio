import { ObjectLiteralExpression, SourceFile, ts } from 'ts-morph'

export function getPropsLiteralExpression(
  sourceFile: SourceFile,
  propsVariableName: string
): ObjectLiteralExpression | undefined {
  const exportSymbols = sourceFile.getExportSymbols()
  const propSymbol = exportSymbols.find(s => s.getEscapedName() === propsVariableName)
  if (!propSymbol) {
    return
  }
  return propSymbol
    .getValueDeclaration()
    ?.getFirstDescendantByKind(ts.SyntaxKind.ObjectLiteralExpression)
}
