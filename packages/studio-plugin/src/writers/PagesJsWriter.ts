import { PAGESJS_TEMPLATE_PROPS_TYPE, PAGES_PACKAGE_NAME } from "../constants";
import StudioSourceFileWriter from "./StudioSourceFileWriter";
import { ArrowFunction, FunctionDeclaration } from "ts-morph";

/**
 * PagesJsWriter is a class for housing the PagesJS-specific updating logic for
 * a PageFile.
 */
export default class PagesJsWriter {
  constructor(private studioSourceFileWriter: StudioSourceFileWriter) {}

  /** Adds named imports from the PagesJS package. */
  addPagesJsImports(namedImports: string[]): void {
    this.studioSourceFileWriter.addFileImport({
      source: PAGES_PACKAGE_NAME,
      namedImports,
    });
  }

  /** Adds a destructured template props paramater to the function. */
  addTemplateParameter(componentFunction: FunctionDeclaration | ArrowFunction) {
    this.studioSourceFileWriter.updateFunctionParameter(
      componentFunction,
      PAGESJS_TEMPLATE_PROPS_TYPE,
      ["document"]
    );
  }
}
