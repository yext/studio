import {
  Project,
  SourceFile,
  SyntaxKind,
  VariableDeclaration,
  FunctionDeclaration,
  JsxElement,
  JsxFragment,
  JsxSelfClosingElement,
  JsxChild,
  Identifier
} from "ts-morph";
import typescript from "typescript";
import { ComponentState, ComponentStateKind } from "../types/State";
import StaticParsingHelpers, {
  ParsedInterface,
  ParsedObjectLiteral,
} from "./StaticParsingHelpers";
import { v4 } from "uuid";

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

  /**
   * There is full support for default exports defined directly as function
   * declarations. But, for exports defined as assignments, support is slightly
   * restricted as follows:
   * - If there is only a single identifer (e.g. `export default Identifier;`),
   *   it will look for and return the declaration for that identifier.
   * - If there is an array (e.g. `export default [Identifier1, Identifier 2];`),
   *   it will only look for and return the declaration for the first identifier.
   * - If there is an object (e.g. `export default \{ key1: val1, key2: val2 \};`),
   *   it will only look for and return a declartion for the identifier of the
   *   first field's value (i.e. `val1`). This is also the case if property
   *   shorthand is used (e.g. `export default \{ Export1, Export2 \};` would look
   *   for a declaration of `Export1`.), 
   */
  parseDefaultExport(): VariableDeclaration | FunctionDeclaration {
    const declarations = this.sourceFile.getDefaultExportSymbolOrThrow().getDeclarations();
    if (declarations.length === 0) {
      throw new Error("Error getting default export");
    }
    const exportDeclaration = declarations[0];
    if (exportDeclaration.isKind(SyntaxKind.FunctionDeclaration)) {
      return exportDeclaration;
    } else if (exportDeclaration.isKind(SyntaxKind.ExportAssignment)) {
      let identifier: Identifier | undefined = undefined;
      const objLiteralExp = exportDeclaration.getFirstDescendantByKind(
        SyntaxKind.ObjectLiteralExpression
      );
      if (objLiteralExp) {
        const propAssignment = objLiteralExp.getFirstDescendant(n =>
          n.isKind(SyntaxKind.PropertyAssignment)
          || n.isKind(SyntaxKind.ShorthandPropertyAssignment)
        );
        if (propAssignment?.isKind(SyntaxKind.PropertyAssignment)) {
          const identifiers = propAssignment.getDescendantsOfKind(SyntaxKind.Identifier);
          if (identifiers.length > 1) {
            // The value of the object's first property
            identifier = identifiers[1];
          }
        }
      }
      identifier = identifier
        ?? exportDeclaration.getFirstDescendantByKindOrThrow(SyntaxKind.Identifier);
      const identifierName = identifier.getText();
      return this.sourceFile.getVariableDeclaration(identifierName)
        ?? this.sourceFile.getFunctionOrThrow(identifierName);
    }
    throw new Error("Error getting default export, no ExportAssignment or FunctionDeclaration found");
  }

  parseComponentTree(defaultImports: Record<string, string>): ComponentState[] {
    const defaultExport = this.parseDefaultExport();
    const returnStatement = defaultExport.getFirstDescendantByKind(SyntaxKind.ReturnStatement);
    if (!returnStatement) {
      throw new Error(`No return statement found for the default export at path: "${this.sourceFile.getFilePath()}"`);
    }
    const JsxNodeWrapper = returnStatement.getFirstChildByKind(SyntaxKind.ParenthesizedExpression)
      ?? returnStatement;
    const topLevelJsxNode = JsxNodeWrapper.getChildren()
      .find((n): n is JsxElement | JsxFragment =>
        n.isKind(SyntaxKind.JsxElement) || n.isKind(SyntaxKind.JsxFragment)
      );
    if (!topLevelJsxNode) {
      throw new Error("Unable to find top-level JSX element or JSX fragment type"
        + ` in the default export at path: "${this.sourceFile.getFilePath()}"`);
    }

    return this.parseJsxChild(
      topLevelJsxNode,
      defaultImports
    );
  }

  parseJsxChild(
    c: JsxChild,
    defaultImports: Record<string, string>,
    parentUUID?: string
  ): ComponentState[] {
    // All whitespace in Jsx is also considered JsxText, for example indentation
    if (c.isKind(SyntaxKind.JsxText)) {
      if (c.getLiteralText().trim().length) {
        throw new Error(`Found JsxText with content "${c.getLiteralText()}". JsxText is not currently supported.`);
      }
      return [];
    } else if (c.isKind(SyntaxKind.JsxExpression)) {
      throw new Error(
        `Jsx nodes of kind "${c.getKindName()}" are not supported for direct use in page files.`);
    }

    const selfState: ComponentState = {
      ...this.parseComponentState(c, defaultImports),
      parentUUID
    };

    if (c.isKind(SyntaxKind.JsxSelfClosingElement)) {
      return [selfState];
    }

    const children: ComponentState[] = c.getJsxChildren()
      .flatMap(c => this.parseJsxChild(c, defaultImports, selfState.uuid))
      .filter((c): c is ComponentState => !!c);
    return [selfState, ...children];
  }

  parseComponentState(
    component: JsxFragment | JsxElement | JsxSelfClosingElement,
    defaultImports: Record<string, string>,
    parentUUID?: string
  ): ComponentState {
    const commonComponentState = {
      parentUUID,
      uuid: v4()
    };

    function getJsxElementName(element: JsxElement): string {
      return element.getOpeningElement().getTagNameNode().getText();
    }

    if (component.isKind(SyntaxKind.JsxSelfClosingElement)) {
      const componentName = component.getTagNameNode().getText();
      return {
        ...commonComponentState,
        ...StaticParsingHelpers.parseElement(component, componentName, defaultImports),
        kind: ComponentStateKind.Standard, // TODO: determine when this would be Module kind
        componentName
      };
    } else if (
      component.isKind(SyntaxKind.JsxFragment)
      || ["Fragment", "React.Fragment"].includes(getJsxElementName(component))
    ) {
      return {
        ...commonComponentState,
        kind: ComponentStateKind.Fragment
      };
    } else {
      const componentName = getJsxElementName(component);
      return {
        ...commonComponentState,
        ...StaticParsingHelpers.parseElement(component, componentName, defaultImports),
        kind: ComponentStateKind.Standard, // TODO: determine when this would be Module kind
        componentName
      };
    }
  }
}
