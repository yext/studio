import {
  ComponentMetadata,
  FileMetadataKind,
  PropValueType,
} from "@yext/studio-plugin";
import useStudioStore from "../../src/store/useStudioStore";
import { FileMetadataSliceStates } from "../../src/store/models/slices/FileMetadataSlice";
import mockStore from "../__utils__/mockStore";

describe("FileMetadataSlice", () => {
  const componentMetadata: ComponentMetadata = {
    kind: FileMetadataKind.Component,
    metadataUUID: "mock-metadataUUID",
    filepath: "mock-filepath",
    propShape: {
      myText: {
        type: PropValueType.string,
        doc: "a random string",
      },
    },
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

  it("removes a FileMetadata using removeFileMetadata", () => {
    setInitialState({
      UUIDToFileMetadata: {
        "uuid-1": componentMetadata,
      },
    });
    useStudioStore.getState().fileMetadatas.removeFileMetadata("uuid-1");
    const UUIDToFileMetadata =
      useStudioStore.getState().fileMetadatas.UUIDToFileMetadata;
    expect(UUIDToFileMetadata).toEqual({});
  });

  it("updates UUIDToImportedComponent using setUUIDToImportedComponent", () => {
    const newImportedComponents = {
      universalPage: () => <div>hello world</div>,
    };
    useStudioStore
      .getState()
      .fileMetadatas.setUUIDToImportedComponent(newImportedComponents);
    const UUIDToImportedComponent =
      useStudioStore.getState().fileMetadatas.UUIDToImportedComponent;
    expect(UUIDToImportedComponent).toEqual(newImportedComponents);
  });
});

function setInitialState(initialState: Partial<FileMetadataSliceStates>): void {
  const baseState: FileMetadataSliceStates = {
    UUIDToFileMetadata: {},
    UUIDToImportedComponent: {},
  };
  mockStore({ fileMetadatas: { ...baseState, ...initialState } });
}
