import StudioSourceFile from "./StudioSourceFile";
import path from "path";
import { ModuleMetadata } from "../types/ModuleMetadata";
import { FileMetadataKind } from "../types/FileMetadata";
import { getFileMetadata } from "../getFileMetadata";
import FileMetadataParser from "./FileMetadataParser";
import { Project } from "ts-morph";
import ReactComponentFileWriter from "./ReactComponentFileWriter";

/**
 * ModuleFile is responsible for parsing a single module file, for example
 * `src/modules/Card.tsx`.
 */
export default class ModuleFile {
  private studioSourceFile: StudioSourceFile;
  private componentName: string;
  private fileMetadataParser: FileMetadataParser;
  private reactComponentFileWriter: ReactComponentFileWriter

  constructor(filepath: string, project?: Project) {
    this.componentName = path.basename(filepath, ".tsx");
    this.studioSourceFile = new StudioSourceFile(filepath, project);
    this.fileMetadataParser = new FileMetadataParser(
      this.componentName,
      this.studioSourceFile
    );
    this.reactComponentFileWriter = new ReactComponentFileWriter(
      this.componentName,
      this.studioSourceFile
      );
  }

  getModuleMetadata(): ModuleMetadata {
    const absPathDefaultImports =
      this.studioSourceFile.getAbsPathDefaultImports();
    const componentTree = this.studioSourceFile.parseComponentTree(
      absPathDefaultImports,
      getFileMetadata
    );

    return {
      kind: FileMetadataKind.Module,
      componentTree,
      ...this.fileMetadataParser.parse(),
    };
  }

  updateModuleFile(moduleMetadata: ModuleMetadata): void {
    this.reactComponentFileWriter.updateFile({
      componentTree: moduleMetadata.componentTree,
      fileMetadata: moduleMetadata,
    })
  }
}
