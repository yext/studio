import { PageState, PropValues } from "@yext/studio-plugin";
import { PageSlice, PageSliceStates } from "../models/slices/pageSlice";
import { SliceCreator } from "../models/utils";

const initialStates: PageSliceStates = {
  pages: {
    index: {
      pageName: 'index',
      componentTree: [],
      cssImports: [],
    },
  },
  activePageName: "index",
  activeComponentUUID: undefined,
};

export const createPageSlice: SliceCreator<PageSlice> = (set, get) => {
  const pagesActions = {
    setPages: (pages: Record<string, PageState>) => set({ pages }),
    setActivePageState: (pageState: PageState) =>
      set((store) => {
        if (pageState.pageName !== get().activePageName) {
          store.activePageName = pageState.pageName
        }
        if(!pageState.componentTree.find(component => component.uuid === store.activeComponentUUID)) {
          store.activeComponentUUID = undefined;
        }
        store.pages[pageState.pageName] = pageState;
      }),
    getActivePageState: () => get().pages[get().activePageName],
  };

  const activeComponentActions = {
    setActiveComponentUUID: (activeComponentUUID: string | undefined) =>
      set({ activeComponentUUID }),
    getActiveComponentState: () => {
      const activeComponentUUID = get().activeComponentUUID;
      if (!activeComponentUUID) {
        return undefined;
      }
      return get()
        .getActivePageState()
        .componentTree.find((component) => component.uuid === activeComponentUUID);
    },
    setActiveComponentProps: (props: PropValues) =>
      set((store) => {
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
            c.props = props;
          }
        });
      }),
  };

  return {
    ...initialStates,
    ...pagesActions,
    ...activeComponentActions,
  };
};
