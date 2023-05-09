import StudioSourceFileParser from "./StudioSourceFileParser";
import { PagesJsState } from "../types/PageState";
import GetPathParser from "./GetPathParser";

/**
 * PagesJsStateParser is a class for parsing the PagesJS-related information
 * (the {@link PagesJsState}) for a PageFile.
 */
export default class PagesJsStateParser {
  private getPathParser: GetPathParser;

  constructor(
    studioSourceFileParser: StudioSourceFileParser,
    private isPagesJSRepo: boolean,
    private entityFiles?: string[]
  ) {
    this.getPathParser = new GetPathParser(studioSourceFileParser);
  }

  getPagesJsState(): PagesJsState | undefined {
    const getPathValue =
      this.isPagesJSRepo && this.getPathParser.parseGetPathValue();
    if (getPathValue || this.entityFiles) {
      return {
        ...(this.entityFiles && { entityFiles: this.entityFiles }),
        ...(getPathValue && { getPathValue }),
      };
    }
  }
}
