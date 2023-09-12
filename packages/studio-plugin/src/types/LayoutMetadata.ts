import { ComponentState } from "./ComponentState";

export type LayoutMetadata = {
  componentTree: ComponentState[];
  cssImports: string[];
  filepath: string;
};
