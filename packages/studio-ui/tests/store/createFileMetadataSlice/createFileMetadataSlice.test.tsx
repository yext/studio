import {
  ComponentMetadata,
  FileMetadataKind,
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
      tooltip: "a random string",
      required: false,
    },
  },
  styleImports: [],
};

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
