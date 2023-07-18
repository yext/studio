import {
  SyntaxKind,
  JsxElement,
  JsxFragment,
  JsxSelfClosingElement,
  JsxAttributeLike,
  JsxExpression,
} from "ts-morph";
import {
  BuiltInState,
  ComponentState,
  ComponentStateKind,
  ErrorComponentState,
  RepeaterState,
  StandardOrModuleComponentState,
} from "../types/ComponentState";
import { v4 } from "uuid";
import {
  FileMetadataKind,
  PropShape,
  PropValueType,
  PropValues,
  TypelessPropVal,
  PropValueKind,
} from "../types";
import StudioSourceFileParser from "./StudioSourceFileParser";
import StaticParsingHelpers from "./helpers/StaticParsingHelpers";
import TypeGuards from "../utils/TypeGuards";
import ParsingOrchestrator from "../ParsingOrchestrator";

export type GetFileMetadata = ParsingOrchestrator["getFileMetadata"];

export default class ComponentTreeParser {
  constructor(
    private studioSourceFileParser: StudioSourceFileParser,
    private getFileMetadata: GetFileMetadata
  ) {}

  parseComponentTree(defaultImports: Record<string, string>): ComponentState[] {
    const defaultExport =
      this.studioSourceFileParser.getDefaultExportReactComponent();
    const returnStatement = defaultExport.getFirstDescendantByKind(
      SyntaxKind.ReturnStatement
    );
    if (!returnStatement) {
      return [];
    }
    const JsxNodeWrapper =
      returnStatement.getFirstChildByKind(SyntaxKind.ParenthesizedExpression) ??
      returnStatement;
    const topLevelJsxNode = JsxNodeWrapper.getChildren().find(
      (n): n is JsxElement | JsxFragment | JsxSelfClosingElement =>
        n.isKind(SyntaxKind.JsxElement) ||
        n.isKind(SyntaxKind.JsxFragment) ||
        n.isKind(SyntaxKind.JsxSelfClosingElement)
    );
    if (!topLevelJsxNode) {
      throw new Error(
        "Unable to find top-level JSX element or JSX fragment type" +
          ` in the default export at path: "${this.studioSourceFileParser.getFilepath()}"`
      );
    }

    return StaticParsingHelpers.parseJsxChild(
      topLevelJsxNode,
      (child, parent) => this.parseComponentState(child, defaultImports, parent)
    );
  }

  private parseComponentState(
    component: JsxFragment | JsxElement | JsxSelfClosingElement | JsxExpression,
    defaultImports: Record<string, string>,
    parent: ComponentState | undefined
  ): ComponentState {
    const commonComponentState = {
      parentUUID: parent?.uuid,
      uuid: v4(),
    };

    if (component.isKind(SyntaxKind.JsxExpression)) {
      const { selfClosingElement, listExpression } =
        StaticParsingHelpers.parseJsxExpression(component);
      const parsedRepeaterElement = this.parseRepeaterElement(
        defaultImports,
        selfClosingElement,
        listExpression
      );
      return {
        ...commonComponentState,
        ...parsedRepeaterElement,
      };
    }

    if (!TypeGuards.isNotFragmentElement(component)) {
      return {
        ...commonComponentState,
        kind: ComponentStateKind.Fragment,
      };
    }

    const componentName = StaticParsingHelpers.parseJsxElementName(component);
    const parsedElement = this.parseElement(
      component,
      componentName,
      defaultImports
    );

    return {
      ...commonComponentState,
      ...parsedElement,
      componentName,
    };
  }

  private parseRepeaterElement(
    defaultImports: Record<string, string>,
    repeatedComponent: JsxSelfClosingElement,
    listExpression: string
  ): Omit<RepeaterState, "uuid" | "parentUUID"> {
    const componentName =
      StaticParsingHelpers.parseJsxElementName(repeatedComponent);
    const parsedRepeatedComponent = this.parseElement(
      repeatedComponent,
      componentName,
      defaultImports
    );
    if (parsedRepeatedComponent.kind === ComponentStateKind.BuiltIn) {
      throw new Error(
        "Error parsing map expression: repetition of built-in components is not supported."
      );
    }
    return {
      kind: ComponentStateKind.Repeater,
      listExpression,
      repeatedComponent: {
        ...parsedRepeatedComponent,
        componentName,
      },
    };
  }

  private parseElement(
    component: JsxElement | JsxSelfClosingElement,
    componentName: string,
    defaultImports: Record<string, string>
  ):
    | Pick<StandardOrModuleComponentState, "kind" | "props" | "metadataUUID">
    | Pick<BuiltInState, "kind" | "props">
    | Omit<ErrorComponentState, "componentName"> {
    const attributes: JsxAttributeLike[] = component.isKind(
      SyntaxKind.JsxSelfClosingElement
    )
      ? component.getAttributes()
      : component.getOpeningElement().getAttributes();

    const filepath = Object.keys(defaultImports).find((importIdentifier) => {
      return defaultImports[importIdentifier] === componentName;
    });
    const assumeIsBuiltInElement = filepath === undefined;
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

    const fileMetadata = this.getFileMetadata(filepath);
    if (fileMetadata.kind === FileMetadataKind.Error) {
      const props: Record<string, TypelessPropVal> = {};
      attributes.forEach((attribute) => {
        const propName = StaticParsingHelpers.parseJsxAttributeName(attribute);
        const parsedAttribute =
          StaticParsingHelpers.parseJsxAttribute(attribute);
        if (parsedAttribute !== undefined) {
          props[propName] = parsedAttribute;
        }
      });

      return {
        kind: ComponentStateKind.Error,
        metadataUUID: fileMetadata.metadataUUID,
        uuid: v4(),
        fullText: component.getFullText(),
        message: fileMetadata.message,
        props,
      };
    }
    const { kind: fileMetadataKind, metadataUUID, propShape } = fileMetadata;

    const componentStateKind =
      fileMetadataKind === FileMetadataKind.Module
        ? ComponentStateKind.Module
        : ComponentStateKind.Standard;
    const props = StaticParsingHelpers.parseJsxAttributes(
      attributes,
      propShape
    );

    const missingProps = getMissingRequiredProps(props, propShape);
    const missingPropsString = missingProps.join(", ");
    if (missingProps.length) {
      return {
        kind: ComponentStateKind.Error,
        metadataUUID: fileMetadata.metadataUUID,
        uuid: v4(),
        fullText: component.getFullText(),
        message: "Props missing: " + missingPropsString,
        props,
      };
    }

    return {
      kind: componentStateKind,
      metadataUUID,
      props,
    };
  }
}

function getMissingRequiredProps(
  propValues: PropValues,
  propShape: PropShape | undefined
): string[] {
  const missingProps: string[] = [];
  if (!propShape) {
    return [];
  }

  for (const propName of Object.keys(propShape)) {
    const propIsRequired = propShape[propName].required;
    const propIsUndefined = propValues[propName] === undefined;
    if (propIsRequired && propIsUndefined) {
      missingProps.push(propName);
    }
    if (propIsUndefined) {
      continue;
    }

    const shapeMetadata = propShape[propName];
    const valueMetadata = propValues[propName];
    if (shapeMetadata.type === PropValueType.Array) {
      if (
        shapeMetadata.itemType.type !== PropValueType.Object ||
        valueMetadata.valueType !== PropValueType.Array ||
        valueMetadata.kind !== PropValueKind.Literal
      ) {
        continue;
      }
      const arrayShapes = shapeMetadata.itemType.shape;
      for (const value of valueMetadata.value) {
        if (value.valueType === PropValueType.Object) {
          const missingArrayProps = getMissingRequiredProps(
            value.value,
            arrayShapes
          );
          missingProps.push(...missingArrayProps);
        }
      }
    } else if (shapeMetadata.type === PropValueType.Object) {
      if (valueMetadata.valueType === PropValueType.Object) {
        const objectShape = shapeMetadata.shape;
        const missingObjectProps = getMissingRequiredProps(
          valueMetadata.value,
          objectShape
        );
        missingProps.push(...missingObjectProps);
      }
    }
  }
  return missingProps;
}
