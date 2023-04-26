import {
  Project,
  SourceFile,
  SyntaxKind,
  VariableDeclaration,
  FunctionDeclaration,
  ObjectLiteralExpression,
  Identifier,
  ArrayLiteralExpression,
} from "ts-morph";
import StaticParsingHelpers, {
  ParsedObjectLiteral,
} from "./helpers/StaticParsingHelpers";
import path from "path";
import vm from "vm";
import ShapeParsingHelper, { ParsedShape } from "./helpers/ShapeParsingHelper";
import { NpmLookup } from "../utils";

/**
 * StudioSourceFileParser contains shared business logic for
 * parsing source files used by Studio.
 */
export default class StudioSourceFileParser {
  private sourceFile: SourceFile;

  constructor(private filepath: string, project: Project) {
    if (!project.getSourceFile(filepath)) {
      project.addSourceFileAtPath(filepath);
    }
    this.sourceFile = project.getSourceFileOrThrow(filepath);
  }

  getFilepath() {
    return this.filepath;
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

  private parseDefaultImports(): Record<string, string> {
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

  getAbsPathDefaultImports(): Record<string, string> {
    // For now, we are only supporting imports from files that export a component
    // as the default export. We will add support for named exports at a later date.
    const defaultImports = this.parseDefaultImports();
    return Object.entries(defaultImports).reduce(
      (imports, [importIdentifier, importName]) => {
        if (path.isAbsolute(importIdentifier)) {
          imports[importIdentifier] = importName;
        } else {
          const absoluteFilepath =
            path.resolve(this.filepath, "..", importIdentifier) + ".tsx";
          imports[absoluteFilepath] = importName;
        }
        return imports;
      },
      {}
    );
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

  getExportedObjectExpression(
    variableName: string
  ): ObjectLiteralExpression | undefined {
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
    return objectLiteralExp;
  }

  parseExportedObjectLiteral(
    variableName: string
  ): ParsedObjectLiteral | undefined {
    const objectLiteralExp = this.getExportedObjectExpression(variableName);
    if (!objectLiteralExp) {
      return;
    }
    return StaticParsingHelpers.parseObjectLiteral(objectLiteralExp);
  }

  /**
   * This function takes in an {@link ObjectLiteralExpression} and returns it's data.
   *
   * It converts a js object string and converts it into an object using vm.runInNewContext,
   * which can be thought of as a safe version of `eval`. Note that we cannot use JSON.parse here,
   * because we are working with a js object not a JSON.
   */
  getCompiledObjectLiteral<T>(objectLiteralExp: ObjectLiteralExpression): T {
    return vm.runInNewContext("(" + objectLiteralExp.getText() + ")");
  }

  private getImportSourceForIdentifier(identifier: string) {
    const namedImports = this.parseNamedImports();
    for (const importSource of Object.keys(namedImports)) {
      if (namedImports[importSource].includes(identifier)) {
        return {
          importSource,
          isDefault: false,
        };
      }
    }
    const defaultImports = this.parseDefaultImports();
    for (const importSource of Object.keys(defaultImports)) {
      if (defaultImports[importSource] === identifier) {
        return {
          importSource,
          isDefault: true,
        };
      }
    }
  }

  private parseImportedShape(
    identifier: string,
    importSource: string,
    isDefault: boolean
  ) {
    if (importSource.startsWith(".")) {
      importSource = path.resolve(path.dirname(this.filepath), importSource);
    }
    const typesFile = new NpmLookup(importSource).getResolvedFilepath();
    const parserForImportSource = new StudioSourceFileParser(
      typesFile,
      this.sourceFile.getProject()
    );

    if (isDefault) {
      const exportAssignment = this.sourceFile
        .getDefaultExportSymbolOrThrow()
        .getDeclarations()[0];
      if (!exportAssignment.isKind(SyntaxKind.ExportAssignment)) {
        throw new Error(
          `Expected an ExportAssignment node for "${exportAssignment.getText()}"`
        );
      }
      identifier = exportAssignment
        .getFirstDescendantByKindOrThrow(SyntaxKind.Identifier)
        .getText();
    }
    return parserForImportSource.parseShape(identifier);
  }

  /**
   * Parses the type or interface with the given name.
   */
  parseShape(identifier: string): ParsedShape | undefined {
    const interfaceDeclaration = this.sourceFile.getInterface(identifier);
    const typeLiteral = this.sourceFile
      .getTypeAlias(identifier)
      ?.getFirstChildByKind(SyntaxKind.TypeLiteral);
    const shapeNode = interfaceDeclaration ?? typeLiteral;
    if (shapeNode) {
      return ShapeParsingHelper.parseShape(shapeNode);
    }

    const importData = this.getImportSourceForIdentifier(identifier);
    if (importData) {
      return this.parseImportedShape(
        identifier,
        importData.importSource,
        importData.isDefault
      );
    }
  }

  /**
   * Returns the default exported node, if one exists.
   *
   * If the exported node uses an AsExpression (type assertion) or is wrapped in a
   * ParenthesizedExpression, those will be unwrapped and the underlying node will be
   * returned instead.
   */
  getDefaultExport():
    | FunctionDeclaration
    | Identifier
    | ObjectLiteralExpression
    | ArrayLiteralExpression
    | undefined {
    const defaultExportSymbol = this.sourceFile.getDefaultExportSymbol();
    if (!defaultExportSymbol) {
      return undefined;
    }
    const declarations = defaultExportSymbol.getDeclarations();
    const exportDeclaration = declarations[0];
    if (exportDeclaration.isKind(SyntaxKind.FunctionDeclaration)) {
      return exportDeclaration;
    } else if (exportDeclaration.isKind(SyntaxKind.ExportAssignment)) {
      return StaticParsingHelpers.parseExportAssignment(exportDeclaration);
    }
    throw new Error(
      "Error getting default export: No ExportAssignment or FunctionDeclaration found."
    );
  }

  /**
   * There is full support for default exports defined directly as function
   * declarations. But, for exports defined as assignments, support is restricted
   * as follows:
   * - If there is only a single identifier (e.g. `export default Identifier;`),
   *   it will look for and return the declaration for that identifier.
   * - If an identifier does not have a corresponding variable or function
   *   declaration, it will throw an error.
   * - If the export assignment is an object (e.g.
   *   `export default \{ key: val \};`), an array (e.g.
   *   `export default [Identifier];`), etc., an error will be thrown.
   */
  getDefaultExportReactComponent(): VariableDeclaration | FunctionDeclaration {
    const defaultExport = this.getDefaultExport();
    if (!defaultExport) {
      throw new Error(
        `Error getting default export: No declaration node found in ${this.filepath}.`
      );
    }
    if (
      defaultExport.isKind(SyntaxKind.ObjectLiteralExpression) ||
      defaultExport.isKind(SyntaxKind.ArrayLiteralExpression)
    ) {
      throw new Error(
        "Error getting default export React component: Only a direct Identifier is supported for ExportAssignment."
      );
    }
    if (defaultExport.isKind(SyntaxKind.Identifier)) {
      const identifierName = defaultExport.getText();
      return (
        this.sourceFile.getVariableDeclaration(identifierName) ??
        this.sourceFile.getFunctionOrThrow(identifierName)
      );
    }
    return defaultExport;
  }
}
