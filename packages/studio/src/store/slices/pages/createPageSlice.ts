import {
  ComponentState,
  ComponentStateHelpers,
  PageState,
  TypeGuards,
} from "@yext/studio-plugin";
import { isEqual } from "lodash";
import initialStudioData from "virtual:yext-studio";
import DOMRectProperties from "../../models/DOMRectProperties";
import PageSlice, { PageSliceStates } from "../../models/slices/PageSlice";
import { SliceCreator } from "../../models/utils";
import createDetachAllModuleInstances from "./detachAllModuleInstances";

const firstPageEntry = Object.entries(
  initialStudioData.pageNameToPageState
)?.[0];

const initialStates: PageSliceStates = {
  pages: initialStudioData.pageNameToPageState,
  activePageName: firstPageEntry?.[0],
  activeEntityFile: firstPageEntry?.[1]?.["entityFiles"]?.[0],
  activeComponentUUID: undefined,
  activeComponentRect: undefined,
  pendingChanges: {
    pagesToRemove: new Set<string>(),
    pagesToUpdate: new Set<string>(),
  },
  moduleUUIDBeingEdited: undefined,
};

export const createPageSlice: SliceCreator<PageSlice> = (set, get) => {
  const pageActions = {
    addPage: (pageName: string, page: PageState) => {
      if (get().pages[pageName]) {
        throw new Error(
          `Error adding page: page name "${pageName}" is already used.`
        );
      }

      set((store) => {
        store.pages[pageName] = page;
        store.pendingChanges.pagesToUpdate.add(pageName);
      });
    },
    removePage: (pageName: string) => {
      set((store) => {
        delete store.pages[pageName];
        if (pageName === store.activePageName) {
          get().setActivePage(undefined);
        }
        const { pagesToRemove, pagesToUpdate } = store.pendingChanges;
        pagesToUpdate.delete(pageName);
        pagesToRemove.add(pageName);
      });
    },
    setComponentTreeInPage: (
      pageName: string,
      componentTree: ComponentState[]
    ) => {
      set((store) => {
        const originalComponentTree = store.pages[pageName].componentTree;
        store.pages[pageName].componentTree = componentTree;
        if (!isEqual(originalComponentTree, componentTree)) {
          store.pendingChanges.pagesToUpdate.add(pageName);
        }
      });
    },
  };

  const activePageActions = {
    setActivePage: (activePageName: string | undefined) => {
      if (activePageName === undefined) {
        set({
          activePageName,
          activeComponentUUID: undefined,
          activeEntityFile: undefined,
        });
      } else {
        const activePageState = get().pages[activePageName];
        if (activePageState) {
          set({
            activePageName,
            activeComponentUUID: undefined,
            activeEntityFile: activePageState.entityFiles?.[0],
          });
        } else {
          console.error(
            `Error in setActivePage: Page "${activePageName}" is not found in Store. Unable to set it as active page.`
          );
        }
      }
    },
    setActivePageState: (pageState: PageState) =>
      set((store) => {
        if (!store.activePageName) {
          console.error(
            "Tried to setActivePageState when activePageName was undefined"
          );
          return;
        }
        if (
          !pageState.componentTree.some(
            (component) => component.uuid === store.activeComponentUUID
          )
        ) {
          store.activeComponentUUID = undefined;
        }
        store.pages[store.activePageName] = pageState;
        store.pendingChanges.pagesToUpdate.add(store.activePageName);
      }),
    getActivePageState: () => {
      const { pages, activePageName } = get();
      if (!activePageName) {
        return;
      }
      return pages[activePageName];
    },
    getComponentStateInActivePage: (uuid: string) =>
      get()
        .getActivePageState()
        ?.componentTree.find((c) => c.uuid === uuid),
  };

  const pageComponentActions = {
    setActiveComponentUUID: (activeComponentUUID: string | undefined) => {
      set({ activeComponentUUID });
    },
    setActiveComponentRect: (rect: DOMRectProperties | undefined) => {
      set({ activeComponentRect: rect });
    },
    getActiveComponentState: () => {
      const { activeComponentUUID, getComponentStateInActivePage } = get();
      if (!activeComponentUUID) {
        return undefined;
      }
      return getComponentStateInActivePage(activeComponentUUID);
    },
  };

  const activeEntityFileActions = {
    setActiveEntityFile: (activeEntityFile?: string): boolean => {
      if (!activeEntityFile) {
        set({ activeEntityFile: undefined });
        return true;
      }
      const activePageName = get().activePageName;
      if (!activePageName) {
        console.error(
          `Error setting active entity file: no active page selected.`
        );
        return false;
      }
      if (get().pages[activePageName].entityFiles?.includes(activeEntityFile)) {
        set({ activeEntityFile });
        return true;
      }
      console.error(
        "Error setting active entity file:" +
          ` "${activeEntityFile}" is not an entity file for this page.`
      );
      return false;
    },
  };

  const moduleStateActions: Pick<
    PageSlice,
    "getModuleMetadataUUIDBeingEdited" | "setModuleUUIDBeingEdited"
  > = {
    getModuleMetadataUUIDBeingEdited(): string | undefined {
      const moduleUUIDBeingEdited = get().moduleUUIDBeingEdited;
      if (!moduleUUIDBeingEdited) {
        return;
      }
      const matchingState = get().getComponentStateInActivePage(
        moduleUUIDBeingEdited
      );
      if (
        !matchingState ||
        !TypeGuards.isEditableComponentState(matchingState)
      ) {
        return undefined;
      }
      const extractedState =
        ComponentStateHelpers.extractStandardOrModuleComponentState(
          matchingState
        );
      return TypeGuards.isModuleState(extractedState)
        ? extractedState.metadataUUID
        : undefined;
    },
    setModuleUUIDBeingEdited(moduleStateUUID: string | undefined) {
      set((store) => {
        store.moduleUUIDBeingEdited = moduleStateUUID;
      });
    },
  };

  return {
    ...initialStates,
    ...pageActions,
    ...activePageActions,
    ...pageComponentActions,
    ...activeEntityFileActions,
    ...moduleStateActions,
    detachAllModuleInstances: createDetachAllModuleInstances(get),
  };
};

export default createPageSlice;
