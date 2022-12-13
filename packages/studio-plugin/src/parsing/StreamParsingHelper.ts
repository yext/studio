import { TemplateConfig } from "@yext/pages"
import { v4 } from "uuid"
import { PAGES_PACKAGE_NAME } from "../constants"
import { ComponentState, ComponentStateKind, PropValueKind } from "../types"
import StudioSourceFile from "./StudioSourceFile"
import TypeGuards from "./TypeGuards"

/**
 * Describes the path in the streams document to the desired data. Bracket
 * notation for property access is not supported, except for indexing an array.
 */
export type StreamsDataExpression = `document.${string}`

/**
 * These are stream properties that will throw an error if specified within
 * a "Stream.fields", with the exception of `id` (at the time of writing),
 * and should always be present in localData even if not specifically asked for.
 */
const NON_CONFIGURABLE_STREAM_PROPERTIES = [
  '__',
  'businessId',
  'id',
  'key',
  'locale',
  'meta',
  'siteDomain',
  'siteId',
  'siteInternalHostName',
  'uid'
]

const STREAM_CONFIG_VARIABLE_NAME = "config";
const STREAM_CONFIG_VARIABLE_TYPE = "TemplateConfig";

/**
 * StreamParsingHelpers is a class for housing data parsing
 * logic for Stream within Studio.
 */
export default class StreamParsingHelper {

  constructor(private studioSourceFile: StudioSourceFile) {}
  
  isStreamsDataExpression(value: unknown): value is StreamsDataExpression {
    return typeof value === 'string' && value.startsWith('document.')
  }

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
    const TEMPLATE_STRING_EXPRESSION_REGEX = /\${(.*?)}/g
    const streamDataExpressions = new Set<StreamsDataExpression>()
    componentTree.forEach((component) => {
      if (component.kind === ComponentStateKind.Fragment) {
        return
      }
      Object.keys(component.props).forEach(propName => {
        const { value, kind } = component.props[propName]
        if (kind !== PropValueKind.Expression) {
          return
        }
        if (TypeGuards.isTemplateString(value)) {
          [...value.matchAll(TEMPLATE_STRING_EXPRESSION_REGEX)].forEach(m => {
            if (this.isStreamsDataExpression(m[1])) {
              streamDataExpressions.add(m[1])
            }
          })
        } else if (this.isStreamsDataExpression(value)) {
          streamDataExpressions.add(value)
        }
      })
    })
    return streamDataExpressions
  }

  /**
   * Creates a Pages template config by merging current stream config, if defined,
   * with a new stream configuration used by the constructed page from Studio.
   *
   * @param componentTree - the states of the page's component tree
   * @param currentTemplateConfig - template config defined in page file
   * @returns a template config with updated Stream configuration
   */
  private getUpdatedTemplateConfig(
    componentTree: ComponentState[],
    currentTemplateConfig?: TemplateConfig
    ): TemplateConfig {
    const usedDocumentPaths = this.getUsedStreamDocumentPaths(componentTree)
    const fields = [...usedDocumentPaths]
      // Stream config's fields do not allow specifying an index of a field.
      .map(documentPath => documentPath.split('document.')[1].split('[')[0])
      .filter(documentPath => !NON_CONFIGURABLE_STREAM_PROPERTIES.includes(documentPath))
    return {
      ...currentTemplateConfig,
      stream: {
        $id: 'studio-stream-id_' + v4(),
        filter: {},
        localization: {
          locales: ['en'],
          primary: false,
        },
        ...currentTemplateConfig?.stream,
        fields
      }
    }
  }

  /**
   * Updates the stream configuration by mutating the current template config
   * or adding a template config definition to the original sourceFile.
   *
   * @param componentTree - the states of the page's component tree
   */
  updateStreamConfig(componentTree: ComponentState[]): void {
    const streamObjectLiteralExp = this.studioSourceFile.getExportedObjectExpression(STREAM_CONFIG_VARIABLE_NAME);
    const currentTemplateConfig = streamObjectLiteralExp && this.studioSourceFile.getCompiledObjectLiteral<TemplateConfig>(streamObjectLiteralExp)
    const updatedTemplateConfig = this.getUpdatedTemplateConfig(componentTree, currentTemplateConfig)

    const stringifiedConfig = JSON.stringify(updatedTemplateConfig)
    if (streamObjectLiteralExp) {
      streamObjectLiteralExp.replaceWithText(stringifiedConfig)
    } else {
      this.studioSourceFile.addVariableStatement(STREAM_CONFIG_VARIABLE_NAME, stringifiedConfig, STREAM_CONFIG_VARIABLE_TYPE)
    }
  }

  addStreamImport(studioSourceFile: StudioSourceFile): void {
    studioSourceFile.addFileImport({
      source: PAGES_PACKAGE_NAME,
      namedImports: [STREAM_CONFIG_VARIABLE_TYPE]
    })
  }
}