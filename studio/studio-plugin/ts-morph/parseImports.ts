import { ImportClause, Project, SyntaxKind } from 'ts-morph'
import { tsCompilerOptions } from './common'

/**
 * Returns a mapping of import identifier (i.e. path or module name)
 * to identifiers imported from that path or module name.
 */
export default function parseImports(filePath: string): Record<string, string[]> {
  const p = new Project(tsCompilerOptions)
  p.addSourceFilesAtPaths(filePath)
  const sourceFile = p.getSourceFileOrThrow(filePath)
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