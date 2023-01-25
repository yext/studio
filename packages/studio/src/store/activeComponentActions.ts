import { ComponentState, PropValues } from "@yext/studio-plugin";
import { ActiveComponentActions, StudioStore } from "./models/store";

export default function createActiveComponentActions(
  get: () => StudioStore
): ActiveComponentActions {
  return {
    getComponentTree: () => {
      const store = get();
      const moduleStateBeingEdited = store.pages.getModuleStateBeingEdited();
      if (moduleStateBeingEdited) {
        return store.fileMetadatas.getModuleMetadata(
          moduleStateBeingEdited.metadataUUID
        ).componentTree;
      }
      return store.pages.getActivePageState()?.componentTree;
    },
    getActiveComponentState: () => {
      const { activeComponentUUID } = get().pages;
      return get()
        .getComponentTree()
        ?.find((component) => component.uuid === activeComponentUUID);
    },
    updateActiveComponentProps: (props: PropValues) => {
      const store = get();
      const { activeComponentUUID, activePageName, getModuleStateBeingEdited } =
        store.pages;
      if (!activeComponentUUID) {
        console.error(
          "Error in setActiveComponentProps: No active component selected in store."
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
    },
    updateComponentTree: (componentTree: ComponentState[]) => {
      const store = get();
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
    },
  };
}
