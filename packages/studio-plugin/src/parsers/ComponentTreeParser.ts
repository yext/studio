import {
  SyntaxKind,
  JsxElement,
  JsxFragment,
  JsxSelfClosingElement,
  JsxAttributeLike,
} from "ts-morph";
import {
  BuiltInState,
  ComponentState,
  ComponentStateKind,
  StandardOrModuleComponentState,
} from "../types/State";
import { v4 } from "uuid";
import { FileMetadataKind } from "../types";
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
        // console.warn(
        //   `Props for builtIn element: '${componentName}' are currently not supported.`
        // );
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
