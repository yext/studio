import { StudioData } from "@yext/studio-plugin";
import useStudioStore from "../../src/store/useStudioStore";
import setInitialEntityFile from "../../src/store/setInitialEntityFile";

jest.mock("virtual:yext-studio", () => {
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

it("sets the initial entity file", async () => {
  expect(useStudioStore.getState().pages.activeEntityFile).toBeUndefined();
  expect(useStudioStore.getState().pages.activeEntityData).toBeUndefined();
  await setInitialEntityFile(useStudioStore);
  expect(useStudioStore.getState().pages.activeEntityFile).toEqual(
    "entityFile.json"
  );
  expect(useStudioStore.getState().pages.activeEntityData).toEqual({
    employeeCount: 123,
    favs: ["cat", "dog", "sleep"],
    name: "bob",
  });
});
