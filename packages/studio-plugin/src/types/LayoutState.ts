import { ComponentState } from "./ComponentState";

export type LayoutState = {
  componentTree: ComponentState[];
  cssImports: string[];
  filepath: string;
};
