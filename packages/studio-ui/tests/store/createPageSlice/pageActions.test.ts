import useStudioStore from "../../../src/store/useStudioStore";
import path from "path";
import { mockPageSliceStates } from "../../__utils__/mockPageSliceState";
import { PagesRecord } from "../../../src/store/models/slices/PageSlice";
import mockStore from "../../__utils__/mockStore";
import { PropValueKind } from "@yext/studio-plugin";

const pages: PagesRecord = {
  universal: {
    componentTree: [],
    styleImports: [],
    filepath: "mock-filepath",
    pagesJS: {
      getPathValue: { kind: PropValueKind.Literal, value: "index.html" },
    },
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
      styleImports: [],
      filepath,
    });
    const pagesRecord = useStudioStore.getState().pages.pages;
    expect(pagesRecord).toEqual({
      ...pages,
      test: {
        componentTree: [],
        styleImports: [],
        filepath,
      },
    });
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
  it("updates getPathValue and pendingChanges with string literal", () => {
    useStudioStore.getState().pages.updateGetPathValue("universal", {
      kind: PropValueKind.Literal,
      value: "index",
    });
    const pageState = useStudioStore.getState().pages.pages["universal"];
    expect(pageState.pagesJS?.getPathValue).toEqual({
      kind: PropValueKind.Literal,
      value: "index",
    });
    const pendingChanges = useStudioStore.getState().pages.pendingChanges;
    expect(pendingChanges).toEqual({
      pagesToUpdate: new Set(["universal"]),
      pagesToRemove: new Set(),
    });
  });

  it("updates getPathValue with expression", () => {
    mockStore({
      pages: {
        pages: {
          universal: {
            ...pages.universal,
            pagesJS: {
              getPathValue: pages.universal.pagesJS?.getPathValue,
              streamScope: {},
            },
          },
        },
      },
    });
    useStudioStore.getState().pages.updateGetPathValue("universal", {
      kind: PropValueKind.Expression,
      value: "`${document.slug}`",
    });
    const pageState = useStudioStore.getState().pages.pages["universal"];
    expect(pageState.pagesJS?.getPathValue).toEqual({
      kind: PropValueKind.Expression,
      value: "`${document.slug}`",
    });
  });

  it("updates getPathValue if original getPathValue is undefined", () => {
    mockPageSliceStates({
      pages: {
        ...pages,
        universal: {
          ...pages["universal"],
          pagesJS: {
            getPathValue: undefined,
          },
        },
      },
    });
    useStudioStore.getState().pages.updateGetPathValue("universal", {
      kind: PropValueKind.Literal,
      value: "index",
    });
    const pageState = useStudioStore.getState().pages.pages["universal"];
    expect(pageState.pagesJS?.getPathValue).toEqual({
      kind: PropValueKind.Literal,
      value: "index",
    });
  });

  it("throws error if pagesJS state is undefined", () => {
    mockPageSliceStates({
      pages: {
        ...pages,
        universal: {
          ...pages["universal"],
          pagesJS: undefined,
        },
      },
    });
    const action = () =>
      useStudioStore.getState().pages.updateGetPathValue("universal", {
        kind: PropValueKind.Literal,
        value: "index",
      });
    expect(action).toThrowError(
      `Error updating getPath value: "universal" is not a PagesJS page.`
    );
  });
});
