import StudioSourceFile from "./StudioSourceFile";
import path from "path";
import FileMetadataParsingHelper from "./FileMetadataParsingHelper";
import { ModuleMetadata } from "../types/ModuleMetadata";
import { FileMetadataKind } from "../types/FileMetadata";
import { getFileMetadata } from "../getFileMetadata";
import { Project } from "ts-morph";

/**
 * ModuleFile is responsible for parsing a single module file, for example
 * `src/modules/Card.tsx`.
 */
export default class ModuleFile {
  private studioSourceFile: StudioSourceFile;
  private componentName: string;
  private fileMetadataParsingHelper: FileMetadataParsingHelper;

  constructor(filepath: string, project?: Project) {
    this.componentName = path.basename(filepath, ".tsx");
    this.studioSourceFile = new StudioSourceFile(filepath, project);
    this.fileMetadataParsingHelper = new FileMetadataParsingHelper(
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

    const propShape = this.fileMetadataParsingHelper.getPropShape();
    const initialProps =
      this.fileMetadataParsingHelper.getInitialProps(propShape);

    return {
      kind: FileMetadataKind.Module,
      propShape,
      componentTree,
      ...(initialProps && { initialProps }),
    };
  }
}
