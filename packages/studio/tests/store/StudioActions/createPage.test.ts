import { PropValueKind } from "@yext/studio-plugin";
import useStudioStore from "../../../src/store/useStudioStore";
import mockStore from "../../__utils__/mockStore";

describe("non-PagesJS repo", () => {
  it("gives an error for a relative filepath", async () => {
    const createPage = useStudioStore.getState().actions.createPage("../test");
    await expect(createPage).rejects.toThrow(
      "Error adding page: pageName is invalid: ../test"
    );
  });

  it("gives an error for an empty string pagename", async () => {
    const createPage = useStudioStore.getState().actions.createPage("");
    await expect(createPage).rejects.toThrow(
      "Error adding page: a pageName is required."
    );
  });

  it("adds the new page name to pagesToUpdate", async () => {
    await useStudioStore.getState().actions.createPage("test");
    const pagesToUpdate =
      useStudioStore.getState().pages.pendingChanges.pagesToUpdate;
    expect(pagesToUpdate).toEqual(new Set(["test"]));
  });

  it("adds a page to pages and updates the active page to the new one", async () => {
    await useStudioStore.getState().actions.createPage("test");
    const pagesRecord = useStudioStore.getState().pages.pages;
    expect(pagesRecord).toEqual({
      test: {
        componentTree: [],
        cssImports: [],
        filepath: expect.stringContaining("test"),
      },
    });
    expect(useStudioStore.getState().pages.activePageName).toEqual("test");
  });

  it("ignores getPath value if one is passed in", async () => {
    await useStudioStore.getState().actions.createPage("test", {
      kind: PropValueKind.Literal,
      value: "testing",
    });
    const pagesRecord = useStudioStore.getState().pages.pages;
    expect(pagesRecord).toEqual({
      test: {
        componentTree: [],
        cssImports: [],
        filepath: expect.stringContaining("test"),
      },
    });
  });
});

describe("PagesJS repo", () => {
  beforeEach(() => {
    const originalStudioConfig = useStudioStore.getState().studioConfig;
    mockStore({
      studioConfig: {
        ...originalStudioConfig,
        isPagesJSRepo: true,
      },
    });
  });

  it("gives an error if no getPath value is passed in", async () => {
    const createPage = useStudioStore.getState().actions.createPage("test");
    await expect(createPage).rejects.toThrow(
      "Error adding page: a getPath value is required."
    );
  });

  it("adds a page with getPathValue to pages record", async () => {
    await useStudioStore.getState().actions.createPage("test", {
      kind: PropValueKind.Literal,
      value: "testing",
    });
    const pagesRecord = useStudioStore.getState().pages.pages;
    expect(pagesRecord).toEqual({
      test: {
        componentTree: [],
        cssImports: [],
        filepath: expect.stringContaining("test"),
        pagesJS: {
          getPathValue: { kind: PropValueKind.Literal, value: "testing" },
        },
      },
    });
  });
});
