import {
  ComponentMetadata,
  FileMetadataKind,
  PropValueType,
} from "@yext/studio-plugin";
import { useStudioStore } from "../../src/store/store";
import { FileMetadatasStates } from "../../src/store/models/slices/fileMetadatas";

describe("FileMetadatasSlice", () => {
  const componentMetadata: ComponentMetadata = {
    kind: FileMetadataKind.Component,
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
});

function setInitialState(initialState: FileMetadatasStates): void {
  useStudioStore.setState({
    fileMetadatas: {
      ...useStudioStore.getState().fileMetadatas,
      ...initialState,
    },
  });
}
