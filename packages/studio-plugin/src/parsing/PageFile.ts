import StudioSourceFile from "./StudioSourceFile";
import { PageState } from "../types/State";
import { JsxElement, JsxFragment, ts } from "ts-morph";
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
    const returnStatement = defaultExport.getFirstDescendantByKind(ts.SyntaxKind.ReturnStatement);
    if (!returnStatement) {
      throw new Error('No return statement found for page');
    }
    const JsxNodeWrapper = returnStatement.getFirstChildByKind(ts.SyntaxKind.ParenthesizedExpression)
      ?? returnStatement;
    const topLevelJsxNode = JsxNodeWrapper.getChildren()
      .find((n): n is JsxElement | JsxFragment =>
        n.getKind() === ts.SyntaxKind.JsxElement || n.getKind() === ts.SyntaxKind.JsxFragment
      );
    if (!topLevelJsxNode) {
      throw new Error('Unable to find top level JSX element or JsxFragment type from file.');
    }

    const defaultImports = this.studioSourceFile.parseDefaultImports();
    const absoluteDefaultImports: Record<string, string> = Object.entries(defaultImports)
      .reduce((imports, [importIdentifier, importName]) => {
        if (importIdentifier.startsWith(".")) {
          const absoluteFilepath = path.resolve(this.filepath, "..", importIdentifier) + ".tsx";
          imports[absoluteFilepath] = importName;
        } else {
          imports[importIdentifier] = importName;
        }
        return imports;
      }, {});

    const componentTree = StaticParsingHelpers.parseJsxChild(
      topLevelJsxNode,
      absoluteDefaultImports
    );

    const cssImports = this.studioSourceFile.parseCssImports();

    return {
      componentTree,
      cssImports
    }
  }
}
