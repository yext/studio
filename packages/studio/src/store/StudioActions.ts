import {
  ComponentState,
  ComponentStateKind,
  ComponentTreeHelpers,
  MessageID,
  ModuleMetadata,
  ModuleState,
  PropValues,
  TypeGuards,
} from "@yext/studio-plugin";
import FileMetadataSlice from "./models/slices/FileMetadataSlice";
import PageSlice from "./models/slices/PageSlice";
import { v4 } from "uuid";
import sendMessage from "../messaging/sendMessage";
import { cloneDeep } from "lodash";
import SiteSettingsSlice from "./models/slices/SiteSettingsSlice";
import PreviousSaveSlice from "./models/slices/PreviousSaveSlice";
import StudioConfigSlice from "./models/slices/StudioConfigSlice";
import AddComponentAction from "./StudioActions/AddComponentAction";
import CreateComponentStateAction from "./StudioActions/CreateComponentStateAction";
import UpdateActivePageAction from "./StudioActions/UpdateActivePageAction";
import ImportComponentAction from "./StudioActions/ImportComponentAction";
import GenerateTestDataAction from "./StudioActions/GenerateTestDataAction";
import CreatePageAction from "./StudioActions/CreatePageAction";
import dynamicImportFromBrowser from "../utils/dynamicImportFromBrowser";
import path from "path-browserify";

export default class StudioActions {
  public addComponent: AddComponentAction["addComponent"];
  public createComponentState: CreateComponentStateAction["createComponentState"];
  public updateActivePage: UpdateActivePageAction["updateActivePage"];
  public importComponent: ImportComponentAction["importComponent"];
  public generateTestData: GenerateTestDataAction["generateTestData"];
  public createPage: CreatePageAction["createPage"];

  constructor(
    private getPages: () => PageSlice,
    private getFileMetadatas: () => FileMetadataSlice,
    private getSiteSettings: () => SiteSettingsSlice,
    private getPreviousSave: () => PreviousSaveSlice,
    private getStudioConfig: () => StudioConfigSlice
  ) {
    this.addComponent = new AddComponentAction(this).addComponent;
    this.createComponentState =
      new CreateComponentStateAction().createComponentState;
    this.updateActivePage = new UpdateActivePageAction(
      getPages,
      this
    ).updateActivePage;
    this.importComponent = new ImportComponentAction(
      getFileMetadatas
    ).importComponent;
    this.generateTestData = new GenerateTestDataAction(
      getPages,
      this
    ).generateTestData;
    this.createPage = new CreatePageAction(
      this,
      getPages,
      getStudioConfig
    ).createPage;
  }

  getComponentTree = () => {
    const moduleMetadataBeingEdited = this.getModuleMetadataBeingEdited();
    return moduleMetadataBeingEdited
      ? moduleMetadataBeingEdited.componentTree
      : this.getPages().getActivePageState()?.componentTree;
  };

  getComponentState = (componentTree?: ComponentState[], uuid?: string) => {
    return componentTree?.find((component) => component.uuid === uuid);
  };

  getActiveComponentState = () => {
    const activeComponentUUID = this.getPages().activeComponentUUID;
    return this.getComponentState(this.getComponentTree(), activeComponentUUID);
  };

  getComponentHasChildren = (uuid: string) => {
    return this.getComponentTree()?.some((c) => c.parentUUID === uuid);
  };

  getComponentMetadata = (componentState?: ComponentState) => {
    if (componentState?.kind !== ComponentStateKind.Standard) {
      return undefined;
    }
    return this.getFileMetadatas().getComponentMetadata(
      componentState.metadataUUID
    );
  };

  getModuleMetadataBeingEdited = () => {
    const { moduleUUIDBeingEdited, getActivePageState } = this.getPages();
    const state = this.getComponentState(
      getActivePageState()?.componentTree,
      moduleUUIDBeingEdited
    );
    if (!state || !TypeGuards.isModuleState(state)) {
      return undefined;
    }
    return this.getFileMetadatas().getModuleMetadata(state.metadataUUID);
  };

  updateActiveComponentProps = (props: PropValues) => {
    const activeComponentState = this.getActiveComponentState();
    if (!activeComponentState) {
      console.error(
        "Error in updateActiveComponentProps: No active component found."
      );
      return;
    }
    if (
      activeComponentState.kind === ComponentStateKind.BuiltIn ||
      activeComponentState.kind === ComponentStateKind.Fragment
    ) {
      throw new Error(
        "Error in updateActiveComponentProps: Cannot update props for BuiltIn or Fragment components."
      );
    }

    const updatedComponentState = TypeGuards.isRepeaterState(
      activeComponentState
    )
      ? {
          ...activeComponentState,
          repeatedComponent: {
            ...activeComponentState.repeatedComponent,
            props,
          },
        }
      : { ...activeComponentState, props };

    this.replaceComponentState(
      activeComponentState.uuid,
      updatedComponentState
    );
  };

  updateComponentTree = (componentTree: ComponentState[]) => {
    const moduleMetadataBeingEdited = this.getModuleMetadataBeingEdited();
    const activePageName = this.getPages().activePageName;

    if (moduleMetadataBeingEdited) {
      this.getFileMetadatas().setComponentTreeInModule(
        moduleMetadataBeingEdited.metadataUUID,
        componentTree
      );
    } else if (activePageName) {
      this.getPages().setComponentTreeInPage(activePageName, componentTree);
    }
  };

  replaceComponentState = (
    uuidToReplace: string,
    newComponentState: ComponentState
  ) => {
    const currentComponentTree = this.getComponentTree();
    if (!currentComponentTree) {
      return;
    }
    const updatedComponentTree = currentComponentTree.flatMap((c) => {
      if (c.uuid === uuidToReplace) {
        return newComponentState;
      }
      return c;
    });
    this.updateComponentTree(updatedComponentTree);
  };

  removeComponent = (componentUUID: string) => {
    const componentTree = this.getComponentTree();
    if (!componentTree) {
      return;
    }
    const updatedComponentTree = ComponentTreeHelpers.mapComponentTree<
      ComponentState[]
    >(componentTree, (componentState, mappedChildren) => {
      return componentState.uuid === componentUUID
        ? []
        : [componentState, ...mappedChildren.flat()];
    }).flat();
    this.updateComponentTree(updatedComponentTree);
    if (this.getPages().activeComponentUUID === componentUUID) {
      this.getPages().setActiveComponentUUID(undefined);
    }
    if (this.getPages().selectedComponentUUIDs.has(componentUUID)) {
      this.getPages().selectedComponentUUIDs.delete(componentUUID);
      delete this.getPages().selectedComponentRectsMap[componentUUID];
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
    this.getPages().clearPendingChanges();
  };

  saveChanges = async () => {
    await sendMessage(MessageID.SaveChanges, this.getSaveData());
    this.updatePreviousSave();
    this.getPages().clearPendingChanges();
  };

  refreshActivePageEntities = async () => {
    const entityFiles =
      this.getPages().getActivePageState()?.pagesJS?.entityFiles;
    if (!entityFiles?.length) {
      this.getPages().setActivePageEntities(undefined);
      return;
    }

    const localDataFolder = this.getStudioConfig().paths.localData;
    const entityEntries = await Promise.all(
      entityFiles.map(async (entityFile) => {
        const entityData = (
          await dynamicImportFromBrowser(path.join(localDataFolder, entityFile))
        ).default;
        return [entityFile, entityData];
      })
    );
    const entitiesRecord = Object.fromEntries(entityEntries);
    this.getPages().setActivePageEntities(entitiesRecord);
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
}
