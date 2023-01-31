import { ComponentState, PropValues } from "@yext/studio-plugin";
import { StudioStore } from "./models/StudioStore";

export default class StudioActions {
  constructor(private getStore: () => StudioStore) {}

  getComponentTree() {
    const store = this.getStore();
    const moduleStateBeingEdited = store.pages.getModuleStateBeingEdited();
    if (moduleStateBeingEdited) {
      return store.fileMetadatas.getModuleMetadata(
        moduleStateBeingEdited.metadataUUID
      ).componentTree;
    }
    return store.pages.getActivePageState()?.componentTree;
  }

  getActiveComponentState() {
    const { activeComponentUUID } = this.getStore().pages;
    return this.getStore()
      .actions
      .getComponentTree()
      ?.find((component) => component.uuid === activeComponentUUID);
  }

  updateActiveComponentProps(props: PropValues) {
    const store = this.getStore();
    const { activeComponentUUID, activePageName, getModuleStateBeingEdited } =
      store.pages;
    if (!activeComponentUUID) {
      console.error(
        "Error in updateActiveComponentProps: No active component in store."
      );
      return;
    }

    const moduleStateBeingEdited = getModuleStateBeingEdited();
    if (moduleStateBeingEdited) {
      store.fileMetadatas.updateComponentPropsInsideModule(
        moduleStateBeingEdited.metadataUUID,
        activeComponentUUID,
        props
      );
    } else if (activePageName) {
      store.pages.setComponentProps(
        activePageName,
        activeComponentUUID,
        props
      );
    }
  }

  updateComponentTree(componentTree: ComponentState[]) {
    const store = this.getStore();
    const moduleStateBeingEdited = store.pages.getModuleStateBeingEdited();
    const activePageName = store.pages.activePageName;

    if (moduleStateBeingEdited) {
      store.fileMetadatas.setComponentTreeInModule(
        moduleStateBeingEdited.metadataUUID,
        componentTree
      );
    } else if (activePageName) {
      store.pages.setComponentTreeInPage(activePageName, componentTree);
    }
  }

  addComponent(componentState: ComponentState) {
    const store = this.getStore();
    const { activePageName, getModuleStateBeingEdited } = store.pages;
    const moduleStateBeingEdited = getModuleStateBeingEdited();
    if (moduleStateBeingEdited) {
      store.fileMetadatas.addComponentToModule(
        moduleStateBeingEdited.metadataUUID,
        componentState
      );
    } else if (activePageName) {
      store.pages.addComponentToPage(activePageName, componentState);
    }
  }

  removeComponent(componentUUID: string) {
    const store = this.getStore();
    const { activePageName, getModuleStateBeingEdited } = store.pages;
    const moduleStateBeingEdited = getModuleStateBeingEdited();
    if (moduleStateBeingEdited) {
      store.fileMetadatas.removeComponentFromModule(
        moduleStateBeingEdited.metadataUUID,
        componentUUID
      );
    } else if (activePageName) {
      store.pages.removeComponentFromPage(activePageName, componentUUID);
    }
    if (store.pages.activeComponentUUID === componentUUID) {
      store.pages.setActiveComponentUUID(undefined);
    }
  }
}