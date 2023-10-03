import {
  ComponentMetadata,
  FileMetadata,
  FileMetadataKind,
} from "@yext/studio-plugin";
import initialStudioData from "virtual_yext-studio";
import FileMetadataSlice from "../models/slices/FileMetadataSlice";
import { SliceCreator } from "../models/utils";

const createFileMetadataSlice: SliceCreator<FileMetadataSlice> = (
  set,
  get
) => ({
  UUIDToFileMetadata: initialStudioData.UUIDToFileMetadata,
  UUIDToImportedComponent: {},
  filepathToCssFiles: {},
  getFileMetadata: (metadataUUID: string) =>
    get().UUIDToFileMetadata[metadataUUID],
  getComponentMetadata: (metadataUUID) => {
    const fileMetadata = get().getFileMetadata(metadataUUID);
    assertIsComponentMetadata(fileMetadata);
    return fileMetadata;
  },
  setImportedComponent(uuid, importedComponent) {
    set((store) => {
      store.UUIDToImportedComponent[uuid] = importedComponent;
    });
  },
  updateFilepathToCssFiles: (
    filepathToCssFiles: Record<string, string[]>
  ) => {
    set((store) => {
      Object.entries(filepathToCssFiles).forEach(
        ([importer, filepathToCssFiles]) => {
          if (!store.filepathToCssFiles.hasOwnProperty(importer)) {
            store.filepathToCssFiles[importer] = new Set();
          }
          filepathToCssFiles.forEach((cssFile) =>
            store.filepathToCssFiles[importer].add(cssFile)
          );
        }
      );
    });
  },
});

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
