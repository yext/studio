import { TemplateConfig } from "@yext/pages";
import { ArrowFunction, FunctionDeclaration } from "ts-morph";
import {
  PAGESJS_TEMPLATE_PROPS_TYPE,
  TEMPLATE_STRING_EXPRESSION_REGEX,
} from "../constants";
import TypeGuards from "../utils/TypeGuards";
import StudioSourceFileParser from "../parsers/StudioSourceFileParser";
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
import { GetPathVal } from "../types";

const STREAM_CONFIG_VARIABLE_NAME = "config";
const STREAM_CONFIG_VARIABLE_TYPE = "TemplateConfig";

/**
 * StreamConfigWriter is a class for housing data
 * updating logic for Stream config in PageFile.
 */
export default class StreamConfigWriter {
  private pagesJsWriter: PagesJsWriter;

  constructor(
    private studioSourceFileWriter: StudioSourceFileWriter,
    private studioSourceFileParser: StudioSourceFileParser
  ) {
    this.pagesJsWriter = new PagesJsWriter(studioSourceFileWriter);
  }

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
   * Creates a Pages template config by merging current stream config, if defined,
   * with a new stream configuration used by the constructed page from Studio.
   * If there is no current stream config and there are no used document paths
   * found, then it returns undefined.
   *
   * @param componentTree - the states of the page's component tree
   * @param currentTemplateConfig - template config defined in page file
   * @returns a template config with updated Stream configuration
   */
  private getUpdatedTemplateConfig(
    componentTree: ComponentState[],
    getPathValue?: GetPathVal,
    currentTemplateConfig?: TemplateConfig
  ): TemplateConfig | undefined {
    const usedDocumentPaths = this.getUsedStreamDocumentPaths(
      componentTree,
      getPathValue
    );
    if (!currentTemplateConfig && usedDocumentPaths.size === 0) {
      return undefined;
    }

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
        filter: {},
        localization: {
          locales: ["en"],
          primary: false,
        },
        ...currentTemplateConfig?.stream,
        fields: pagesJSFieldsMerger(currentFields, newFields),
      },
    };
  }

  /**
   * Updates the stream configuration by mutating the current template config
   * or adding a template config definition to the original sourceFile if any
   * document paths are used in the component tree.
   *
   * @param componentTree - the states of the page's component tree
   * @returns Whether or not a stream config was written to the sourceFile
   */
  updateStreamConfig(
    componentTree: ComponentState[],
    getPathValue?: GetPathVal
  ): boolean {
    const streamObjectLiteralExp =
      this.studioSourceFileParser.getExportedObjectExpression(
        STREAM_CONFIG_VARIABLE_NAME
      );
    const currentTemplateConfig =
      streamObjectLiteralExp &&
      this.studioSourceFileParser.getCompiledObjectLiteral<TemplateConfig>(
        streamObjectLiteralExp
      );
    const updatedTemplateConfig = this.getUpdatedTemplateConfig(
      componentTree,
      getPathValue,
      currentTemplateConfig
    );

    if (updatedTemplateConfig) {
      const stringifiedConfig = JSON.stringify(updatedTemplateConfig);
      this.studioSourceFileWriter.updateVariableStatement(
        STREAM_CONFIG_VARIABLE_NAME,
        stringifiedConfig,
        STREAM_CONFIG_VARIABLE_TYPE
      );
      return true;
    }
    return false;
  }

  addStreamImport(): void {
    this.pagesJsWriter.addPagesJsImports([
      STREAM_CONFIG_VARIABLE_TYPE,
      PAGESJS_TEMPLATE_PROPS_TYPE,
    ]);
  }

  addStreamParameter(componentFunction: FunctionDeclaration | ArrowFunction) {
    this.pagesJsWriter.addTemplateParameter(componentFunction);
  }
}
