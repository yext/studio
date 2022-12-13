import {
  Project,
  SourceFile,
  SyntaxKind,
  VariableDeclaration,
  FunctionDeclaration,
  JsxElement,
  JsxFragment,
  JsxSelfClosingElement,
  ObjectLiteralExpression,
  Identifier,
  ArrayLiteralExpression,
} from "ts-morph";
import typescript from "typescript";
import { ComponentState, ComponentStateKind } from "../types/State";
import StaticParsingHelpers, {
  ParsedInterface,
  ParsedObjectLiteral,
} from "./StaticParsingHelpers";
import { v4 } from "uuid";
import path from "path";
import { getFileMetadata as getFileMetadataFn } from "../getFileMetadata";

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

  constructor(private filepath: string, project = tsMorphProject) {
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

  parseInterface(interfaceName: string): ParsedInterface | undefined {
    const interfaceDeclaration = this.sourceFile.getInterface(interfaceName);
    if (!interfaceDeclaration) {
      return undefined;
    }
    return StaticParsingHelpers.parseInterfaceDeclaration(interfaceDeclaration);
  }

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
      const identifier = exportDeclaration.getFirstChildByKind(
        SyntaxKind.Identifier
      );
      const objectLiteral = exportDeclaration.getFirstChildByKind(
        SyntaxKind.ObjectLiteralExpression
      );
      const arrayLiteral = exportDeclaration.getFirstChildByKind(
        SyntaxKind.ArrayLiteralExpression
      );
      const assignment = identifier ?? objectLiteral ?? arrayLiteral;
      if (!assignment) {
        throw new Error(
          `Error parsing default export in \`${exportDeclaration.getFullText()}\`, expected either an Identifier, ObjectLiteralExpression, or ArrayLiteralExpression.`
        );
      }
      if (
        [identifier, objectLiteral, arrayLiteral].filter((n) => !!n).length > 1
      ) {
        throw new Error(
          `Unexpected state, multiple nodes found when parsing default export \`${exportDeclaration.getFullText()}\``
        );
      }
      return assignment;
    }
    throw new Error(
      "Error getting default export: No ExportAssignment or FunctionDeclaration found."
    );
  }

  /**
   * There is full support for default exports defined directly as function
   * declarations. But, for exports defined as assignments, support is restricted
   * as follows:
   * - If there is only a single identifer (e.g. `export default Identifier;`),
   *   it will look for and return the declaration for that identifier.
   * - If an identifier does not have a corresponding variable or function
   *   declaration, it will throw an error.
   * - If the export assignment is an object (e.g.
   *   `export default \{ key: val \};`), an array (e.g.
   *   `export default [Identifier];`), etc., an error will be thrown.
   */
  private getDefaultExportReactComponent():
    | VariableDeclaration
    | FunctionDeclaration {
    const defaultExport = this.getDefaultExport();
    if (!defaultExport) {
      throw new Error(
        "Error getting default export: No declaration node found."
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

  parseComponentTree(
    defaultImports: Record<string, string>,
    getFileMetadata: typeof getFileMetadataFn
  ): ComponentState[] {
    const defaultExport = this.getDefaultExportReactComponent();
    const returnStatement = defaultExport.getFirstDescendantByKind(
      SyntaxKind.ReturnStatement
    );
    if (!returnStatement) {
      throw new Error(
        `No return statement found for the default export at path: "${this.sourceFile.getFilePath()}"`
      );
    }
    const JsxNodeWrapper =
      returnStatement.getFirstChildByKind(SyntaxKind.ParenthesizedExpression) ??
      returnStatement;
    const topLevelJsxNode = JsxNodeWrapper.getChildren().find(
      (n): n is JsxElement | JsxFragment =>
        n.isKind(SyntaxKind.JsxElement) || n.isKind(SyntaxKind.JsxFragment)
    );
    if (!topLevelJsxNode) {
      throw new Error(
        "Unable to find top-level JSX element or JSX fragment type" +
          ` in the default export at path: "${this.sourceFile.getFilePath()}"`
      );
    }

    return StaticParsingHelpers.parseJsxChild(
      topLevelJsxNode,
      (child, parent) =>
        this.parseComponentState(child, defaultImports, getFileMetadata, parent)
    );
  }

  parseComponentState(
    component: JsxFragment | JsxElement | JsxSelfClosingElement,
    defaultImports: Record<string, string>,
    getFileMetadata: typeof getFileMetadataFn,
    parent?: ComponentState
  ): ComponentState {
    const commonComponentState = {
      parentUUID: parent?.uuid,
      uuid: v4(),
    };

    if (
      component.isKind(SyntaxKind.JsxFragment) ||
      StaticParsingHelpers.isFragmentElement(component)
    ) {
      return {
        ...commonComponentState,
        kind: ComponentStateKind.Fragment,
      };
    }

    const componentName = StaticParsingHelpers.parseJsxElementName(component);

    return {
      ...commonComponentState,
      ...StaticParsingHelpers.parseElement(
        component,
        componentName,
        defaultImports,
        getFileMetadata
      ),
      componentName,
    };
  }
}
