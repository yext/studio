import StudioSourceFile from "./StudioSourceFile";
import path from "path";
import { ComponentMetadata } from "../types/ComponentMetadata";
import { SpecialReactProps } from "../types/PropShape";
import { FileMetadataKind } from "../types/FileMetadata";
import FileMetadataParser from "../parsers/FileMetadataParser";
import { Project } from "ts-morph";

/**
 * ComponentFile is responsible for parsing a single component file, for example
 * `src/components/Banner.tsx`.
 */
export default class ComponentFile {
  private studioSourceFile: StudioSourceFile;
  private componentName: string;
  private fileMetadataParser: FileMetadataParser;

  constructor(filepath: string, project?: Project) {
    this.componentName = path.basename(filepath, ".tsx");
    this.studioSourceFile = new StudioSourceFile(filepath, project);
    this.fileMetadataParser = new FileMetadataParser(
      this.componentName,
      this.studioSourceFile
    );
  }

  getComponentMetadata(): ComponentMetadata {
    let acceptsChildren = false;
    const onProp = (propName: string): boolean => {
      if (propName === SpecialReactProps.Children) {
        acceptsChildren = true;
      }
      return propName !== SpecialReactProps.Children;
    };

    return {
      kind: FileMetadataKind.Component,
      ...this.fileMetadataParser.parse(onProp),
      ...(acceptsChildren ? { acceptsChildren } : {}),
    };
  }
}
