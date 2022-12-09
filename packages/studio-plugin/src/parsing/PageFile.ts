import StudioSourceFile from "./StudioSourceFile";
import { PageState } from "../types/State";
import path from "path";

/**
 * PageFile is responsible for parsing a single page file, for example
 * `src/templates/index.tsx`.
 */
export default class PageFile {
  private studioSourceFile: StudioSourceFile;

  constructor(private filepath: string) {
    this.studioSourceFile = new StudioSourceFile(filepath);
  }

  getPageState(): PageState {
    // For now, we are only supporting imports from files that export a component
    // as the default export. We will add support for named exports at a later date.
    const defaultImports = this.studioSourceFile.parseDefaultImports();
    const absPathDefaultImports: Record<string, string> = Object.entries(defaultImports)
      .reduce((imports, [importIdentifier, importName]) => {
        if (path.isAbsolute(importIdentifier)) {
          imports[importIdentifier] = importName;
        } else {
          const absoluteFilepath = path.resolve(this.filepath, "..", importIdentifier) + ".tsx";
          imports[absoluteFilepath] = importName;
        }
        return imports;
      }, {});

    return {
      componentTree: this.studioSourceFile.parseComponentTree(absPathDefaultImports),
      cssImports: this.studioSourceFile.parseCssImports()
    }
  }
}
