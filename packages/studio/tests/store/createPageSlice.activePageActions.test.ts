import useStudioStore from "../../src/store/useStudioStore";
import { PageState } from "@yext/studio-plugin";
import { PagesRecord } from "../../src/store/models/slices/PageSlice";
import path from "path";
import { mockPageSliceStates } from "../__utils__/mockPageSliceState";
import {
  searchBarComponent,
  resultsComponent,
  buttonComponent,
} from "../__fixtures__/componentStates";

jest.mock("virtual:yext-studio", () => {
  return {
    pageNameToPageState: {},
    studioPaths: {
      pages: __dirname,
    },
  };
});

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
      mockPageSliceStates({
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
      mockPageSliceStates({
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
      mockPageSliceStates({
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
      mockPageSliceStates({
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
      mockPageSliceStates({
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
});
