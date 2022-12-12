import StudioSourceFile from "./StudioSourceFile";
import path from "path";
import FileMetadataParsingHelpers from "./FileMetadataParsingHelpers";
import { ModuleMetadata } from "../types/ModuleMetadata";
import { FileMetadataKind } from "../types/FileMetadata";
import { getFileMetadata } from "../getFileMetadata";

/**
 * ModuleFile is responsible for parsing a single module file, for example
 * `src/modules/Card.tsx`.
 */
export default class ModuleFile {
  private studioSourceFile: StudioSourceFile;
  private componentName: string;

  constructor(filepath: string) {
    this.componentName = path.basename(filepath, ".tsx");
    this.studioSourceFile = new StudioSourceFile(filepath);
  }

  getModuleMetadata(): ModuleMetadata {
    const absPathDefaultImports =
      this.studioSourceFile.getAbsPathDefaultImports();
    const componentTree = this.studioSourceFile.parseComponentTree(
      absPathDefaultImports,
      getFileMetadata
    );

    const propShape = FileMetadataParsingHelpers.getPropShape(
      this.studioSourceFile,
      this.componentName
    );
    const initialProps = FileMetadataParsingHelpers.getInitialProps(
      this.studioSourceFile,
      this.componentName,
      propShape
    );

    return {
      kind: FileMetadataKind.Module,
      propShape,
      componentTree,
      ...(initialProps && { initialProps }),
    };
  }
}
