import { ComponentState, PageState, PropValues } from "@yext/studio-plugin";

export interface PageSliceStates {
  /** All constructed pages that can be preview in Studio. */
  pages: Record<string, PageState>;
  /** The name of the current page display in Studio. */
  activePageName: string;
  /** The uuid of the current component display in Studio. */
  activeComponentUUID?: string;
}

interface PageSliceActions {
  setPages: (state: Record<string, PageState>) => void;

  setActivePageState: (pageState: PageState) => void;
  getActivePageState: () => PageState;

  setActiveComponentUUID: (activeComponentUUID: string | undefined) => void;
  setActiveComponentProps: (props: PropValues) => void;
  getActiveComponentState: () => ComponentState | undefined;
}
/**
 * Maintains information about pages and components parsed by Studio plugin
 * and composed by user through Studio, including the active page and component
 * state on preview.
 */
export type PageSlice = PageSliceStates & PageSliceActions;
