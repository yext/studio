import {
  ComponentState,
  GetPathVal,
  PageState,
  StreamScope,
  ComponentTreeHelpers,
} from "@yext/studio-plugin";
import { isEqual } from "lodash";
import initialStudioData from "virtual_yext-studio";
import DOMRectProperties from "../../models/DOMRectProperties";
import PageSlice, { PageSliceStates } from "../../models/slices/PageSlice";
import { SliceCreator } from "../../models/utils";
import createDetachAllModuleInstances from "./detachAllModuleInstances";
import removeTopLevelFragments from "../../../utils/removeTopLevelFragments";
import PropValueHelpers from "../../../utils/PropValueHelpers";

const firstPageEntry = Object.entries(
  initialStudioData.pageNameToPageState
)?.sort()[0];

const initialStates: PageSliceStates = {
  pages: removeTopLevelFragments(initialStudioData.pageNameToPageState),
  errorPages: initialStudioData.pageNameToErrorPageState,
  activePageName: firstPageEntry?.[0],
  activeEntityFile: firstPageEntry?.[1]?.pagesJS?.entityFiles?.[0],
  activeComponentUUID: undefined,
  selectedComponentUUIDs: new Set<string>(),
  selectedComponentRectsMap: {},
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
          store.activePageEntities = undefined;
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
    setEntityFiles: (pageName: string, entityFiles: string[] | undefined) => {
      set((store) => {
        const pageState = store.pages[pageName];
        if (!pageState.pagesJS) {
          throw new Error(
            `Tried to update entity files for non-PagesJS page ${pageName}.`
          );
        }
        pageState.pagesJS = {
          ...pageState.pagesJS,
          entityFiles,
        };
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
      get().clearSelectedComponents();
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
    addSelectedComponentUUID: (selectedUUID: string) => {
      set((store) => {
        store.selectedComponentUUIDs.add(selectedUUID);
      });
    },
    addSelectedComponentRect: (
      selectedUUID: string,
      rect: DOMRectProperties
    ) => {
      set((store) => {
        store.selectedComponentRectsMap[selectedUUID] = rect;
      });
    },
    clearSelectedComponents: () => {
      set((store) => {
        store.selectedComponentUUIDs = new Set();
        store.selectedComponentRectsMap = {};
      });
    },
    /**
     * Adds all of the components and their children ordered between the selected component and
     * the active component (inclusive) to selectedComponentUUIDs.
     */
    addShiftSelectedComponentUUIDs: (selectedComponent: ComponentState) => {
      const selectedUUID = selectedComponent.uuid;
      const {
        activeComponentUUID,
        getActivePageState,
        addSelectedComponentUUID,
      } = get();
      const activePageState = getActivePageState();
      const componentTree = activePageState?.componentTree;
      if (selectedUUID === activeComponentUUID) return;
      if (!componentTree) {
        throw new Error(
          `Error selecting components: component tree is undefined.`
        );
      }
      if (!activeComponentUUID) {
        throw new Error(
          `Error selecting components: active component is undefined.`
        );
      }
      const targetComponentUUIDs = [selectedUUID, activeComponentUUID] as const;
      const lowestParentUUID = ComponentTreeHelpers.getLowestParentUUID(
        ...targetComponentUUIDs,
        componentTree
      );

      let selecting = false;
      ComponentTreeHelpers.mapComponentTreeParentsFirst(componentTree, (c) => {
        if (c.parentUUID !== lowestParentUUID) return;
        const descendants = ComponentTreeHelpers.getDescendants(
          c,
          componentTree
        );
        const targetIsParent = targetComponentUUIDs.includes(c.uuid);
        const targetInDescendants = descendants.some((d) =>
          targetComponentUUIDs.includes(d.uuid)
        );
        if (targetIsParent || targetInDescendants) {
          if (selecting || (targetIsParent && targetInDescendants)) {
            descendants.forEach((d) => addSelectedComponentUUID(d.uuid));
            addSelectedComponentUUID(c.uuid);
            selecting = false;
          } else selecting = true;
        }
        if (selecting) {
          descendants.forEach((d) => addSelectedComponentUUID(d.uuid));
          addSelectedComponentUUID(c.uuid);
        }
      });
    },
  };

  const activeEntityFileActions: Pick<
    PageSlice,
    "setActiveEntityFile" | "setActivePageEntities" | "getActiveEntityData"
  > = {
    setActiveEntityFile: (activeEntityFile?: string) => {
      if (activeEntityFile === undefined) {
        set({ activeEntityFile: undefined });
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
      set({ activeEntityFile });
    },
    setActivePageEntities: (
      entities?: Record<string, Record<string, unknown>>
    ) => {
      set({ activePageEntities: entities });
    },
    getActiveEntityData() {
      const activeEntityFile = get().activeEntityFile;
      if (activeEntityFile) {
        return get().activePageEntities?.[activeEntityFile];
      }
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
