import { ComponentStateKind, FileMetadataKind } from "@yext/studio-plugin";
import useStudioStore from "../../src/store/useStudioStore";
import { searchBarComponent } from "../__fixtures__/componentStates";
import mockStore from "../__utils__/mockStore";
import path from "path-browserify";

const UUIDToFileMetadata = {
  [path.resolve(__dirname, "../__mocks__", "./test.tsx")]: {
    kind: FileMetadataKind.Module,
    componentTree: [],
    metadataUUID: "test",
    filepath: path.resolve(__dirname, "../__mocks__", "./test.tsx"),
  },
};

beforeEach(() => {
  mockStore({
    pages: {
      pages: {
        universal: {
          componentTree: [
            {
              kind: ComponentStateKind.Fragment,
              uuid: "mock-uuid-0",
            },
            {
              ...searchBarComponent,
              uuid: "mock-uuid-1",
              parentUUID: "mock-uuid-0",
            },
            {
              kind: ComponentStateKind.Module,
              uuid: "mock-uuid-2",
              parentUUID: "mock-uuid-1",
              componentName: "module",
              props: {},
              metadataUUID: "mock-metadata",
            },
            {
              ...searchBarComponent,
              uuid: "mock-uuid-3",
              parentUUID: "mock-uuid-0",
            },
          ],
          cssImports: [],
          filepath: "mock-filepath",
        },
      },
      activePageName: "universal",
      activeComponentUUID: "mock-uuid-1",
    },
    fileMetadatas: {
      UUIDToFileMetadata,
    },
  });
});

const filepath = path.resolve(__dirname, "../__mocks__", "./module.tsx");

it("adds module metadata to UUIDToFileMetadata", () => {
  useStudioStore.getState().createModule(filepath);
  const UUIDToFileMetadata =
    useStudioStore.getState().fileMetadatas.UUIDToFileMetadata;
  expect(UUIDToFileMetadata).toEqual({
    ...UUIDToFileMetadata,
    [filepath]: {
      kind: FileMetadataKind.Module,
      componentTree: [
        {
          ...searchBarComponent,
          uuid: "mock-uuid-1",
        },
        {
          kind: ComponentStateKind.Module,
          uuid: "mock-uuid-2",
          parentUUID: "mock-uuid-1",
          componentName: "module",
          props: {},
          metadataUUID: "mock-metadata",
        },
      ],
      filepath,
      metadataUUID: filepath,
      propShape: {},
    },
  });
});

it("updates active page state to include new module component", () => {
  useStudioStore.getState().createModule(filepath);
  const activeComponentState = useStudioStore
    .getState()
    .pages.getActivePageState();
  expect(activeComponentState).toEqual({
    componentTree: [
      {
        kind: ComponentStateKind.Fragment,
        uuid: "mock-uuid-0",
      },
      {
        kind: ComponentStateKind.Module,
        uuid: expect.anything(),
        parentUUID: "mock-uuid-0",
        componentName: "module",
        metadataUUID: expect.stringMatching(/\/module.tsx$/),
        props: {},
      },
      {
        ...searchBarComponent,
        uuid: "mock-uuid-3",
        parentUUID: "mock-uuid-0",
      },
    ],
    cssImports: [],
    filepath: "mock-filepath",
  });
});

it("sets active component to the new module component", () => {
  useStudioStore.getState().createModule(filepath);
  const activeComponentState = useStudioStore
    .getState()
    .pages.getActiveComponentState();
  expect(activeComponentState).toEqual({
    kind: ComponentStateKind.Module,
    uuid: expect.anything(),
    parentUUID: "mock-uuid-0",
    componentName: "module",
    metadataUUID: expect.stringMatching(/\/module.tsx$/),
    props: {},
  });
});

describe("errors", () => {
  let consoleErrorSpy: jest.SpyInstance;
  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  it("gives an error when there is no active component state", () => {
    useStudioStore.getState().pages.setActiveComponentUUID(undefined);
    const consoleErrorSpy = jest
      .spyOn(global.console, "error")
      .mockImplementation();
    expect(useStudioStore.getState().createModule(filepath)).toBeFalsy();
    expect(consoleErrorSpy).toBeCalledTimes(1);
    expect(consoleErrorSpy).toBeCalledWith(
      "Tried to create module without active component."
    );
  });

  it("gives an error for an empty string filepath", () => {
    useStudioStore.getState().createModule("");
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error creating module: a filepath is required."
    );
  });

  it("gives an error for a relative filepath", () => {
    useStudioStore.getState().createModule("./module.tsx");
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error creating module: filepath is invalid: ./module.tsx"
    );
  });

  it("gives an error for a filepath outside the allowed path for modules", () => {
    const filepath = path.join(__dirname, "../__mocks__", "../module.tsx");
    useStudioStore.getState().createModule(filepath);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Error creating module: filepath is invalid: ${filepath}`
    );
  });

  it("gives an error for a filepath with a module name that already exists", () => {
    const filepath = path.join(__dirname, "../__mocks__", "./test.tsx");
    useStudioStore.getState().createModule(filepath);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error creating module: module name "test" is already used.'
    );
  });
});
