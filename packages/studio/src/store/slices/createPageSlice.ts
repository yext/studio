import { ComponentStateKind, PageState, PropValues } from "@yext/studio-plugin";
import initialStudioData from "virtual:yext-studio";
import PageSlice, {
  PageSliceStates,
  PagesRecord,
} from "../models/slices/PageSlice";
import { SliceCreator } from "../models/utils";

const firstpageEntry = Object.entries(
  initialStudioData.pageNameToPageState
)?.[0];

const initialStates: PageSliceStates = {
  pages: initialStudioData.pageNameToPageState,
  activePageName: firstpageEntry?.[0],
  activeComponentUUID: undefined,
  activeEntityFile: firstpageEntry?.[1]?.["entityFiles"]?.[0],
};

export const createPageSlice: SliceCreator<PageSlice> = (set, get) => {
  const pagesActions = {
    setPages: (pages: PagesRecord) => set({ pages }),
    setActivePageName: (activePageName: string) => {
      if (get().pages[activePageName]) {
        set({ activePageName });
      } else {
        console.error(
          `Error in setActivePage: Page "${activePageName}" is not found in Store. Unable to set it as active page.`
        );
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
          !pageState.componentTree.find(
            (component) => component.uuid === store.activeComponentUUID
          )
        ) {
          store.activeComponentUUID = undefined;
        }
        store.pages[store.activePageName] = pageState;
      }),
    getActivePageState: () => {
      const { pages, activePageName } = get();
      if (!activePageName) {
        return;
      }
      return pages[activePageName];
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
      if (
        !get().pages[activePageName].entityFiles?.includes(activeEntityFile)
      ) {
        console.error(
          "Error setting active entity file:" +
            ` "${activeEntityFile}" is not an entity file for this page.`
        );
        return false;
      }
      set({ activeEntityFile });
      return true;
    },
  };

  const activeComponentActions = {
    setActiveComponentUUID: (activeComponentUUID: string | undefined) =>
      set({ activeComponentUUID }),
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
    setActiveComponentProps: (props: PropValues) =>
      set((store) => {
        if (!store.activePageName) {
          console.error(
            "Tried to setActiveComponentProps when activePageName was undefined"
          );
          return;
        }
        const activeComponent = get().getActiveComponentState();
        if (!activeComponent) {
          console.error(
            "Error in setActiveComponentProps: No active component selected in store."
          );
          return;
        }
        const components = store.pages[store.activePageName].componentTree;
        components.forEach((c) => {
          if (c.uuid === activeComponent.uuid) {
            if (c.kind === ComponentStateKind.Fragment) {
              console.error(
                "Error in setActiveComponentProps: The active component is a fragment and does not accept props."
              );
              return;
            } else {
              c.props = props;
            }
          }
        });
      }),
  };

  return {
    ...initialStates,
    ...pagesActions,
    ...activeEntityFileActions,
    ...activeComponentActions,
  };
};

export default createPageSlice;
