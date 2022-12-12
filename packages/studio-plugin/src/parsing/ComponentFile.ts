import StudioSourceFile from "./StudioSourceFile";
import path from "path";
import { ComponentMetadata } from "../types/ComponentMetadata";
import { SpecialReactProps } from "../types/PropShape";
import FileMetadataParsingHelpers from "./FileMetadataParsingHelper";
import { FileMetadataKind } from "../types/FileMetadata";

/**
 * ComponentFile is responsible for parsing a single component file, for example
 * `src/components/Banner.tsx`.
 */
export default class ComponentFile {
  private studioSourceFile: StudioSourceFile;
  private componentName: string;

  constructor(filepath: string) {
    this.componentName = path.basename(filepath, ".tsx");
    this.studioSourceFile = new StudioSourceFile(filepath);
  }

  getComponentMetadata(): ComponentMetadata {
    let acceptsChildren = false;
    const onProp = (propName: string): boolean => {
      if (propName === SpecialReactProps.Children) {
        acceptsChildren = true;
        return false;
      }
      return true;
    };

    const propShape = FileMetadataParsingHelpers.getPropShape(
      this.studioSourceFile,
      this.componentName,
      onProp
    );
    const initialProps = FileMetadataParsingHelpers.getInitialProps(
      this.studioSourceFile,
      this.componentName,
      propShape
    );
    return {
      kind: FileMetadataKind.Component,
      propShape,
      ...(initialProps && { initialProps }),
      ...(acceptsChildren ? { acceptsChildren } : {}),
    };
  }
}
