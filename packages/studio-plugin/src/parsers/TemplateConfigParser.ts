import { STREAM_CONFIG_VARIABLE_NAME } from "../constants";
import { StreamScope } from "../types";
import StudioSourceFileParser from "./StudioSourceFileParser";
import { TemplateConfig } from "@yext/pages";

/**
 * TemplateConfigParser is a class for parsing the stream config in a PageFile.
 */
export default class TemplateConfigParser {
  constructor(private studioSourceFileParser: StudioSourceFileParser) {}

  /**
   * If the page has a template config exported, returns the scope of the
   * stream defined by it.
   */
  getStreamScope(): StreamScope | undefined {
    return this.getTemplateConfig()?.stream?.filter;
  }

  /** Returns the template config exported from the page if one is present. */
  getTemplateConfig(): TemplateConfig | undefined {
    const streamObjectLiteralExp =
      this.studioSourceFileParser.getExportedObjectExpression(
        STREAM_CONFIG_VARIABLE_NAME
      );
    return (
      streamObjectLiteralExp &&
      this.studioSourceFileParser.getCompiledObjectLiteral<TemplateConfig>(
        streamObjectLiteralExp
      )
    );
  }
}
