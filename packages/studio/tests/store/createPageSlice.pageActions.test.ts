import useStudioStore from "../../src/store/useStudioStore";
import path from "path";
import { mockPageSliceStates } from "../__utils__/mockPageSliceState";
import { PagesRecord } from "../../src/store/models/slices/PageSlice";

const pages: PagesRecord = {
  universal: {
    componentTree: [],
    cssImports: [],
    filepath: "mock-filepath",
  },
};

beforeEach(() => {
  mockPageSliceStates({
    pages,
    activePageName: "universal",
  });
});

describe("addPage", () => {
  const filepath = path.resolve(__dirname, "../__mocks__", "./test.tsx");

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
      const filepath = path.join(__dirname, "../__mocks__", "../test.tsx");
      useStudioStore.getState().pages.addPage(filepath);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Error adding page: filepath is invalid: ${filepath}`
      );
    });

    it("gives an error for a filepath with a page name that already exists", () => {
      const filepath = path.join(
        __dirname,
        "../__mocks__",
        "./universal.tsx"
      );
      useStudioStore.getState().pages.addPage(filepath);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error adding page: page name "universal" is already used.'
      );
    });
  });
});

describe("removePage", () => {
  it("removes a page from pages and update pending changes", () => {
    mockPageSliceStates({
      pages,
      activePageName: "universal",
      pendingChanges: {
        pagesToUpdate: new Set(['universal']),
        pagesToRemove: new Set(),
      }
    });
    useStudioStore.getState().pages.removePage("universal");
    const pagesRecord = useStudioStore.getState().pages.pages;
    expect(pagesRecord).toEqual({})
    const pendingChanges = useStudioStore.getState().pages.pendingChanges;
    expect(pendingChanges).toEqual({
      pagesToUpdate: new Set(),
      pagesToRemove: new Set(['universal']),
    });
  });
});