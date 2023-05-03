import {
  SyntaxKind,
  JsxElement,
  JsxFragment,
  JsxSelfClosingElement,
  JsxAttributeLike,
  JsxExpression,
} from "ts-morph";
import { Result } from "true-myth";
import {
  BuiltInState,
  ComponentState,
  ComponentStateKind,
  RepeaterState,
  StandardOrModuleComponentState,
} from "../types/ComponentState";
import { v4 } from "uuid";
import { FileMetadataKind } from "../types";
import StudioSourceFileParser from "./StudioSourceFileParser";
import StaticParsingHelpers from "./helpers/StaticParsingHelpers";
import TypeGuards from "../utils/TypeGuards";
import ParsingOrchestrator from "../ParsingOrchestrator";
import { ParsingError, ParsingErrorType } from "../types/errors/ParsingError";

export type GetFileMetadata = ParsingOrchestrator["getFileMetadata"];

export default class ComponentTreeParser {
  constructor(
    private studioSourceFileParser: StudioSourceFileParser,
    private getFileMetadata: GetFileMetadata
  ) {}

  parseComponentTree(
    defaultImports: Record<string, string>
  ): Result<ComponentState[], ParsingError> {
    const defaultExport =
      this.studioSourceFileParser.getDefaultExportReactComponent();
    const returnStatement = defaultExport.getFirstDescendantByKind(
      SyntaxKind.ReturnStatement
    );
    if (!returnStatement) {
      return Result.ok([]);
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
      return Result.err({
        name: ParsingErrorType.MissingTopLevelJSXNode,
        message:
          "Unable to find top-level JSX element or JSX fragment type" +
          ` in the default export at path: "${this.studioSourceFileParser.getFilepath()}"`,
      });
    }

    return Result.ok(
      StaticParsingHelpers.parseJsxChild(topLevelJsxNode, (child, parent) =>
        this.parseComponentState(child, defaultImports, parent)
      )
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
    | Pick<BuiltInState, "kind" | "props"> {
    const attributes: JsxAttributeLike[] = component.isKind(
      SyntaxKind.JsxSelfClosingElement
    )
      ? component.getAttributes()
      : component.getOpeningElement().getAttributes();

    const filepath = Object.keys(defaultImports).find((importIdentifier) => {
      const compareComponent = defaultImports[importIdentifier];
      return compareComponent === componentName;
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
    const { kind: fileMetadataKind, metadataUUID, propShape } = fileMetadata;

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
