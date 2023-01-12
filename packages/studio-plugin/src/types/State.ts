import { PropValues } from "./PropValues";

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

export type ComponentState =
  | StandardOrModuleComponentState
  | FragmentState
  | BuiltInState;
export enum ComponentStateKind {
  Standard = "standard",
  Module = "module",
  Fragment = "fragment", // when the component is a React.Fragment,
  BuiltIn = "builtIn", // for built in elements like div and img
}

export type StandardOrModuleComponentState = {
  kind: ComponentStateKind.Standard | ComponentStateKind.Module;
  /** The name of the component (i.e. Card or Banner). */
  componentName: string;
  /** Represents the props of the component. */
  props: PropValues;
  /** A unique UUID for this specific component instance. */
  uuid: string;
  /**
   * The UUID of the corresponding StandardComponentMetadata or ModuleMetadata.
   */
  metadataUUID: string;
  /** The UUID of the parent component in the tree, if one exists. */
  parentUUID?: string;
  /** A secondary name of the component, for cosmetic purposes. */
  prettyName?: string;
};

type FragmentState = {
  kind: ComponentStateKind.Fragment;
  uuid: string;
  parentUUID?: string;
};

export type BuiltInState = {
  kind: ComponentStateKind.BuiltIn;
  componentName: string;
  uuid: string;
  /** We currently do not support props on built in elements. */
  // eslint-disable-next-line @typescript-eslint/ban-types
  props: {};
  parentUUID?: string;
};
