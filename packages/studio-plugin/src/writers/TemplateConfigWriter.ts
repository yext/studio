import { TemplateConfig } from "@yext/pages";
import { ArrowFunction, FunctionDeclaration } from "ts-morph";
import {
  PAGESJS_TEMPLATE_PROPS_TYPE,
  STREAM_LOCALIZATION,
  TEMPLATE_CONFIG_VARIABLE_NAME,
} from "../constants";
import { ComponentState } from "../types/ComponentState";
import StudioSourceFileWriter from "./StudioSourceFileWriter";
import pagesJSFieldsMerger from "../utils/StreamConfigFieldsMerger";
import PagesJsWriter from "./PagesJsWriter";
import { GetPathVal, PagesJsState } from "../types";
import TemplateConfigParser from "../parsers/TemplateConfigParser";
import { ComponentTreeHelpers } from "../utils";

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
    private pagesJsWriter: PagesJsWriter,
    private pageName: string
  ) {}

  /**
   * Extracts stream's data expressions used in the provided component tree,
   * in the form of `document.${string}`.
   *
   * @param componentTree - the states of the page's component tree
   * @param getPathValue - the return value of the getPath function
   * @returns a set of the stream's data expressions
   */
  private getUsedStreamDocumentPaths(
    componentTree: ComponentState[],
    getPathValue?: GetPathVal
  ): Set<string> {
    const expressions: string[] =
      ComponentTreeHelpers.getComponentTreeExpressions(componentTree);
    if (getPathValue) {
      expressions.push(
        ...ComponentTreeHelpers.getExpressionUsagesFromPropVal(getPathValue)
      );
    }
    const streamDataExpressions: string[] =
      ComponentTreeHelpers.selectExpressionsWithSource(expressions, "document");
    return new Set<string>(streamDataExpressions);
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
        $id: `studio-stream-id-${this.pageName}`,
        localization: STREAM_LOCALIZATION,
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

    this.addParametersAndImports(componentTree, componentFunction);
  }

  private addParametersAndImports(
    componentTree: ComponentState[],
    componentFunction: FunctionDeclaration | ArrowFunction
  ) {
    this.pagesJsWriter.addPagesJsImports([TEMPLATE_CONFIG_VARIABLE_TYPE]);

    const usesDocument = ComponentTreeHelpers.usesExpressionSource(
      componentTree,
      "document"
    );
    if (usesDocument) {
      this.pagesJsWriter.addTemplateParameter(componentFunction);
      this.pagesJsWriter.addPagesJsImports([PAGESJS_TEMPLATE_PROPS_TYPE]);
    }
  }

  isEntityPageState(
    pagesJsState: PagesJsState | undefined
  ): pagesJsState is EntityPageState {
    return !!pagesJsState?.streamScope;
  }
}
