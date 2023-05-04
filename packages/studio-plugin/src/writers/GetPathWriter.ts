import {
  GET_PATH_FUNCTION_NAME,
  PAGESJS_TEMPLATE_PROPS_TYPE,
  PAGES_PACKAGE_NAME,
} from "../constants";
import StudioSourceFileParser from "../parsers/StudioSourceFileParser";
import StudioSourceFileWriter from "./StudioSourceFileWriter";
import GetPathParser from "../parsers/GetPathParser";

const GET_PATH_FUNCTION_TYPE = "GetPath";

/**
 * GetPathWriter is a class for housing the updating logic for the getPath
 * function in a PageFile.
 */
export default class GetPathWriter {
  private getPathParser: GetPathParser;

  constructor(
    private studioSourceFileWriter: StudioSourceFileWriter,
    studioSourceFileParser: StudioSourceFileParser
  ) {
    this.getPathParser = new GetPathParser(studioSourceFileParser);
  }

  /**
   * Updates the getPath function by replacing the returned string literal's
   * value or adding a new getPath function to the original sourceFile.
   *
   * @param getPathValue - the new value to return from the getPath function
   */
  updateGetPath(getPathValue: string) {
    const getPathFunction = this.getPathParser.findGetPathFunction();
    if (getPathFunction) {
      const returnStringLiteral = this.getPathParser.getReturnStringLiteral();
      returnStringLiteral?.setLiteralValue(getPathValue);
    } else {
      this.studioSourceFileWriter.updateVariableStatement(
        GET_PATH_FUNCTION_NAME,
        `() => { return "${getPathValue}"; }`,
        `${GET_PATH_FUNCTION_TYPE}<${PAGESJS_TEMPLATE_PROPS_TYPE}>`
      );
      this.addGetPathImports();
    }
  }

  private addGetPathImports(): void {
    this.studioSourceFileWriter.addFileImport({
      source: PAGES_PACKAGE_NAME,
      namedImports: [GET_PATH_FUNCTION_TYPE, PAGESJS_TEMPLATE_PROPS_TYPE],
    });
  }
}
