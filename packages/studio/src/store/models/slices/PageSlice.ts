import {
  ComponentState,
  ModuleMetadata,
  ModuleState,
  PageState,
  PropValues,
} from "@yext/studio-plugin";

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
   * The current active module if one exists. This will take precedence over the PageState
   * for things like adding components.
   */
  activeModuleState?: ModuleState;
}

interface PageSliceActions {
  addPage: (filepath: string) => boolean;
  removePage: (filepath: string) => void;
  setPagesRecord: (pages: PagesRecord) => void;

  setActivePageName: (pageName: string | undefined) => void;
  setActivePageState: (pageState: PageState) => void;
  getActivePageState: () => PageState | undefined;

  setActiveComponentUUID: (activeComponentUUID: string | undefined) => void;
  setComponentProps: (
    pageName: string,
    componentUUID: string,
    props: PropValues
  ) => void;
  setActiveEntityFile: (activeEntityFile?: string) => boolean;
  setActiveModuleState: (moduleState: ModuleState | undefined) => void;
  setComponentTreeInPage: (
    pageName: string,
    componentTree: ComponentState[]
  ) => void;
  addComponentToPage: (
    pageName: string,
    componentState: ComponentState
  ) => void;
  removeComponentFromPage: (pageName: string, uuidToRemove: string) => void;

  detachAllModuleInstances: (metadata: ModuleMetadata) => void;
}

/**
 * Maintains information about pages and components parsed by Studio plugin
 * and composed by user through Studio, including the active page and component
 * state on preview.
 */
type PageSlice = PageSliceStates & PageSliceActions;
export default PageSlice;
