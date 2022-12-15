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
  JsxAttributeLike,
} from "ts-morph";
import typescript from "typescript";
import { ComponentState, ComponentStateKind } from "../types/State";
import StaticParsingHelpers, {
  ParsedInterface,
  ParsedObjectLiteral,
} from "./StaticParsingHelpers";
import { v4 } from "uuid";
import path from "path";
import vm from "vm";
import { FileMetadata, FileMetadataKind, PropValues } from '../types';
import TypeGuards from './TypeGuards';

export type GetFileMetadata = (filepath: string) => FileMetadata

/**
 * StudioSourceFileParser contains shared business logic for
 * parsing source files used by Studio.
 */
export default class StudioSourceFileParser {
  protected sourceFile: SourceFile;

  constructor(protected filepath: string, private getFileMetadata: GetFileMetadata, project: Project) {
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

  parseInterface(interfaceName: string): ParsedInterface | undefined {
    const interfaceDeclaration = this.sourceFile.getInterface(interfaceName);
    if (!interfaceDeclaration) {
      return undefined;
    }
    return StaticParsingHelpers.parseInterfaceDeclaration(interfaceDeclaration);
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
   * - If there is only a single identifer (e.g. `export default Identifier;`),
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

  parseComponentTree(defaultImports: Record<string, string>): ComponentState[] {
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
        this.parseComponentState(child, defaultImports, parent)
    );
  }

  parseComponentState(
    component: JsxFragment | JsxElement | JsxSelfClosingElement,
    defaultImports: Record<string, string>,
    parent: ComponentState | undefined
  ): ComponentState {
    const commonComponentState = {
      parentUUID: parent?.uuid,
      uuid: v4(),
    };

    if (!TypeGuards.isNotFragmentElement(component)) {
      return {
        ...commonComponentState,
        kind: ComponentStateKind.Fragment,
      };
    }

    const componentName = StaticParsingHelpers.parseJsxElementName(component);
    const parsedElement = this.parseElement(component, componentName, defaultImports);

    return {
      ...commonComponentState,
      ...parsedElement,
      componentName,
    };
  }

  private parseElement(component: JsxElement | JsxSelfClosingElement, componentName: string, defaultImports: Record<string, string>): {
    kind: ComponentStateKind;
    props: PropValues;
    metadataUUID?: string;
  } {
    const attributes: JsxAttributeLike[] = component.isKind(
      SyntaxKind.JsxSelfClosingElement
    )
      ? component.getAttributes()
      : component.getOpeningElement().getAttributes();

    const filepath = Object.keys(defaultImports).find(
      (importIdentifier) => defaultImports[importIdentifier] === componentName
    );
    const assumeIsBuiltInElement = filepath === undefined
    if (assumeIsBuiltInElement) {
      if (attributes.length > 0) {
        console.warn(
          `Props for builtIn element: '${componentName}' are currently not supported.`
        );
      }
      return {
        kind: ComponentStateKind.BuiltIn,
        props: {},
      };
    }

    const fileMetadataAndUUID = this.getFileMetadata(filepath);
    const {
      kind: fileMetadataKind,
      metadataUUID,
      propShape,
    } = fileMetadataAndUUID;

    const componentStateKind =
      fileMetadataKind === FileMetadataKind.Module
        ? ComponentStateKind.Module
        : ComponentStateKind.Standard;
    const props = StaticParsingHelpers.parseJsxAttributes(
      attributes,
      propShape
    );

    return {
      kind: componentStateKind,
      metadataUUID,
      props,
    };
  }
}
