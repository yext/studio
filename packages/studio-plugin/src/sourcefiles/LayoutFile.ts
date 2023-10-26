import { Result } from "true-myth";
import StudioSourceFileParser from "../parsers/StudioSourceFileParser";
import ComponentTreeParser from "../parsers/ComponentTreeParser";
import { ParsingError, ParsingErrorKind } from "../errors/ParsingError";
import tryUsingResult from "../errors/tryUsingResult";
import { LayoutState } from "../types/LayoutState";

/**
 * LayoutFile is responsible for parsing a single layout file, for example
 * `src/layouts/BasicProfile.tsx`.
 */
export default class LayoutFile {
  constructor(
    private studioSourceFileParser: StudioSourceFileParser,
    private componentTreeParser: ComponentTreeParser
  ) {}

  getLayoutState(): Result<LayoutState, ParsingError> {
    return tryUsingResult(
      ParsingErrorKind.FailedToParseLayoutState,
      `Failed to parse LayoutState for "${this.studioSourceFileParser.getFilepath()}"`,
      this._getLayoutState
    );
  }

  private _getLayoutState = (): LayoutState => {
    this.studioSourceFileParser.checkForSyntaxErrors();
    this.studioSourceFileParser.checkForMissingImports();
    const componentTree = this.componentTreeParser.parseComponentTree({
      ...this.studioSourceFileParser.getAbsPathDefaultImports(),
    });
    const styleImports = this.studioSourceFileParser.parseStyleImports();
    const filepath = this.studioSourceFileParser.getFilepath();

    return {
      componentTree,
      styleImports,
      filepath,
    };
  };
}
