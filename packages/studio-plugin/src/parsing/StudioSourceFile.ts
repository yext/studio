import { ts, InterfaceDeclaration, Project, SourceFile, SyntaxKind, JSDocableNodeStructure, TypedNodeStructure, PropertyNamedNodeStructure, PropertySignatureStructure, OptionalKind, ObjectLiteralExpression } from 'ts-morph'
import typescript from 'typescript'

// 'typescript' is a CommonJS module, which may not support all module.exports as named exports
const { JsxEmit } = typescript

const project = new Project({
  compilerOptions: {
    jsx: JsxEmit.ReactJSX
  }
})


export default class StudioSourceFile {
  private sourceFile: SourceFile

  constructor(filepath: string) {
    if (!project.getSourceFile(filepath)) {
      project.addSourceFileAtPath(filepath)
    }
    this.sourceFile = project.getSourceFileOrThrow(filepath)
  }

  getInterfaceByName(interfaceName: string): InterfaceDeclaration {
    return this.sourceFile.getInterfaceOrThrow(interfaceName);
  }

  getImportsFromStudio(): string[] {
    return this.parseImports()['@yext/studio']
  }

  private parseImports(): Record<string, string[]> {
    const importPathToImportNames: Record<string, string[]> = {}

    this.sourceFile.getDescendantsOfKind(SyntaxKind.ImportDeclaration).forEach(importDeclaration => {
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

  getExportedObjectLiteralOrThrow(variableName: string): ObjectLiteralExpression {
    const exportSymbols = this.sourceFile.getExportSymbols()
    const propSymbol = exportSymbols.find(s => s.getEscapedName() === variableName)
    const objectLiteralExp = propSymbol
      ?.getValueDeclaration()
      ?.getFirstDescendantByKind(ts.SyntaxKind.ObjectLiteralExpression)
    if (!objectLiteralExp) {
      throw new Error(`Could not find ObjectLiteralExpression for variable ${variableName}`)
    }
    return objectLiteralExp
  }
}