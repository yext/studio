import { Project, SourceFile, SyntaxKind, VariableDeclaration, FunctionDeclaration } from "ts-morph";
import typescript from "typescript";
import StaticParsingHelpers, {
  ParsedInterface,
  ParsedObjectLiteral,
} from "./StaticParsingHelpers";

/**
 * The ts-morph Project instance for the entire app.
 */
const tsMorphProject = new Project({
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

  constructor(filepath: string, project = tsMorphProject) {
    if (!project.getSourceFile(filepath)) {
      project.addSourceFileAtPath(filepath);
    }
    this.sourceFile = project.getSourceFileOrThrow(filepath);
  }

  parseNamedImports(): Record<string, string[]> {
    const importPathToImportNames: Record<string, string[]> = {};

    this.sourceFile.getImportDeclarations().forEach((importDeclaration) => {
      const { source, namedImports } =
        StaticParsingHelpers.parseImport(importDeclaration);
      importPathToImportNames[source] = [...namedImports];
    });
    return importPathToImportNames;
  }

  parseDefaultImports(): Record<string, string> {
    const importPathToImportName: Record<string, string> = {};

    this.sourceFile.getImportDeclarations().forEach((importDeclaration) => {
      const { source, defaultImport } =
        StaticParsingHelpers.parseImport(importDeclaration);

      if (defaultImport) {
        importPathToImportName[source] = defaultImport;
      }
    });
    return importPathToImportName;
  }

  parseCssImports(): string[] {
    const cssImports: string[] = [];

    this.sourceFile.getImportDeclarations().forEach((importDeclaration) => {
      const { source } = StaticParsingHelpers.parseImport(importDeclaration);
      if (source.endsWith(".css")) {
        cssImports.push(source);
      }
    });
    return cssImports;
  }

  parseExportedObjectLiteral(
    variableName: string
  ): ParsedObjectLiteral | undefined {
    const variableStatement = this.sourceFile
      .getVariableStatements()
      .find((variableStatement) => {
        return (
          variableStatement.isExported() &&
          variableStatement
            .getFirstDescendantByKindOrThrow(SyntaxKind.VariableDeclaration)
            .getName() === variableName
        );
      });
    if (!variableStatement) {
      return;
    }
    const objectLiteralExp = variableStatement.getFirstDescendantByKind(
      SyntaxKind.ObjectLiteralExpression
    );
    if (!objectLiteralExp) {
      throw new Error(
        `Could not find ObjectLiteralExpression within \`${variableStatement.getFullText()}\`.`
      );
    }
    return StaticParsingHelpers.parseObjectLiteral(objectLiteralExp);
  }

  parseInterface(interfaceName: string): ParsedInterface {
    const interfaceDeclaration =
      this.sourceFile.getInterfaceOrThrow(interfaceName);
    return StaticParsingHelpers.parseInterfaceDeclaration(interfaceDeclaration);
  }

  parseDefaultExport(): VariableDeclaration | FunctionDeclaration {
    const declarations = this.sourceFile.getDefaultExportSymbolOrThrow().getDeclarations();
    if (declarations.length === 0) {
      throw new Error("Error getting default export");
    }
    const exportDeclaration = declarations[0];
    if (exportDeclaration.isKind(SyntaxKind.ExportAssignment)) {
      const identifierName = exportDeclaration.getFirstDescendantByKindOrThrow(SyntaxKind.Identifier).getText();
      return this.sourceFile.getVariableDeclarationOrThrow(identifierName);
    } else if (exportDeclaration.isKind(SyntaxKind.FunctionDeclaration)) {
      return exportDeclaration;
    }
    throw new Error("Error getting default export, no ExportAssignment or FunctionDeclaration found");
  }
}
