import { ImportClause, SourceFile, SyntaxKind } from 'ts-morph'
import { getSourceFile } from './common'

/**
 * Returns a mapping of import identifier (i.e. path or module name)
 * to identifiers imported from that path or module name.
 */
export default function parseImports(file: string | SourceFile): Record<string, string[]> {
  const sourceFile = typeof file === 'string' ? getSourceFile(file) : file
  const importPathToImportNames: Record<string, string[]> = {}

  sourceFile.getDescendantsOfKind(SyntaxKind.ImportDeclaration).forEach(n => {
    const importClause: ImportClause = n.getFirstDescendantByKindOrThrow(SyntaxKind.ImportClause)
    const defaultImport: string | undefined = importClause.getDefaultImport()?.getText()
    const namedImports: string[] = importClause.getNamedImports()
      .map(n => n.compilerNode.name.escapedText.toString())
    const importPath: string = n.getModuleSpecifierValue()
    if (!importPathToImportNames[importPath]) {
      importPathToImportNames[importPath] = []
    }
    importPathToImportNames[importPath].push(...namedImports)
    defaultImport && importPathToImportNames[importPath].push(defaultImport)
  })
  return importPathToImportNames
}