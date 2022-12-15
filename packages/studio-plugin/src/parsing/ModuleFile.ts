import StudioSourceFile from "./StudioSourceFile";
import path from "path";
import { ModuleMetadata } from "../types/ModuleMetadata";
import { FileMetadataKind } from "../types/FileMetadata";
import FileMetadataParser from "./FileMetadataParser";
import { Project } from "ts-morph";
import ComponentTreeParser, { GetFileMetadata } from "./ComponentTreeParser";

/**
 * ModuleFile is responsible for parsing a single module file, for example
 * `src/modules/Card.tsx`.
 */
export default class ModuleFile {
  private studioSourceFile: StudioSourceFile;
  private componentName: string;
  private fileMetadataParser: FileMetadataParser;
  private componentTreeParser: ComponentTreeParser;

  constructor(
    private filepath: string,
    getFileMetadata: GetFileMetadata,
    project: Project
  ) {
    this.componentName = path.basename(filepath, ".tsx");
    this.studioSourceFile = new StudioSourceFile(filepath, project);
    this.fileMetadataParser = new FileMetadataParser(
      this.componentName,
      this.studioSourceFile
    );
    this.componentTreeParser = new ComponentTreeParser(
      this.studioSourceFile,
      getFileMetadata
    );
  }

  getModuleMetadata(): ModuleMetadata {
    const defaultImports = this.studioSourceFile.getAbsPathDefaultImports();
    const componentTree =
      this.componentTreeParser.parseComponentTree(defaultImports);

    return {
      kind: FileMetadataKind.Module,
      componentTree,
      ...this.fileMetadataParser.parse(),
      filepath: this.filepath,
    };
  }
}
