import {
  ComponentState,
  ComponentTreeHelpers,
  MessageID,
  ModuleMetadata,
  ModuleState,
  PropValues,
} from "@yext/studio-plugin";
import FileMetadataSlice from "./models/slices/FileMetadataSlice";
import PageSlice from "./models/slices/PageSlice";
import { v4 } from "uuid";
import sendMessage from "../messaging/sendMessage";
import { cloneDeep } from "lodash";
import SiteSettingSlice from "./models/slices/SiteSettingsSlice";
import PreviousSaveSlice from "./models/slices/PreviousSaveSlice";

export default class StudioActions {
  constructor(
    private getPages: () => PageSlice,
    private getFileMetadatas: () => FileMetadataSlice,
    private getSiteSettings: () => SiteSettingSlice,
    private getPreviousSave: () => PreviousSaveSlice
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

  deploy = () => {
    sendMessage(MessageID.Deploy, this.getSaveData());
    this.updatePreviousSave();
  }

  saveChanges = () => {
    sendMessage(MessageID.SaveChanges, this.getSaveData());
    this.updatePreviousSave();
  };

  private updatePreviousSave() {
    const { UUIDToFileMetadata } =
      this.getFileMetadatas();
    const { values } = this.getSiteSettings();
    const previousSaveState = cloneDeep({
      siteSettings: {
        values,
      },
      fileMetadatas: {
        UUIDToFileMetadata,
      },
    });
    this.getPreviousSave().setPreviousSave(previousSaveState)
  }

  private getSaveData() {
    const { pages, pendingChanges: pendingPageChanges } = this.getPages();
    const { pagesToRemove, pagesToUpdate } = pendingPageChanges;
    const { UUIDToFileMetadata, pendingChanges: pendingModuleChanges } =
      this.getFileMetadatas();
    const { modulesToUpdate } = pendingModuleChanges;
    const { values } = this.getSiteSettings();
    return {
      pageNameToPageState: pages,
      UUIDToFileMetadata,
      pendingChanges: {
        pagesToRemove: [...pagesToRemove.keys()],
        pagesToUpdate: [...pagesToUpdate],
        modulesToUpdate: [...modulesToUpdate.keys()],
      },
      siteSettings: { values },
    };
  }
}
