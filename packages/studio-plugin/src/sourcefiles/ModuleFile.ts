import path from "path";
import { ModuleMetadata } from "../types/ModuleMetadata";
import { FileMetadataKind } from "../types/FileMetadata";
import FileMetadataParser from "../parsers/FileMetadataParser";
import { Project } from "ts-morph";
import ReactComponentFileWriter from "../writers/ReactComponentFileWriter";
import StudioSourceFileParser from "../parsers/StudioSourceFileParser";
import StudioSourceFileWriter from "../writers/StudioSourceFileWriter";
import ComponentTreeParser, { GetFileMetadata } from '../parsers/ComponentTreeParser';

/**
 * ModuleFile is responsible for parsing a single module file, for example
 * `src/modules/Card.tsx`.
 */
export default class ModuleFile {
  private studioSourceFileParser: StudioSourceFileParser;
  private componentName: string;
  private fileMetadataParser: FileMetadataParser;
  private reactComponentFileWriter: ReactComponentFileWriter;
  private componentTreeParser: ComponentTreeParser;

  constructor(filepath: string, getFileMetadata: GetFileMetadata, project: Project) {
    this.studioSourceFileParser = new StudioSourceFileParser(filepath, project);
    this.componentName = this.getComponentName();
    this.fileMetadataParser = new FileMetadataParser(
      this.componentName,
      this.studioSourceFileParser
    );
    this.reactComponentFileWriter = new ReactComponentFileWriter(
      this.componentName,
      new StudioSourceFileWriter(filepath, project),
      this.studioSourceFileParser,
    );
    this.componentTreeParser = new ComponentTreeParser(this.studioSourceFileParser, getFileMetadata);
  }

  private getComponentName(): string {
    return path.basename(this.studioSourceFileParser.getFilepath(), ".tsx");
  }

  getModuleMetadata(): ModuleMetadata {
    const absPathDefaultImports =
      this.studioSourceFileParser.getAbsPathDefaultImports();
    const componentTree = this.componentTreeParser.parseComponentTree(absPathDefaultImports);

    return {
      kind: FileMetadataKind.Module,
      componentTree,
      ...this.fileMetadataParser.parse(),
      filepath: this.studioSourceFileParser.getFilepath()
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
