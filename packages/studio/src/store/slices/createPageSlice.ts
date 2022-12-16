import { ComponentStateKind, PageState, PropValues } from "@yext/studio-plugin";
import initialStudioData from "virtual:yext-studio";
import PageSlice, {
  PageSliceStates,
  PagesRecord,
} from "../models/slices/PageSlice";
import { SliceCreator } from "../models/utils";

const initialStates: PageSliceStates = {
  pages: initialStudioData.pageNameToPageState,
  activePageName: Object.keys(initialStudioData.pageNameToPageState)[0],
  activeComponentUUID: undefined,
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
        if (
          !pageState.componentTree.find(
            (component) => component.uuid === store.activeComponentUUID
          )
        ) {
          store.activeComponentUUID = undefined;
        }
        store.pages[store.activePageName] = pageState;
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
        .componentTree.find(
          (component) => component.uuid === activeComponentUUID
        );
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
    ...activeComponentActions,
  };
};

export default createPageSlice;
