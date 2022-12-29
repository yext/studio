import { ComponentState, PageState, PropValues } from "@yext/studio-plugin";

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
  /**
   * The part of state that tracks which pages have been interacted with from
   * the UI and have changes pending on commit.
   */
  pendingChanges: {
    /**
     * The names of pages (new or existing) that need to be updated in the
     * user's file system.
     */
    pagesToUpdate: Set<string>;
  };
}

interface PageSliceActions {
  setActivePageName: (pageName: string) => void;
  setActivePageState: (pageState: PageState) => void;
  getActivePageState: () => PageState | undefined;
  addPage: (filepath: string) => boolean;

  setActiveComponentUUID: (activeComponentUUID: string | undefined) => void;
  setActiveComponentProps: (props: PropValues) => void;
  getActiveComponentState: () => ComponentState | undefined;
}

/**
 * Maintains information about pages and components parsed by Studio plugin
 * and composed by user through Studio, including the active page and component
 * state on preview.
 */
type PageSlice = PageSliceStates & PageSliceActions;
export default PageSlice;
