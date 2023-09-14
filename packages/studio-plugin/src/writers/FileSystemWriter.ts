import ParsingOrchestrator from "../ParsingOrchestrator";
import { PageState, SiteSettingsValues } from "../types";
import fs from "fs";
import { Project } from "ts-morph";
import upath from "upath";

/**
 * FileSystemWriter is a class for housing content modification logic
 * for Studio editable source files (e.g. SiteSettingsFile and PageFile).
 */
export class FileSystemWriter {
  constructor(
    private orchestrator: ParsingOrchestrator,
    private project: Project
  ) {}

  /**
   * Update the page file's content based on provided page state.
   *
   * @param pageName - Name of the page file to update
   * @param pageState - the updated state for the page file
   */
  writeToPageFile(pageName: string, pageState: PageState): void {
    const pageFile = this.orchestrator.getOrCreatePageFile(pageName);
    pageFile.updatePageFile(pageState);
  }

  writeToSiteSettings(siteSettingsValues: SiteSettingsValues): void {
    this.orchestrator.updateSiteSettings(siteSettingsValues);
  }

  static openFile(filepath: string) {
    if (!fs.existsSync(filepath)) {
      const dirname = upath.dirname(filepath);
      if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
      }
      fs.openSync(filepath, "w");
    }
  }

  removeFile(filepath: string) {
    if (fs.existsSync(filepath)) {
      const sourceFile = this.project.getSourceFile(filepath);
      if (sourceFile) {
        this.project.removeSourceFile(sourceFile);
      }
      fs.rmSync(filepath);
    }
  }
}
