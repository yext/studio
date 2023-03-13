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
import {
  ComponentState,
  ExpressionProp,
  PropShape,
  PropValueKind,
} from "../types";
import { TypeGuards } from "../utils";

/**
 * ModuleFile is responsible for parsing and updating a single
 * module file, for example `src/modules/Card.tsx`.
 */
export default class ModuleFile {
  private studioSourceFileParser: StudioSourceFileParser;
  private componentName: string;
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
    this.componentName = this.getComponentName();
    this.fileMetadataParser = new FileMetadataParser(
      this.componentName,
      this.studioSourceFileParser
    );
    this.reactComponentFileWriter = new ReactComponentFileWriter(
      this.componentName,
      new StudioSourceFileWriter(filepath, project),
      this.studioSourceFileParser,
      getFileMetadataByUUID
    );
    this.componentTreeParser = new ComponentTreeParser(
      this.studioSourceFileParser,
      getFileMetadata
    );
  }

  private getComponentName(): string {
    return path.basename(this.studioSourceFileParser.getFilepath(), ".tsx");
  }

  getModuleMetadata(): ModuleMetadata {
    const absPathDefaultImports =
      this.studioSourceFileParser.getAbsPathDefaultImports();
    const componentTree = this.componentTreeParser.parseComponentTree(
      absPathDefaultImports
    );

    return {
      kind: FileMetadataKind.Module,
      componentTree,
      ...this.getCommonMetadata(),
      filepath: this.studioSourceFileParser.getFilepath(),
    };
  }

  private getCommonMetadata(): Pick<
    ModuleMetadata,
    "metadataUUID" | "initialProps" | "propShape"
  > {
    const { propShape, ...otherMetadata } = this.fileMetadataParser.parse();
    if (!propShape?.hasOwnProperty("document")) {
      throw new Error(
        "All Modules must contain a prop interface with a document prop."
      );
    }
    return {
      ...otherMetadata,
      propShape,
    };
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
    this.reactComponentFileWriter.updateFile({
      componentTree: moduleMetadata.componentTree,
      fileMetadata: moduleMetadata,
      defaultImports,
      propArgs: ModuleFile.calcPropArgs(
        moduleMetadata.propShape,
        moduleMetadata.componentTree
      ),
    });
  }

  private static calcPropArgs(
    propShape: PropShape | undefined,
    componentTree: ComponentState[]
  ) {
    if (!propShape?.hasOwnProperty("document")) {
      return undefined;
    }
    const expressionProps: ExpressionProp[] = componentTree
      .filter(TypeGuards.isStandardOrModuleComponentState)
      .flatMap((c) =>
        Object.values(c.props).filter(
          (p): p is ExpressionProp => p.kind === PropValueKind.Expression
        )
      );

    const usesDocument = expressionProps.some((e) => {
      return (
        e.value.startsWith("document.") || e.value.match(/\${document\..*}/)
      );
    });
    const usesProps = expressionProps.some((e) => {
      return e.value.startsWith("props.") || e.value.match(/\${props\..*}/);
    });
    if (usesDocument && usesProps) {
      return ["document", "...props"];
    } else if (usesDocument) {
      return ["document"];
    } else if (usesProps) {
      return "props";
    }
    return undefined;
  }
}
