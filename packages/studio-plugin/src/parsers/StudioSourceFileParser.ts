import {
  Project,
  SourceFile,
  SyntaxKind,
  VariableDeclaration,
  FunctionDeclaration,
  ObjectLiteralExpression,
  Identifier,
  ArrayLiteralExpression,
  ArrowFunction,
  LanguageService,
} from "ts-morph";
import StaticParsingHelpers, {
  NamedImport,
} from "./helpers/StaticParsingHelpers";
import upath from "upath";
import vm from "vm";
import TypeNodeParsingHelper, {
  ParsedType,
} from "./helpers/TypeNodeParsingHelper";
import { parseSync as babelParseSync } from "@babel/core";
import NpmLookup from "./helpers/NpmLookup";
import { TypelessPropVal } from "../types";
import cabinet from "filing-cabinet";

export type ParsedImport = {
  importSource: string;
  importName: string;
  isDefault: boolean;
};

/**
 * StudioSourceFileParser contains shared business logic for
 * parsing source files used by Studio.
 */
export default class StudioSourceFileParser {
  private sourceFile: SourceFile;
  private languageService: LanguageService;

  constructor(private filepath: string, project: Project) {
    if (!project.getSourceFile(filepath)) {
      project.addSourceFileAtPath(filepath);
    }
    this.sourceFile = project.getSourceFileOrThrow(filepath);
    this.languageService = project.getLanguageService();
  }

  /**
   * Returns the filepath with posix path separators.
   */
  getFilepath() {
    return upath.normalize(this.filepath);
  }

  getFilename() {
    return upath.basename(this.filepath);
  }

  checkForSyntaxErrors() {
    babelParseSync(this.sourceFile.getFullText(), {
      filename: this.filepath,
      presets: [
        ["@babel/preset-env", { targets: { node: "current" } }],
        "@babel/preset-typescript",
        ["@babel/preset-react", { runtime: "automatic" }],
      ],
    });
  }

  checkForMissingImports() {
    const codeActions = this.languageService.getCombinedCodeFix(
      this.sourceFile,
      "fixMissingImport"
    );
    if (codeActions.getChanges().length > 0) {
      throw new Error(`Missing import statement(s) in ${this.getFilename()}`);
    }
  }

  parseNamedImports(): Record<string, NamedImport[]> {
    const importPathToImportNames: Record<string, NamedImport[]> = {};

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
        if (upath.isAbsolute(importIdentifier)) {
          imports[importIdentifier] = importName;
        } else {
          const absoluteFilepath =
            upath.resolve(this.filepath, "..", importIdentifier) + ".tsx";
          imports[absoluteFilepath] = importName;
        }
        return imports;
      },
      {}
    );
  }

  parseCssImports(): string[] {
    const cssImports: string[] = [];

    const getImportAbsoluteFilepath = (importPath: string) => {
      if (upath.isAbsolute(importPath)) {
        return upath.toUnix(importPath);
      }
      const resolvedPath = cabinet({
        partial: importPath,
        directory: upath.dirname(this.sourceFile.getFilePath()),
        filename: this.sourceFile.getFilePath(),
      });
      if (!resolvedPath) {
        throw new Error(
          `${importPath} could not be resolved when parsing` + 
          `${this.sourceFile.getFilePath()} for CSS imports.`
        );
      }
      return upath.toUnix(resolvedPath);
    };

    this.sourceFile.getImportDeclarations().forEach((importDeclaration) => {
      const { source: importPath } = StaticParsingHelpers.parseImport(importDeclaration);
      if (importPath.endsWith(".css")) {
        cssImports.push(getImportAbsoluteFilepath(importPath));
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
  ): Record<string, TypelessPropVal> | undefined {
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

  private getImportForIdentifier(identifier: string): ParsedImport | undefined {
    const namedImports = this.parseNamedImports();
    for (const importSource of Object.keys(namedImports)) {
      const matchingNamedImport = namedImports[importSource].find(
        (namedImport) => identifier === (namedImport.alias ?? namedImport.name)
      );
      if (matchingNamedImport) {
        return {
          importSource,
          importName: matchingNamedImport.name,
          isDefault: false,
        };
      }
    }
    const defaultImports = this.parseDefaultImports();
    for (const importSource of Object.keys(defaultImports)) {
      if (defaultImports[importSource] === identifier) {
        return {
          importSource,
          importName: identifier,
          isDefault: true,
        };
      }
    }
  }

  private parseImportedShape({
    importName: identifier,
    importSource,
    isDefault,
  }: ParsedImport): ParsedType | undefined {
    const typesFile = new NpmLookup(
      importSource,
      this.filepath
    ).getResolvedFilepath();
    const parserForImportSource = new StudioSourceFileParser(
      typesFile,
      this.sourceFile.getProject()
    );

    if (isDefault) {
      const exportAssignment = parserForImportSource.sourceFile
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
    return parserForImportSource.parseTypeReference(identifier);
  }

  /**
   * Parses the type or interface with the given name.
   */
  parseTypeReference = (identifier: string): ParsedType | undefined => {
    const interfaceDeclaration = this.sourceFile.getInterface(identifier);
    const typeAliasDeclaration = this.sourceFile.getTypeAlias(identifier);
    const shapeDeclaration = interfaceDeclaration ?? typeAliasDeclaration;
    if (shapeDeclaration) {
      return TypeNodeParsingHelper.parseShape(
        shapeDeclaration,
        this.parseTypeReference
      );
    }

    const importData = this.getImportForIdentifier(identifier);
    if (!importData) {
      return;
    }
    const studioType = TypeNodeParsingHelper.parseStudioType(importData);
    return studioType ?? this.parseImportedShape(importData);
  };

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

  getFunctionNode(
    funcName: string
  ): FunctionDeclaration | ArrowFunction | undefined {
    return (
      this.sourceFile.getFunction(funcName) ??
      this.sourceFile
        .getVariableDeclaration(funcName)
        ?.getFirstChildByKind(SyntaxKind.ArrowFunction)
    );
  }
}
