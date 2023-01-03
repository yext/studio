import useStudioStore from "../../src/store/useStudioStore";
import { PageSliceStates } from "../../src/store/models/slices/PageSlice";
import { searchBarComponent } from "../__fixtures__/componentStates";
import { mockPageSliceStates } from "../__utils__/mockPageSliceState";

describe("active entity file actions", () => {
  const initialState: Partial<PageSliceStates> = {
    pages: {
      universal: {
        componentTree: [searchBarComponent],
        cssImports: [],
        entityFiles: ["file1.json", "file2.json"],
        filepath: "some/file/path",
      },
    },
    activePageName: "universal",
    activeEntityFile: undefined,
  };

  beforeEach(() => {
    mockPageSliceStates(initialState);
  });

  it("updates activeEntityFile using setActiveEntityFile", () => {
    let actionStatus = useStudioStore
      .getState()
      .pages.setActiveEntityFile("file2.json");
    let activeEntityFile = useStudioStore.getState().pages.activeEntityFile;
    expect(actionStatus).toBeTruthy();
    expect(activeEntityFile).toEqual("file2.json");

    actionStatus = useStudioStore
      .getState()
      .pages.setActiveEntityFile(undefined);
    activeEntityFile = useStudioStore.getState().pages.activeEntityFile;
    expect(actionStatus).toBeTruthy();
    expect(activeEntityFile).toEqual(undefined);
  });

  it("logs an error when using setActiveEntityFile before an active page is selected", () => {
    mockPageSliceStates({
      ...initialState,
      activePageName: undefined,
    });
    const consoleErrorSpy = jest
      .spyOn(global.console, "error")
      .mockImplementation();
    const actionStatus = useStudioStore
      .getState()
      .pages.setActiveEntityFile("file2.json");
    const activeEntityFile = useStudioStore.getState().pages.activeEntityFile;
    expect(actionStatus).toBeFalsy();
    expect(activeEntityFile).toEqual(undefined);
    expect(consoleErrorSpy).toBeCalledWith(
      "Error setting active entity file: no active page selected."
    );
  });

  it("logs an error when using setActiveEntityFile and the provided file is not for the active page", () => {
    const consoleErrorSpy = jest
      .spyOn(global.console, "error")
      .mockImplementation();
    const actionStatus = useStudioStore
      .getState()
      .pages.setActiveEntityFile("file-does-not-exist.json");
    const activeEntityFile = useStudioStore.getState().pages.activeEntityFile;
    expect(actionStatus).toBeFalsy();
    expect(activeEntityFile).toEqual(undefined);
    expect(consoleErrorSpy).toBeCalledWith(
      'Error setting active entity file: "file-does-not-exist.json" is not an entity file for this page.'
    );
  });
});
