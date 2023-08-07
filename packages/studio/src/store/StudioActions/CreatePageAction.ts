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
import { toast } from "react-toastify";

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
      try {
        const mappingJson = await this.studioActions.generateTestData();
        this.updateEntityFiles(pageName, mappingJson);
      } catch {
        toast.warn("Could not generate test data, but page was still created.");
      }
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

  private updateEntityFiles(
    pageName: string,
    mappingJson: Record<string, string[]>
  ) {
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
  if (!filepath.startsWith(pagesPath)) {
    throw new Error(`Error adding page: pageName is invalid: ${pageName}`);
  }
}
