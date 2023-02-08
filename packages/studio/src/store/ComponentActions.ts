import {
  ComponentState,
  ComponentStateKind,
  ComponentTreeHelpers,
  ModuleMetadata,
  ModuleState,
  PropValues,
} from "@yext/studio-plugin";
import FileMetadataSlice from "./models/slices/FileMetadataSlice";
import PageSlice from "./models/slices/PageSlice";
import { v4 } from "uuid";

export default class ComponentActions {
  constructor(
    private getPages: () => PageSlice,
    private getFileMetadatas: () => FileMetadataSlice
  ) {}

  getComponentTree = () => {
    const moduleStateBeingEdited = this.getPages().getModuleStateBeingEdited();
    if (moduleStateBeingEdited) {
      return this.getFileMetadatas().getModuleMetadata(
        moduleStateBeingEdited.metadataUUID
      ).componentTree;
    }
    return this.getPages().getActivePageState()?.componentTree;
  };

  getActiveComponentState = () => {
    const { activeComponentUUID } = this.getPages();
    return this.getComponentTree()?.find(
      (component) => component.uuid === activeComponentUUID
    );
  };

  updateActiveComponentProps = (props: PropValues) => {
    const { activeComponentUUID, activePageName, getModuleStateBeingEdited } =
      this.getPages();
    if (!activeComponentUUID) {
      console.error(
        "Error in updateActiveComponentProps: No active component in this.get()."
      );
      return;
    }

    const moduleStateBeingEdited = getModuleStateBeingEdited();
    if (moduleStateBeingEdited) {
      this.getFileMetadatas().updateComponentPropsInsideModule(
        moduleStateBeingEdited.metadataUUID,
        activeComponentUUID,
        props
      );
    } else if (activePageName) {
      this.getPages().setComponentProps(
        activePageName,
        activeComponentUUID,
        props
      );
    }
  };

  updateComponentTree = (componentTree: ComponentState[]) => {
    const moduleStateBeingEdited = this.getPages().getModuleStateBeingEdited();
    const activePageName = this.getPages().activePageName;

    if (moduleStateBeingEdited) {
      this.getFileMetadatas().setComponentTreeInModule(
        moduleStateBeingEdited.metadataUUID,
        componentTree
      );
    } else if (activePageName) {
      this.getPages().setComponentTreeInPage(activePageName, componentTree);
    }
  };

  addComponent = (componentState: ComponentState) => {
    const { activePageName, getModuleStateBeingEdited, activeComponentUUID } =
      this.getPages();

    const activeComponentState = this.getActiveComponentState();
    const activeComponentMetadata =
      activeComponentState?.kind === ComponentStateKind.Standard
        ? this.getFileMetadatas().getComponentMetadata(
            activeComponentState.metadataUUID
          )
        : undefined;
    const activeComponentIsParent =
      activeComponentMetadata?.acceptsChildren ||
      activeComponentState?.kind === ComponentStateKind.Fragment ||
      activeComponentState?.kind === ComponentStateKind.BuiltIn;
    const parentUUID = activeComponentIsParent
      ? activeComponentState?.uuid
      : activeComponentState?.parentUUID;
    const updatedComponentState = {
      ...componentState,
      parentUUID,
    };

    const tree = this.getComponentTree();
    if (tree && !activeComponentIsParent) {
      const activeComponentIndex = tree.findIndex(
        (c) => c.uuid === activeComponentUUID
      );
      if (activeComponentIndex >= 0) {
        const updatedTree = [...tree];
        updatedTree.splice(activeComponentIndex + 1, 0, updatedComponentState);
        return this.updateComponentTree(updatedTree);
      }
    }
    const moduleStateBeingEdited = getModuleStateBeingEdited();
    if (moduleStateBeingEdited) {
      this.getFileMetadatas().addComponentToModule(
        moduleStateBeingEdited.metadataUUID,
        updatedComponentState
      );
    } else if (activePageName) {
      this.getPages().addComponentToPage(activePageName, updatedComponentState);
    }
  };

  removeComponent = (componentUUID: string) => {
    const { activePageName, getModuleStateBeingEdited } = this.getPages();
    const moduleStateBeingEdited = getModuleStateBeingEdited();
    if (moduleStateBeingEdited) {
      this.getFileMetadatas().removeComponentFromModule(
        moduleStateBeingEdited.metadataUUID,
        componentUUID
      );
    } else if (activePageName) {
      this.getPages().removeComponentFromPage(activePageName, componentUUID);
    }
    if (this.getPages().activeComponentUUID === componentUUID) {
      this.getPages().setActiveComponentUUID(undefined);
    }
  };

  /**
   * @param moduleMetadata - the {@link ModuleMetadata} of the module to detach.
   * @param instanceUUID - the instance to detach.
   */
  detachModuleInstance = (
    moduleMetadata: ModuleMetadata,
    moduleState: ModuleState
  ) => {
    const currentComponentTree = this.getComponentTree();
    if (!currentComponentTree) {
      return;
    }
    const updatedComponentTree = currentComponentTree.flatMap(
      (componentState) => {
        if (componentState.uuid !== moduleState.uuid) {
          return componentState;
        }
        return ComponentTreeHelpers.mapComponentTreeParentsFirst<ComponentState>(
          moduleMetadata.componentTree,
          (child, parentValue) => {
            return {
              ...child,
              uuid: v4(),
              parentUUID: parentValue?.uuid ?? componentState.parentUUID,
            };
          }
        );
      }
    );
    this.updateComponentTree(updatedComponentTree);
  };
}
