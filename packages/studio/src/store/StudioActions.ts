import {
  ComponentState,
  ComponentStateKind,
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
import SiteSettingsSlice from "./models/slices/SiteSettingsSlice";
import PreviousSaveSlice from "./models/slices/PreviousSaveSlice";
import path from "path-browserify";
import StudioConfigSlice from "./models/slices/StudioConfigSlice";

export default class StudioActions {
  constructor(
    private getPages: () => PageSlice,
    private getFileMetadatas: () => FileMetadataSlice,
    private getSiteSettings: () => SiteSettingsSlice,
    private getPreviousSave: () => PreviousSaveSlice,
    private getStudioConfig: () => StudioConfigSlice
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
    if (!tree) {
      return;
    }
    const activeComponentIndex = tree.findIndex(
      (c) => c.uuid === activeComponentState?.uuid
    );
    const insertionIndex = activeComponentIsParent
      ? 0
      : activeComponentIndex + 1;
    const updatedTree = [...tree];
    updatedTree.splice(insertionIndex, 0, updatedComponentState);
    return this.updateComponentTree(updatedTree);
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

  deploy = async () => {
    await sendMessage(MessageID.Deploy, this.getSaveData());
    this.updatePreviousSave();
  };

  saveChanges = async () => {
    await sendMessage(MessageID.SaveChanges, this.getSaveData());
    this.updatePreviousSave();
  };

  private updatePreviousSave = () => {
    const { UUIDToFileMetadata } = this.getFileMetadatas();
    const { values } = this.getSiteSettings();
    const previousSaveState = cloneDeep({
      siteSettings: {
        values,
      },
      fileMetadatas: {
        UUIDToFileMetadata,
      },
    });
    this.getPreviousSave().setPreviousSave(previousSaveState);
  };

  private getSaveData = () => {
    const { pages, pendingChanges: pendingPageChanges } = this.getPages();
    const { pagesToRemove, pagesToUpdate } = pendingPageChanges;
    const { UUIDToFileMetadata } = this.getFileMetadatas();
    const { values } = this.getSiteSettings();
    return {
      pageNameToPageState: pages,
      UUIDToFileMetadata,
      pendingChanges: {
        pagesToRemove: [...pagesToRemove.keys()],
        pagesToUpdate: [...pagesToUpdate],
      },
      siteSettings: { values },
    };
  };

  createPage = (pageName: string) => {
    if (!pageName) {
      throw new Error("Error adding page: a pageName is required.");
    }
    const pagesPath = this.getStudioConfig().paths.pages;
    const filepath = path.join(pagesPath, pageName + ".tsx");
    if (!path.isAbsolute(filepath) || !filepath.startsWith(pagesPath)) {
      throw new Error(`Error adding page: pageName is invalid: ${pageName}`);
    }
    this.getPages().addPage(pageName, {
      componentTree: [],
      cssImports: [],
      filepath,
    });
    this.getPages().setActivePage(pageName);
  };
}
