import {
  GET_PATH_FUNCTION_NAME,
  PAGESJS_TEMPLATE_PROPS_TYPE,
} from "../constants.js";
import StudioSourceFileWriter from "./StudioSourceFileWriter.js";
import GetPathParser from "../parsers/GetPathParser.js";
import { GetPathVal } from "../types/PageState.js";
import { PropValueKind } from "../types/PropValues.js";
import ExpressionHelpers from "../utils/ExpressionHelpers.js";
import PagesJsWriter from "./PagesJsWriter.js";

const GET_PATH_FUNCTION_TYPE = "GetPath";

/**
 * GetPathWriter is a class for housing the updating logic for the getPath
 * function in a PageFile.
 */
export default class GetPathWriter {
  constructor(
    private studioSourceFileWriter: StudioSourceFileWriter,
    private getPathParser: GetPathParser,
    private pagesJsWriter: PagesJsWriter
  ) {}

  /**
   * Updates the getPath function by replacing the returned string's value or
   * adding a new getPath function to the original sourceFile.
   *
   * @param getPathValue - the new value to return from the getPath function
   */
  updateGetPath(getPathValue: GetPathVal) {
    const stringNodeText = this.constructStringNodeText(getPathValue);
    const usesDocument =
      getPathValue.kind === PropValueKind.Expression &&
      ExpressionHelpers.usesExpressionSource(getPathValue.value, "document");

    const getPathFunction = this.getPathParser.findGetPathFunction();
    if (getPathFunction) {
      const stringNode = this.getPathParser.getReturnStringNode();
      if (!stringNode) {
        throw new Error(
          "Error updating getPath function: unable to find returned string node."
        );
      }
      stringNode.replaceWithText(stringNodeText);
      usesDocument && this.pagesJsWriter.addTemplateParameter(getPathFunction);
    } else {
      const functionText = usesDocument
        ? `({ document }) => { return ${stringNodeText}; }`
        : `() => { return ${stringNodeText}; }`;
      this.studioSourceFileWriter.updateVariableStatement(
        GET_PATH_FUNCTION_NAME,
        functionText,
        `${GET_PATH_FUNCTION_TYPE}<${PAGESJS_TEMPLATE_PROPS_TYPE}>`
      );
    }

    this.pagesJsWriter.addPagesJsImports([
      GET_PATH_FUNCTION_TYPE,
      PAGESJS_TEMPLATE_PROPS_TYPE,
    ]);
  }

  private constructStringNodeText({ kind, value }: GetPathVal) {
    return kind === PropValueKind.Literal ? `"${value}"` : value;
  }
}
