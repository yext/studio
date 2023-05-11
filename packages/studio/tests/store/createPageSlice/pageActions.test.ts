import useStudioStore from "../../../src/store/useStudioStore";
import path from "path";
import { mockPageSliceStates } from "../../__utils__/mockPageSliceState";
import { PagesRecord } from "../../../src/store/models/slices/PageSlice";
import mockStore from "../../__utils__/mockStore";

const pages: PagesRecord = {
  universal: {
    componentTree: [],
    cssImports: [],
    filepath: "mock-filepath",
    pagesJS: { getPathValue: "index.html" },
  },
};

beforeEach(() => {
  const originalStudioConfig = useStudioStore.getState().studioConfig;
  mockStore({
    pages: { pages, activePageName: "universal" },
    studioConfig: { ...originalStudioConfig, isPagesJSRepo: true },
  });
});

describe("addPage", () => {
  const filepath = path.resolve(__dirname, "../../__mocks__", "./test.tsx");

  it("adds a page to pages", () => {
    useStudioStore.getState().pages.addPage("test", {
      componentTree: [],
      cssImports: [],
      filepath,
    });
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

  it("gives an error for a filepath with a page name that already exists", () => {
    const action = () =>
      useStudioStore.getState().pages.addPage("universal", {
        componentTree: [],
        cssImports: [],
        filepath: "/blah/universal.tsx",
      });
    expect(action).toThrowError(
      'Error adding page: page name "universal" is already used.'
    );
  });
});

describe("removePage", () => {
  it("removes a page from pages and update pending changes", () => {
    mockPageSliceStates({
      pages,
      activePageName: "universal",
      pendingChanges: {
        pagesToUpdate: new Set(["universal"]),
        pagesToRemove: new Set(),
      },
    });
    useStudioStore.getState().pages.removePage("universal");
    const pagesRecord = useStudioStore.getState().pages.pages;
    expect(pagesRecord).toEqual({});
    const pendingChanges = useStudioStore.getState().pages.pendingChanges;
    expect(pendingChanges).toEqual({
      pagesToUpdate: new Set(),
      pagesToRemove: new Set(["universal"]),
    });
  });
});

describe("updateGetPathValue", () => {
  it("updates getPathValue and pendingChanges", () => {
    useStudioStore.getState().pages.updateGetPathValue("universal", "index");
    const pageState = useStudioStore.getState().pages.pages["universal"];
    expect(pageState.pagesJS?.getPathValue).toEqual("index");
    const pendingChanges = useStudioStore.getState().pages.pendingChanges;
    expect(pendingChanges).toEqual({
      pagesToUpdate: new Set(["universal"]),
      pagesToRemove: new Set(),
    });
  });

  it("throws an error if original getPathValue is undefined", () => {
    mockPageSliceStates({
      pages: {
        ...pages,
        universal: {
          ...pages["universal"],
          pagesJS: undefined,
        },
      },
    });
    expect(() =>
      useStudioStore.getState().pages.updateGetPathValue("universal", "index")
    ).toThrowError(
      "Error updating getPath value: unable to parse original getPath value."
    );
  });
});
