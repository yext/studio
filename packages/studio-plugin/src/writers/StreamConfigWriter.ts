import { TemplateConfig } from "@yext/pages";
import { ArrowFunction, FunctionDeclaration } from "ts-morph";
import {
  PAGESJS_TEMPLATE_PROPS_TYPE,
  PAGES_PACKAGE_NAME,
  TEMPLATE_STRING_EXPRESSION_REGEX,
} from "../constants";
import TypeGuards from "../utils/TypeGuards";
import StudioSourceFileParser from "../parsers/StudioSourceFileParser";
import {
  PropValueKind,
  PropValues,
  TypelessPropVal,
} from "../types/PropValues";
import { ComponentState, ComponentStateKind } from "../types/ComponentState";
import StudioSourceFileWriter from "./StudioSourceFileWriter";
import { StreamsDataExpression } from "../types/Expression";
import pagesJSFieldsMerger from "../utils/StreamConfigFieldsMerger";

const STREAM_CONFIG_VARIABLE_NAME = "config";
const STREAM_CONFIG_VARIABLE_TYPE = "TemplateConfig";

/**
 * StreamConfigWriter is a class for housing data
 * updating logic for Stream config in PageFile.
 */
export default class StreamConfigWriter {
  constructor(
    private studioSourceFileWriter: StudioSourceFileWriter,
    private studioSourceFileParser: StudioSourceFileParser
  ) {}

  /**
   * Extracts stream's data expressions used in the provided component tree,
   * in the form of `document.${string}`.
   *
   * @param componentsState - the states of the page's component tree
   * @returns a set of stream's data expressions
   */
  private getUsedStreamDocumentPaths(
    componentTree: ComponentState[]
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
    return streamDataExpressions;
  }

  private getPathsFromProps(
    props: PropValues | Record<string, TypelessPropVal>
  ): StreamsDataExpression[] {
    const dataExpressions: StreamsDataExpression[] = [];
    Object.keys(props).forEach((propName) => {
      const { value, kind } = props[propName];
      if (kind !== PropValueKind.Expression) {
        return;
      }
      if (TypeGuards.isTemplateString(value)) {
        [...value.matchAll(TEMPLATE_STRING_EXPRESSION_REGEX)].forEach((m) => {
          if (TypeGuards.isStreamsDataExpression(m[1])) {
            dataExpressions.push(m[1]);
          }
        });
      } else if (TypeGuards.isStreamsDataExpression(value)) {
        dataExpressions.push(value);
      }
    });
    return dataExpressions;
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
    currentTemplateConfig?: TemplateConfig
  ): TemplateConfig | undefined {
    const usedDocumentPaths = this.getUsedStreamDocumentPaths(componentTree);
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
  updateStreamConfig(componentTree: ComponentState[]): boolean {
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
    this.studioSourceFileWriter.addFileImport({
      source: PAGES_PACKAGE_NAME,
      namedImports: [STREAM_CONFIG_VARIABLE_TYPE, PAGESJS_TEMPLATE_PROPS_TYPE],
    });
  }

  addStreamParameter(componentFunction: FunctionDeclaration | ArrowFunction) {
    this.studioSourceFileWriter.updateFunctionParameter(
      componentFunction,
      PAGESJS_TEMPLATE_PROPS_TYPE,
      ["document"]
    );
  }
}
