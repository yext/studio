import { ArrowFunction, FunctionDeclaration, Project } from "ts-morph";
import { PageState } from "../types";
import StreamConfigWriter from "../writers/StreamConfigWriter";
import ReactComponentFileWriter, {
  GetFileMetadataByUUID,
} from "../writers/ReactComponentFileWriter";
import path from "path";
import StudioSourceFileParser from "../parsers/StudioSourceFileParser";
import StudioSourceFileWriter from "../writers/StudioSourceFileWriter";
import ComponentTreeParser, {
  GetFileMetadata,
} from "../parsers/ComponentTreeParser";
import { PluginComponentData } from "../ParsingOrchestrator";
import GetPathWriter from "../writers/GetPathWriter";
import GetPathParser from "../parsers/GetPathParser";

/**
 * Configuration options to the page file's update process
 */
interface UpdatePageFileOptions {
  /** Whether to update stream config specified in the "config" variable in the page file. */
  updateStreamConfig?: boolean;
}

/**
 * PageFile is responsible for parsing and updating a single
 * page file, for example `src/templates/index.tsx`.
 */
export default class PageFile {
  private studioSourceFileParser: StudioSourceFileParser;
  private getPathParser: GetPathParser;
  private getPathWriter: GetPathWriter;
  private streamConfigWriter: StreamConfigWriter;
  private reactComponentFileWriter: ReactComponentFileWriter;
  private componentTreeParser: ComponentTreeParser;
  private pluginFilepathToComponentName?: Record<string, string>;

  constructor(
    filepath: string,
    getFileMetadata: GetFileMetadata,
    getFileMetadataByUUID: GetFileMetadataByUUID,
    project: Project,
    filepathToPluginNames: Record<string, PluginComponentData> = {},
    private entityFiles?: string[]
  ) {
    this.studioSourceFileParser = new StudioSourceFileParser(filepath, project);
    const pageComponentName = path.basename(
      this.studioSourceFileParser.getFilepath(),
      ".tsx"
    );
    const studioSourceFileWriter = new StudioSourceFileWriter(
      filepath,
      project
    );
    this.getPathParser = new GetPathParser(this.studioSourceFileParser);
    this.getPathWriter = new GetPathWriter(
      studioSourceFileWriter,
      this.studioSourceFileParser
    );
    this.streamConfigWriter = new StreamConfigWriter(
      studioSourceFileWriter,
      this.studioSourceFileParser
    );
    this.reactComponentFileWriter = new ReactComponentFileWriter(
      pageComponentName,
      studioSourceFileWriter,
      this.studioSourceFileParser,
      getFileMetadataByUUID
    );
    this.componentTreeParser = new ComponentTreeParser(
      this.studioSourceFileParser,
      getFileMetadata
    );
    this.pluginFilepathToComponentName = Object.keys(
      filepathToPluginNames
    ).reduce((filepathToComponent, filepath) => {
      filepathToComponent[filepath] =
        filepathToPluginNames[filepath].componentName;
      return filepathToComponent;
    }, {});
  }

  getPageState(isPagesJSRepo = false): PageState {
    const componentTree = this.componentTreeParser.parseComponentTree({
      ...this.studioSourceFileParser.getAbsPathDefaultImports(),
      ...this.pluginFilepathToComponentName,
    });
    const cssImports = this.studioSourceFileParser.parseCssImports();
    const filepath = this.studioSourceFileParser.getFilepath();
    const getPathValue =
      isPagesJSRepo && this.getPathParser.parseGetPathValue();
    return {
      componentTree,
      cssImports,
      filepath,
      ...((getPathValue || this.entityFiles) && {
        pagesJS: {
          ...(this.entityFiles && { entityFiles: this.entityFiles }),
          ...(getPathValue && { getPathValue }),
        },
      }),
    };
  }

  /**
   * Update page file by mutating the source file based on the page's updated state.
   * Additionally, if updateStreamConfig option is set to true, the "config" variable
   * in the source file will also be mutated to update the stream configuration.
   *
   * @param updatedPageState - the updated state for the page file
   * @param options - configuration to the source file's update process
   */
  updatePageFile(
    updatedPageState: PageState,
    options: UpdatePageFileOptions = {}
  ): void {
    const onFileUpdate = (
      pageComponent: FunctionDeclaration | ArrowFunction
    ) => {
      const getPathValue = updatedPageState.pagesJS?.getPathValue;
      if (getPathValue) {
        this.getPathWriter.updateGetPath(getPathValue);
      }
      if (options.updateStreamConfig) {
        const hasStreamConfig = this.streamConfigWriter.updateStreamConfig(
          updatedPageState.componentTree
        );
        if (hasStreamConfig) {
          this.streamConfigWriter.addStreamParameter(pageComponent);
          this.streamConfigWriter.addStreamImport();
        }
      }
    };

    this.reactComponentFileWriter.updateFile({
      componentTree: updatedPageState.componentTree,
      cssImports: updatedPageState.cssImports,
      onFileUpdate,
    });
  }
}
