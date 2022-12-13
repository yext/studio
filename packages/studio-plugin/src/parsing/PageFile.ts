import StudioSourceFile from "./StudioSourceFile";
import { getFileMetadata } from "../getFileMetadata";
import { Project, SyntaxKind } from "ts-morph";
import fs from "fs";
import {
  PropValueKind,
  PropValues,
  PropValueType,
  ComponentState,
  ComponentStateKind,
  PageState,
} from "../types";
import StreamParsingHelper from "./StreamParsingHelper";

/**
 * Configuration options to the page file's update process
 */
interface UpdatePageFileOptions {
  /** Whether to update stream config specified in the "config" variable in the page file. */
  updateStreamConfig?: boolean
}

/**
 * PageFile is responsible for parsing a single page file, for example
 * `src/templates/index.tsx`.
 */
export default class PageFile {
  private studioSourceFile: StudioSourceFile;
  private streamParsingHelper: StreamParsingHelper;

  constructor(private filepath: string, project?: Project) {
    this.studioSourceFile = new StudioSourceFile(filepath, project);
    this.streamParsingHelper = new StreamParsingHelper(this.studioSourceFile)
  }

  getPageState(): PageState {
    const absPathDefaultImports =
      this.studioSourceFile.getAbsPathDefaultImports();
    return {
      componentTree: this.studioSourceFile.parseComponentTree(
        absPathDefaultImports,
        getFileMetadata
      ),
      cssImports: this.studioSourceFile.parseCssImports(),
    };
  }

  private createProps(props: PropValues): string {
    let propsString = "";
    Object.keys(props).forEach((propName) => {
      const propType = props[propName].valueType;
      const val = props[propName].value;
      if (
        props[propName].kind === PropValueKind.Literal &&
        (propType === PropValueType.string ||
          propType === PropValueType.HexColor)
      ) {
        propsString += `${propName}='${val}' `;
      } else {
        propsString += `${propName}={${val}} `;
      }
    });
    return propsString;
  }

  private createReturnStatement(componentTree: ComponentState[]): string {
    const elements = this.studioSourceFile.mapComponentStates<string>(
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
    ).join("\n");
    return `return (${elements})`;
  }

  /**
   * Update page file by mutating the imports and return statement of the page's
   * React component in the source file based on the page's updated state.
   * Additionally, if updateStreamConfig option is set to true, the "config" variable
   * in the source file will also be mutated to update the stream configuration.
   *
   * @param updatedPageState - the updated state for the page file
   * @param options - configuration to the source file's update process
   */
  updatePageFile(updatedPageState: PageState, options: UpdatePageFileOptions = {}): void {
    const defaultExport = this.studioSourceFile.parseDefaultExport();
    const pageComponent = defaultExport.isKind(SyntaxKind.VariableDeclaration)
      ? defaultExport.getFirstDescendantByKindOrThrow(SyntaxKind.ArrowFunction)
      : defaultExport;

    const returnStatementIndex = pageComponent
      .getDescendantStatements()
      .findIndex((n) => n.isKind(SyntaxKind.ReturnStatement));
    if (returnStatementIndex < 0) {
      throw new Error(`No return statement found at page: "${this.filepath}"`);
    }
    const newReturnStatement = this.createReturnStatement(
      updatedPageState.componentTree
    );
    pageComponent.removeStatement(returnStatementIndex);
    pageComponent.addStatements(newReturnStatement);

    if (options.updateStreamConfig) {
      this.streamParsingHelper.updateStreamConfig(updatedPageState.componentTree);
      this.streamParsingHelper.addStreamImport(this.studioSourceFile);
    }
    this.studioSourceFile.updateFileImports(updatedPageState.cssImports);

    const updatedFileText = this.studioSourceFile.prettify();
    fs.writeFileSync(this.filepath, updatedFileText);
  }
}
