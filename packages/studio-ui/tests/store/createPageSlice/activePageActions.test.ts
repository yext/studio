import useStudioStore from "../../../src/store/useStudioStore";
import { PagesRecord } from "../../../src/store/models/slices/PageSlice";
import { mockPageSliceStates } from "../../__utils__/mockPageSliceState";
import {
  searchBarComponent,
  resultsComponent,
} from "../../__fixtures__/componentStates";

const pages: PagesRecord = {
  universal: {
    componentTree: [searchBarComponent],
    styleImports: ["index.css"],
    filepath: "mock-filepath",
  },
  vertical: {
    componentTree: [resultsComponent],
    styleImports: [],
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

    it("updates activePageName using setActivePage", () => {
      useStudioStore.getState().pages.setActivePage("vertical");
      const activePageName = useStudioStore.getState().pages.activePageName;
      expect(activePageName).toEqual("vertical");
    });

    it("resets activeComponentUUID when setActivePage is used", () => {
      mockPageSliceStates({
        pages,
        activePageName: "universal",
        activeComponentUUID: "searchbar-uuid",
      });
      useStudioStore.getState().pages.setActivePage("vertical");
      const activeComponentUUID =
        useStudioStore.getState().pages.activeComponentUUID;
      expect(activeComponentUUID).toBeUndefined();
    });

    it("throws an error when using setActivePage for a page not found in store", () => {
      const setPage = () =>
        useStudioStore.getState().pages.setActivePage("location");
      expect(setPage).toThrow(
        'Page "location" is not found in Store. Unable to set it as active page.'
      );
      const activePageName = useStudioStore.getState().pages.activePageName;
      expect(activePageName).toEqual("universal");
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

    it("getActivePageState", () => {
      const nonexistantPage = useStudioStore
        .getState()
        .pages.getActivePageState();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      expect(nonexistantPage).toBeUndefined();
    });
  });
});
