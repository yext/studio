import {
  ArrowFunction,
  FunctionDeclaration,
  SyntaxKind,
  VariableDeclaration,
  WriterFunction,
  Writers,
} from "ts-morph";
import StudioSourceFileParser from "../parsers/StudioSourceFileParser";
import {
  ComponentState,
  ComponentStateKind,
  FileMetadata,
  PropShape,
  PropValueKind,
  PropValues,
  PropValueType,
} from "../types";
import StudioSourceFileWriter from "./StudioSourceFileWriter";
import ComponentTreeHelpers from "../utils/ComponentTreeHelpers";
import { transformPropValuesToRaw } from "../utils";
import ParsingOrchestrator from "../ParsingOrchestrator";
import { TypeGuards } from "../utils";

export type GetFileMetadataByUUID =
  ParsingOrchestrator["getFileMetadataByUUID"];

/**
 * ReactComponentFileWriter is a class for housing data
 * updating logic for a React component file (e.g. ModuleFile or PageFile).
 */
export default class ReactComponentFileWriter {
  constructor(
    private componentName: string,
    private studioSourceFileWriter: StudioSourceFileWriter,
    private studioSourceFileParser: StudioSourceFileParser,
    private getFileMetadataByUUID: GetFileMetadataByUUID
  ) {}

  private createComponentFunction(): FunctionDeclaration {
    const functionDeclaration =
      this.studioSourceFileWriter.createDefaultFunction(this.componentName);
    functionDeclaration.addStatements([Writers.returnStatement("<></>")]);
    return functionDeclaration;
  }

  private createProps(props: PropValues): string {
    let propsString = "";
    Object.keys(props).forEach((propName) => {
      const { kind, valueType: propType, value } = props[propName];

      if (
        kind === PropValueKind.Literal &&
        (propType === PropValueType.string ||
          propType === PropValueType.HexColor)
      ) {
        propsString += `${propName}='${value}' `;
      } else if (propType === PropValueType.Object) {
        propsString += `${propName}={${JSON.stringify(
          transformPropValuesToRaw(value)
        )}}`;
      } else {
        propsString += `${propName}={${value}} `;
      }
    });
    return propsString;
  }

  private createReturnStatement(
    componentTree: ComponentState[]
  ): WriterFunction {
    const elements = ComponentTreeHelpers.mapComponentTree<string>(
      componentTree,
      (c, children): string => {
        if (c.kind === ComponentStateKind.Fragment) {
          return "<>\n" + children.join("\n") + "</>";
        } else if (children.length === 0) {
          return `<${c.componentName} ` + this.createProps(c.props) + "/>";
        } else {
          return (
            `<${c.componentName} ` +
            this.createProps(c.props) +
            ">\n" +
            children.join("\n") +
            `</${c.componentName}>`
          );
        }
      }
    );
    const joinedElements = elements.join("\n");
    const wrappedElements =
      elements.length > 1 ? `<>${joinedElements}</>` : joinedElements;
    return Writers.returnStatement(wrappedElements);
  }

  private updateReturnStatement(
    functionComponent: FunctionDeclaration | ArrowFunction,
    componentTree: ComponentState[]
  ) {
    const returnStatementIndex = functionComponent
      .getDescendantStatements()
      .findIndex((n) => n.isKind(SyntaxKind.ReturnStatement));
    if (returnStatementIndex >= 0) {
      functionComponent.removeStatement(returnStatementIndex);
    }
    if (componentTree.length > 0) {
      const newReturnStatement = this.createReturnStatement(componentTree);
      functionComponent.addStatements(newReturnStatement);
    }
  }

  private updatePropInterface(propShape: PropShape) {
    const getTypeString = (valueType: PropValueType) =>
      valueType === PropValueType.Record ? "Record<string, any>" : valueType;
    const interfaceName = `${this.componentName}Props`;
    const properties = Object.entries(propShape).map(([key, value]) => ({
      name: key,
      type: getTypeString(value.type),
      hasQuestionToken: !value.required,
      ...(value.doc && { docs: [value.doc] }),
    }));
    this.studioSourceFileWriter.updateInterface(interfaceName, properties);
  }

  private updateInitialProps(initialProps: PropValues) {
    this.studioSourceFileWriter.updateVariableStatement(
      "initialProps",
      this.studioSourceFileWriter.createPropsObjectLiteralWriter(initialProps),
      `${this.componentName}Props`
    );
  }

  /**
   * Update a React component file, which include:
   * - file imports
   * - const variable "initialProps"
   * - component's prop interface `${componentName}Props`
   * - component's parameter and return statement
   */
  updateFile({
    componentTree,
    fileMetadata,
    cssImports,
    onFileUpdate,
    defaultImports,
    propArgs,
  }: {
    componentTree: ComponentState[];
    fileMetadata?: FileMetadata;
    cssImports?: string[];
    onFileUpdate?: (
      functionComponent: FunctionDeclaration | ArrowFunction
    ) => void;
    defaultImports?: { name: string; moduleSpecifier: string }[];
    propArgs?: string[] | null;
  }): void {
    let defaultExport: VariableDeclaration | FunctionDeclaration;
    try {
      defaultExport =
        this.studioSourceFileParser.getDefaultExportReactComponent();
    } catch (e: unknown) {
      if (
        /^Error getting default export: No declaration node found/.test(
          (e as Error).message
        )
      ) {
        defaultExport = this.createComponentFunction();
      } else {
        throw e;
      }
    }
    const functionComponent = defaultExport.isKind(
      SyntaxKind.VariableDeclaration
    )
      ? defaultExport.getFirstDescendantByKindOrThrow(SyntaxKind.ArrowFunction)
      : defaultExport;

    onFileUpdate?.(functionComponent);
    if (fileMetadata) {
      const { initialProps, propShape } = fileMetadata;
      if (initialProps) {
        this.updateInitialProps(initialProps);
      }
      if (propShape && Object.keys(propShape).length !== 0) {
        this.updatePropInterface(propShape);
        this.studioSourceFileWriter.updateFunctionParameter(
          functionComponent,
          `${this.componentName}Props`,
          propArgs
        );
      }
    }

    this.updateReturnStatement(functionComponent, componentTree);
    const pluginNameToComponentNames =
      this.getPluginNameToComponentNames(componentTree);
    this.studioSourceFileWriter.updateFileImports(
      pluginNameToComponentNames,
      cssImports,
      defaultImports
    );
    this.studioSourceFileWriter.writeToFile();
  }

  /**
   * Identify and sort components of named imports by their node module.
   * It is assumed that any component with a `pluginName` is a plugin.
   */
  getPluginNameToComponentNames(
    componentTree: ComponentState[]
  ): Record<string, string[]> {
    const pluginNameToComponentNames: Record<string, string[]> = {};

    componentTree
      .filter(TypeGuards.isStandardOrModuleComponentState)
      .forEach((node) => {
        const metadata = this.getFileMetadataByUUID(node.metadataUUID);
        if (metadata && "pluginName" in metadata && metadata.pluginName) {
          if (pluginNameToComponentNames.hasOwnProperty(metadata.pluginName)) {
            pluginNameToComponentNames[metadata.pluginName].push(
              node.componentName
            );
          } else {
            pluginNameToComponentNames[metadata.pluginName] = [
              node.componentName,
            ];
          }
        }
      });

    return pluginNameToComponentNames;
  }
}
