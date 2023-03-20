import {
  ArrayLiteralExpression,
  ExportAssignment,
  Expression,
  Identifier,
  ImportDeclaration,
  InterfaceDeclaration,
  JsxAttributeLike,
  JsxChild,
  JsxElement,
  JsxFragment,
  JsxSelfClosingElement,
  Node,
  ObjectLiteralExpression,
  ParenthesizedExpression,
  SyntaxKind,
  TypeNode,
  PropertySignature,
  PropertyAssignment,
  UnionTypeNode,
  JsxExpression,
} from "ts-morph";
import {
  PropValueKind,
  PropValues,
  PropValueType,
} from "../../types/PropValues";
import { PropShape, SpecialReactProps } from "../../types/PropShape";
import TypeGuards from "../../utils/TypeGuards";
import TsMorphHelpers from "./TsMorphHelpers";
import RepeaterParsingHelpers from "./RepeaterParsingHelpers";

export enum ParsedInterfaceKind {
  Simple = "simple",
  Nested = "nested",
}

export type ParsedInterface = {
  [key: string]:
    | {
        kind: ParsedInterfaceKind.Simple;
        type: string;
        required: boolean;
        unionValues?: string[];
        doc?: string;
      }
    | {
        kind: ParsedInterfaceKind.Nested;
        type: ParsedInterface;
        required: boolean;
      };
};

export type ParsedObjectLiteral = {
  [key: string]:
    | {
        value: string | number | boolean;
        isExpression?: true;
      }
    | {
        value: ParsedObjectLiteral;
        isExpression?: false;
      };
};

export type ParsedImport = {
  source: string;
  defaultImport?: string;
  namedImports: string[];
};

/**
 * StaticParsingHelpers is a static class for housing lower level details for parsing
 * files within Studio.
 */
export default class StaticParsingHelpers {
  private static parseInitializer(
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
      expression.isKind(SyntaxKind.Identifier) ||
      expression.isKind(SyntaxKind.NoSubstitutionTemplateLiteral)
    ) {
      return { value: expression.getText(), isExpression: true };
    } else if (
      expression.isKind(SyntaxKind.NumericLiteral) ||
      expression.isKind(SyntaxKind.FalseKeyword) ||
      expression.isKind(SyntaxKind.TrueKeyword)
    ) {
      return { value: expression.getLiteralValue() };
    } else if (expression.isKind(SyntaxKind.ObjectLiteralExpression)) {
      return { value: this.parseObjectLiteral(expression) };
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
      const key = this.getEscapedName(p);
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
    return this.parsePropertySignatures(interfaceDeclaration.getProperties());
  }

  private static getEscapedName(
    p: PropertySignature | PropertyAssignment
  ): string {
    return p.getSymbolOrThrow().getEscapedName();
  }

  private static getJsDocs(propertySignature: PropertySignature) {
    const docs = propertySignature.getStructure().docs;
    return docs
      ?.map((doc) => (typeof doc === "string" ? doc : doc.description))
      .join("\n");
  }

  private static parsePropertySignatures(
    propertySignatures: PropertySignature[]
  ): ParsedInterface {
    const parsedInterface: ParsedInterface = {};

    const handleNestedType = (typeNode: TypeNode, p: PropertySignature) => {
      parsedInterface[this.getEscapedName(p)] = {
        kind: ParsedInterfaceKind.Nested,
        type: this.parsePropertySignatures(
          typeNode.getChildrenOfKind(SyntaxKind.PropertySignature)
        ),
        required: !p.hasQuestionToken(),
      };
    };

    const handleSimplePropertySignature = (p: PropertySignature) => {
      const { name: propName, type } = p.getStructure();
      if (typeof type !== "string") {
        console.error(
          "Unable to parse prop:",
          propName,
          "in PropertySignature:",
          p.getFullText()
        );
        return;
      }

      const jsdoc = this.getJsDocs(p);
      parsedInterface[this.getEscapedName(p)] = {
        kind: ParsedInterfaceKind.Simple,
        type,
        ...(jsdoc && { doc: jsdoc }),
        required: !p.hasQuestionToken(),
      };
    };

    const handleUnionType = (
      p: PropertySignature,
      unionType: UnionTypeNode
    ) => {
      const unionValues = unionType.getTypeNodes().map((n) => {
        const firstChild = n.getFirstChild();
        if (!firstChild?.isKind(SyntaxKind.StringLiteral)) {
          throw new Error(
            `Union types only support strings. Found a ${firstChild?.getKindName()} ` +
              `within "${this.getEscapedName(p)}".`
          );
        }
        return firstChild.getLiteralText();
      });
      const jsdoc = this.getJsDocs(p);
      parsedInterface[this.getEscapedName(p)] = {
        kind: ParsedInterfaceKind.Simple,
        type: PropValueType.string,
        unionValues,
        ...(jsdoc && { doc: jsdoc }),
        required: !p.hasQuestionToken(),
      };
    };

    propertySignatures.forEach((p) => {
      const typeNode = p.getTypeNode();
      if (typeNode?.isKind(SyntaxKind.TypeLiteral)) {
        handleNestedType(typeNode, p);
        return;
      }
      const unionType = p.getFirstChildByKind(SyntaxKind.UnionType);
      if (unionType) {
        handleUnionType(p, unionType);
      } else {
        handleSimplePropertySignature(p);
      }
    });
    return parsedInterface;
  }

  static parseJsxChild<T>(
    c: JsxChild,
    handleJsxChild: (
      c: JsxFragment | JsxElement | JsxSelfClosingElement | JsxExpression,
      parent: T | undefined
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
    }
    const self: T = handleJsxChild(c, parent);

    if (
      c.isKind(SyntaxKind.JsxSelfClosingElement) ||
      c.isKind(SyntaxKind.JsxExpression)
    ) {
      return [self];
    }

    const children: T[] = c
      .getJsxChildren()
      .flatMap((child) => this.parseJsxChild(child, handleJsxChild, self))
      .filter((child): child is T => !!child);
    return [self, ...children];
  }

  static parseJsxExpression(c: JsxExpression): {
    selfClosingElement: JsxSelfClosingElement;
    listExpression: string;
  } {
    const isMapExpression =
      c
        .getFirstDescendantByKind(SyntaxKind.PropertyAccessExpression)
        ?.getLastChildByKind(SyntaxKind.Identifier)
        ?.getText() === "map";

    if (!isMapExpression) {
      throw new Error(
        `Jsx nodes of kind "${c.getKindName()}" are not supported for direct use` +
          " in page files except for `map` function expressions."
      );
    }
    return RepeaterParsingHelpers.parseMapExpression(c);
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
      if (Object.values<string>(SpecialReactProps).includes(propName)) {
        return;
      }
      const propType = propShape?.[propName]?.type;
      if (!propType) {
        throw new Error(
          `Could not find prop type for: \`${jsxAttribute.getFullText()}\` with prop shape ${JSON.stringify(
            propShape,
            null,
            2
          )}`
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

  /**
   * Recursively unwraps a ParenthesizedExpression to its last layer.
   */
  static unwrapParensExpression(
    parensExpression: ParenthesizedExpression
  ): ParenthesizedExpression {
    let node: ParenthesizedExpression = parensExpression;
    let nextNode: ParenthesizedExpression | undefined = node;
    while (nextNode) {
      nextNode = nextNode.getFirstChildByKind(
        SyntaxKind.ParenthesizedExpression
      );
      if (nextNode) {
        node = nextNode;
      }
    }
    return node;
  }

  static parseExportAssignment(
    exportAssignment: ExportAssignment
  ): Identifier | ObjectLiteralExpression | ArrayLiteralExpression {
    let parentNode: Node = exportAssignment;

    const asExpression = parentNode.getFirstChildByKind(
      SyntaxKind.AsExpression
    );
    if (asExpression) {
      parentNode = asExpression;
    }

    const parensExpression = parentNode.getFirstChildByKind(
      SyntaxKind.ParenthesizedExpression
    );
    if (parensExpression) {
      parentNode =
        StaticParsingHelpers.unwrapParensExpression(parensExpression);
    }

    return TsMorphHelpers.getFirstChildOfKindOrThrow(
      parentNode,
      SyntaxKind.ObjectLiteralExpression,
      SyntaxKind.ArrayLiteralExpression,
      SyntaxKind.Identifier
    );
  }
}
