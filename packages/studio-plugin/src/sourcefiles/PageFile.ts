import StudioSourceFile from "./StudioSourceFile";
import { getFileMetadata } from "../getFileMetadata";
import { ArrowFunction, FunctionDeclaration, Project } from "ts-morph";
import {
  PageState,
} from "../types";
import StreamConfigWriter from "../writers/StreamConfigWriter";
import ReactComponentFileWriter from "../writers/ReactComponentFileWriter";
import path from "path";

/**
 * Configuration options to the page file's update process
 */
interface UpdatePageFileOptions {
  /** Whether to update stream config specified in the "config" variable in the page file. */
  updateStreamConfig?: boolean;
}

/**
 * PageFile is responsible for parsing a single page file, for example
 * `src/templates/index.tsx`.
 */
export default class PageFile {
  private studioSourceFile: StudioSourceFile;
  private streamConfigWriter: StreamConfigWriter;
  private reactComponentFileWriter: ReactComponentFileWriter;

  constructor(filepath: string, project?: Project) {
    this.studioSourceFile = new StudioSourceFile(filepath, project);
    this.streamConfigWriter = new StreamConfigWriter(this.studioSourceFile);
    this.reactComponentFileWriter = new ReactComponentFileWriter(
      path.basename(this.studioSourceFile.getFilepath(), ".tsx"),
      this.studioSourceFile
    );
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

  /**
   * Update page file by mutating the imports and return statement of the page's
   * React component in the source file based on the page's updated state.
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
    const onFileUpdate = (pageComponent: FunctionDeclaration | ArrowFunction) => {
      if (options.updateStreamConfig) {
        this.streamConfigWriter.updateStreamConfig(
          updatedPageState.componentTree
        );
        this.streamConfigWriter.addStreamParameter(pageComponent);
        this.streamConfigWriter.addStreamImport();
      }
    }

    this.reactComponentFileWriter.updateFile({
      componentTree: updatedPageState.componentTree,
      cssImports: updatedPageState.cssImports,
      onFileUpdate
    })
  }
}
