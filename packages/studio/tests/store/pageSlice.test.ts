import { useStudioStore } from "../../src/store/store";
import {
  ComponentState,
  PageState,
  PropValueKind,
  PropValues,
  PropValueType,
} from "@yext/studio-plugin";
import { PageSliceStates } from "../../src/store/models/slices/pageSlice";

const searchBarComponent: ComponentState = {
  name: "SearchBar",
  props: {
    query: {
      kind: PropValueKind.Literal,
      valueType: PropValueType.string,
      value: "what is Yext?",
    },
  },
  uuid: "searchbar-uuid",
  metadataUUID: "searchbar-metadata-uuid",
};
const resultsComponent: ComponentState = {
  name: "results",
  props: {
    limit: {
      kind: PropValueKind.Literal,
      valueType: PropValueType.number,
      value: 10,
    },
  },
  uuid: "results-uuid",
  metadataUUID: "results-metadata-uuid",
};
const pages: Record<string, PageState> = {
  universal: {
    pageName: 'universal',
    componentTree: [searchBarComponent],
    cssImports: ["index.css"],
  },
  vertical: {
    pageName: 'vertical',
    componentTree: [resultsComponent],
    cssImports: [],
  },
};

describe("PageSlice", () => {
  it("updates pages using setPages", () => {
    useStudioStore.getState().pages.setPages(pages);
    const actualPages = useStudioStore.getState().pages.pages;
    expect(actualPages).toEqual(pages);
  });

  describe("active page actions", () => {
    beforeEach(() => {
      setInitialState({
        pages,
        activePageName: "universal",
      });
    });

    it("updates existing active page's state using setActivePageState", () => {
      const newActivePageState: PageState = {
        pageName: 'universal',
        componentTree: [
          {
            name: "Button",
            props: {
              clicked: {
                kind: PropValueKind.Literal,
                valueType: PropValueType.boolean,
                value: false,
              },
            },
            uuid: "button-uuid",
            metadataUUID: "button-metadata-uuid",
          },
        ],
        cssImports: ["app.css"],
      };
      useStudioStore.getState().pages.setActivePageState(newActivePageState);
      const actualPages = useStudioStore.getState().pages.pages;
      expect(actualPages).toEqual({
        universal: newActivePageState,
        vertical: pages["vertical"],
      });
    });

    it("updates new page's state using setActivePageState", () => {
      const newActivePageState: PageState = {
        pageName: 'test',
        componentTree: [resultsComponent],
        cssImports: [],
      };
      useStudioStore.getState().pages.setActivePageState(newActivePageState);
      const actualPages = useStudioStore.getState().pages.pages;
      expect(actualPages).toEqual({
        ...pages,
        test: newActivePageState
      });
    });

    it("returns active page's state using getActivePageState", () => {
      const activePageState = useStudioStore
        .getState()
        .pages.getActivePageState();
      expect(activePageState).toEqual(pages["universal"]);
    });
  });

  describe("active component actions", () => {
    beforeEach(() => {
      setInitialState({
        pages: {
          universal: {
            pageName: 'universal',
            componentTree: [searchBarComponent, resultsComponent],
            cssImports: [],
          },
        },
        activePageName: "universal",
        activeComponentUUID: "results-uuid",
      });
    });

    it("updates activeComponentUUID using setActiveComponentUUID", () => {
      useStudioStore.getState().pages.setActiveComponentUUID("searchbar-uuid");
      const activeComponentUUID =
        useStudioStore.getState().pages.activeComponentUUID;
      expect(activeComponentUUID).toEqual("searchbar-uuid");
    });

    it("updates active component's prop values using setActiveComponentProps", () => {
      const newPropValues: PropValues = {
        clicked: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.boolean,
          value: true,
        },
      };
      useStudioStore.getState().pages.setActiveComponentProps(newPropValues);
      const actualPropValues =
        useStudioStore.getState().pages.pages["universal"].componentTree[1]
          .props;
      expect(actualPropValues).toEqual(newPropValues);
    });

    it("logs an error when using setActiveComponentProps before an active component is not selected", () => {
      const initialPages = {
        universal: {
          pageName: 'universal',
          componentTree: [searchBarComponent],
          cssImports: [],
        },
      };
      setInitialState({
        pages: initialPages,
        activePageName: "universal",
        activeComponentUUID: undefined,
      });
      const newPropValues: PropValues = {
        clicked: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.boolean,
          value: true,
        },
      };
      const consoleErrorSpy = jest
        .spyOn(global.console, "error")
        .mockImplementation();
      useStudioStore.getState().pages.setActiveComponentProps(newPropValues);
      const actualPages = useStudioStore.getState().pages.pages;
      expect(actualPages).toEqual(initialPages);
      expect(consoleErrorSpy).toBeCalledWith(
        "Error in setActiveComponentProps: No active component selected in store."
      );
    });

    it("returns active component using getActiveComponent", () => {
      const activeComponent = useStudioStore
        .getState()
        .pages.getActiveComponent();
      expect(activeComponent).toEqual(resultsComponent);
    });

    it("returns undefined when using getActiveComponent before an active component is set in store", () => {
      setInitialState({
        pages: {
          universal: {
            pageName: 'universal',
            componentTree: [searchBarComponent],
            cssImports: [],
          },
        },
        activePageName: "universal",
        activeComponentUUID: undefined,
      });
      const activeComponent = useStudioStore
        .getState()
        .pages.getActiveComponent();
      expect(activeComponent).toEqual(undefined);
    });
  });
});

function setInitialState(initialState: PageSliceStates): void {
  useStudioStore.setState({
    pages: {
      ...useStudioStore.getState().pages,
      ...initialState,
    },
  });
}
