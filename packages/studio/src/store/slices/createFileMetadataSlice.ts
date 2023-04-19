import {
  ComponentMetadata,
  ComponentState,
  FileMetadata,
  FileMetadataKind,
  ModuleMetadata,
} from "@yext/studio-plugin";
import initialStudioData from "virtual:yext-studio";
import FileMetadataSlice from "../models/slices/FileMetadataSlice";
import { SliceCreator } from "../models/utils";
import removeTopLevelFragments from "../../utils/removeTopLevelFragments";

const createFileMetadataSlice: SliceCreator<FileMetadataSlice> = (
  set,
  get
) => ({
  UUIDToFileMetadata: removeTopLevelFragments(
    initialStudioData.UUIDToFileMetadata
  ),
  UUIDToImportedComponent: {},
  setFileMetadata: (metadataUUID: string, metadata: FileMetadata) =>
    set((store) => {
      store.UUIDToFileMetadata[metadataUUID] = metadata;
    }),
  getFileMetadata: (metadataUUID: string) =>
    get().UUIDToFileMetadata[metadataUUID],
  removeFileMetadata: (metadataUUID: string) =>
    set((store) => {
      const metadata = store.UUIDToFileMetadata[metadataUUID];
      if (metadata.kind === FileMetadataKind.Module) {
        delete store.UUIDToFileMetadata[metadataUUID];
      } else {
        console.error(
          "removeFileMetadata is only allowed for modules, not:",
          metadata.kind
        );
      }
    }),
  getComponentMetadata: (metadataUUID) => {
    const fileMetadata = get().getFileMetadata(metadataUUID);
    assertIsComponentMetadata(fileMetadata);
    return fileMetadata;
  },
  getModuleMetadata: (metadataUUID) => {
    const fileMetadata = get().getFileMetadata(metadataUUID);
    assertIsModuleMetadata(fileMetadata);
    return fileMetadata;
  },
  setImportedComponent(uuid, importedComponent) {
    set((store) => {
      store.UUIDToImportedComponent[uuid] = importedComponent;
    });
  },
  setComponentTreeInModule(
    metadataUUID: string,
    componentTree: ComponentState[]
  ) {
    set((store) => {
      const fileMetadata = store.UUIDToFileMetadata[metadataUUID];
      assertIsModuleMetadata(fileMetadata);
      fileMetadata.componentTree = componentTree;
    });
  },
});

function assertIsModuleMetadata(
  fileMetadata?: FileMetadata
): asserts fileMetadata is ModuleMetadata {
  if (fileMetadata?.kind !== FileMetadataKind.Module) {
    throw new Error(
      `Expected a ModuleMetadata, instead received ${JSON.stringify(
        fileMetadata,
        null,
        2
      )}.`
    );
  }
}

function assertIsComponentMetadata(
  fileMetadata?: FileMetadata
): asserts fileMetadata is ComponentMetadata {
  if (fileMetadata?.kind !== FileMetadataKind.Component) {
    throw new Error(
      `Expected a ComponentMetadata, instead received ${JSON.stringify(
        fileMetadata,
        null,
        2
      )}.`
    );
  }
}

export default createFileMetadataSlice;
