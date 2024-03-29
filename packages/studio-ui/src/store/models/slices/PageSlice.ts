import {
  ComponentState,
  ErrorPageState,
  GetPathVal,
  PageState,
  StreamScope,
} from "@yext/studio-plugin";
import DOMRectProperties from "../DOMRectProperties";

export interface PagesRecord {
  [pageName: string]: PageState;
}

export interface PageSliceStates {
  /** All constructed pages that can be preview in Studio. */
  pages: PagesRecord;
  /** All pages that cannot be previewed in Studio due to some parsing error. */
  errorPages: Record<string, ErrorPageState>;
  /** The name of the current page display in Studio. */
  activePageName: string | undefined;
  /** The uuid of the current component display in Studio. */
  activeComponentUUID?: string;
  /** The entity file whose data is seeding the active preview page. */
  activeEntityFile?: string;
  /**
   * A map of the file name to entity data for the entities that can be used
   * to seed the active preview page.
   */
  activePageEntities?: Record<string, Record<string, unknown>>;
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
}

interface PageSliceActions {
  addPage: (pageName: string, page: PageState) => void;
  removePage: (filepath: string) => void;

  setActivePage: (pageName: string | undefined) => void;
  getActivePageState: () => PageState | undefined;
  setComponentTreeInPage: (
    pageName: string,
    componentTree: ComponentState[]
  ) => void;
  updateGetPathValue: (pageName: string, getPathValue: GetPathVal) => void;
  updateStreamScope: (pageName: string, newStreamScope: StreamScope) => void;
  setEntityFiles: (pageName: string, entityFiles: string[] | undefined) => void;

  setActiveComponentUUID: (activeComponentUUID: string | undefined) => void;
  setActiveComponentRect: (rect: DOMRectProperties | undefined) => void;

  setActiveEntityFile: (activeEntityFile?: string) => void;
  setActivePageEntities: (
    entities?: Record<string, Record<string, unknown>>
  ) => void;
  getActiveEntityData: () => Record<string, unknown> | undefined;

  clearPendingChanges: () => void;
}

/**
 * Maintains information about pages and components parsed by Studio plugin
 * and composed by user through Studio, including the active page and component
 * state on preview.
 */
type PageSlice = PageSliceStates & PageSliceActions;
export default PageSlice;
