import { SourceFile, ts, VariableDeclaration, FunctionDeclaration } from 'ts-morph'

export function getDefaultExport(
  sourceFile: SourceFile
): VariableDeclaration | FunctionDeclaration {
  const declarations = sourceFile.getDefaultExportSymbolOrThrow().getDeclarations()
  if (declarations.length === 0) {
    throw new Error('Error getting default export')
  }
  const node = declarations[0]
  if (node.isKind(ts.SyntaxKind.ExportAssignment)) {
    const identifierName = node.getFirstDescendantByKindOrThrow(ts.SyntaxKind.Identifier).getText()
    return sourceFile.getVariableDeclarationOrThrow(identifierName)
  } else if (node.isKind(ts.SyntaxKind.FunctionDeclaration)) {
    return node
  }
  throw new Error('Error getting default export, no ExportAssignment or FunctionDeclaration found')
}