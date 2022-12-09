import { PropValues } from "./PropValues";

export type PageState = {
  componentTree: ComponentState[],
  cssImports: string[]
};

export type ComponentState = StandardOrModuleComponentState | FragmentState;
export enum ComponentStateKind {
  Standard = "standard",
  Module = "module",
  Fragment = "fragment", // when the component is a React.Fragment
}

type StandardOrModuleComponentState = {
  kind: ComponentStateKind.Standard | ComponentStateKind.Module,
  /** The name of the component (i.e. Card or Banner). */
  componentName: string,
  /** Represents the props of the component. */
  props: PropValues,
  /** A unique UUID for this specific component instance. */
  uuid: string,
  /**
   * The UUID of the corresponding StandardComponentMetadata or ModuleMetadata,
   * if it exists (i.e. not an instance of a builtIn component).
   */
  metadataUUID?: string,
  /** The UUID of the parent component in the tree, if one exists. */
  parentUUID?: string,
};

type FragmentState = {
  kind: ComponentStateKind.Fragment,
  uuid: string,
  parentUUID?: string,
};
