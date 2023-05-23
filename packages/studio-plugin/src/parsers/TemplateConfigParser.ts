import { TEMPLATE_CONFIG_VARIABLE_NAME } from "../constants";
import { StreamScope } from "../types";
import StudioSourceFileParser from "./StudioSourceFileParser";
import { TemplateConfig } from "@yext/pages";

/**
 * TemplateConfigParser is a class for parsing the template config in a PageFile.
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
    const configObjectLiteralExp =
      this.studioSourceFileParser.getExportedObjectExpression(
        TEMPLATE_CONFIG_VARIABLE_NAME
      );
    return (
      configObjectLiteralExp &&
      this.studioSourceFileParser.getCompiledObjectLiteral<TemplateConfig>(
        configObjectLiteralExp
      )
    );
  }
}
