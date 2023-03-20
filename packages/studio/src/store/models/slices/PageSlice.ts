import {
  ComponentState,
  ModuleMetadata,
  ModuleState,
  PageState,
} from "@yext/studio-plugin";
import DOMRectProperties from "../DOMRectProperties";

export interface PagesRecord {
  [pageName: string]: PageState;
}

export interface PageSliceStates {
  /** All constructed pages that can be preview in Studio. */
  pages: PagesRecord;
  /** The name of the current page display in Studio. */
  activePageName: string | undefined;
  /** The uuid of the current component display in Studio. */
  activeComponentUUID?: string;
  /** The entity file whose data is seeding the active preview page. */
  activeEntityFile?: string;
  /** The DOMRect of the active component, for highlighting purposes. */
  activeComponentRect?: DOMRectProperties;
  /**
   * The part of state that tracks which pages have been interacted with from
   * the UI and have changes pending on commit.
   */
  pendingChanges: {
    /** The names of pages that need to be removed from the user's file system. */
    pagesToRemove: Set<string>;
    /**
     * The names of pages (new or existing) that need to be updated in the
     * user's file system.
     */
    pagesToUpdate: Set<string>;
  };
  /**
   * The {@link ComponentState.uuid} for the module currently being edited, if it exists.
   */
  moduleUUIDBeingEdited?: string;
}

interface PageSliceActions {
  addPage: (pageName: string, page: PageState) => void;
  removePage: (filepath: string) => void;

  setActivePage: (pageName: string | undefined) => void;
  setActivePageState: (pageState: PageState) => void;
  getActivePageState: () => PageState | undefined;
  setComponentTreeInPage: (
    pageName: string,
    componentTree: ComponentState[]
  ) => void;
  getModuleStateBeingEdited: () => ModuleState | undefined;

  setActiveComponentUUID: (activeComponentUUID: string | undefined) => void;
  setActiveComponentRect: (rect: DOMRectProperties | undefined) => void;
  setActiveEntityFile: (activeEntityFile?: string) => boolean;
  setModuleUUIDBeingEdited: (moduleStateUUID: string | undefined) => void;

  detachAllModuleInstances: (metadata: ModuleMetadata) => void;
}

/**
 * Maintains information about pages and components parsed by Studio plugin
 * and composed by user through Studio, including the active page and component
 * state on preview.
 */
type PageSlice = PageSliceStates & PageSliceActions;
export default PageSlice;
