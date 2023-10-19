import {
  ArrowFunction,
  FunctionDeclaration,
  JSDocTagStructure,
  JSDocableNodeStructure,
  OptionalKind,
  StructureKind,
  SyntaxKind,
  VariableDeclaration,
  WriterFunction,
  Writers,
} from "ts-morph";
import StudioSourceFileParser from "../parsers/StudioSourceFileParser";
import {
  ComponentState,
  ComponentStateKind,
  ErrorComponentState,
  FileMetadata,
  PropVal,
  PropValueKind,
  PropValues,
  PropValueType,
  StandardComponentState,
} from "../types";
import StudioSourceFileWriter from "./StudioSourceFileWriter";
import ComponentTreeHelpers from "../utils/ComponentTreeHelpers";
import camelCase from "camelcase";
import { CustomTags } from "../parsers/helpers/TypeNodeParsingHelpers";
import getImportSpecifier from "../utils/getImportSpecifier";

/**
 * ReactComponentFileWriter is a class for housing data
 * updating logic for a React component file (i.e. PageFile).
 */
export default class ReactComponentFileWriter {
  constructor(
    private componentName: string,
    private studioSourceFileWriter: StudioSourceFileWriter,
    private studioSourceFileParser: StudioSourceFileParser
  ) {}

  private reactComponentNameSanitizer(name: string) {
    name = camelCase(name, { pascalCase: true });
    const nonAlphaNumeric = /[\W]/g;
    const firstNonLetters = /^[^a-zA-Z]*/;
    name = name.replaceAll(nonAlphaNumeric, "");
    name = name.replace(firstNonLetters, "");
    return name
      ? name[0].toUpperCase() + name.slice(1)
      : "PageDefaultFromInvalidInput";
  }

  private createComponentFunction(): FunctionDeclaration {
    this.componentName = this.reactComponentNameSanitizer(this.componentName);
    const functionDeclaration =
      this.studioSourceFileWriter.createDefaultFunction(this.componentName);
    functionDeclaration.addStatements([Writers.returnStatement("<></>")]);
    return functionDeclaration;
  }

  private createProps(props: PropValues): string {
    let propsString = "";
    Object.keys(props).forEach((propName) => {
      const propVal = props[propName];
      const value = this.parsePropVal(propVal);
      if (value === "") {
        return;
      }
      if (this.shouldUseStringSyntaxForProp(propVal)) {
        propsString += `${propName}=${value} `;
      } else {
        propsString += `${propName}={${value}} `;
      }
    });
    return propsString;
  }

  private parsePropVal = (propVal: PropVal) => {
    const { value, valueType, kind } = propVal;
    if (this.shouldUseStringSyntaxForProp(propVal)) {
      const escapedValueWithDoubleQuotes = JSON.stringify(value);
      return escapedValueWithDoubleQuotes;
    } else if (valueType === PropValueType.Object) {
      const stringifiedObject = Object.keys(value).reduce(
        (stringifiedObject, keyName) => {
          const childPropVal = value[keyName];
          stringifiedObject +=
            JSON.stringify(keyName) +
            ": " +
            this.parsePropVal(childPropVal) +
            ",\n";
          return stringifiedObject;
        },
        ""
      );
      return "{" + stringifiedObject + "}";
    } else if (
      valueType === PropValueType.Array &&
      kind === PropValueKind.Literal
    ) {
      const stringifiedArray = value.map(this.parsePropVal).join(", ");
      return "[" + stringifiedArray + "]";
    } else {
      return value;
    }
  };

  private shouldUseStringSyntaxForProp({ kind, valueType }: PropVal) {
    const isRepresentedAsString =
      valueType === PropValueType.string ||
      valueType === PropValueType.HexColor ||
      valueType === PropValueType.TailwindClass;
    return kind === PropValueKind.Literal && isRepresentedAsString;
  }

  private createJsxSelfClosingElement(
    componentName: string,
    props: PropValues
  ) {
    return `<${componentName} ${this.createProps(props)}/>`;
  }

  private createReturnStatement(
    componentTree: ComponentState[]
  ): WriterFunction {
    const elements = ComponentTreeHelpers.mapComponentTree<string>(
      componentTree,
      (c, children): string => {
        if (c.kind === ComponentStateKind.Error) {
          return c.fullText;
        } else if (c.kind === ComponentStateKind.Fragment) {
          return "<>\n" + children.join("\n") + "</>";
        } else if (children.length === 0) {
          return this.createJsxSelfClosingElement(c.componentName, c.props);
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

  /**
   * Gets the import data for each component in the component tree that is
   * defined in the user's repo (e.g. in `src/components`). Note, for now, we
   * only allow default imports for components.
   */
  private getComponentImports(
    componentTree: ComponentState[],
    UUIDToFileMetadata: Record<string, FileMetadata>
  ): { name: string; moduleSpecifier: string }[] {
    return componentTree
      .filter(
        (c): c is StandardComponentState | ErrorComponentState =>
          c.kind === ComponentStateKind.Standard ||
          c.kind === ComponentStateKind.Error
      )
      .filter((c) => {
        if (UUIDToFileMetadata[c.metadataUUID]) {
          return true;
        }
        console.error(
          `Error adding import in ${this.componentName}: unable to find metadata for ${c.componentName}.`
        );
        return false;
      })
      .map((c) => {
        const moduleSpecifier = getImportSpecifier(
          this.studioSourceFileParser.getFilepath(),
          UUIDToFileMetadata[c.metadataUUID].filepath
        );
        return { name: c.componentName, moduleSpecifier };
      });
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
    UUIDToFileMetadata,
    cssImports,
    onFileUpdate,
  }: {
    componentTree: ComponentState[];
    UUIDToFileMetadata: Record<string, FileMetadata>;
    cssImports?: string[];
    onFileUpdate?: (
      functionComponent: FunctionDeclaration | ArrowFunction
    ) => void;
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
    this.updateReturnStatement(functionComponent, componentTree);
    this.studioSourceFileWriter.updateFileImports(
      {},
      cssImports,
      this.getComponentImports(componentTree, UUIDToFileMetadata)
    );
    this.studioSourceFileWriter.writeToFile();
  }

  reconstructDocs(
    tooltip?: string,
    displayName?: string
  ): JSDocableNodeStructure | undefined {
    if (!tooltip && !displayName) {
      return;
    }

    const tags: OptionalKind<JSDocTagStructure>[] = [];
    if (tooltip) {
      tags.push({ tagName: CustomTags.Tooltip, text: tooltip });
    }

    if (displayName) {
      tags.push({ tagName: CustomTags.DisplayName, text: displayName });
    }
    return {
      docs: [{ tags, kind: StructureKind.JSDoc }],
    };
  }
}
