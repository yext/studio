import StudioSourceFile from "./StudioSourceFile";
import path from "path";
import { ComponentMetadata } from "../types/ComponentMetadata";
import { SpecialReactProps } from "../types/PropShape";
import { FileMetadataKind } from "../types/FileMetadata";
import FileMetadataParser from "./FileMetadataParser";
import { Project } from "ts-morph";
import { GetFileMetadata } from './StudioSourceFileParser';

/**
 * ComponentFile is responsible for parsing a single component file, for example
 * `src/components/Banner.tsx`.
 */
export default class ComponentFile {
  private studioSourceFile: StudioSourceFile;
  private componentName: string;
  private fileMetadataParser: FileMetadataParser;

  constructor(private filepath: string, getFileMetadata: GetFileMetadata, project: Project) {
    this.componentName = path.basename(filepath, ".tsx");
    this.studioSourceFile = new StudioSourceFile(filepath, getFileMetadata, project);
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
      filepath: this.filepath
    };
  }
}
