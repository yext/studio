import {
  Expression,
  ImportDeclaration,
  InterfaceDeclaration,
  JsxAttributeLike,
  JsxChild,
  JsxElement,
  JsxFragment,
  JsxSelfClosingElement,
  ObjectLiteralExpression,
  SyntaxKind,
} from "ts-morph";
import { PropValueKind, PropValues } from "../types/PropValues";
import { PropShape } from "../types/PropShape";
import TypeGuards from "./TypeGuards";
import { FileMetadataKind } from "../types/FileMetadata";
import { ComponentStateKind } from "../types/State";
import { getFileMetadata as getFileMetadataFn } from "../getFileMetadata";

export type ParsedInterface = {
  [key: string]: {
    type: string;
    doc?: string;
  };
};

export type ParsedObjectLiteral = {
  [key: string]: {
    value: string | number | boolean;
    isExpression?: true;
  };
};

export type ParsedImport = {
  source: string;
  defaultImport?: string;
  namedImports: string[];
};

export type ParsedElement = {
  metadataUUID?: string;
  props: PropValues;
  kind: ComponentStateKind;
};

/**
 * StaticParsingHelpers is a static class for housing lower level details for parsing
 * files within Studio.
 */
export default class StaticParsingHelpers {
  static parseInitializer(
    initializer: Expression
  ): ParsedObjectLiteral[string] {
    if (initializer.isKind(SyntaxKind.StringLiteral)) {
      return { value: initializer.compilerNode.text };
    }
    const expression = initializer.isKind(SyntaxKind.JsxExpression)
      ? initializer.getExpressionOrThrow()
      : initializer;
    if (
      expression.isKind(SyntaxKind.PropertyAccessExpression) ||
      expression.isKind(SyntaxKind.TemplateExpression) ||
      expression.isKind(SyntaxKind.ElementAccessExpression) ||
      expression.isKind(SyntaxKind.Identifier)
    ) {
      return { value: expression.getText(), isExpression: true };
    } else if (
      expression.isKind(SyntaxKind.NumericLiteral) ||
      expression.isKind(SyntaxKind.FalseKeyword) ||
      expression.isKind(SyntaxKind.TrueKeyword)
    ) {
      return { value: expression.getLiteralValue() };
    } else {
      throw new Error(
        `Unrecognized prop value ${initializer.getFullText()} ` +
          `with kind: ${expression.getKindName()}`
      );
    }
  }

  static parseObjectLiteral(
    objectLiteral: ObjectLiteralExpression
  ): ParsedObjectLiteral {
    const parsedValues: ParsedObjectLiteral = {};
    objectLiteral.getProperties().forEach((p) => {
      if (!p.isKind(SyntaxKind.PropertyAssignment)) {
        throw new Error(
          `Unrecognized node type: ${p.getKindName()} in object literal ${p.getFullText()}`
        );
      }
      const key = p.getName();
      const value = StaticParsingHelpers.parseInitializer(
        p.getInitializerOrThrow()
      );
      parsedValues[key] = value;
    });
    return parsedValues;
  }

  static parseImport(importDeclaration: ImportDeclaration): ParsedImport {
    const source: string = importDeclaration.getModuleSpecifierValue();
    const importClause = importDeclaration.getImportClause();
    //  Ignore imports like `import 'index.css'` which lack an import clause
    if (!importClause) {
      return {
        source,
        namedImports: [],
      };
    }
    const defaultImport: string | undefined = importClause
      .getDefaultImport()
      ?.getText();
    const namedImports: string[] = importClause
      .getNamedImports()
      .map((n) => n.getName());
    return {
      source,
      namedImports,
      defaultImport,
    };
  }

  static parseInterfaceDeclaration(
    interfaceDeclaration: InterfaceDeclaration
  ): ParsedInterface {
    const properties = interfaceDeclaration.getStructure().properties;
    if (!properties) {
      return {};
    }
    const parsedInterface: ParsedInterface = {};
    properties.forEach((p) => {
      const { name: propName, type } = p;
      if (typeof type !== "string") {
        console.error(
          "Unable to parse prop:",
          propName,
          "in props interface:",
          interfaceDeclaration.getFullText()
        );
        return;
      }

      const jsdoc = p.docs
        ?.map((doc) => (typeof doc === "string" ? doc : doc.description))
        .join("\n");
      parsedInterface[p.name] = {
        type,
        ...(jsdoc && { doc: jsdoc }),
      };
    });
    return parsedInterface;
  }

  static parseJsxChild<T>(
    c: JsxChild,
    handleJsxChild: (
      c: JsxFragment | JsxElement | JsxSelfClosingElement,
      parent?: T
    ) => T,
    parent?: T
  ): T[] {
    // All whitespace in Jsx is also considered JsxText, for example indentation
    if (c.isKind(SyntaxKind.JsxText)) {
      if (c.getLiteralText().trim().length) {
        throw new Error(
          `Found JsxText with content "${c.getLiteralText()}". JsxText is not currently supported.`
        );
      }
      return [];
    } else if (c.isKind(SyntaxKind.JsxExpression)) {
      throw new Error(
        `Jsx nodes of kind "${c.getKindName()}" are not supported for direct use in page files.`
      );
    }

    const self: T = handleJsxChild(c, parent);

    if (c.isKind(SyntaxKind.JsxSelfClosingElement)) {
      return [self];
    }

    const children: T[] = c
      .getJsxChildren()
      .flatMap((child) => this.parseJsxChild(child, handleJsxChild, self))
      .filter((child): child is T => !!child);
    return [self, ...children];
  }

  static parseElement(
    component: JsxElement | JsxSelfClosingElement,
    name: string,
    defaultImports: Record<string, string>,
    getFileMetadata: typeof getFileMetadataFn
  ): ParsedElement {
    const filepath = Object.keys(defaultImports).find(
      (importIdentifier) => defaultImports[importIdentifier] === name
    );

    const {
      metadataUUID,
      kind: fileMetadataKind,
      propShape,
    } = getFileMetadata(filepath);
    if (!metadataUUID) {
      console.warn(
        `Props for builtIn element: '${name}' are currently not supported.`
      );
    }

    const attributes: JsxAttributeLike[] = component.isKind(
      SyntaxKind.JsxSelfClosingElement
    )
      ? component.getAttributes()
      : component.getOpeningElement().getAttributes();

    const props = StaticParsingHelpers.parseJsxAttributes(
      attributes,
      propShape
    );
    const kind =
      fileMetadataKind === FileMetadataKind.Module
        ? ComponentStateKind.Module
        : ComponentStateKind.Standard;
    return {
      metadataUUID,
      props,
      kind,
    };
  }

  static parseJsxAttributes(
    attributes: JsxAttributeLike[],
    propShape?: PropShape
  ): PropValues {
    const propValues: PropValues = {};
    attributes.forEach((jsxAttribute: JsxAttributeLike) => {
      if (jsxAttribute.isKind(SyntaxKind.JsxSpreadAttribute)) {
        throw new Error(
          `Error parsing \`${jsxAttribute.getText()}\`:` +
            " JsxSpreadAttribute is not currently supported."
        );
      }
      const propName = jsxAttribute
        .getFirstDescendantByKind(SyntaxKind.Identifier)
        ?.getText();
      if (!propName) {
        throw new Error(
          "Could not parse jsx attribute prop name: " +
            jsxAttribute.getFullText()
        );
      }
      const propType = propShape?.[propName]?.type;
      if (!propType) {
        throw new Error(
          "Could not find prop type for: " + jsxAttribute.getFullText()
        );
      }
      const { value, isExpression } = StaticParsingHelpers.parseInitializer(
        jsxAttribute.getInitializerOrThrow()
      );
      const propValue = {
        valueType: propType,
        value,
        kind: isExpression ? PropValueKind.Expression : PropValueKind.Literal,
      };
      if (!TypeGuards.isValidPropValue(propValue)) {
        throw new Error(
          "Invalid prop value: " + JSON.stringify(propValue, null, 2)
        );
      }
      propValues[propName] = propValue;
    });
    return propValues;
  }

  static parseJsxElementName(
    element: JsxElement | JsxSelfClosingElement
  ): string {
    return element.isKind(SyntaxKind.JsxSelfClosingElement)
      ? element.getTagNameNode().getText()
      : element.getOpeningElement().getTagNameNode().getText();
  }

  static isFragmentElement(
    element: JsxElement | JsxSelfClosingElement
  ): boolean {
    const name = StaticParsingHelpers.parseJsxElementName(element);
    return (
      element.isKind(SyntaxKind.JsxElement) &&
      ["Fragment", "React.Fragment"].includes(name)
    );
  }
}
