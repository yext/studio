import StudioSourceFile from "./StudioSourceFile";
import { PageState } from "../types/State";
import { JsxElement, JsxFragment, SyntaxKind } from "ts-morph";
import StaticParsingHelpers from "./StaticParsingHelpers";
import path from "path";

/**
 * PageFile is responsible for parsing a single page file, for example
 * `src/templates/index.tsx`.
 */
export default class PageFile {
  private studioSourceFile: StudioSourceFile;
  private filepath: string;

  constructor(filepath: string) {
    this.studioSourceFile = new StudioSourceFile(filepath);
    this.filepath = filepath;
  }

  getPageState(): PageState {
    const defaultExport = this.studioSourceFile.parseDefaultExport();
    const returnStatement = defaultExport.getFirstDescendantByKind(SyntaxKind.ReturnStatement);
    if (!returnStatement) {
      throw new Error(`No return statement found for the default export at path: "${this.filepath}"`);
    }
    const JsxNodeWrapper = returnStatement.getFirstChildByKind(SyntaxKind.ParenthesizedExpression)
      ?? returnStatement;
    const topLevelJsxNode = JsxNodeWrapper.getChildren()
      .find((n): n is JsxElement | JsxFragment =>
        n.isKind(SyntaxKind.JsxElement) || n.isKind(SyntaxKind.JsxFragment)
      );
    if (!topLevelJsxNode) {
      throw new Error("Unable to find top-level JSX element or JSX fragment type"
        + ` in the default export at path: "${this.filepath}"`);
    }

    const defaultImports = this.studioSourceFile.parseDefaultImports();
    const absPathDefaultImports: Record<string, string> = Object.entries(defaultImports)
      .reduce((imports, [importIdentifier, importName]) => {
        if (!path.isAbsolute(importIdentifier)) {
          const absoluteFilepath = path.resolve(this.filepath, "..", importIdentifier) + ".tsx";
          imports[absoluteFilepath] = importName;
        } else {
          imports[importIdentifier] = importName;
        }
        return imports;
      }, {});

    const componentTree = StaticParsingHelpers.parseJsxChild(
      topLevelJsxNode,
      absPathDefaultImports
    );

    const cssImports = this.studioSourceFile.parseCssImports();

    return {
      componentTree,
      cssImports
    }
  }
}
