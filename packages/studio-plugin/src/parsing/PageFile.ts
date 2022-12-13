import StudioSourceFile from "./StudioSourceFile";
import { PageState } from "../types/State";
import { getFileMetadata } from "../getFileMetadata";

/**
 * PageFile is responsible for parsing a single page file, for example
 * `src/templates/index.tsx`.
 */
export default class PageFile {
  private studioSourceFile: StudioSourceFile;

  constructor(filepath: string) {
    this.studioSourceFile = new StudioSourceFile(filepath);
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
}
