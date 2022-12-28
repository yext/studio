import useStudioStore from "../../src/store/useStudioStore";
import {
  ComponentState,
  ComponentStateKind,
  PageState,
  PropValueKind,
  PropValues,
  PropValueType,
} from "@yext/studio-plugin";
import {
  PageSliceStates,
  PagesRecord,
} from "../../src/store/models/slices/PageSlice";
import mockStore from "../__utils__/mockStore";

const fragmentComponent: ComponentState = {
  kind: ComponentStateKind.Fragment,
  uuid: "fragment-uuid",
};
const searchBarComponent: ComponentState = {
  kind: ComponentStateKind.Standard,
  componentName: "SearchBar",
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
  kind: ComponentStateKind.Standard,
  componentName: "results",
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
const buttonComponent: ComponentState = {
  kind: ComponentStateKind.Standard,
  componentName: "Button",
  props: {
    clicked: {
      kind: PropValueKind.Literal,
      valueType: PropValueType.boolean,
      value: false,
    },
  },
  uuid: "button-uuid",
  metadataUUID: "button-metadata-uuid",
};
const pages: PagesRecord = {
  universal: {
    componentTree: [searchBarComponent],
    cssImports: ["index.css"],
  },
  vertical: {
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

    it("updates activePageName using setActivePageName", () => {
      useStudioStore.getState().pages.setActivePageName("vertical");
      const activePageName = useStudioStore.getState().pages.activePageName;
      expect(activePageName).toEqual("vertical");
    });

    it("logs an error when using setActivePageName for a page not found in store", () => {
      const consoleErrorSpy = jest
        .spyOn(global.console, "error")
        .mockImplementation();
      useStudioStore.getState().pages.setActivePageName("location");
      const activePageName = useStudioStore.getState().pages.activePageName;
      expect(activePageName).toEqual("universal");
      expect(consoleErrorSpy).toBeCalledWith(
        'Error in setActivePage: Page "location" is not found in Store. Unable to set it as active page.'
      );
    });

    it("updates existing active page's state using setActivePageState", () => {
      const newActivePageState: PageState = {
        componentTree: [buttonComponent],
        cssImports: ["app.css"],
      };
      useStudioStore.getState().pages.setActivePageState(newActivePageState);
      const actualPages = useStudioStore.getState().pages.pages;
      expect(actualPages).toEqual({
        universal: newActivePageState,
        vertical: pages["vertical"],
      });
    });

    it("resets active component uuid when it's remove from page state using setActivePageState", () => {
      setInitialState({
        pages,
        activePageName: "universal",
        activeComponentUUID: "searchbar-uuid",
      });
      const newActivePageState: PageState = {
        componentTree: [buttonComponent],
        cssImports: ["app.css"],
      };
      expect(useStudioStore.getState().pages.activeComponentUUID).toEqual(
        "searchbar-uuid"
      );
      useStudioStore.getState().pages.setActivePageState(newActivePageState);
      expect(useStudioStore.getState().pages.activeComponentUUID).toEqual(
        undefined
      );
    });

    it("maintains active component uuid when it's still in page state using setActivePageState", () => {
      setInitialState({
        pages,
        activePageName: "universal",
        activeComponentUUID: "searchbar-uuid",
      });
      const newActivePageState: PageState = {
        componentTree: [searchBarComponent, buttonComponent],
        cssImports: ["app.css"],
      };
      expect(useStudioStore.getState().pages.activeComponentUUID).toEqual(
        "searchbar-uuid"
      );
      useStudioStore.getState().pages.setActivePageState(newActivePageState);
      expect(useStudioStore.getState().pages.activeComponentUUID).toEqual(
        "searchbar-uuid"
      );
    });

    it("returns active page's state using getActivePageState", () => {
      const activePageState = useStudioStore
        .getState()
        .pages.getActivePageState();
      expect(activePageState).toEqual(pages["universal"]);
    });
  });

  describe("when there is no active page", () => {
    let consoleErrorSpy;
    beforeEach(() => {
      setInitialState({
        pages: {},
        activePageName: undefined,
      });
      consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    });

    it("setActivePageState", () => {
      useStudioStore.getState().pages.setActivePageState({
        componentTree: [],
        cssImports: [],
      });
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Tried to setActivePageState when activePageName was undefined"
      );
    });

    it("getActivePageState", () => {
      const nonexistantPage = useStudioStore
        .getState()
        .pages.getActivePageState();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      expect(nonexistantPage).toBeUndefined();
    });

    it("getActiveComponentState", () => {
      const nonexistantComponentState = useStudioStore
        .getState()
        .pages.getActiveComponentState();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      expect(nonexistantComponentState).toBeUndefined();
    });

    it("setActiveComponentProps", () => {
      useStudioStore.getState().pages.setActiveComponentProps({});
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Tried to setActiveComponentProps when activePageName was undefined"
      );
    });
  });

  describe("active component actions", () => {
    beforeEach(() => {
      setInitialState({
        pages: {
          universal: {
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
      const componentState =
        useStudioStore.getState().pages.pages["universal"].componentTree[1];
      const actualPropValues =
        componentState.kind === ComponentStateKind.Fragment
          ? undefined
          : componentState.props;
      expect(actualPropValues).toEqual(newPropValues);
    });

    it("logs an error when using setActiveComponentProps if the active component is a fragment", () => {
      const initialPages = {
        universal: {
          pageName: "universal",
          componentTree: [fragmentComponent, searchBarComponent],
          cssImports: [],
        },
      };
      setInitialState({
        pages: initialPages,
        activePageName: "universal",
        activeComponentUUID: fragmentComponent.uuid,
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
        "Error in setActiveComponentProps: The active component is a fragment and does not accept props."
      );
    });

    it("logs an error when using setActiveComponentProps before an active component is selected", () => {
      const initialPages = {
        universal: {
          pageName: "universal",
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

    it("returns active component using getActiveComponentState", () => {
      const activeComponent = useStudioStore
        .getState()
        .pages.getActiveComponentState();
      expect(activeComponent).toEqual(resultsComponent);
    });

    it("returns undefined when using getActiveComponentState before an active component is set in store", () => {
      setInitialState({
        pages: {
          universal: {
            componentTree: [searchBarComponent],
            cssImports: [],
          },
        },
        activePageName: "universal",
        activeComponentUUID: undefined,
      });
      const activeComponent = useStudioStore
        .getState()
        .pages.getActiveComponentState();
      expect(activeComponent).toEqual(undefined);
    });
  });

  describe("active entity file actions", () => {
    const initialState: PageSliceStates = {
      pages: {
        universal: {
          componentTree: [searchBarComponent],
          cssImports: [],
          entityFiles: ['file1.json', 'file2.json']
        },
      },
      activePageName: "universal",
      activeEntityFile: undefined
    }
    it("updates activeEntityFile using setActiveEntityFile", () => {
      setInitialState(initialState)
      let actionStatus = useStudioStore.getState().pages.setActiveEntityFile("file2.json");
      let activeEntityFile =
        useStudioStore.getState().pages.activeEntityFile;
      expect(actionStatus).toBeTruthy()
      expect(activeEntityFile).toEqual("file2.json");

      actionStatus = useStudioStore.getState().pages.setActiveEntityFile(undefined);
      activeEntityFile =
        useStudioStore.getState().pages.activeEntityFile;
      expect(actionStatus).toBeTruthy()
      expect(activeEntityFile).toEqual(undefined);
    })

    it("logs an error when using setActiveEntityFile before an active page is selected", () => {
      setInitialState({
        ...initialState,
        activePageName: undefined
      })
      const consoleErrorSpy = jest
        .spyOn(global.console, "error")
        .mockImplementation();
      const actionStatus = useStudioStore.getState().pages.setActiveEntityFile("file2.json");
      const activeEntityFile =
        useStudioStore.getState().pages.activeEntityFile;
      expect(actionStatus).toBeFalsy()
      expect(activeEntityFile).toEqual(undefined);
      expect(consoleErrorSpy).toBeCalledWith(
        'Error setting active entity file: no active page selected.'
      );
    })

    it("logs an error when using setActiveEntityFile and the provided file is not for the active page", () => {
      setInitialState(initialState)
      const consoleErrorSpy = jest
        .spyOn(global.console, "error")
        .mockImplementation();
      const actionStatus = useStudioStore.getState().pages.setActiveEntityFile("file-does-not-exist.json");
      const activeEntityFile =
        useStudioStore.getState().pages.activeEntityFile;
      expect(actionStatus).toBeFalsy()
      expect(activeEntityFile).toEqual(undefined);
      expect(consoleErrorSpy).toBeCalledWith(
        'Error setting active entity file: "file-does-not-exist.json" is not an entity file for this page.'
      );
    })
  })
});

function setInitialState(initialState: PageSliceStates): void {
  mockStore({ pages: initialState });
}
