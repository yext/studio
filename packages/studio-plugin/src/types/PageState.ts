import { ComponentState } from "./ComponentState";

export type PageState = {
  componentTree: ComponentState[];
  cssImports: string[];
  filepath: string;
  /**
   * An array of names of entity files for this page.
   * e.g. ["locations__7f93c5160594d864417cee454f073ef3.json"]
   */
  entityFiles?: string[];
};
