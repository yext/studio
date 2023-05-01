import path from "path";
import { ModuleMetadata } from "../types/ModuleMetadata";
import { FileMetadataKind } from "../types/FileMetadata";
import FileMetadataParser from "../parsers/FileMetadataParser";
import { Project } from "ts-morph";
import ReactComponentFileWriter, {
  GetFileMetadataByUUID,
} from "../writers/ReactComponentFileWriter";
import StudioSourceFileParser from "../parsers/StudioSourceFileParser";
import StudioSourceFileWriter from "../writers/StudioSourceFileWriter";
import ComponentTreeParser, {
  GetFileMetadata,
} from "../parsers/ComponentTreeParser";
import getImportSpecifier from "../utils/getImportSpecifier";
import { ComponentState } from "../types";
import { ComponentTreeHelpers } from "../utils";

/**
 * ModuleFile is responsible for parsing and updating a single
 * module file, for example `src/modules/Card.tsx`.
 */
export default class ModuleFile {
  private studioSourceFileParser: StudioSourceFileParser;
  private fileMetadataParser: FileMetadataParser;
  private reactComponentFileWriter: ReactComponentFileWriter;
  private componentTreeParser: ComponentTreeParser;

  constructor(
    filepath: string,
    getFileMetadata: GetFileMetadata,
    getFileMetadataByUUID: GetFileMetadataByUUID,
    project: Project
  ) {
    this.studioSourceFileParser = new StudioSourceFileParser(filepath, project);
    this.fileMetadataParser = new FileMetadataParser(
      this.studioSourceFileParser
    );
    const componentName = path.basename(
      this.studioSourceFileParser.getFilepath(),
      ".tsx"
    );
    this.reactComponentFileWriter = new ReactComponentFileWriter(
      componentName,
      new StudioSourceFileWriter(filepath, project),
      this.studioSourceFileParser,
      getFileMetadataByUUID
    );
    this.componentTreeParser = new ComponentTreeParser(
      this.studioSourceFileParser,
      getFileMetadata
    );
  }

  getModuleMetadata(): ModuleMetadata | undefined {
    const absPathDefaultImports =
      this.studioSourceFileParser.getAbsPathDefaultImports();
    const componentTreeResult = this.componentTreeParser.parseComponentTree(
      absPathDefaultImports
    );
    
    if (componentTreeResult.isOk) {
      return {
        kind: FileMetadataKind.Module,
        componentTree: componentTreeResult.value,
        ...this.fileMetadataParser.parse(),
        filepath: this.studioSourceFileParser.getFilepath(),
      };
    } else {
      console.error(componentTreeResult.error.message);
    }
  }

  /**
   * Update module file by mutating the source file based on
   * the module's updated moduleMetadata.
   *
   * @param moduleMetadata - the updated moduleMetadata for module file
   * @param moduleDependencies - the filepaths of any depended upon modules
   */
  updateModuleFile(
    moduleMetadata: ModuleMetadata,
    moduleDependencies?: string[]
  ): void {
    const defaultImports = moduleDependencies?.map((filepath) => {
      return {
        name: path.basename(filepath, ".tsx"),
        moduleSpecifier: getImportSpecifier(moduleMetadata.filepath, filepath),
      };
    });
    const propArgs = ModuleFile.calcPropArgs(moduleMetadata.componentTree);
    this.reactComponentFileWriter.updateFile({
      componentTree: moduleMetadata.componentTree,
      fileMetadata: moduleMetadata,
      defaultImports,
      propArgs,
    });
  }

  private static calcPropArgs(componentTree: ComponentState[]) {
    const usesDocument = ComponentTreeHelpers.usesExpressionSource(
      componentTree,
      "document"
    );
    const usesProps = ComponentTreeHelpers.usesExpressionSource(
      componentTree,
      "props"
    );

    if (usesDocument && usesProps) {
      return ["document", "...props"];
    } else if (usesDocument) {
      return ["document"];
    } else if (usesProps) {
      return "props";
    }
    return "_props";
  }
}
