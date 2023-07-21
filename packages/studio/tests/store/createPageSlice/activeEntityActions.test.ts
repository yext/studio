import useStudioStore from "../../../src/store/useStudioStore";
import { PageSliceStates } from "../../../src/store/models/slices/PageSlice";
import { searchBarComponent } from "../../__fixtures__/componentStates";
import { mockPageSliceStates } from "../../__utils__/mockPageSliceState";
import path from "path";

describe("active entity file actions", () => {
  const initialState: Partial<PageSliceStates> = {
    pages: {
      Universal: {
        componentTree: [searchBarComponent],
        cssImports: [],
        filepath: "some/file/path",
        pagesJS: {
          entityFiles: ["file1.json", "entityFile.json"],
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

  const localDataFolder = path.resolve(__dirname, "../../__mocks__");

  it("updates activeEntityFile using setActiveEntityFile", async () => {
    await useStudioStore
      .getState()
      .pages.setActiveEntityFile(localDataFolder, "entityFile.json");
    let activeEntityFile = useStudioStore.getState().pages.activeEntityFile;
    expect(activeEntityFile).toEqual("entityFile.json");

    await useStudioStore
      .getState()
      .pages.setActiveEntityFile(localDataFolder, undefined);
    activeEntityFile = useStudioStore.getState().pages.activeEntityFile;
    expect(activeEntityFile).toEqual(undefined);
  });

  it("throws when using setActiveEntityFile without an active page", async () => {
    mockPageSliceStates({
      ...initialState,
      activePageName: undefined,
    });
    const setEntityFile = () =>
      useStudioStore
        .getState()
        .pages.setActiveEntityFile(localDataFolder, "entityFile.json");
    await expect(setEntityFile).rejects.toThrow(
      "Error setting active entity file: no active page."
    );
    const activeEntityFile = useStudioStore.getState().pages.activeEntityFile;
    expect(activeEntityFile).toEqual(undefined);
  });

  it("throws when the entity file is not accepted by the page", async () => {
    const setEntityFile = () =>
      useStudioStore
        .getState()
        .pages.setActiveEntityFile(localDataFolder, "file-does-not-exist.json");
    await expect(setEntityFile).rejects.toThrow(
      '"file-does-not-exist.json" is not an accepted entity file for this page.'
    );
    const activeEntityFile = useStudioStore.getState().pages.activeEntityFile;
    expect(activeEntityFile).toEqual(undefined);
  });
});
