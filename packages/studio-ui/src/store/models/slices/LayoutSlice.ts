import { LayoutState } from "@yext/studio-plugin";

export interface LayoutSlice {
  /**
   * A mapping of name to LayoutState for layouts that can be applied via Studio.
   */
  layoutNameToLayoutState: Record<string, LayoutState>;
}
