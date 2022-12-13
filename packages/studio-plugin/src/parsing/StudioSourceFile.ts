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
  VariableDeclarationKind,
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
import prettier from "prettier";
import vm from 'vm'

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

  constructor(private filepath: string, project: Project = tsMorphProject) {
    if (!project.getSourceFile(filepath)) {
      project.addSourceFileAtPath(filepath);
    }
    this.sourceFile = project.getSourceFileOrThrow(filepath);
  }

  /**
   * Run prettier on the source file's content.
   *
   * @returns the formatted content 
   */
  prettify(): string {
    return prettier.format(this.sourceFile.getFullText(), {
      parser: "typescript",
    });
  }

  /**
   * Mutates the source file by adding missing import declarations for identifiers
   * that are referenced in the file, removing import declarations that are no longer
   * needed, and adding any provided css imports.
   *
   * @param cssImports - css file paths to add as import declarations to the file
   */
  updateFileImports(cssImports?: string[]) {
    this.sourceFile.fixMissingImports();
    cssImports?.forEach((importSource) => {
      this.sourceFile.addImportDeclaration({
        moduleSpecifier: importSource
      })
    })
    this.sourceFile.organizeImports()
  }

  /**
   * Add an import to source file if it's not already imported, either
   * by setting default and named imports to an existing import declaration
   * matching the provided source or creating a new import declaration node.
   *
   * @param importData - the import and source identifier(s) to add to file.
   */
  addFileImport(importData: {
    source: string,
    defaultImport?: string,
    namedImports?: string[]
  }): void {
    const { source, namedImports, defaultImport } = importData
    const importDeclaration = this.sourceFile
      .getImportDeclaration(i => i.getModuleSpecifierValue() !== source)
    if (importDeclaration) {
      namedImports && importDeclaration.addNamedImports(namedImports)
      defaultImport && importDeclaration.setDefaultImport(defaultImport)
    } else {
      this.sourceFile.addImportDeclaration({
        moduleSpecifier: source,
        namedImports,
        defaultImport
      })
    }
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
    const objectLiteralExp = this.getExportedObjectExpression(variableName)
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
  getCompiledObjectLiteral<T>(
    objectLiteralExp: ObjectLiteralExpression
  ): T {
    return vm.runInNewContext('(' + objectLiteralExp.getText() + ')')
  }

  parseInterface(interfaceName: string): ParsedInterface {
    const interfaceDeclaration =
      this.sourceFile.getInterfaceOrThrow(interfaceName);
    return StaticParsingHelpers.parseInterfaceDeclaration(interfaceDeclaration);
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
  parseDefaultExport(): VariableDeclaration | FunctionDeclaration {
    const declarations = this.sourceFile
      .getDefaultExportSymbolOrThrow()
      .getDeclarations();
    if (declarations.length === 0) {
      throw new Error(
        "Error getting default export: No declaration node found."
      );
    }
    const exportDeclaration = declarations[0];
    if (exportDeclaration.isKind(SyntaxKind.FunctionDeclaration)) {
      return exportDeclaration;
    } else if (exportDeclaration.isKind(SyntaxKind.ExportAssignment)) {
      const assignment = exportDeclaration.getFirstDescendantOrThrow(
        (n) =>
          n.isKind(SyntaxKind.ObjectLiteralExpression) ||
          n.isKind(SyntaxKind.Identifier) ||
          n.isKind(SyntaxKind.ArrayLiteralExpression)
      );
      if (!assignment.isKind(SyntaxKind.Identifier)) {
        throw new Error(
          "Error getting default export: Only a direct Identifier is supported for ExportAssignment."
        );
      }
      const identifierName = assignment.getText();
      return (
        this.sourceFile.getVariableDeclaration(identifierName) ??
        this.sourceFile.getFunctionOrThrow(identifierName)
      );
    }
    throw new Error(
      "Error getting default export: No ExportAssignment or FunctionDeclaration found."
    );
  }

  parseComponentTree(
    defaultImports: Record<string, string>,
    getFileMetadata: typeof getFileMetadataFn
  ): ComponentState[] {
    const defaultExport = this.parseDefaultExport();
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

  /**
   * Adds a variable statement at the top of the file,
   * under the last import statement, if any.
   *
   * @param name - the variable's name for the left side of the statement
   * @param content - the variable's content for the right side of the statement
   */
  addVariableStatement(name: string, content: string, type?: string): void {
    const lastImportStatementIndex = this.sourceFile
      .getLastChildByKind(SyntaxKind.ImportDeclaration)
      ?.getChildIndex() ?? -1
    this.sourceFile.insertVariableStatement(lastImportStatementIndex + 1, {
      isExported: true,
      declarationKind: VariableDeclarationKind.Const,
      declarations: [{ name, type, initializer: content }]
    })
  }

  /**
   * Performs an Array.prototype.map over the given {@link ComponentState}s in
   * a level order traversal, starting from the leaf nodes (deepest children)
   * and working up to root node.
   * 
   * @param componentStates - the component tree to perform on
   * @param handler - a function to execute on each component
   * @param parent - the top-most parent or root node to work up to
   *
   * @returns an array of elements returned by the handler function
   */
  mapComponentStates<T>(
    componentStates: ComponentState[],
    handler: (component: ComponentState, mappedChildren: T[]) => T,
    parent?: ComponentState
  ): T[] {
    const directChildren: ComponentState[] = [];
    const nonDirectChildren: ComponentState[] = [];
    componentStates.forEach((component) => {
      if (component.parentUUID === parent?.uuid) {
        directChildren.push(component);
      } else if (component.uuid !== parent?.uuid) {
        nonDirectChildren.push(component);
      }
    });
    return directChildren.map((component) => {
      const children = this.mapComponentStates(
        nonDirectChildren,
        handler,
        component
      );
      return handler(component, children);
    });
  }
}
