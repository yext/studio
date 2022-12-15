import StudioSourceFile from "./StudioSourceFile";
import path from "path";
import { ModuleMetadata } from "../types/ModuleMetadata";
import { FileMetadata, FileMetadataKind } from "../types/FileMetadata";
import FileMetadataParser from "./FileMetadataParser";
import { Project } from "ts-morph";

/**
 * ModuleFile is responsible for parsing a single module file, for example
 * `src/modules/Card.tsx`.
 */
export default class ModuleFile {
  private studioSourceFile: StudioSourceFile;
  private componentName: string;
  private fileMetadataParser: FileMetadataParser;

  constructor(private filepath: string, getFileMetadata: (filepath: string) => FileMetadata, project: Project) {
    this.componentName = path.basename(filepath, ".tsx");
    this.studioSourceFile = new StudioSourceFile(filepath, getFileMetadata, project);
    this.fileMetadataParser = new FileMetadataParser(
      this.componentName,
      this.studioSourceFile
    );
  }

  getModuleMetadata(): ModuleMetadata {
    const defaultImports = this.studioSourceFile.getAbsPathDefaultImports();
    const componentTree = this.studioSourceFile.parseComponentTree(defaultImports);

    return {
      kind: FileMetadataKind.Module,
      componentTree,
      ...this.fileMetadataParser.parse(),
      filepath: this.filepath
    };
  }
}
