import { Project, SyntaxKind } from "ts-morph";
import StudioSourceFileParser from "../parsers/StudioSourceFileParser";
/**
 * LayoutFile is responsible for parsing a Layout File
 */
export default class LayoutFile {
  private studioSourceFileParser: StudioSourceFileParser;
  private filepath;

  constructor(
    filepath: string,
    project: Project,
  ) {
    this.studioSourceFileParser = new StudioSourceFileParser(filepath, project);
    this.filepath = filepath;
  }

  getLayoutName(): string {
    let defaultExportNode = this.studioSourceFileParser.getDefaultExport()
    if (!defaultExportNode) {
      throw new Error("Layout must be declared as a default export.");
    }
    if (defaultExportNode.isKind(SyntaxKind.FunctionDeclaration)) {
      defaultExportNode = defaultExportNode.getChildrenOfKind(SyntaxKind.Identifier)[0]
    }

    if (!defaultExportNode.isKind(SyntaxKind.Identifier)) {
      throw new Error("Invalid layout declaration");
    }
    return defaultExportNode.getText();
  }

  getFilepath() {
    return this.filepath
  }
}
