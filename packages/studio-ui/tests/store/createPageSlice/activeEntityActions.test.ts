import useStudioStore from "../../../src/store/useStudioStore";
import { PageSliceStates } from "../../../src/store/models/slices/PageSlice";
import { searchBarComponent } from "../../__fixtures__/componentStates";
import { mockPageSliceStates } from "../../__utils__/mockPageSliceState";

const initialState: Partial<PageSliceStates> = {
  pages: {
    Universal: {
      componentTree: [searchBarComponent],
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

describe("setActiveEntityFile", () => {
  it("updates activeEntityFile using setActiveEntityFile", () => {
    useStudioStore.getState().pages.setActiveEntityFile("entityFile.json");
    let activeEntityFile = useStudioStore.getState().pages.activeEntityFile;
    expect(activeEntityFile).toEqual("entityFile.json");

    useStudioStore.getState().pages.setActiveEntityFile(undefined);
    activeEntityFile = useStudioStore.getState().pages.activeEntityFile;
    expect(activeEntityFile).toEqual(undefined);
  });

  it("throws when using setActiveEntityFile without an active page", () => {
    mockPageSliceStates({
      ...initialState,
      activePageName: undefined,
    });
    const setEntityFile = () =>
      useStudioStore.getState().pages.setActiveEntityFile("entityFile.json");
    expect(setEntityFile).toThrow(
      "Error setting active entity file: no active page."
    );
    const activeEntityFile = useStudioStore.getState().pages.activeEntityFile;
    expect(activeEntityFile).toEqual(undefined);
  });

  it("throws when the entity file is not accepted by the page", () => {
    const setEntityFile = () =>
      useStudioStore
        .getState()
        .pages.setActiveEntityFile("file-does-not-exist.json");
    expect(setEntityFile).toThrow(
      '"file-does-not-exist.json" is not an accepted entity file for this page.'
    );
    const activeEntityFile = useStudioStore.getState().pages.activeEntityFile;
    expect(activeEntityFile).toEqual(undefined);
  });
});

describe("setActivePageEntities", () => {
  it("updates activePageEntities using setActivePageEntities", () => {
    expect(useStudioStore.getState().pages.activePageEntities).toBeUndefined();
    const expectedData = {
      employeeCount: 123,
      favs: ["cat", "dog", "sleep"],
      name: "bob",
    };
    useStudioStore.getState().pages.setActivePageEntities({
      "entityFile.json": expectedData,
    });
    expect(useStudioStore.getState().pages.activePageEntities).toEqual({
      "entityFile.json": expectedData,
    });
  });
});
