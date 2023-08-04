import { StudioData } from "@yext/studio-plugin";
import useStudioStore from "../../src/store/useStudioStore";
import setInitialEntities from "../../src/store/setInitialEntities";

jest.mock("virtual_yext-studio", () => {
  const path = jest.requireActual("path");
  const mockFilepath = path.join(__dirname, "../../tests/__mocks__");
  const mockStudioData: StudioData = {
    pageNameToPageState: {
      UniversalPage: {
        componentTree: [],
        cssImports: [],
        filepath: "filepath to page",
        pagesJS: {
          entityFiles: ["entityFile.json"],
          getPathValue: undefined,
        },
      },
    },
    pageNameToErrorPageState: {},
    UUIDToFileMetadata: {},
    studioConfig: {
      openBrowser: true,
      paths: {
        components: mockFilepath,
        pages: mockFilepath,
        modules: mockFilepath,
        siteSettings: mockFilepath,
        localData: mockFilepath,
      },
      isPagesJSRepo: false,
      port: 8080,
    },
  };

  return mockStudioData;
});

it("sets the initial entities", async () => {
  expect(useStudioStore.getState().pages.activeEntityFile).toEqual(
    "entityFile.json"
  );
  expect(useStudioStore.getState().pages.activePageEntities).toBeUndefined();
  await setInitialEntities(useStudioStore);
  expect(useStudioStore.getState().pages.activePageEntities).toEqual({
    "entityFile.json": {
      employeeCount: 123,
      favs: ["cat", "dog", "sleep"],
      name: "bob",
    },
  });
});