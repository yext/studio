import {
  GetPathVal,
  StreamScope,
  PageState,
  PagesJsState,
} from "@yext/studio-plugin";
import path from "path-browserify";
import StudioConfigSlice from "../models/slices/StudioConfigSlice";
import PageSlice from "../models/slices/PageSlice";
import StudioActions from "../StudioActions";

export default class CreatePageAction {
  constructor(
    private studioActions: StudioActions,
    private getPageSlice: () => PageSlice,
    private getStudioConfigSlice: () => StudioConfigSlice
  ) {}

  createPage = async (
    pageName: string,
    getPathValue?: GetPathVal,
    streamScope?: StreamScope
  ) => {
    const pagesPath = this.getStudioConfigSlice().paths.pages;
    const filepath = path.join(pagesPath, pageName + ".tsx");
    const isPagesJSRepo = this.getStudioConfigSlice().isPagesJSRepo;
    validate(pageName, filepath, pagesPath, isPagesJSRepo, getPathValue);
    const pageState = this.getPageState(
      filepath,
      isPagesJSRepo,
      getPathValue,
      streamScope
    );
    this.getPageSlice().addPage(pageName, pageState);

    if (streamScope) {
      await this.regenerateTestData(pageName);
    }

    await this.studioActions.updateActivePage(pageName);
  };

  private getPageState(
    filepath: string,
    isPagesJSRepo: boolean,
    getPathValue?: GetPathVal,
    streamScope?: StreamScope
  ) {
    const pageState: PageState = {
      componentTree: [],
      cssImports: [],
      filepath,
    };
    if (isPagesJSRepo && getPathValue) {
      const pagesJsState: PagesJsState = { getPathValue, streamScope };
      pageState.pagesJS = pagesJsState;
    }
    return pageState;
  }

  private async regenerateTestData(pageName: string) {
    const mappingJson = await this.studioActions.generateTestData();
    const entityFilesForPage: string[] = mappingJson?.[pageName];
    if (!Array.isArray(entityFilesForPage)) {
      console.error(
        `Error getting entity files for ${pageName} from ${JSON.stringify(
          mappingJson,
          null,
          2
        )}`
      );
    } else {
      this.getPageSlice().updateEntityFiles(pageName, entityFilesForPage);
    }
  }
}

function validate(
  pageName: string,
  filepath: string,
  pagesPath: string,
  isPagesJSRepo: boolean,
  getPathValue?: GetPathVal
) {
  if (isPagesJSRepo && !getPathValue) {
    throw new Error("Error adding page: a getPath value is required.");
  }
  if (!pageName) {
    throw new Error("Error adding page: a pageName is required.");
  }
  if (!filepath.startsWith(pagesPath)) {
    throw new Error(`Error adding page: pageName is invalid: ${pageName}`);
  }
  const errorChars = pageName.match(/[\\/?%*:|"<>]/g);
  if (errorChars) {
    throw new Error(
      `Error adding page: pageName ${pageName} cannot contain the characters: ${[
        ...new Set(errorChars),
      ]}`
    );
  }
  if (pageName.endsWith(".")) {
    throw new Error(
      `Error adding page: pageName ${pageName} cannot end with a period.`
    );
  }
  if (pageName.length > 255) {
    throw new Error(
      "Error adding page: pageName must be 255 characters or less."
    );
  }
}
