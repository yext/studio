import StudioSourceFileParser from "./StudioSourceFileParser";
import { PagesJsState } from "../types/PageState";
import GetPathParser from "./GetPathParser";
import TemplateConfigParser from "./TemplateConfigParser";
import { PropValueKind } from "../types";

/**
 * PagesJsStateParser is a class for parsing the PagesJS-related information
 * (the {@link PagesJsState}) for a PageFile.
 */
export default class PagesJsStateParser {
  private getPathParser: GetPathParser;
  private templateConfigParser: TemplateConfigParser;

  constructor(
    studioSourceFileParser: StudioSourceFileParser,
    private isPagesJSRepo: boolean,
    private entityFiles?: string[]
  ) {
    this.getPathParser = new GetPathParser(studioSourceFileParser);
    this.templateConfigParser = new TemplateConfigParser(
      studioSourceFileParser
    );
  }

  getPagesJsState(): PagesJsState | undefined {
    if (!this.isPagesJSRepo) {
      return;
    }
    const streamScope = this.templateConfigParser.getStreamScope();
    let getPathValue = this.getPathParser.parseGetPathValue();
    if (getPathValue?.kind === PropValueKind.Expression && !streamScope) {
      getPathValue = undefined;
    }

    return {
      ...(this.entityFiles && { entityFiles: this.entityFiles }),
      getPathValue: this.getPathParser.parseGetPathValue(),
      ...(streamScope && { streamScope }),
    };
  }
}
