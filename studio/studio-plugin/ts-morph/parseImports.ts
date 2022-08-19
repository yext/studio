import { SourceFile, SyntaxKind } from 'ts-morph'
import { getSourceFile } from '../common/common'

/**
 * Returns a mapping of import identifier (i.e. path or module name)
 * to identifiers imported from that path or module name.
 */
export default function parseImports(file: string | SourceFile): Record<string, string[]> {
  const sourceFile = typeof file === 'string' ? getSourceFile(file) : file
  const importPathToImportNames: Record<string, string[]> = {}

  sourceFile.getDescendantsOfKind(SyntaxKind.ImportDeclaration).forEach(importDeclaration => {
    const importClause = importDeclaration.getFirstDescendantByKind(SyntaxKind.ImportClause)
    //  Ignore imports like `import 'index.css'` which lack an import clause
    if (!importClause) {
      return
    }
    const defaultImport: string | undefined = importClause.getDefaultImport()?.getText()
    const namedImports: string[] = importClause.getNamedImports()
      .map(n => n.compilerNode.name.escapedText.toString())
    const importPath: string = importDeclaration.getModuleSpecifierValue()
    if (!importPathToImportNames[importPath]) {
      importPathToImportNames[importPath] = []
    }
    importPathToImportNames[importPath].push(...namedImports)
    defaultImport && importPathToImportNames[importPath].push(defaultImport)
  })
  return importPathToImportNames
}
