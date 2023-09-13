import { Result } from "true-myth";
import StudioSourceFileParser from "../parsers/StudioSourceFileParser";
import ComponentTreeParser from "../parsers/ComponentTreeParser";
import { ParsingError, ParsingErrorKind } from "../errors/ParsingError";
import tryUsingResult from "../errors/tryUsingResult";
import { LayoutMetadata } from "../types/LayoutMetadata";

/**
 * LayoutFile is responsible for parsing a single layout file, for example
 * `src/layouts/BasicProfile.tsx`.
 */
export default class LayoutFile {
  constructor(
    private studioSourceFileParser: StudioSourceFileParser,
    private componentTreeParser: ComponentTreeParser
  ) {}

  getLayoutMetadata(): Result<LayoutMetadata, ParsingError> {
    return tryUsingResult(
      ParsingErrorKind.FailedToParseLayoutMetadata,
      `Failed to parse LayoutMetadata for "${this.studioSourceFileParser.getFilepath()}"`,
      this._getLayoutMetadata
    );
  }

  private _getLayoutMetadata = (): LayoutMetadata => {
    this.studioSourceFileParser.checkForSyntaxErrors();
    const componentTree = this.componentTreeParser.parseComponentTree({
      ...this.studioSourceFileParser.getAbsPathDefaultImports(),
    });
    const cssImports = this.studioSourceFileParser.parseCssImports();
    const filepath = this.studioSourceFileParser.getFilepath();

    return {
      componentTree,
      cssImports,
      filepath,
    };
  };
}
