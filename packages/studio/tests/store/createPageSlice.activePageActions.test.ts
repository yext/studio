import useStudioStore from "../../src/store/useStudioStore";
import { PageState } from "@yext/studio-plugin";
import {
  PagesRecord,
} from "../../src/store/models/slices/PageSlice";
import { mockPageSliceStates } from "../__utils__/mockPageSliceState";
import {
  searchBarComponent,
  resultsComponent,
  buttonComponent,
} from "../__fixtures__/componentStates";

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

describe("PageSlice", () => {
  describe("active page actions", () => {
    beforeEach(() => {
      mockPageSliceStates({
        pages,
        activePageName: "universal",
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
  });

  describe("when there is no active page", () => {
    let consoleErrorSpy: jest.SpyInstance;
    beforeEach(() => {
      mockPageSliceStates({
        pages: {},
        activePageName: undefined,
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
