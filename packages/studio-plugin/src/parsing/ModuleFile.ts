import StudioSourceFile from "./StudioSourceFile";
import path from "path";
import { ModuleMetadata } from "../types/ModuleMetadata";
import { FileMetadataKind } from "../types/FileMetadata";
import { getFileMetadata } from "../getFileMetadata";
import FileMetadataParser from './FileMetadataParser';

/**
 * ModuleFile is responsible for parsing a single module file, for example
 * `src/modules/Card.tsx`.
 */
export default class ModuleFile {
  private studioSourceFile: StudioSourceFile;
  private componentName: string;
  private fileMetadataParser: FileMetadataParser

  constructor(filepath: string) {
    this.componentName = path.basename(filepath, ".tsx");
    this.studioSourceFile = new StudioSourceFile(filepath);
    this.fileMetadataParser = new FileMetadataParser(this.componentName, this.studioSourceFile);
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
      ...this.fileMetadataParser.parse()
    };
  }
}
