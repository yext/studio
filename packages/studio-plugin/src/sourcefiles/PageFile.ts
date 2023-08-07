import { ArrowFunction, FunctionDeclaration, Project } from "ts-morph";
import { Result } from "true-myth";
import { PageState } from "../types";
import TemplateConfigWriter from "../writers/TemplateConfigWriter";
import ReactComponentFileWriter from "../writers/ReactComponentFileWriter";
import upath from "upath";
import StudioSourceFileParser from "../parsers/StudioSourceFileParser";
import StudioSourceFileWriter from "../writers/StudioSourceFileWriter";
import ComponentTreeParser, {
  GetFileMetadata,
} from "../parsers/ComponentTreeParser";
import GetPathWriter from "../writers/GetPathWriter";
import PagesJsStateParser from "../parsers/PagesJsStateParser";
import { ParsingError, ParsingErrorKind } from "../errors/ParsingError";
import tryUsingResult from "../errors/tryUsingResult";
import GetPathParser from "../parsers/GetPathParser";
import TemplateConfigParser from "../parsers/TemplateConfigParser";
import PagesJsWriter from "../writers/PagesJsWriter";

/**
 * PageFile is responsible for parsing and updating a single
 * page file, for example `src/templates/index.tsx`.
 */
export default class PageFile {
  private studioSourceFileParser: StudioSourceFileParser;
  private pagesJsStateParser: PagesJsStateParser;
  private getPathWriter: GetPathWriter;
  private templateConfigWriter: TemplateConfigWriter;
  private reactComponentFileWriter: ReactComponentFileWriter;
  private componentTreeParser: ComponentTreeParser;

  constructor(
    filepath: string,
    getFileMetadata: GetFileMetadata,
    project: Project,
    private isPagesJSRepo: boolean,
    entityFiles?: string[]
  ) {
    this.studioSourceFileParser = new StudioSourceFileParser(filepath, project);
    const pageComponentName = upath.basename(
      this.studioSourceFileParser.getFilepath(),
      ".tsx"
    );
    const studioSourceFileWriter = new StudioSourceFileWriter(
      filepath,
      project
    );
    const getPathParser = new GetPathParser(this.studioSourceFileParser);
    const templateConfigParser = new TemplateConfigParser(
      this.studioSourceFileParser
    );
    const pagesJsWriter = new PagesJsWriter(studioSourceFileWriter);

    this.pagesJsStateParser = new PagesJsStateParser(
      getPathParser,
      templateConfigParser,
      entityFiles
    );
    this.getPathWriter = new GetPathWriter(
      studioSourceFileWriter,
      getPathParser,
      pagesJsWriter
    );
    this.templateConfigWriter = new TemplateConfigWriter(
      studioSourceFileWriter,
      templateConfigParser,
      pagesJsWriter,
      pageComponentName
    );
    this.reactComponentFileWriter = new ReactComponentFileWriter(
      pageComponentName,
      studioSourceFileWriter,
      this.studioSourceFileParser
    );
    this.componentTreeParser = new ComponentTreeParser(
      this.studioSourceFileParser,
      getFileMetadata
    );
  }

  getPageState(): Result<PageState, ParsingError> {
    return tryUsingResult(
      ParsingErrorKind.FailedToParsePageState,
      `Failed to parse PageState for "${this.studioSourceFileParser.getFilepath()}"`,
      this._getPageState
    );
  }

  private _getPageState = (): PageState => {
    this.studioSourceFileParser.checkForSyntaxErrors();
    const componentTree = this.componentTreeParser.parseComponentTree({
      ...this.studioSourceFileParser.getAbsPathDefaultImports(),
    });
    const cssImports = this.studioSourceFileParser.parseCssImports();
    const filepath = this.studioSourceFileParser.getFilepath();

    return {
      componentTree,
      cssImports,
      filepath,
      ...(this.isPagesJSRepo && {
        pagesJS: this.pagesJsStateParser.getPagesJsState(),
      }),
    };
  };

  /**
   * Update page file by mutating the source file based on the page's updated
   * state. Additionally, for an entity page, the "config" variable in the
   * source file will be mutated to update the template configuration.
   *
   * @param updatedPageState - the updated state for the page file
   */
  updatePageFile(updatedPageState: PageState): void {
    const onFileUpdate = (
      pageComponent: FunctionDeclaration | ArrowFunction
    ) => {
      const getPathValue = updatedPageState.pagesJS?.getPathValue;
      if (getPathValue) {
        this.getPathWriter.updateGetPath(getPathValue);
      }
      if (
        this.templateConfigWriter.isEntityPageState(updatedPageState.pagesJS)
      ) {
        this.templateConfigWriter.updateTemplateConfig(
          updatedPageState.componentTree,
          updatedPageState.pagesJS,
          pageComponent
        );
      }
    };

    this.reactComponentFileWriter.updateFile({
      componentTree: updatedPageState.componentTree,
      cssImports: updatedPageState.cssImports,
      onFileUpdate,
    });
  }
}
