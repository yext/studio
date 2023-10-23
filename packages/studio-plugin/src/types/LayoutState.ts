import { ComponentState } from "./ComponentState";

export type LayoutState = {
  componentTree: ComponentState[];
  styleImports: string[];
  filepath: string;
};
