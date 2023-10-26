import {
  GetPathVal,
  StreamScope,
  PageState,
  PagesJsState,
  ResponseType,
  LayoutState,
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
    streamScope?: StreamScope,
    layout?: LayoutState
  ) => {
    const pagesPath = this.getStudioConfigSlice().paths.pages;
    const filepath = path.join(pagesPath, pageName + ".tsx");
    const isPagesJSRepo = this.getStudioConfigSlice().isPagesJSRepo;
    validate(pageName, filepath, pagesPath, isPagesJSRepo, getPathValue);
    const pageState = this.getPageState(
      filepath,
      isPagesJSRepo,
      getPathValue,
      streamScope,
      layout
    );
    this.getPageSlice().addPage(pageName, pageState);

    if (isPagesJSRepo) {
      const response = await this.studioActions.generateTestData();
      if (response.type === ResponseType.Error) {
        toast.error(
          "Could not generate test data, but page was still created."
        );
      }
    }

    await this.studioActions.updateActivePage(pageName);
  };

  private getPageState(
    filepath: string,
    isPagesJSRepo: boolean,
    getPathValue?: GetPathVal,
    streamScope?: StreamScope,
    layout?: LayoutState
  ) {
    const pageState: PageState = {
      componentTree: layout ? layout.componentTree : [],
      styleImports: layout ? layout.styleImports : [],
      filepath,
    };
    if (isPagesJSRepo && getPathValue) {
      const pagesJsState: PagesJsState = { getPathValue, streamScope };
      pageState.pagesJS = pagesJsState;
    }
    return pageState;
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
    throw new Error("A getPath value is required.");
  }
  if (!filepath.startsWith(pagesPath)) {
    throw new Error(`Page name is invalid: ${pageName}`);
  }
}
