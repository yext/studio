import { ComponentMetadata } from "../types/ComponentMetadata.js";
import { SpecialReactProps } from "../types/PropShape.js";
import { FileMetadataKind } from "../types/FileMetadata.js";
import FileMetadataParser from "../parsers/FileMetadataParser.js";
import { Project } from "ts-morph";
import StudioSourceFileParser from "../parsers/StudioSourceFileParser.js";
import tryUsingResult from "../errors/tryUsingResult.js";
import { ParsingError, ParsingErrorKind } from "../errors/ParsingError.js";
import { Result } from "true-myth";

/**
 * ComponentFile is responsible for parsing a single component file, for example
 * `src/components/Banner.tsx`.
 */
export default class ComponentFile {
  private studioSourceFileParser: StudioSourceFileParser;
  private fileMetadataParser: FileMetadataParser;

  constructor(filepath: string, project: Project) {
    this.studioSourceFileParser = new StudioSourceFileParser(filepath, project);
    this.fileMetadataParser = new FileMetadataParser(
      this.studioSourceFileParser
    );
  }

  getComponentMetadata(): Result<ComponentMetadata, ParsingError> {
    return tryUsingResult(
      ParsingErrorKind.FailedToParseComponentMetadata,
      `Failed to parse ComponentMetadata for "${this.studioSourceFileParser.getFilepath()}"`,
      this._getComponentMetadata
    );
  }

  private _getComponentMetadata = (): ComponentMetadata => {
    this.studioSourceFileParser.checkForSyntaxErrors();
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
    };
  };
}
