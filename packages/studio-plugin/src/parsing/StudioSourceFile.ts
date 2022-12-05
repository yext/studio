import { ts, InterfaceDeclaration, Project, SourceFile, SyntaxKind } from 'ts-morph'
import typescript from 'typescript'
import StaticParsingHelpers, { ParsedObjectLiteral } from './StaticParsingHelpers'
// 'typescript' is a CommonJS module, which may not support all module.exports as named exports
const { JsxEmit } = typescript

const project = new Project({
  compilerOptions: {
    jsx: JsxEmit.ReactJSX
  }
})

/**
 * StudioSourceFile contains shared business logic for parsing source files used by Studio.
 * Lower level details should be delegated to separate static classes/helper functions.
 */
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
      const {
        source, namedImports, defaultImport 
      } = StaticParsingHelpers.parseImport(importDeclaration)
      importPathToImportNames[source] = [...namedImports]
      if (defaultImport) {
        importPathToImportNames[source].push(defaultImport)
      }
    })
    return importPathToImportNames
  }

  parseExportedObjectLiteral(variableName: string): ParsedObjectLiteral {
    const exportSymbols = this.sourceFile.getExportSymbols()
    const propSymbol = exportSymbols.find(s => s.getEscapedName() === variableName)
    const objectLiteralExp = propSymbol
      ?.getValueDeclaration()
      ?.getFirstDescendantByKind(ts.SyntaxKind.ObjectLiteralExpression)
    if (!objectLiteralExp) {
      throw new Error(`Could not find ObjectLiteralExpression for variable ${variableName}`)
    }
    return StaticParsingHelpers.parseObjectLiteral(objectLiteralExp)
  }
}