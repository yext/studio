import {
  Expression,
  ImportDeclaration,
  InterfaceDeclaration,
  JsxAttributeLike,
  JsxElement,
  JsxExpression,
  JsxFragment,
  JsxSelfClosingElement,
  JsxText,
  ObjectLiteralExpression,
  StringLiteral,
  SyntaxKind,
  ts,
} from "ts-morph";
import { ComponentState, ComponentStateKind } from "../types/State";
import { v4 } from "uuid";
import { PropValueKind, PropValues } from "../types/PropValues";
import ComponentFile from "./ComponentFile";
import { PropShape } from "../types/PropShape";
import TypeGuards from "./TypeGuards";

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
        `Unrecognized initialProps value ${initializer.getFullText()} ` +
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

  static parseComponentState(
    c: JsxFragment | JsxElement | JsxSelfClosingElement,
    defaultImports: Record<string, string>,
    parentUUID?: string
  ): ComponentState {
    const commonComponentState = {
      parentUUID,
      uuid: v4()
    };

    function getJsxElementName(c: JsxElement): string {
      return c.getOpeningElement().getTagNameNode().getText();
    }

    if (c.isKind(SyntaxKind.JsxSelfClosingElement)) {
      const componentName = c.getTagNameNode().getText();
      return {
        ...commonComponentState,
        ...StaticParsingHelpers.parseElement(c, componentName, defaultImports),
        kind: ComponentStateKind.Standard, // TODO: determine when this would be Module kind
        componentName
      };
    } else if (
        c.isKind(SyntaxKind.JsxFragment)
        || ["Fragment", "React.Fragment"].includes(getJsxElementName(c))
      ) {
      return {
        ...commonComponentState,
        kind: ComponentStateKind.Fragment
      };
    } else {
      const componentName = getJsxElementName(c);
      return {
        ...commonComponentState,
        ...StaticParsingHelpers.parseElement(c, componentName, defaultImports),
        kind: ComponentStateKind.Standard, // TODO: determine when this would be Module kind
        componentName
      };
    }
  }

  static parseElement(
    c: JsxElement | JsxSelfClosingElement,
    name: string,
    defaultImports: Record<string, string>
  ): { metadataUUID: string, props: PropValues } {
    const metadataUUID = Object.keys(defaultImports)
      .find(importIdentifier => defaultImports[importIdentifier] === name);

    const attributes: JsxAttributeLike[] = c.isKind(SyntaxKind.JsxSelfClosingElement)
      ? c.getAttributes()
      : c.getOpeningElement().getAttributes();
    // This is temporarily added to get the component metadata. Once the state manager is
    // implemented, this data will be stored there and will not need to be computed here.
    // TODO: update to get component metadata from the state manager
    let propShape: PropShape | undefined = undefined;
    if (metadataUUID) {
      const componentFile = new ComponentFile(metadataUUID);
      propShape = componentFile.getComponentMetadata().propShape;
    } else {
      console.warn(`Props for builtIn element: '${name}' are currently not supported.`)
    }
   
    const props = StaticParsingHelpers.parseJsxAttributes(attributes, propShape);
    return { 
      metadataUUID: metadataUUID ?? "builtIn",
      props
    };
  }

  static parseJsxAttributes(
    attributes: JsxAttributeLike[],
    propShape: PropShape | undefined
  ): PropValues {
    const propValues: PropValues = {};
    attributes.forEach((jsxAttribute: JsxAttributeLike) => {
      if (jsxAttribute.isKind(SyntaxKind.JsxSpreadAttribute)) {
        throw new Error("JsxSpreadAttribute is not currently supported.");
      }
      const propName = jsxAttribute.getFirstDescendantByKind(SyntaxKind.Identifier)?.compilerNode.text;
      if (!propName) {
        throw new Error("Could not parse jsx attribute prop name: " + jsxAttribute.getFullText());
      }
      const propType = propShape?.[propName]?.type;
      if (!propType) {
        throw new Error("Could not find prop type for: " + jsxAttribute.getFullText());
      }
      const { value, isExpression } = StaticParsingHelpers.getPropValue(jsxAttribute.getInitializerOrThrow());
      const propValue = {
        valueType: propType,
        value,
        kind: isExpression ? PropValueKind.Expression : PropValueKind.Literal
      };
      if (!TypeGuards.isValidPropValue(propValue)) {
        throw new Error(
          "Invalid prop value: " + JSON.stringify(propValue, null, 2)
        );
      }
      propValues[propName] = propValue;
    })
    return propValues;
  }

  static getPropValue(initializer: StringLiteral | Expression | JsxExpression): {
    value: string | number | boolean,
    isExpression?: boolean
  } {
    if (initializer.isKind(ts.SyntaxKind.StringLiteral)) {
      return { value: initializer.compilerNode.text };
    }
    const expression = initializer.isKind(ts.SyntaxKind.JsxExpression)
      ? initializer.getExpressionOrThrow()
      : initializer;
    if (
      expression.isKind(ts.SyntaxKind.PropertyAccessExpression) ||
      expression.isKind(ts.SyntaxKind.TemplateExpression) ||
      expression.isKind(ts.SyntaxKind.ElementAccessExpression) ||
      expression.isKind(ts.SyntaxKind.Identifier)
    ) {
      return { value: expression.getText(), isExpression: true };
    } else if (
      expression.isKind(ts.SyntaxKind.NumericLiteral) ||
      expression.isKind(ts.SyntaxKind.FalseKeyword) ||
      expression.isKind(ts.SyntaxKind.TrueKeyword)
    ) {
      return { value: expression.getLiteralValue() };
    } else {
      throw new Error("Unrecognized Expression kind: " + expression.getKindName());
    }
  }

  static parseJsxChild(
    c: JsxText | JsxExpression | JsxSelfClosingElement | JsxElement | JsxFragment,
    defaultImports: Record<string, string>,
    parentUUID?: string
  ): ComponentState[] {
    // All whitespace in Jsx is also considered JsxText, for example indentation
    if (c.isKind(SyntaxKind.JsxText)) {
      if (c.getLiteralText().trim() !== "") {
        throw new Error(`Found JsxText with content "${c.getLiteralText()}". JsxText is not currently supported.`);
      }
      return [];
    } else if (c.isKind(SyntaxKind.JsxExpression)) {
      throw new Error(
        `Jsx nodes of kind "${c.getKindName()}" are not supported for direct use in page files.`);
    }
  
    const selfState: ComponentState = {
      ...StaticParsingHelpers.parseComponentState(c, defaultImports),
      parentUUID
    };
  
    if (c.isKind(SyntaxKind.JsxSelfClosingElement)) {
      return [ selfState ];
    }
  
    const children: ComponentState[] = c.getJsxChildren()
      .flatMap(c => StaticParsingHelpers.parseJsxChild(c, defaultImports, selfState.uuid))
      .filter((c): c is ComponentState => !!c);
    return [ selfState, ...children ];
  }
}
