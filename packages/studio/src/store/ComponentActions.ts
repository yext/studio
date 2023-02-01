import { ComponentState, PropValues } from "@yext/studio-plugin";
import FileMetadataSlice from "./models/slices/FileMetadataSlice";
import PageSlice from "./models/slices/PageSlice";
import { StudioStore } from "./models/StudioStore";

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
    return this.getComponentTree()
      ?.find((component) => component.uuid === activeComponentUUID);
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
    const { activePageName, getModuleStateBeingEdited } = this.getPages();
    const moduleStateBeingEdited = getModuleStateBeingEdited();
    if (moduleStateBeingEdited) {
      this.getFileMetadatas().addComponentToModule(
        moduleStateBeingEdited.metadataUUID,
        componentState
      );
    } else if (activePageName) {
      this.getPages().addComponentToPage(activePageName, componentState);
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
}
