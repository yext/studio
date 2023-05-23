import { TemplateConfig } from "@yext/pages";
import { ArrowFunction, FunctionDeclaration } from "ts-morph";
import {
  PAGESJS_TEMPLATE_PROPS_TYPE,
  TEMPLATE_CONFIG_VARIABLE_NAME,
  TEMPLATE_STRING_EXPRESSION_REGEX,
} from "../constants";
import TypeGuards from "../utils/TypeGuards";
import {
  PropVal,
  PropValueKind,
  PropValues,
  TypelessPropVal,
} from "../types/PropValues";
import { ComponentState, ComponentStateKind } from "../types/ComponentState";
import StudioSourceFileWriter from "./StudioSourceFileWriter";
import { StreamsDataExpression } from "../types/Expression";
import pagesJSFieldsMerger from "../utils/StreamConfigFieldsMerger";
import PagesJsWriter from "./PagesJsWriter";
import { GetPathVal, PagesJsState } from "../types";
import TemplateConfigParser from "../parsers/TemplateConfigParser";

const TEMPLATE_CONFIG_VARIABLE_TYPE = "TemplateConfig";

type EntityPageState = PagesJsState &
  Required<Pick<PagesJsState, "streamScope">>;

/**
 * TemplateConfigWriter is a class for housing the updating logic for the
 * template config in the PageFile for an entity page.
 */
export default class TemplateConfigWriter {
  constructor(
    private studioSourceFileWriter: StudioSourceFileWriter,
    private templateConfigParser: TemplateConfigParser,
    private pagesJsWriter: PagesJsWriter
  ) {}

  /**
   * Extracts stream's data expressions used in the provided component tree,
   * in the form of `document.${string}`.
   *
   * @param componentsState - the states of the page's component tree
   * @returns a set of stream's data expressions
   */
  private getUsedStreamDocumentPaths(
    componentTree: ComponentState[],
    getPathValue?: GetPathVal
  ): Set<StreamsDataExpression> {
    const streamDataExpressions = new Set<StreamsDataExpression>();
    componentTree.forEach((c) => {
      if (
        !TypeGuards.isEditableComponentState(c) &&
        c.kind !== ComponentStateKind.Error
      ) {
        return;
      }
      if (TypeGuards.isRepeaterState(c)) {
        if (TypeGuards.isStreamsDataExpression(c.listExpression)) {
          streamDataExpressions.add(c.listExpression);
        }
        this.getPathsFromProps(c.repeatedComponent.props).forEach((value) =>
          streamDataExpressions.add(value)
        );
      } else {
        this.getPathsFromProps(c.props).forEach((value) =>
          streamDataExpressions.add(value)
        );
      }
    });
    if (getPathValue) {
      this.getPathsFromPropVal(getPathValue)?.forEach((value) =>
        streamDataExpressions.add(value)
      );
    }
    return streamDataExpressions;
  }

  private getPathsFromProps(
    props: PropValues | Record<string, TypelessPropVal>
  ): StreamsDataExpression[] {
    const dataExpressions: StreamsDataExpression[] = [];
    Object.keys(props).forEach((propName) => {
      const paths = this.getPathsFromPropVal(props[propName]);
      paths && dataExpressions.push(...paths);
    });
    return dataExpressions;
  }

  private getPathsFromPropVal({
    value,
    kind,
  }: PropVal | TypelessPropVal | GetPathVal):
    | StreamsDataExpression[]
    | undefined {
    if (kind !== PropValueKind.Expression) {
      return;
    }
    if (TypeGuards.isTemplateString(value)) {
      return [...value.matchAll(TEMPLATE_STRING_EXPRESSION_REGEX)]
        .map((m) => m[1])
        .filter((m): m is StreamsDataExpression =>
          TypeGuards.isStreamsDataExpression(m)
        );
    } else if (TypeGuards.isStreamsDataExpression(value)) {
      return [value];
    }
  }

  /**
   * Creates a Pages template config by merging current template config, if
   * defined, with a new template configuration used by the constructed page
   * from Studio.
   *
   * @param componentTree - the states of the page's component tree
   * @param entityPageState - the PagesJS-specific state of the entity page
   * @returns the updated template config
   */
  private getUpdatedTemplateConfig(
    componentTree: ComponentState[],
    entityPageState: EntityPageState
  ): TemplateConfig {
    const currentTemplateConfig = this.templateConfigParser.getTemplateConfig();
    const usedDocumentPaths = this.getUsedStreamDocumentPaths(
      componentTree,
      entityPageState.getPathValue
    );

    const currentFields = currentTemplateConfig?.stream?.fields || [];
    const newFields = [...usedDocumentPaths]
      // Stream config's fields do not allow specifying an index or sub-field of a field.
      .map((documentPath) => /^document\.([^[.]+)/.exec(documentPath))
      .filter((matchResults) => matchResults && matchResults.length >= 2)
      .map((matchResults) => (matchResults as RegExpExecArray)[1]);

    return {
      ...currentTemplateConfig,
      stream: {
        $id: "studio-stream-id",
        localization: {
          locales: ["en"],
          primary: false,
        },
        ...currentTemplateConfig?.stream,
        filter: entityPageState.streamScope,
        fields: pagesJSFieldsMerger(currentFields, newFields),
      },
    };
  }

  /**
   * Updates the template configuration by mutating the current template config
   * or adding a template config definition to the original sourceFile of the
   * entity page.
   *
   * @param componentTree - the states of the page's component tree
   * @param entityPageState - the PagesJS-specific state of the entity page
   * @param componentFunction - the default export React component function
   */
  updateTemplateConfig(
    componentTree: ComponentState[],
    entityPageState: EntityPageState,
    componentFunction: FunctionDeclaration | ArrowFunction
  ) {
    const updatedTemplateConfig = this.getUpdatedTemplateConfig(
      componentTree,
      entityPageState
    );

    const stringifiedConfig = JSON.stringify(updatedTemplateConfig);
    this.studioSourceFileWriter.updateVariableStatement(
      TEMPLATE_CONFIG_VARIABLE_NAME,
      stringifiedConfig,
      TEMPLATE_CONFIG_VARIABLE_TYPE
    );

    this.pagesJsWriter.addTemplateParameter(componentFunction);
    this.pagesJsWriter.addPagesJsImports([
      TEMPLATE_CONFIG_VARIABLE_TYPE,
      PAGESJS_TEMPLATE_PROPS_TYPE,
    ]);
  }
}
