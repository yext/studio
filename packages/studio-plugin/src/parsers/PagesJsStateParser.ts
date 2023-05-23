import { PagesJsState } from "../types/PageState";
import GetPathParser from "./GetPathParser";
import TemplateConfigParser from "./TemplateConfigParser";
import { PropValueKind } from "../types";

/**
 * PagesJsStateParser is a class for parsing the PagesJS-related information
 * (the {@link PagesJsState}) for a PageFile.
 */
export default class PagesJsStateParser {
  constructor(
    private getPathParser: GetPathParser,
    private templateConfigParser: TemplateConfigParser,
    private entityFiles?: string[]
  ) {}

  getPagesJsState(): PagesJsState {
    const streamScope = this.templateConfigParser.getStreamScope();
    let getPathValue = this.getPathParser.parseGetPathValue();
    if (getPathValue?.kind === PropValueKind.Expression && !streamScope) {
      getPathValue = undefined;
    }

    return {
      ...(this.entityFiles && { entityFiles: this.entityFiles }),
      getPathValue,
      ...(streamScope && { streamScope }),
    };
  }
}
