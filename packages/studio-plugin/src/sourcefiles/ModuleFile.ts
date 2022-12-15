import StudioSourceFile from "./StudioSourceFile";
import path from "path";
import { ModuleMetadata } from "../types/ModuleMetadata";
import { FileMetadataKind } from "../types/FileMetadata";
import { getFileMetadata } from "../getFileMetadata";
import FileMetadataParser from "../parsers/FileMetadataParser";
import { Project } from "ts-morph";
import ReactComponentFileWriter from "../writers/ReactComponentFileWriter";

/**
 * ModuleFile is responsible for parsing a single module file, for example
 * `src/modules/Card.tsx`.
 */
export default class ModuleFile {
  private studioSourceFile: StudioSourceFile;
  private componentName: string;
  private fileMetadataParser: FileMetadataParser;
  private reactComponentFileWriter: ReactComponentFileWriter;

  constructor(filepath: string, project?: Project) {
    this.studioSourceFile = new StudioSourceFile(filepath, project);
    this.componentName = this.getComponentName();
    this.fileMetadataParser = new FileMetadataParser(
      this.componentName,
      this.studioSourceFile
    );
    this.reactComponentFileWriter = new ReactComponentFileWriter(
      this.componentName,
      this.studioSourceFile
    );
  }

  private getComponentName(): string {
    return path.basename(this.studioSourceFile.getFilepath(), ".tsx");
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

  /**
   * Update module file by mutating the source file based on
   * the module's updated moduleMetadata.
   *
   * @param moduleMetadata - the updated moduleMetadata for module file
   */
  updateModuleFile(moduleMetadata: ModuleMetadata): void {
    this.reactComponentFileWriter.updateFile({
      componentTree: moduleMetadata.componentTree,
      fileMetadata: moduleMetadata,
    });
  }
}
