import useStudioStore from "../../../src/store/useStudioStore";
import { mockPageSliceStates } from "../../__utils__/mockPageSliceState";
import { PageSliceStates } from "../../../src/store/models/slices/PageSlice";

const initialState: Partial<PageSliceStates> = {
  pages: {
    Universal: {
      componentTree: [],
      styleImports: [],
      filepath: "some/file/path",
      pagesJS: {
        entityFiles: ["mockLocalData.json", "entityFile.json"],
        getPathValue: undefined,
      },
    },
    empty: {
      componentTree: [],
      styleImports: [],
      filepath: "some/file/path",
      pagesJS: {
        entityFiles: [],
        getPathValue: undefined,
      },
    },
  },
  activePageName: "Universal",
  activeEntityFile: undefined,
};

beforeEach(() => {
  mockPageSliceStates(initialState);
});

describe("refreshActivePageEntities", () => {
  it("performs dynamic imports for the active page's entities", async () => {
    expect(useStudioStore.getState().pages.activePageEntities).toBeUndefined();
    await useStudioStore.getState().actions.refreshActivePageEntities();

    expect(useStudioStore.getState().pages.activePageEntities).toEqual({
      "mockLocalData.json": {
        __: expect.anything(),
      },
      "entityFile.json": {
        employeeCount: 123,
        favs: ["cat", "dog", "sleep"],
        name: "bob",
      },
    });
  });

  it("sets activePageEntities to undefined if there are no entityFiles", async () => {
    await useStudioStore.getState().actions.refreshActivePageEntities();
    expect(
      useStudioStore.getState().pages.activePageEntities
    ).not.toBeUndefined();
    const refreshEntitiesSpy = jest.spyOn(
      useStudioStore.getState().actions,
      "refreshActivePageEntities"
    );
    expect(refreshEntitiesSpy).toBeCalledTimes(0);
    await useStudioStore.getState().actions.updateActivePage("empty");
    expect(refreshEntitiesSpy).toBeCalledTimes(1);
    expect(useStudioStore.getState().pages.activePageEntities).toBeUndefined();
  });

  it("sets activePageEntities to undefined if there is no active page", async () => {
    await useStudioStore.getState().actions.updateActivePage();
    await useStudioStore.getState().actions.refreshActivePageEntities();
    expect(useStudioStore.getState().pages.activePageEntities).toBeUndefined();
  });
});
