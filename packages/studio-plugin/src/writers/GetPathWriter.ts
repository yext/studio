import {
  GET_PATH_FUNCTION_NAME,
  PAGESJS_TEMPLATE_PROPS_TYPE,
} from "../constants";
import StudioSourceFileWriter from "./StudioSourceFileWriter";
import GetPathParser from "../parsers/GetPathParser";
import { SyntaxKind } from "ts-morph";
import { GetPathVal } from "../types/PageState";
import { PropValueKind } from "../types/PropValues";
import ExpressionHelpers from "../utils/ExpressionHelpers";
import PagesJsWriter from "./PagesJsWriter";

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
    const returnText = this.constructReturnText(getPathValue);
    const usesDocument =
      getPathValue.kind === PropValueKind.Expression &&
      ExpressionHelpers.usesExpressionSource(getPathValue.value, "document");

    const getPathFunction = this.getPathParser.findGetPathFunction();
    if (getPathFunction) {
      const returnStatement = this.getPathParser
        .getReturnStringNode()
        ?.getFirstAncestorByKind(SyntaxKind.ReturnStatement);
      if (!returnStatement) {
        throw new Error(
          "Error updating getPath function: unable to find return statement."
        );
      }
      returnStatement.replaceWithText(returnText);
      usesDocument && this.pagesJsWriter.addTemplateParameter(getPathFunction);
    } else {
      const functionText = usesDocument
        ? `({ document }) => { ${returnText} }`
        : `() => { ${returnText} }`;
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

  private constructReturnText({ kind, value }: GetPathVal) {
    return kind === PropValueKind.Literal
      ? `return "${value}";`
      : `return ${value};`;
  }
}
