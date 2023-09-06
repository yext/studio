import { LayoutState } from "@yext/studio-plugin";

export interface LayoutsSlice {
  /** All constructed pages that can be preview in Studio. */
  layouts: Record<string, LayoutState>;
}
