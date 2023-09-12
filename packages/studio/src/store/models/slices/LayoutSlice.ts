import { LayoutMetadata } from "@yext/studio-plugin";

export interface LayoutSlice {
  /**
   * A mapping of name to metadata for all layouts that can be applied through
   * Studio.
   */
  layouts: Record<string, LayoutMetadata>;
}
