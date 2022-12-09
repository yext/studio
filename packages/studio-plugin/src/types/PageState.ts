import { ComponentState } from "./ComponentState";

export type PageState = {
  componentTree: ComponentState[];
  cssImports: string[];
};
