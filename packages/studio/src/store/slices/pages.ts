import { PageState, PropValues } from "@yext/studio-plugin";
import { PagesSlice, PagesStates } from "../models/slices/pages";
import { SliceCreator } from "../models/utils";

const initialStates: PagesStates = {
  pages: {
    index: {
      componentTree: [],
      cssImports: [],
    },
  },
  activePageName: "index",
  activeComponentUUID: undefined,
};

export const createPagesSlice: SliceCreator<PagesSlice> = (set, get) => {
  const pagesActions = {
    setPages: (pages: Record<string, PageState>) => set({ pages }),
    setActivePage: (activePageName: string) => {
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
        const activePageName = store.activePageName;
        store.pages[activePageName] = pageState;
      }),
    getActivePageState: () => get().pages[get().activePageName],
  };

  const activeComponentActions = {
    setActiveComponentUUID: (activeComponentUUID: string | undefined) =>
      set({ activeComponentUUID }),
    getActiveComponent: () => {
      const activeComponentUUID = get().activeComponentUUID;
      if (!activeComponentUUID) {
        return undefined;
      }
      return get()
        .getActivePageState()
        .componentTree.find((c) => c.uuid === activeComponentUUID);
    },
    setActiveComponentProps: (props: PropValues) =>
      set((store) => {
        const activeComponent = get().getActiveComponent();
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
