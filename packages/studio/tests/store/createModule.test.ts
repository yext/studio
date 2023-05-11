import {
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
  PropValueType,
} from "@yext/studio-plugin";
import useStudioStore from "../../src/store/useStudioStore";
import { searchBarComponent } from "../__fixtures__/componentStates";
import mockStore from "../__utils__/mockStore";
import path from "path-browserify";

const UUIDToFileMetadata: Record<string, FileMetadata> = {
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

it("adds module metadata to UUIDToFileMetadata", () => {
  const moduleName = "Module";
  useStudioStore.getState().createModule(moduleName);
  const UUIDToFileMetadata =
    useStudioStore.getState().fileMetadatas.UUIDToFileMetadata;
  expect(Object.values(UUIDToFileMetadata).at(-1)).toEqual({
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
    filepath: expect.stringContaining(moduleName + ".tsx"),
    metadataUUID: expect.any(String),
    propShape: {},
  });
});

it("adds document to prop interface when isPagesJSRepo = true", () => {
  useStudioStore.setState((state) => {
    state.studioConfig.isPagesJSRepo = true;
  });
  const moduleName = "Module";
  useStudioStore.getState().createModule(moduleName);
  const UUIDToFileMetadata =
    useStudioStore.getState().fileMetadatas.UUIDToFileMetadata;
  expect(Object.values(UUIDToFileMetadata).at(-1)).toEqual(
    expect.objectContaining({
      propShape: {
        document: {
          type: PropValueType.Record,
          recordKey: "string",
          recordValue: "any",
          required: true,
        },
      },
    })
  );
});

it("updates active page state to include new module component", () => {
  useStudioStore.getState().createModule("Module");
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
        componentName: "Module",
        metadataUUID: expect.any(String),
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
  useStudioStore.getState().createModule("Module");
  const activeComponentState = useStudioStore
    .getState()
    .actions.getActiveComponentState();
  expect(activeComponentState).toEqual({
    kind: ComponentStateKind.Module,
    uuid: expect.any(String),
    parentUUID: "mock-uuid-0",
    componentName: "Module",
    metadataUUID: expect.any(String),
    props: {},
  });
});

describe("errors", () => {
  it("throws an error when there is no active component state", () => {
    useStudioStore.getState().pages.setActiveComponentUUID(undefined);
    const action = () => useStudioStore.getState().createModule("Any");
    expect(action).toThrow("Tried to create module without active component.");
  });

  it("throws an error for an empty moduleName", () => {
    const action = () => useStudioStore.getState().createModule("");
    expect(action).toThrow("Error creating module: a modulePath is required.");
  });

  it("throws an error for a modulePath outside the allowed path for modules", () => {
    const action = () => useStudioStore.getState().createModule("../Module");
    expect(action).toThrow(
      `Error creating module: modulePath is invalid: "../Module.tsx".`
    );
  });

  it("throws an error when module name starts with a lowercase letter", () => {
    const action = () => useStudioStore.getState().createModule("bob/test");
    expect(action).toThrow("Module names must start with an uppercase letter.");
  });
});
