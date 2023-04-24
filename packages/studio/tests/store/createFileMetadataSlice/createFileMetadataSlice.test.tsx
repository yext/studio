import {
  ComponentMetadata,
  FileMetadataKind,
  ModuleMetadata,
  PropValueType,
} from "@yext/studio-plugin";
import useStudioStore from "../../../src/store/useStudioStore";
import { FileMetadataSliceStates } from "../../../src/store/models/slices/FileMetadataSlice";
import mockStore from "../../__utils__/mockStore";

const componentMetadata: ComponentMetadata = {
  kind: FileMetadataKind.Component,
  metadataUUID: "mock-metadata-uuid",
  filepath: "mock-filepath",
  propShape: {
    myText: {
      type: PropValueType.string,
      doc: "a random string",
      required: false,
    },
  },
};
const moduleMetadata: ModuleMetadata = {
  kind: FileMetadataKind.Module,
  metadataUUID: "mock-metadataUUID",
  filepath: "mock-filepath",
  componentTree: [],
};

it("updates UUIDToFileMetadata using setFileMetadata", () => {
  useStudioStore
    .getState()
    .fileMetadatas.setFileMetadata("some-uuid", componentMetadata);
  const UUIDToFileMetadata =
    useStudioStore.getState().fileMetadatas.UUIDToFileMetadata;
  expect(UUIDToFileMetadata).toEqual({
    "some-uuid": componentMetadata,
  });
});

it("returns a FileMetadata using getFileMetadata", () => {
  setInitialState({
    UUIDToFileMetadata: {
      "uuid-1": componentMetadata,
    },
  });
  const fileMetadata = useStudioStore
    .getState()
    .fileMetadatas.getFileMetadata("uuid-1");
  expect(fileMetadata).toEqual(componentMetadata);
});

it("errors when removeFileMetadata is called on a non-module", () => {
  const initialState = {
    UUIDToFileMetadata: {
      "uuid-1": componentMetadata,
    },
  };
  setInitialState(initialState);
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  useStudioStore.getState().fileMetadatas.removeFileMetadata("uuid-1");
  expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  expect(consoleErrorSpy).toHaveBeenCalledWith(
    "removeFileMetadata is only allowed for modules, not:",
    FileMetadataKind.Component
  );

  const UUIDToFileMetadata =
    useStudioStore.getState().fileMetadatas.UUIDToFileMetadata;
  expect(UUIDToFileMetadata).toEqual(initialState.UUIDToFileMetadata);
});

it("removeFileMetadata can remove a module metadata", () => {
  const initialState = {
    UUIDToFileMetadata: {
      "uuid-1": moduleMetadata,
    },
  };
  setInitialState(initialState);
  useStudioStore.getState().fileMetadatas.removeFileMetadata("uuid-1");
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  expect(consoleErrorSpy).toHaveBeenCalledTimes(0);

  const UUIDToFileMetadata =
    useStudioStore.getState().fileMetadatas.UUIDToFileMetadata;
  expect(UUIDToFileMetadata).toEqual({});
});

it("updates UUIDToImportedComponent using setImportedComponent", () => {
  const importedComponent = () => <div>hello world</div>;
  const newImportedComponents = {
    Banner: importedComponent,
  };
  useStudioStore
    .getState()
    .fileMetadatas.setImportedComponent("Banner", importedComponent);
  const UUIDToImportedComponent =
    useStudioStore.getState().fileMetadatas.UUIDToImportedComponent;
  expect(UUIDToImportedComponent).toEqual(newImportedComponents);
});

function setInitialState(initialState: Partial<FileMetadataSliceStates>): void {
  const baseState: FileMetadataSliceStates = {
    UUIDToFileMetadata: {},
    UUIDToImportedComponent: {},
  };
  mockStore({ fileMetadatas: { ...baseState, ...initialState } });
}
