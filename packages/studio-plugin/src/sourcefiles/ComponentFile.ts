import path from "path";
import { ComponentMetadata } from "../types/ComponentMetadata";
import { SpecialReactProps } from "../types/PropShape";
import { FileMetadataKind } from "../types/FileMetadata";
import FileMetadataParser from "../parsers/FileMetadataParser";
import { Project } from "ts-morph";
import StudioSourceFileParser from "../parsers/StudioSourceFileParser";
import getNpmPackageName from "../parsers/getNpmPackageName";

/**
 * ComponentFile is responsible for parsing a single component file, for example
 * `src/components/Banner.tsx`.
 */
export default class ComponentFile {
  private studioSourceFileParser: StudioSourceFileParser;
  private componentName: string;
  private fileMetadataParser: FileMetadataParser;

  constructor(filepath: string, project: Project) {
    this.componentName = path.basename(filepath, ".tsx");
    this.studioSourceFileParser = new StudioSourceFileParser(filepath, project);
    this.fileMetadataParser = new FileMetadataParser(
      this.componentName,
      this.studioSourceFileParser
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

    const filepath = this.studioSourceFileParser.getFilepath();

    return {
      kind: FileMetadataKind.Component,
      ...this.fileMetadataParser.parse(onProp),
      ...(acceptsChildren ? { acceptsChildren } : {}),
      filepath,
      prettyName: getNpmPackageName(filepath) + this.componentName,
    };
  }
}
