import ParsingOrchestrator from "../ParsingOrchestrator";
import { PageState } from "../types";

/**
 * FileSystemWriter is a class for housing content modification logic
 * for Studio editable source files (e.g. SiteSettingsFile, ModuleFile and PageFile).
 */
export class FileSystemWriter {
  constructor(
    private orchestrator: ParsingOrchestrator,
    private isPagesJSRepo: boolean
  ) {}

  /**
   * Update the page file's content based on provided page state.
   *
   * @param pageName - Name of the page file to update
   * @param pageState - the updated state for the page file
   */
  async writeToPageFile(pageName: string, pageState: PageState): Promise<void> {
    const pageFile = await this.orchestrator.getPageFile(pageName);
    pageFile.updatePageFile(pageState, {
      updateStreamConfig: this.isPagesJSRepo,
    });
  }
}
