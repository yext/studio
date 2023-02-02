import {
  ComponentState,
  ComponentStateKind,
  ModuleState,
  PageState,
  PropValues,
} from "@yext/studio-plugin";
import { isEqual } from "lodash";
import path from "path-browserify";
import initialStudioData from "virtual:yext-studio";
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
  pendingChanges: {
    pagesToRemove: new Set<string>(),
    pagesToUpdate: new Set<string>(),
  },
  moduleUUIDBeingEdited: undefined,
};

export const createPageSlice: SliceCreator<PageSlice> = (set, get) => {
  const pageActions = {
    addPage: (filepath: string) => {
      if (!filepath) {
        console.error("Error adding page: a filepath is required.");
        return false;
      }
      const pagesPath = initialStudioData.userPaths.pages;
      if (!path.isAbsolute(filepath) || !filepath.startsWith(pagesPath)) {
        console.error(`Error adding page: filepath is invalid: ${filepath}`);
        return false;
      }
      const pageName = path.basename(filepath, ".tsx");
      if (get().pages[pageName]) {
        console.error(
          `Error adding page: page name "${pageName}" is already used.`
        );
        return false;
      }

      set((store) => {
        store.pages[pageName] = {
          componentTree: [],
          cssImports: [],
          filepath,
        };
        store.pendingChanges.pagesToUpdate.add(pageName);
      });
      get().setActivePageName(pageName);
      return true;
    },
    removePage: (pageName: string) => {
      set((store) => {
        delete store.pages[pageName];
        if (pageName === store.activePageName) {
          get().setActivePageName(undefined);
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
    setComponentProps: (
      pageName: string,
      componentUUID: string,
      props: PropValues
    ) => {
      set((store) => {
        const components = store.pages[pageName].componentTree;
        const matchingComponent = components.find(
          (c) => c.uuid === componentUUID
        );
        if (!matchingComponent) {
          throw new Error("Could not find component.");
        }
        if (matchingComponent.kind === ComponentStateKind.Fragment) {
          console.error(
            "Error in setComponentProps: The active component is a fragment and does not accept props."
          );
          return;
        }

        matchingComponent.props = props;
        store.pendingChanges.pagesToUpdate.add(pageName);
      });
    },
    addComponentToPage(pageName: string, componentState: ComponentState) {
      const tree = get().pages[pageName].componentTree;
      get().setComponentTreeInPage(pageName, [...tree, componentState]);
    },
    removeComponentFromPage(pageName: string, componentUUID: string) {
      const componentTree = get().pages[pageName].componentTree;
      get().setComponentTreeInPage(
        pageName,
        componentTree.filter((c) => c.uuid !== componentUUID)
      );
    },
  };

  const activePageActions = {
    setActivePageName: (activePageName: string | undefined) => {
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
  };

  const pageComponentActions = {
    setActiveComponentUUID: (activeComponentUUID: string | undefined) => {
      set({ activeComponentUUID });
    },
    getActiveComponentState: () => {
      const { activeComponentUUID, getActivePageState } = get();
      const activePageState = getActivePageState();
      if (!activeComponentUUID || !activePageState) {
        return undefined;
      }
      return activePageState.componentTree.find(
        (component) => component.uuid === activeComponentUUID
      );
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
    "getModuleStateBeingEdited" | "setModuleUUIDBeingEdited"
  > = {
    getModuleStateBeingEdited(): ModuleState | undefined {
      const activePageState = get().getActivePageState();
      if (!activePageState) {
        return;
      }
      const moduleUUIDBeingEdited = get().moduleUUIDBeingEdited;
      return activePageState.componentTree.find(
        (c): c is ModuleState =>
          c.kind === ComponentStateKind.Module &&
          c.uuid === moduleUUIDBeingEdited
      );
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
