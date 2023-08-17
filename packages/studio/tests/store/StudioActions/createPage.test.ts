import { PropValueKind, ResponseType } from "@yext/studio-plugin";
import useStudioStore from "../../../src/store/useStudioStore";
import mockStore from "../../__utils__/mockStore";
import * as sendMessageModule from "../../../src/messaging/sendMessage";

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

  it("gives an error for a pagename with only asterisks", async () => {
    const createPage = useStudioStore.getState().actions.createPage("***");
    await expect(createPage).rejects.toThrow(
      "Error adding page: pageName *** cannot contain the characters: *"
    );
  });

  it("gives an error for a pagename with multiple special characters", async () => {
    const createPage = useStudioStore
      .getState()
      .actions.createPage('test\\|"<>?');
    await expect(createPage).rejects.toThrow(
      'Error adding page: pageName test\\|"<>? cannot contain the characters: \\,|,",<,>,?'
    );
  });

  it("gives an error for a pagename ending in a period", async () => {
    const createPage = useStudioStore.getState().actions.createPage("test.");
    await expect(createPage).rejects.toThrow(
      "Error adding page: pageName test. cannot end with a period."
    );
  });

  it("gives an error for a pagename 256 characters long", async () => {
    const longName = "a".repeat(256);
    const createPage = useStudioStore.getState().actions.createPage(longName);
    await expect(createPage).rejects.toThrow(
      "Error adding page: pageName must be 255 characters or less."
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
    jest.spyOn(sendMessageModule, "default").mockImplementation(() => {
      return new Promise((resolve) =>
        resolve({
          msg: "msg",
          type: ResponseType.Success,
          mappingJson: {
            testing: ["mockLocalData.json"],
          },
        })
      );
    });
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
