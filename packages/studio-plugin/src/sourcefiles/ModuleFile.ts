import upath from "upath";
import { ModuleMetadata } from "../types/ModuleMetadata";
import { FileMetadataKind } from "../types/FileMetadata";
import FileMetadataParser from "../parsers/FileMetadataParser";
import { Project } from "ts-morph";
import ReactComponentFileWriter from "../writers/ReactComponentFileWriter";
import StudioSourceFileParser from "../parsers/StudioSourceFileParser";
import StudioSourceFileWriter from "../writers/StudioSourceFileWriter";
import ComponentTreeParser, {
  GetFileMetadata,
} from "../parsers/ComponentTreeParser";
import getImportSpecifier from "../utils/getImportSpecifier";
import { ComponentState } from "../types";
import { ComponentTreeHelpers } from "../utils";
import tryUsingResult from "../errors/tryUsingResult";
import { ParsingErrorKind } from "../errors/ParsingError";

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
    project: Project
  ) {
    this.studioSourceFileParser = new StudioSourceFileParser(filepath, project);
    this.fileMetadataParser = new FileMetadataParser(
      this.studioSourceFileParser
    );
    const componentName = upath.basename(
      this.studioSourceFileParser.getFilepath(),
      ".tsx"
    );
    this.reactComponentFileWriter = new ReactComponentFileWriter(
      componentName,
      new StudioSourceFileWriter(filepath, project),
      this.studioSourceFileParser
    );
    this.componentTreeParser = new ComponentTreeParser(
      this.studioSourceFileParser,
      getFileMetadata
    );
  }

  getModuleMetadata() {
    return tryUsingResult(
      ParsingErrorKind.FailedToParseModuleMetadata,
      `Failed to parse ModuleMetadata for "${this.studioSourceFileParser.getFilepath()}"`,
      this._getModuleMetadata
    );
  }

  private _getModuleMetadata = (): ModuleMetadata => {
    this.studioSourceFileParser.checkForSyntaxErrors();
    const absPathDefaultImports =
      this.studioSourceFileParser.getAbsPathDefaultImports();
    const componentTree = this.componentTreeParser.parseComponentTree(
      absPathDefaultImports
    );

    return {
      kind: FileMetadataKind.Module,
      componentTree,
      ...this.fileMetadataParser.parse(),
      filepath: this.studioSourceFileParser.getFilepath(),
    };
  };

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
        name: upath.basename(filepath, ".tsx"),
        moduleSpecifier: getImportSpecifier(moduleMetadata.filepath, filepath),
      };
    });
    const propArgs = ModuleFile.calcPropArgs(moduleMetadata.componentTree);
    this.reactComponentFileWriter.updateFile({
      componentTree: moduleMetadata.componentTree,
      moduleMetadata,
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
