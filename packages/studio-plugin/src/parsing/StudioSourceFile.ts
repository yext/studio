import {
  ts,
  Project,
  SourceFile,
  SyntaxKind,
} from "ts-morph";
import typescript from "typescript";
import StaticParsingHelpers, {
  ParsedInterface,
  ParsedObjectLiteral,
} from "./StaticParsingHelpers";

/**
 * The ts-morph Project instance for the entire app.
 */
const project = new Project({
  compilerOptions: {
    jsx: typescript.JsxEmit.ReactJSX,
  },
});

/**
 * StudioSourceFile contains shared business logic for parsing source files used by Studio.
 * Lower level details should be delegated to separate static classes/helper functions.
 */
export default class StudioSourceFile {
  private sourceFile: SourceFile;

  constructor(filepath: string) {
    if (!project.getSourceFile(filepath)) {
      project.addSourceFileAtPath(filepath);
    }
    this.sourceFile = project.getSourceFileOrThrow(filepath);
  }

  parseImports(): Record<string, string[]> {
    const importPathToImportNames: Record<string, string[]> = {};

    this.sourceFile
      .getDescendantsOfKind(SyntaxKind.ImportDeclaration)
      .forEach((importDeclaration) => {
        const { source, namedImports, defaultImport } =
          StaticParsingHelpers.parseImport(importDeclaration);
        importPathToImportNames[source] = [...namedImports];
        if (defaultImport) {
          importPathToImportNames[source].push(defaultImport);
        }
      });
    return importPathToImportNames;
  }

  parseExportedObjectLiteral(variableName: string): ParsedObjectLiteral | undefined {
    const variableStatement = this.sourceFile.getChildrenOfKind(SyntaxKind.VariableStatement).find(variableStatement => {
      return variableStatement.isExported() &&
        variableStatement.getFirstDescendantByKindOrThrow(SyntaxKind.VariableDeclaration).getName() === variableName
    })
    if (!variableStatement) {
      return
    }
    const objectLiteralExp = variableStatement.getFirstDescendantByKind(ts.SyntaxKind.ObjectLiteralExpression);
    if (!objectLiteralExp) {
      throw new Error(
        `Could not find ObjectLiteralExpression for variable ${variableName}`
      );
    }
    return StaticParsingHelpers.parseObjectLiteral(objectLiteralExp);
  }

  parseInterface(interfaceName: string): ParsedInterface {
    const interfaceDeclaration = this.sourceFile.getInterfaceOrThrow(interfaceName);
    return StaticParsingHelpers.parseInterfaceDeclaration(interfaceDeclaration)
  }
}
