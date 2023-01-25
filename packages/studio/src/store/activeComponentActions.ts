import {
  ComponentState,
  PropValues,
} from "@yext/studio-plugin";
import { ActiveComponentActions, StudioStore } from "./models/store";

export default function createActiveComponentActions(
  get: () => StudioStore
): ActiveComponentActions {
  return {
    getComponentTree: () => {
      const store = get();
      const activeModuleState = store.pages.activeModuleState;
      if (activeModuleState) {
        return store.fileMetadatas.getModuleMetadata(
          activeModuleState.metadataUUID
        ).componentTree;
      }
      return store.pages.getActivePageState()?.componentTree ?? [];
    },
    getActiveComponentState: () => {
      const { activeComponentUUID } = get().pages;
      return get().getComponentTree().find(
        (component) => component.uuid === activeComponentUUID
      );
    },
    updateActiveComponentProps: (props: PropValues) => {
      const store = get();
      const { activeComponentUUID, activePageName, activeModuleState } = store.pages;
      if (!activeComponentUUID) {
        console.error(
          "Error in setActiveComponentProps: No active component selected in store."
        );
        return;
      }

      if (activeModuleState) {
        store.fileMetadatas.updateComponentPropsInsideModule(activeModuleState.metadataUUID, activeComponentUUID, props);
      } else if (activePageName) {
        store.pages.setComponentProps(activePageName, activeComponentUUID, props);
      }
    },
    updateComponentTree: (componentTree: ComponentState[]) => {
      const store = get();
      const activeModuleState = store.pages.activeModuleState;
      const activePageName = store.pages.activePageName;
  
      if (activeModuleState) {
        store.fileMetadatas.setComponentTreeInModule(activeModuleState.metadataUUID, componentTree);
      } else if (activePageName) {
        store.pages.setComponentTreeInPage(activePageName, componentTree);
      }
    }
  };
}
