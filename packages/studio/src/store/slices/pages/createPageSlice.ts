import {
  ComponentState,
  GetPathVal,
  PageState,
  StreamScope,
} from "@yext/studio-plugin";
import { isEqual } from "lodash";
import path from "path-browserify";
import initialStudioData from "virtual_yext-studio";
import DOMRectProperties from "../../models/DOMRectProperties";
import PageSlice, { PageSliceStates } from "../../models/slices/PageSlice";
import { SliceCreator } from "../../models/utils";
import createDetachAllModuleInstances from "./detachAllModuleInstances";
import removeTopLevelFragments from "../../../utils/removeTopLevelFragments";
import PropValueHelpers from "../../../utils/PropValueHelpers";
import dynamicImportFromBrowser from "../../../utils/dynamicImportFromBrowser";

const firstPageEntry = Object.entries(
  initialStudioData.pageNameToPageState
)?.sort()[0];

const initialStates: PageSliceStates = {
  pages: removeTopLevelFragments(initialStudioData.pageNameToPageState),
  errorPages: initialStudioData.pageNameToErrorPageState,
  activePageName: firstPageEntry?.[0],
  activeEntityFile: undefined,
  activeComponentUUID: undefined,
  activeComponentRect: undefined,
  selectedComponentUUIDs: [],
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
          store.activeEntityFile = undefined;
          store.activeEntityData = undefined;
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
    updateGetPathValue: (pageName: string, getPathValue: GetPathVal) => {
      set((store) => {
        const originalPagesJsState = store.pages[pageName].pagesJS;
        if (!originalPagesJsState) {
          throw new Error(
            `Error updating getPath value: "${pageName}" is not a PagesJS page.`
          );
        }
        const originalGetPathValue = originalPagesJsState.getPathValue;
        if (
          !originalGetPathValue ||
          PropValueHelpers.getTemplateExpression(originalGetPathValue) !==
            PropValueHelpers.getTemplateExpression(getPathValue)
        ) {
          store.pages[pageName].pagesJS = {
            ...originalPagesJsState,
            getPathValue,
          };
          store.pendingChanges.pagesToUpdate.add(pageName);
        }
      });
    },
    updateStreamScope: (pageName: string, newStreamScope: StreamScope) => {
      set((store) => {
        const pagesJS = store.pages[pageName].pagesJS;
        if (pagesJS?.streamScope) {
          pagesJS.streamScope = newStreamScope;
          store.pendingChanges.pagesToUpdate.add(pageName);
        }
      });
    },
    clearPendingChanges: () => {
      set((store) => {
        store.pendingChanges.pagesToRemove = new Set();
        store.pendingChanges.pagesToUpdate = new Set();
      });
    },
  };

  const activePageActions = {
    setActivePage: (activePageName: string | undefined) => {
      if (activePageName !== undefined && !get().pages[activePageName]) {
        throw new Error(
          `Page "${activePageName}" is not found in Store. Unable to set it as active page.`
        );
      }

      get().setActiveComponentUUID(undefined);
      set({ activePageName });
    },
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
    setActiveComponentRect: (rect: DOMRectProperties | undefined) => {
      set({ activeComponentRect: rect });
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
    addSelectedComponentUUID: (selectedComponentUUID: string) => {
      set((store) => {
        const selectedComponentUUIDs = store.selectedComponentUUIDs;
        if (selectedComponentUUIDs.includes(selectedComponentUUID)) {
          throw new Error(
            `Error selecting component: component is already selected.`
          );
        }
        selectedComponentUUIDs.push(selectedComponentUUID);
      });
    },
    removeSelectedComponentUUID: (selectedComponentUUID: string) => {
      set((store) => {
        const selectedComponentUUIDs = store.selectedComponentUUIDs;
        if (!selectedComponentUUIDs.includes(selectedComponentUUID)) {
          throw new Error(
            `Error removing component: component is not selected.`
          );
        }
        store.selectedComponentUUIDs = selectedComponentUUIDs.filter(uuid => uuid !== selectedComponentUUID);
      });
    },
    clearSelectedComponentUUIDs: () => {
      set({ selectedComponentUUIDs: [] });
    },
  };

  const activeEntityFileActions: Pick<PageSlice, "setActiveEntityFile"> = {
    setActiveEntityFile: async (
      parentFolder: string,
      activeEntityFile?: string
    ): Promise<void> => {
      if (activeEntityFile === undefined) {
        set({
          activeEntityFile: undefined,
          activeEntityData: undefined,
        });
        return;
      }

      const activePageState = get().getActivePageState();
      if (!activePageState) {
        throw new Error(`Error setting active entity file: no active page.`);
      }

      const acceptedEntityFiles = activePageState.pagesJS?.entityFiles;
      if (!acceptedEntityFiles?.includes(activeEntityFile)) {
        throw new Error(
          `"${activeEntityFile}" is not an accepted entity file for this page.`
        );
      }
      const activeEntityData = (
        await dynamicImportFromBrowser(
          path.join(parentFolder, activeEntityFile)
        )
      ).default;
      set({ activeEntityFile, activeEntityData });
    },
  };

  const moduleStateActions: Pick<PageSlice, "setModuleUUIDBeingEdited"> = {
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
