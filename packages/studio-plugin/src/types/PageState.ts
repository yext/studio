import { ComponentState } from "./ComponentState";

export type PageState = {
  pageName: string,
  componentTree: ComponentState[],
  cssImports: string[]
};