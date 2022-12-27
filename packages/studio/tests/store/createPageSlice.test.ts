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
import path from "path";

jest.mock("virtual:yext-studio", () => {
  return {
    pageNameToPageState: {},
    studioPaths: {
      pages: __dirname,
    },
  };
});

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
    filepath: "mock-filepath",
  },
  vertical: {
    componentTree: [resultsComponent],
    cssImports: [],
    filepath: "mock-filepath",
  },
};
const pendingChanges = {
  pagesToUpdate: new Set<string>(),
};

describe("PageSlice", () => {
  describe("active page actions", () => {
    beforeEach(() => {
      setInitialState({
        pages,
        activePageName: "universal",
        pendingChanges,
      });
    });

    it("updates activePageName using setActivePageName", () => {
      useStudioStore.getState().pages.setActivePageName("vertical");
      const activePageName = useStudioStore.getState().pages.activePageName;
      expect(activePageName).toEqual("vertical");
    });

    it("resets activeComponentUUID when setActivePageName is used", () => {
      setInitialState({
        pages,
        activePageName: "universal",
        activeComponentUUID: "searchbar-uuid",
        pendingChanges,
      });
      useStudioStore.getState().pages.setActivePageName("vertical");
      const activeComponentUUID =
        useStudioStore.getState().pages.activeComponentUUID;
      expect(activeComponentUUID).toBeUndefined();
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
        filepath: "mock-filepath",
      };
      useStudioStore.getState().pages.setActivePageState(newActivePageState);
      const actualPages = useStudioStore.getState().pages.pages;
      expect(actualPages).toEqual({
        universal: newActivePageState,
        vertical: pages["vertical"],
      });
    });

    it("updates pagesToUpdate when setActivePageState is used", () => {
      const newActivePageState: PageState = {
        componentTree: [buttonComponent],
        cssImports: ["app.css"],
        filepath: "mock-filepath",
      };
      useStudioStore.getState().pages.setActivePageState(newActivePageState);
      const pagesToUpdate =
        useStudioStore.getState().pages.pendingChanges.pagesToUpdate;
      expect(pagesToUpdate).toEqual(new Set<string>(["universal"]));
    });

    it("resets active component uuid when it's remove from page state using setActivePageState", () => {
      setInitialState({
        pages,
        activePageName: "universal",
        activeComponentUUID: "searchbar-uuid",
        pendingChanges,
      });
      const newActivePageState: PageState = {
        componentTree: [buttonComponent],
        cssImports: ["app.css"],
        filepath: "mock-filepath",
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
        pendingChanges,
      });
      const newActivePageState: PageState = {
        componentTree: [searchBarComponent, buttonComponent],
        cssImports: ["app.css"],
        filepath: "mock-filepath",
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

    describe("addPage", () => {
      const filepath = path.resolve(__dirname, "./test.tsx");

      it("adds a page to pages", () => {
        useStudioStore.getState().pages.addPage(filepath);
        const pagesRecord = useStudioStore.getState().pages.pages;
        expect(pagesRecord).toEqual({
          ...pages,
          test: {
            componentTree: [],
            cssImports: [],
            filepath,
          },
        });
      });

      it("sets active page name to the new page", () => {
        useStudioStore.getState().pages.addPage(filepath);
        const activePageName = useStudioStore.getState().pages.activePageName;
        expect(activePageName).toEqual("test");
      });

      it("adds the new page name to pagesToUpdate", () => {
        useStudioStore.getState().pages.addPage(filepath);
        const pagesToUpdate =
          useStudioStore.getState().pages.pendingChanges.pagesToUpdate;
        expect(pagesToUpdate).toEqual(new Set<string>(["test"]));
      });

      describe("errors", () => {
        let consoleErrorSpy;
        beforeEach(() => {
          consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
        });

        it("gives an error for an empty string filepath", () => {
          useStudioStore.getState().pages.addPage("");
          expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Error adding page: a filepath is required."
          );
        });

        it("gives an error for a relative filepath", () => {
          useStudioStore.getState().pages.addPage("./test.tsx");
          expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Error adding page: filepath is invalid: ./test.tsx"
          );
        });

        it("gives an error for a filepath outside the allowed path for pages", () => {
          const filepath = path.join(__dirname, "../test.tsx");
          useStudioStore.getState().pages.addPage(filepath);
          expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            `Error adding page: filepath is invalid: ${filepath}`
          );
        });

        it("gives an error for a filepath with a page name that already exists", () => {
          const filepath = path.join(__dirname, "./universal.tsx");
          useStudioStore.getState().pages.addPage(filepath);
          expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error adding page: page name "universal" is already used.'
          );
        });
      });
    });
  });

  describe("when there is no active page", () => {
    let consoleErrorSpy;
    beforeEach(() => {
      setInitialState({
        pages: {},
        activePageName: undefined,
        pendingChanges,
      });
      consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    });

    it("setActivePageState", () => {
      useStudioStore.getState().pages.setActivePageState({
        componentTree: [],
        cssImports: [],
        filepath: "mock-filepath",
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
            filepath: "mock-filepath",
          },
        },
        activePageName: "universal",
        activeComponentUUID: "results-uuid",
        pendingChanges,
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

    it("updates pagesToUpdate when setActiveComponentProps is used", () => {
      const newPropValues: PropValues = {
        clicked: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.boolean,
          value: true,
        },
      };
      useStudioStore.getState().pages.setActiveComponentProps(newPropValues);
      const pagesToUpdate =
        useStudioStore.getState().pages.pendingChanges.pagesToUpdate;
      expect(pagesToUpdate).toEqual(new Set<string>(["universal"]));
    });

    it("logs an error when using setActiveComponentProps if the active component is a fragment", () => {
      const initialPages = {
        universal: {
          pageName: "universal",
          componentTree: [fragmentComponent, searchBarComponent],
          cssImports: [],
          filepath: "mock-filepath",
        },
      };
      setInitialState({
        pages: initialPages,
        activePageName: "universal",
        activeComponentUUID: fragmentComponent.uuid,
        pendingChanges,
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
          filepath: "mock-filepath",
        },
      };
      setInitialState({
        pages: initialPages,
        activePageName: "universal",
        activeComponentUUID: undefined,
        pendingChanges,
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
            filepath: "mock-filepath",
          },
        },
        activePageName: "universal",
        activeComponentUUID: undefined,
        pendingChanges,
      });
      const activeComponent = useStudioStore
        .getState()
        .pages.getActiveComponentState();
      expect(activeComponent).toEqual(undefined);
    });
  });
});

function setInitialState(initialState: PageSliceStates): void {
  mockStore({ pages: initialState });
}
