import StudioActions from "../StudioActions";
import PageSlice from "../models/slices/PageSlice";

/**
 * UpdateActivePageAction is responsible for updating the current active page,
 * and any associated side effects with that.
 */
export default class UpdateActivePageAction {
  constructor(
    private getPageSlice: () => PageSlice,
    private studioActions: StudioActions
  ) {}

  updateActivePage = async (activePageName?: string): Promise<void> => {
    this.getPageSlice().setActivePage(activePageName);
    this.getPageSlice().setModuleUUIDBeingEdited(undefined);
    const activePageState = this.getPageSlice().getActivePageState();
    // Any file is fine so pick the first one.
    const anyAcceptedEntityFile = activePageState?.pagesJS?.entityFiles?.[0];
    this.getPageSlice().setActiveEntityFile(anyAcceptedEntityFile);
    await this.studioActions.refreshActivePageEntities();
  };
}
