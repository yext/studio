import { ComponentState, PropValues } from "@yext/studio-plugin";
import { StudioStore } from "./models/StudioStore";

export default class ComponentActions {
  constructor(private get: () => StudioStore) {}

  getComponentTree = () => {
    const moduleStateBeingEdited = this.get().pages.getModuleStateBeingEdited();
    if (moduleStateBeingEdited) {
      return this.get().fileMetadatas.getModuleMetadata(
        moduleStateBeingEdited.metadataUUID
      ).componentTree;
    }
    return this.get().pages.getActivePageState()?.componentTree;
  };

  getActiveComponentState = () => {
    const { activeComponentUUID } = this.get().pages;
    return this.get()
      .actions.getComponentTree()
      ?.find((component) => component.uuid === activeComponentUUID);
  };

  updateActiveComponentProps = (props: PropValues) => {
    const { activeComponentUUID, activePageName, getModuleStateBeingEdited } =
      this.get().pages;
    if (!activeComponentUUID) {
      console.error(
        "Error in updateActiveComponentProps: No active component in this.get()."
      );
      return;
    }

    const moduleStateBeingEdited = getModuleStateBeingEdited();
    if (moduleStateBeingEdited) {
      this.get().fileMetadatas.updateComponentPropsInsideModule(
        moduleStateBeingEdited.metadataUUID,
        activeComponentUUID,
        props
      );
    } else if (activePageName) {
      this.get().pages.setComponentProps(
        activePageName,
        activeComponentUUID,
        props
      );
    }
  };

  updateComponentTree = (componentTree: ComponentState[]) => {
    const moduleStateBeingEdited = this.get().pages.getModuleStateBeingEdited();
    const activePageName = this.get().pages.activePageName;

    if (moduleStateBeingEdited) {
      this.get().fileMetadatas.setComponentTreeInModule(
        moduleStateBeingEdited.metadataUUID,
        componentTree
      );
    } else if (activePageName) {
      this.get().pages.setComponentTreeInPage(activePageName, componentTree);
    }
  };

  addComponent = (componentState: ComponentState) => {
    const { activePageName, getModuleStateBeingEdited } = this.get().pages;
    const moduleStateBeingEdited = getModuleStateBeingEdited();
    if (moduleStateBeingEdited) {
      this.get().fileMetadatas.addComponentToModule(
        moduleStateBeingEdited.metadataUUID,
        componentState
      );
    } else if (activePageName) {
      this.get().pages.addComponentToPage(activePageName, componentState);
    }
  };

  removeComponent = (componentUUID: string) => {
    const { activePageName, getModuleStateBeingEdited } = this.get().pages;
    const moduleStateBeingEdited = getModuleStateBeingEdited();
    if (moduleStateBeingEdited) {
      this.get().fileMetadatas.removeComponentFromModule(
        moduleStateBeingEdited.metadataUUID,
        componentUUID
      );
    } else if (activePageName) {
      this.get().pages.removeComponentFromPage(activePageName, componentUUID);
    }
    if (this.get().pages.activeComponentUUID === componentUUID) {
      this.get().pages.setActiveComponentUUID(undefined);
    }
  };
}
